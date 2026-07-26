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

  
  // Logika di bawah ini yang memutuskan apakah pengunjung boleh lolos (Bypass) atau dihitung.
  skip: (req) => {
    // 1. Cek mode sakelar utama dari file .env (Jalur VIP Global)
    if (process.env.PERFORMANCE_TEST_MODE === "true") return true;

    // 2. Cek apakah ada  "x-performative-mode" yang berisi kata sandi "mbg-stress-bypass"
    // Jika K6 membawa kata sandi ini, membiarkan K6 lolos masuk!
    if (req.headers["x-performative-mode"] === "mbg-stress-bypass") return true;

    // 3. Jika tidak bawa kata sandi (pengunjung biasa / hacker), hitung kliknya dan blokir jika melebihi batas
    return false;
  },

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