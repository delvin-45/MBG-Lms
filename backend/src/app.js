const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const apiRateLimiter = require('./middlewares/rateLimiter');
const { errorHandler } = require('./middlewares/errorHandler');
const promClient = require('prom-client');

// Initialize Prometheus metrics
const collectDefaultMetrics = promClient.collectDefaultMetrics;
collectDefaultMetrics({ prefix: 'mbg_backend_' });

// Import routers
const authRouter = require('./modules/auth/routes');
const usersRouter = require('./modules/users/routes');
const { courseRouter, materialRouter } = require('./modules/courses/routes');
const { courseAssignmentRouter, assignmentRouter } = require('./modules/assignments/routes');
const progressRouter = require('./modules/progress/routes');
const path = require('path');

const app = express();

// 1. Percayai Proxy Nginx agar IP asli pengunjung terbaca di Docker
app.set('trust proxy', 1);

// 2. Proteksi Header Keamanan HTTP (XSS, Clickjacking, MIME, CSP)
app.use(helmet());

// 3. Kompresi respons JSON dengan Gzip untuk menghemat bandwith
app.use(compression());

// 4. Izinkan Cross-Origin Resource Sharing (CORS) dari frontend
app.use(cors());

// 5. Batas ukuran payload JSON 10MB untuk mendukung upload foto Base64
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 6. Menyediakan akses statis ke folder file tugas/avatar yang diunggah
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// [SATPAM PINTU UTAMA API]
// Semua request yang diawali teks '/api/' WAJIB dicegat oleh apiRateLimiter
app.use('/api/', apiRateLimiter);

// Memaksa browser untuk TIDAK menyimpan cache data API
app.use('/api/', (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
  next();
});

// Endpoint Health Check untuk mengecek status server
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    code: '00',
    message: 'Backend server is running',
    data: {
      uptime: process.uptime()
    }
  });
});

// Endpoint Prometheus Metrics untuk pemantauan Grafana
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', promClient.register.contentType);
  res.end(await promClient.register.metrics());
});

// [DEKLARASI RUTE UTAMA BERSAMA PREFIX /api/v1/...]
// Di sinilah seluruh rute modul didaftarkan dan dihubungkan ke Express
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/courses', courseRouter);
app.use('/api/v1/courses', courseAssignmentRouter);
app.use('/api/v1/materials', materialRouter);
app.use('/api/v1/assignments', assignmentRouter);
app.use('/api/v1/progress', progressRouter);

// Penanganan Rute Salah / 404 Not Found
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    code: '01',
    message: 'API route not found'
  });
});

// Middleware Terpusat Penanganan Error (Global Error Handler)
app.use(errorHandler);

module.exports = app;
