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
    // Check Authorization header first, then fallback to cookie
    const authHeader = req.headers.authorization;
    let token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    
    // Fallback to cookie if no Authorization header
    if (!token) {
      token = req.cookies.token;
    }

    console.log('🔐 Auth Middleware - Token present:', !!token);
    console.log('🔗 Request Origin:', req.headers.origin);

    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as {
      userId: string;
      role: string;
    };

    req.user = decoded;
    
    // Check if user still exists in database
    const User = (await import('../models/User.model.js')).default;
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      // User has been deleted, clear cookie and deny access
      const cookieOptions: any = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        path: '/'
      };

      if (process.env.NODE_ENV !== 'production') {
        cookieOptions.domain = 'localhost';
      }

      res.clearCookie('token', cookieOptions);
      return res.status(401).json({ message: 'User account no longer exists' });
    }
    
    // Auto-expire subscription if nextBillingDate passed
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
