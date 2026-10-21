const express = require('express');
const multer = require('multer');
const Anthropic = require('@anthropic-ai/sdk');
const rateLimit = require('express-rate-limit');
const {
  getIfctReference,
  getNutrientDescriptions,
  loadFoodCompositions,
} = require('../utils/mealNutrition');

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
protein, carbs and fat are grams. List identifiable food components separately, with specific food and preparation names and estimated portion weights in grams.
If the image has no food, reply {"error":"no_food"}.`;

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

async function detectCloudVisionLabels(image) {
  const endpoint = new URL('https://vision.googleapis.com/v1/images:annotate');
  endpoint.searchParams.set('key', process.env.GOOGLE_CLOUD_VISION_API_KEY);

  let response;
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requests: [{
          image: { content: image.toString('base64') },
          features: [{ type: 'LABEL_DETECTION', maxResults: 20 }],
        }],
      }),
      signal: AbortSignal.timeout(20000),
    });
  } catch {
    const error = new Error('Cloud Vision request could not be reached.');
    error.provider = 'Google Cloud Vision';
    throw error;
  }

  let payload;
  try {
    payload = await response.json();
  } catch {
    const error = new Error('Cloud Vision returned an invalid response.');
    error.provider = 'Google Cloud Vision';
    error.status = response.status;
    throw error;
  }

  const providerError = payload.responses?.[0]?.error;
  if (!response.ok || providerError) {
    const error = new Error('Cloud Vision image recognition failed.');
    error.provider = 'Google Cloud Vision';
    error.status = Number.isInteger(providerError?.code) ? providerError.code : response.status;
    error.providerStatus = providerError?.status;
    error.providerMessage = providerError?.message;
    throw error;
  }

  const labels = payload.responses?.[0]?.labelAnnotations || [];
  return [...new Set(labels
    .filter(label => Number(label.score) >= 0.35 && typeof label.description === 'string')
    .map(label => label.description.trim())
    .filter(Boolean))]
    .slice(0, 20);
}

function analysisFailure(error) {
  const status = Number.isInteger(error?.status) ? error.status : null;
  const requestId = typeof error?.request_id === 'string' ? error.request_id : undefined;
  const providerType = error?.provider || (typeof error?.error?.type === 'string' ? error.error.type : error?.name);
  const providerMessage = typeof error?.providerMessage === 'string' ? error.providerMessage : undefined;

  console.error('Meal photo analysis failed:', {
    status,
    providerType,
    requestId,
    providerStatus: error?.providerStatus,
    providerMessage,
    message: error?.message || 'Unknown error',
  });

  if (providerType === 'Google Cloud Vision' && [401, 403, 7].includes(status)) {
    return {
      status: 503,
      body: {
        code: 'CLOUD_VISION_AUTH',
        message: 'Cloud Vision is not configured correctly. Check that the Vision API is enabled and the backend API key is valid.',
      },
    };
  }
  if (providerType === 'Google Cloud Vision' && [429, 8].includes(status)) {
    return {
      status: 503,
      body: {
        code: 'CLOUD_VISION_QUOTA',
        message: 'Cloud Vision is temporarily unavailable because its request limit was reached. Please try again later.',
      },
    };
  }
  if (providerType === 'Google Cloud Vision' && [400, 3].includes(status)) {
    return {
      status: 422,
      body: {
        code: 'CLOUD_VISION_IMAGE_INVALID',
        message: 'Cloud Vision could not read this image. Please choose another JPEG, PNG, or WebP photo.',
      },
    };
  }
  if (status === 401 || status === 403) {
    return {
      status: 503,
      body: { code: 'NUTRITION_SERVICE_AUTH', message: 'Meal photo analysis is temporarily unavailable. Please contact support.' },
    };
  }
  if (status === 404) {
    return {
      status: 503,
      body: { code: 'NUTRITION_MODEL_UNAVAILABLE', message: 'Meal photo analysis is not available right now. Please contact support.' },
    };
  }
  if (status === 429) {
    return {
      status: 503,
      body: { code: 'NUTRITION_SERVICE_BUSY', message: 'Meal analysis is busy. Please wait a moment and try again.' },
    };
  }
  if (status !== null && status >= 500) {
    return {
      status: 503,
      body: { code: 'NUTRITION_SERVICE_UNAVAILABLE', message: 'Meal analysis is temporarily unavailable. Please try again shortly.' },
    };
  }
  return {
    status: 502,
    body: { code: 'NUTRITION_ANALYSIS_FAILED', message: 'Could not analyze the photo. Please try again.' },
  };
}

router.post('/test', (req, res) => res.json({ msg: 'working' }));
router.post('/analyze', analyzeLimiter, handleUpload, async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No image uploaded.' });
  if (!IMAGE_TYPES.has(req.file.mimetype)) {
    return res.status(415).json({ message: 'Upload a JPEG, PNG, or WebP image.' });
  }
  if (!process.env.GOOGLE_CLOUD_VISION_API_KEY) {
    return res.status(503).json({
      code: 'CLOUD_VISION_NOT_CONFIGURED',
      message: 'Cloud Vision is not configured on the server. Please contact support.',
    });
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(503).json({
      code: 'NUTRITION_ESTIMATOR_NOT_CONFIGURED',
      message: 'Nutrition estimation is not configured on the server. Please contact support.',
    });
  }

  try {
    const visionLabels = await detectCloudVisionLabels(req.file.buffer);
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
          {
            type: 'text',
            text: `Estimate the nutrition for this meal. Google Cloud Vision detected these candidate labels: ${visionLabels.join(', ') || 'none'}. Use them only as identification hints and include only foods supported by the image.`,
          },
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
    let ifctAvailable = true;
    try {
      await loadFoodCompositions();
    } catch (error) {
      ifctAvailable = false;
      console.error('IFCT food composition data failed to load:', error.message);
    }
    const items = Array.isArray(data.items)
      ? data.items.slice(0, 20).map(item => {
        if (!item || typeof item !== 'object') return null;
        const name = String(item.name || 'Food item').slice(0, 120);
        const grams = numberOrZero(item.grams);
        return {
          name,
          grams,
          kcal: Math.round(numberOrZero(item.kcal)),
          ifctReference: ifctAvailable ? getIfctReference(name, grams) : null,
        };
      }).filter(Boolean)
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
      nutrientDescriptions: ifctAvailable ? getNutrientDescriptions() : null,
      visionLabels,
    });
  } catch (error) {
    const failure = analysisFailure(error);
    return res.status(failure.status).json(failure.body);
  }
});

module.exports = router;