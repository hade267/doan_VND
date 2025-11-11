const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.statusCode || err.status || 500;
  const message =
    err.message || 'Đã xảy ra lỗi máy chủ. Vui lòng thử lại sau.';
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    console.error(err);
  }

  res.status(statusCode).json({
    message,
    ...(isProduction ? {} : { stack: err.stack }),
  });
};

module.exports = errorHandler;
