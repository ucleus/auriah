const express = require('express');
const multer = require('multer');
const path = require('path');
const env = require('../config/env');
const asyncHandler = require('../utils/asyncHandler');
const {
  ensureUploadsPath,
  mapPhotoPayload,
  listResource,
  createResource,
  deleteResource,
} = require('../services/resourceService');

ensureUploadsPath(env.uploadDir);

const storage = multer.diskStorage({
  destination: env.uploadDir,
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-z0-9.]/gi, '_').toLowerCase();
    cb(null, `${Date.now()}-${safeName}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image uploads allowed'));
    }
    cb(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

const router = express.Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const photos = await listResource('photos');
    res.json(photos);
  })
);

router.post(
  '/',
  upload.single('photo'),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: 'Photo is required' });
    }
    const payload = mapPhotoPayload(req.file, req.body.caption);
    const created = await createResource('photos', payload);
    res.status(201).json(created);
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    await deleteResource('photos', req.params.id);
    res.status(204).send();
  })
);

module.exports = router;
