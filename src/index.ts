import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import authRoutes from './routes/auth.routes.js';
import playbookRoutes from './routes/playbook.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Database connection
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/playbooks', playbookRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Coaches Backend API' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
