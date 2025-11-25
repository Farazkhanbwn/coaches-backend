import express from 'express';
import {
  saveCallSession,
  getCallSessions,
  getDashboardStats,
  getSessionById,
  deleteSession,
} from '../controllers/callSession.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// Save call session
router.post('/sessions', saveCallSession);

// Get user's call sessions
router.get('/sessions', getCallSessions);

// Get dashboard stats
router.get('/stats', getDashboardStats);

// Get single session
router.get('/sessions/:id', getSessionById);

// Delete session
router.delete('/sessions/:id', deleteSession);

export default router;
