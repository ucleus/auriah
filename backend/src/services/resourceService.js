const path = require('path');
const { store, generateId } = require('../data/inMemoryStore');
const { getPool, hasPool } = require('../db/pool');

const TABLE_MAP = {
  tasks: 'tasks',
  notes: 'notes',
  music: 'music_links',
  photos: 'photos',
  learn: 'learn_items',
  places: 'places',
};

const FIELD_MAP = {
  tasks: ['title', 'description', 'status', 'due_date'],
  notes: ['title', 'body', 'tags'],
  music: ['title', 'url', 'platform'],
  photos: ['filename', 'url', 'caption'],
  learn: ['title', 'url', 'category'],
  places: ['name', 'address', 'lat', 'lng', 'notes'],
};

const normalizeResource = (resource) => {
  if (!TABLE_MAP[resource]) {
    throw new Error(`Unsupported resource: ${resource}`);
  }
  return resource;
};

const pickFields = (resource, payload) => {
  const allowed = FIELD_MAP[resource] || [];
  return allowed.reduce((acc, field) => {
    if (payload[field] !== undefined) {
      acc[field] = payload[field];
    }
    return acc;
  }, {});
};

const listResource = async (resource) => {
  normalizeResource(resource);
  if (hasPool()) {
    const [rows] = await getPool().query(`SELECT * FROM ${TABLE_MAP[resource]} ORDER BY id DESC`);
    return rows;
  }
  return [...(store[resource] || [])].sort((a, b) => (b.id || 0) - (a.id || 0));
};

const createResource = async (resource, payload) => {
  normalizeResource(resource);
  if (hasPool()) {
    const values = pickFields(resource, payload);
    const [result] = await getPool().query(
      `INSERT INTO ${TABLE_MAP[resource]} SET ?`,
      values
    );
    const [rows] = await getPool().query(`SELECT * FROM ${TABLE_MAP[resource]} WHERE id = ?`, [result.insertId]);
    return rows[0];
  }
  const newItem = { id: generateId(), ...pickFields(resource, payload) };
  store[resource] = [newItem, ...(store[resource] || [])];
  return newItem;
};

const updateResource = async (resource, id, payload) => {
  normalizeResource(resource);
  if (hasPool()) {
    const values = pickFields(resource, payload);
    await getPool().query(`UPDATE ${TABLE_MAP[resource]} SET ? WHERE id = ?`, [values, id]);
    const [rows] = await getPool().query(`SELECT * FROM ${TABLE_MAP[resource]} WHERE id = ?`, [id]);
    return rows[0];
  }
  store[resource] = (store[resource] || []).map((item) =>
    Number(item.id) === Number(id) ? { ...item, ...pickFields(resource, payload) } : item
  );
  return store[resource].find((item) => Number(item.id) === Number(id));
};

const deleteResource = async (resource, id) => {
  normalizeResource(resource);
  if (hasPool()) {
    await getPool().query(`DELETE FROM ${TABLE_MAP[resource]} WHERE id = ?`, [id]);
    return true;
  }
  store[resource] = (store[resource] || []).filter((item) => Number(item.id) !== Number(id));
  return true;
};

const fuzzyMatch = (value, query) =>
  value && query ? value.toLowerCase().includes(query.toLowerCase()) : false;

const searchAll = async (query) => {
  const result = {};
  const resources = Object.keys(TABLE_MAP);
  if (hasPool()) {
    const pool = getPool();
    await Promise.all(
      resources.map(async (resource) => {
        const [rows] = await pool.query(`SELECT * FROM ${TABLE_MAP[resource]} ORDER BY id DESC LIMIT 25`);
        result[resource === 'music' ? 'music' : resource] = rows.filter((item) =>
          Object.values(item || {}).some((value) =>
            typeof value === 'string' ? fuzzyMatch(value, query) : false
          )
        );
      })
    );
  } else {
    resources.forEach((resource) => {
      const key = resource;
      result[key] = (store[key] || []).filter((item) =>
        Object.values(item || {}).some((value) =>
          typeof value === 'string' ? fuzzyMatch(value, query) : false
        )
      );
    });
  }
  return {
    tasks: result.tasks || [],
    notes: result.notes || [],
    music: result.music || [],
    photos: result.photos || [],
    learn: result.learn || [],
    places: result.places || [],
  };
};

const getSuggestions = async (query) => {
  if (!query.trim()) return [];
  const lists = await Promise.all([
    listResource('tasks'),
    listResource('notes'),
    listResource('music'),
    listResource('learn'),
    listResource('places'),
  ]);
  const strings = lists
    .flat()
    .map((item) => item.title || item.name || item.caption)
    .filter((value) => fuzzyMatch(value, query));
  return Array.from(new Set(strings)).slice(0, 6);
};

const getInspiredPrompt = async () => {
  if (hasPool()) {
    const [rows] = await getPool().query('SELECT text FROM inspired_prompts ORDER BY RAND() LIMIT 1');
    if (rows.length) return rows[0].text;
  }
  const prompts = store.inspired_prompts || [];
  return prompts[Math.floor(Math.random() * prompts.length)];
};

const mapPhotoPayload = (file, caption) => ({
  filename: file.filename,
  url: `/uploads/photos/${file.filename}`,
  caption,
});

const ensureUploadsPath = (uploadDir) => {
  const fs = require('fs');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
};

module.exports = {
  listResource,
  createResource,
  updateResource,
  deleteResource,
  searchAll,
  getSuggestions,
  getInspiredPrompt,
  mapPhotoPayload,
  ensureUploadsPath,
};
