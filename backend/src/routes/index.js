const express = require('express');
const createResourceRouter = require('./resourceRouter');
const photosRouter = require('./photos');
const asyncHandler = require('../utils/asyncHandler');
const { searchAll, getSuggestions, getInspiredPrompt } = require('../services/resourceService');

const router = express.Router();

router.get(
  '/health',
  asyncHandler(async (req, res) => {
    res.json({ ok: true });
  })
);

router.get(
  '/suggestions',
  asyncHandler(async (req, res) => {
    const query = req.query.q || '';
    const suggestions = await getSuggestions(query);
    res.json(suggestions);
  })
);

router.get(
  '/search',
  asyncHandler(async (req, res) => {
    const query = (req.query.q || '').trim();
    if (!query) {
      return res.json({ tasks: [], notes: [], music: [], photos: [], learn: [], places: [] });
    }
    const results = await searchAll(query);
    res.json(results);
  })
);

router.get(
  '/inspired',
  asyncHandler(async (req, res) => {
    const prompt = await getInspiredPrompt();
    res.json({ prompt });
  })
);

router.use('/tasks', createResourceRouter('tasks'));
router.use('/notes', createResourceRouter('notes'));
router.use('/music', createResourceRouter('music'));
router.use('/learn', createResourceRouter('learn'));
router.use('/places', createResourceRouter('places'));
router.use('/photos', photosRouter);

module.exports = router;
