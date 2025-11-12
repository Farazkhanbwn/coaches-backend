import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import authRoutes from './routes/auth.routes.js';
import playbookRoutes from './routes/playbook.routes.js';
import coachRoutes from './routes/coach.routes.js';
import adminRoutes from './routes/admin.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import webhookRoutes from './routes/webhook.routes.js';
import { apiLimiter } from './middleware/rateLimiter.middleware.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Webhook route BEFORE express.json() middleware
app.use('/api/webhook', webhookRoutes);

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Rate limiting - Apply to all API routes
app.use('/api/', apiLimiter);

// Database connection
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/playbooks', playbookRoutes);
app.use('/api/coach', coachRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payment', paymentRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Coaches Backend API' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
