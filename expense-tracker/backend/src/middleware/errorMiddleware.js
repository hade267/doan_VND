const logger = require('../utils/logger');

const isProduction = process.env.NODE_ENV === 'production';

const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.statusCode || err.status || 500;
  const isOperational = err.isOperational || statusCode < 500;
  const defaultMessage = 'Internal Server Error';
  const rawMessage = err.message || defaultMessage;
  const message =
    isProduction && !isOperational && statusCode >= 500 ? defaultMessage : rawMessage;

  logger.error(
    {
      err,
      statusCode,
      path: req.originalUrl,
      method: req.method,
      requestId: req.id,
    },
    rawMessage,
  );

  const responsePayload = {
    message,
  };

  if (!isProduction && err.stack) {
    responsePayload.stack = err.stack;
  }

  if (req.id) {
    responsePayload.requestId = req.id;
  }

  res.status(statusCode).json(responsePayload);
};

module.exports = errorHandler;
