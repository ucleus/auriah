const express = require('express');
const {
  listResource,
  createResource,
  updateResource,
  deleteResource,
} = require('../services/resourceService');
const asyncHandler = require('../utils/asyncHandler');

const createResourceRouter = (resource) => {
  const router = express.Router();

  router.get(
    '/',
    asyncHandler(async (req, res) => {
      const items = await listResource(resource);
      res.json(items);
    })
  );

  router.post(
    '/',
    asyncHandler(async (req, res) => {
      const created = await createResource(resource, req.body);
      res.status(201).json(created);
    })
  );

  router.put(
    '/:id',
    asyncHandler(async (req, res) => {
      const updated = await updateResource(resource, req.params.id, req.body);
      res.json(updated);
    })
  );

  router.delete(
    '/:id',
    asyncHandler(async (req, res) => {
      await deleteResource(resource, req.params.id);
      res.status(204).send();
    })
  );

  return router;
};

module.exports = createResourceRouter;
