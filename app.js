import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import config from './src/utils/config.js';
import logger from './src/utils/logger.js';
import connectDB from './src/db/mongoDb.js';
import routes from './src/routes/index.js';

import dotenv from 'dotenv';
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(
  morgan('combined', {
    skip: (req, res) => config.env === 'development' && res.statusCode < 400,
    stream: { write: (message) => logger.info(message.trim()) },
  })
);

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Database Connection
connectDB();

// Routes
app.use('/api', routes);

export default app;