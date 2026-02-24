module.exports.errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  const code = err.code || "INTERNAL_SERVER_ERROR";

  res.status(statusCode).json({
    status: "error",
    code,
    message,
  });
};

module.exports.notFound = (req, res, next) => {
  res.status(404).json({
    status: "error",
    code: "ENDPOINT_NOT_FOUND",
    message: `The requested endpoint '${req.originalUrl}' does not exist.`,
  });
};
