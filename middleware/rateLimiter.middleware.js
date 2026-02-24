const { RateLimiterMemory } = require("rate-limiter-flexible");

const rateLimiter = new RateLimiterMemory({
  points: 5,
  duration: 60,
});

module.exports.rateLimiterMiddleware = (req, res, next) => {
  rateLimiter
    .consume(req.ip)
    .then(() => {
      next();
    })
    .catch(() => {
      res.status(429).json({
        status: "error",
        code: "TOO_MANY_REQUESTS",
        message:
          "Too many requests from this IP, please try again after 1 minute.",
      });
    });
};
