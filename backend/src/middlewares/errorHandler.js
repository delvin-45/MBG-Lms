class AppError extends Error {
  constructor(message, statusCode, code) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.status = 'error';
    Error.captureStackTrace(this, this.constructor);
  }
}

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const code = err.code || '500';
  const message = err.message || 'Internal Server Error';

  // Log error in console for debugging
  console.error(`[Error] ${req.method} ${req.url} - Code: ${code}, Status: ${statusCode}, Message: ${message}`);
  if (statusCode === 500) {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    status: 'error',
    code,
    message,
    data: null
  });
};

module.exports = {
  AppError,
  errorHandler
};
