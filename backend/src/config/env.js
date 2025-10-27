const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT ?? '4000', 10),
  mysql: {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    port: process.env.MYSQL_PORT ? Number(process.env.MYSQL_PORT) : 3306,
  },
  uploadDir: process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads', 'photos'),
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
};

module.exports = env;
