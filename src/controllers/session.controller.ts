import type { Response } from 'express';
import LoginSession from '../models/LoginSession.model.js';
import type { AuthRequest } from '../middleware/auth.middleware.js';

export const getUserSessions = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    
    // Admin can view any user's sessions, users can only view their own
    if (req.user?.role !== 'admin' && req.user?.userId !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const sessions = await LoginSession.find({ userId })
      .sort({ loginTime: -1 })
      .limit(10);

    res.json({ success: true, sessions });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
