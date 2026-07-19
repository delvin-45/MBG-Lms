const rateLimit = require("express-rate-limit");

const parsePositiveInteger = (value, fallback) => {
  const parsedValue = Number.parseInt(value, 10);

  if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
    return fallback;
  }

  return parsedValue;
};

const WINDOW_MS = parsePositiveInteger(
  process.env.RATE_LIMIT_WINDOW_MS,
  15 * 60 * 1000
);

const MAX_REQUESTS = parsePositiveInteger(
  process.env.RATE_LIMIT_MAX,
  1000
);

const apiRateLimiter = rateLimit({
  windowMs: WINDOW_MS,
  max: MAX_REQUESTS,

  standardHeaders: true,
  legacyHeaders: false,

  // Hanya dilewati ketika performance testing
  // diaktifkan secara eksplisit.
  skip: () => process.env.PERFORMANCE_TEST_MODE === "true",

  handler: (req, res) => {
    return res.status(429).json({
      status: "error",
      code: "429",
      message: "Terlalu banyak permintaan, silakan coba lagi nanti.",
      data: null,
    });
  },
});

module.exports = apiRateLimiter;