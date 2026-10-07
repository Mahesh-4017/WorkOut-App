const router = require('express').Router();
const mongoose = require('mongoose');
const multer = require('multer');
const { requireAuth } = require('../middleware/auth');
const { sendSuccess } = require('../utils/apiResponse');

const MAX_IMAGE_SIZE = 8 * 1024 * 1024;
const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
const signatures = {
  'image/jpeg': buffer => buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff,
  'image/png': buffer => buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
  'image/webp': buffer => buffer.length >= 12 && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP'
};
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_SIZE, files: 1 },
  fileFilter: (req, file, callback) => {
    if (!allowedTypes.has(file.mimetype)) {
      return callback(new Error('Choose a JPEG, PNG, or WebP image.'));
    }
    callback(null, true);
  }
});

function imageBucket() {
  const database = mongoose.connection.db;
  if (!database) throw new Error('Image storage is unavailable because MongoDB is not connected.');
  return new mongoose.mongo.GridFSBucket(database, { bucketName: 'media' });
}

router.post('/images', requireAuth, (req, res, next) => {
  upload.single('image')(req, res, error => {
    if (error) {
      return res.status(error.code === 'LIMIT_FILE_SIZE' ? 413 : 422)
        .json({ success: false, message: error.message });
    }
    next();
  });
}, async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(422).json({ success: false, message: 'Select an image to upload.' });
    }
    if (!signatures[req.file.mimetype](req.file.buffer)) {
      return res.status(422).json({ success: false, message: 'The uploaded file does not match its image type.' });
    }
    const bucket = imageBucket();
    const id = new mongoose.Types.ObjectId();
    const stream = bucket.openUploadStreamWithId(id, req.file.originalname, {
      contentType: req.file.mimetype,
      metadata: { kind: 'image' }
    });
    stream.on('error', next);
    stream.on('finish', () => sendSuccess(res, 201, {
      id: String(id),
      url: `/api/media/images/${id}`,
      contentType: req.file.mimetype,
      size: req.file.size
    }, 'Image uploaded'));
    stream.end(req.file.buffer);
  } catch (error) {
    next(error);
  }
});

router.get('/images/:id', async (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(404).json({ success: false, message: 'Image not found' });
  }
  try {
    const bucket = imageBucket();
    const files = await bucket.find({ _id: new mongoose.Types.ObjectId(req.params.id) }).limit(1).toArray();
    if (!files.length) {
      return res.status(404).json({ success: false, message: 'Image not found' });
    }
    const file = files[0];
    if (!allowedTypes.has(file.contentType)) {
      return res.status(415).json({ success: false, message: 'Stored file is not a supported image.' });
    }
    res.set({
      'Content-Type': file.contentType,
      'Content-Length': String(file.length),
      'Cache-Control': 'public, max-age=3600',
      'Cross-Origin-Resource-Policy': 'cross-origin',
      'X-Content-Type-Options': 'nosniff'
    });
    const download = bucket.openDownloadStream(file._id);
    download.on('error', next);
    download.pipe(res);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
