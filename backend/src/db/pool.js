const mysql = require('mysql2/promise');
const env = require('../config/env');

let pool = null;

const hasDbConfig = () =>
  Boolean(env.mysql.host && env.mysql.user && env.mysql.password && env.mysql.database);

const getPool = () => {
  if (!pool && hasDbConfig()) {
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
  return pool;
};

const hasPool = () => Boolean(getPool());

module.exports = {
  getPool,
  hasPool,
};
