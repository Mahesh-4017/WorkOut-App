function notFound(req, res) {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
}

function errorHandler(err, req, res, next) {
  console.error(err);
  const status = err.statusCode || (err.name === 'ValidationError' ? 400 : 500);
  const message = status === 500 && process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message;
  res.status(status).json({ success: false, message, ...(err.errors ? { errors: err.errors } : {}) });
}

module.exports = { notFound, errorHandler };
