const express = require('express');
const cors = require('cors');
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

// Trust Nginx reverse proxy - required for correct IP identification behind docker
app.set('trust proxy', 1);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded assignment files statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Apply rate limiter to all API routes
app.use('/api/', apiRateLimiter);

// Basic Health Check
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

// Prometheus Metrics Endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', promClient.register.contentType);
  res.end(await promClient.register.metrics());
});

// Mount routers
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/courses', courseRouter);
app.use('/api/v1/courses', courseAssignmentRouter);
app.use('/api/v1/materials', materialRouter);
app.use('/api/v1/assignments', assignmentRouter);
app.use('/api/v1/progress', progressRouter);

// 404 Route
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    code: '01',
    message: 'API route not found'
  });
});

// Global Error Handler
app.use(errorHandler);

module.exports = app;
