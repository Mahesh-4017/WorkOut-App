const express = require('express');
const multer = require('multer');
const Anthropic = require('@anthropic-ai/sdk');
const rateLimit = require('express-rate-limit');

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024, files: 1 },
});
const analyzeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
});
const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-5-5';
const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

const SYSTEM = `You are a nutrition estimator. Look at the meal photo and estimate its nutrition for the whole portion shown.
Reply with ONLY a JSON object, no prose, no code fences:
{"name": string, "description": string, "kcal": number, "protein": number, "carbs": number, "fat": number,
 "serving": string, "healthScore": number (1-10), "confidence": "low"|"medium"|"high",
 "items": [{"name": string, "grams": number, "kcal": number}]}
protein, carbs and fat are grams. If the image has no food, reply {"error":"no_food"}.`;

function handleUpload(req, res, next) {
  upload.single('image')(req, res, error => {
    if (!error) return next();
    const status = error.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
    return res.status(status).json({ message: status === 413 ? 'Image must be 8 MB or smaller.' : 'A valid meal image is required.' });
  });
}

function parseResult(text) {
  const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start < 0 || end < start) throw new Error('The nutrition model returned invalid JSON.');
  return JSON.parse(cleaned.slice(start, end + 1));
}

function numberOrZero(value) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, Math.round(number * 10) / 10) : 0;
}

router.post('/test', (req, res) => res.json({ msg: 'working' }));
router.post('/analyze', analyzeLimiter, handleUpload, async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No image uploaded.' });
  if (!IMAGE_TYPES.has(req.file.mimetype)) {
    return res.status(415).json({ message: 'Upload a JPEG, PNG, or WebP image.' });
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(503).json({ message: 'Meal photo analysis is not configured on the server.' });
  }

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 700,
      system: SYSTEM,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: req.file.mimetype,
              data: req.file.buffer.toString('base64'),
            },
          },
          { type: 'text', text: 'Estimate the nutrition for this meal.' },
        ],
      }],
    });

    const text = message.content
      .filter(block => block.type === 'text')
      .map(block => block.text)
      .join('');
    const data = parseResult(text);
    if (data.error === 'no_food') return res.status(422).json({ error: 'no_food' });

    const confidence = ['low', 'medium', 'high'].includes(data.confidence) ? data.confidence : 'medium';
    const items = Array.isArray(data.items)
      ? data.items.slice(0, 20).map(item => ({
        name: String(item.name || 'Food item').slice(0, 120),
        grams: numberOrZero(item.grams),
        kcal: Math.round(numberOrZero(item.kcal)),
      }))
      : [];

    return res.json({
      name: String(data.name || 'Meal').slice(0, 120),
      description: String(data.description || '').slice(0, 500),
      serving: String(data.serving || '1 serving').slice(0, 100),
      kcal: Math.round(numberOrZero(data.kcal)),
      protein: numberOrZero(data.protein),
      carbs: numberOrZero(data.carbs),
      fat: numberOrZero(data.fat),
      healthScore: Math.min(10, Math.max(1, Math.round(Number(data.healthScore) || 5))),
      confidence,
      items,
    });
  } catch (error) {
    console.error('Meal photo analysis failed:', error.message);
    return res.status(502).json({ message: 'Could not analyze the photo. Please try again.' });
  }
});

module.exports = router;