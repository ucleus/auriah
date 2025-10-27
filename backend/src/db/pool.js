const mysql = require('mysql2/promise');
const env = require('../config/env');

let pool = null;
let poolReady = false;
let poolInitPromise = null;

const hasDbConfig = () =>
  Boolean(env.mysql.host && env.mysql.user && env.mysql.password && env.mysql.database);

const resetPool = async () => {
  poolReady = false;
  const currentPool = pool;
  pool = null;
  poolInitPromise = null;
  if (currentPool) {
    try {
      await currentPool.end();
    } catch (error) {
      // Ignore shutdown errors – the pool is being discarded.
    }
  }
};

const initPool = async () => {
  if (!hasDbConfig()) return null;

  if (!pool) {
    pool = mysql.createPool({
      host: env.mysql.host,
      user: env.mysql.user,
      password: env.mysql.password,
      database: env.mysql.database,
      port: env.mysql.port,
      waitForConnections: true,
      connectionLimit: 10,
    });
  }

  if (!poolInitPromise) {
    poolInitPromise = (async () => {
      try {
        const connection = await pool.getConnection();
        connection.release();
        poolReady = true;
        return pool;
      } catch (error) {
        await resetPool();
        throw error;
      }
    })();
  }

  return poolInitPromise;
};

const getPool = () => {
  if (!pool && hasDbConfig()) {
    initPool().catch((error) => {
      const detail = error?.message || error;
      console.warn('[db] Failed to initialize MySQL pool:', detail);
    });
  }
  return pool;
};

const hasPool = () => {
  if (!poolReady && hasDbConfig()) {
    initPool().catch((error) => {
      const detail = error?.message || error;
      console.warn('[db] Failed to initialize MySQL pool:', detail);
    });
  }
  return poolReady;
};

const ensurePool = async () => {
  try {
    await initPool();
  } catch (error) {
    const detail = error?.message || error;
    console.warn('[db] Unable to ensure MySQL pool:', detail);
  }
  return poolReady ? pool : null;
};

const invalidatePool = () => resetPool();

module.exports = {
  getPool,
  hasPool,
  ensurePool,
  invalidatePool,
};
