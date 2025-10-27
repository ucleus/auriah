const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const env = require('./config/env');
const apiRoutes = require('./routes');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const app = express();

const allowedOrigins = env.clientOrigin.split(',').map((origin) => origin.trim());

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));

app.use('/uploads/photos', express.static(env.uploadDir));
app.use('/api', apiRoutes);

app.use(notFound);
app.use(errorHandler);

const start = () => {
  app.listen(env.port, () => {
    // eslint-disable-next-line no-console
    console.log(`API ready on http://localhost:${env.port}`);
  });
};

if (require.main === module) {
  start();
}

module.exports = app;
