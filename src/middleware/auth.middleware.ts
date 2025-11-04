import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
}

export const verifyToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as {
      userId: string;
      role: string;
    };

    req.user = decoded;
    
    // Auto-expire subscription if nextBillingDate passed
    const User = (await import('../models/User.model.js')).default;
    const user = await User.findById(decoded.userId);
    
    if (user?.subscription?.nextBillingDate && 
        (user.subscription.status === 'Active' || user.subscription.status === 'Trial')) {
      const now = new Date();
      const billingDate = new Date(user.subscription.nextBillingDate);
      
      if (now > billingDate) {
        user.subscription.status = 'Inactive';
        await user.save();
      }
    }
    
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};
