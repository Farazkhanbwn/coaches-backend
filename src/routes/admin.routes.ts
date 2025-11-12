import { Router } from 'express';
import { addCompany, getCompanies, updateCompany, deleteCompany, getAllUsers, updateUserSubscription, createUser, updateUser, deleteUser, sendUpgradeLink } from '../controllers/admin.controller.js';
import { getUserSessions } from '../controllers/session.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { createLimiter } from '../middleware/rateLimiter.middleware.js';

const router = Router();

// Company routes - rate limit create/delete operations
router.post('/add-company', verifyToken, createLimiter, addCompany);
router.get('/companies', verifyToken, getCompanies);
router.put('/update-company/:companyId', verifyToken, updateCompany);
router.delete('/delete-company/:companyId', verifyToken, createLimiter, deleteCompany);

// User routes - rate limit create/delete operations
router.get('/users', verifyToken, getAllUsers);
router.post('/create-user', verifyToken, createLimiter, createUser);
router.put('/users/:userId', verifyToken, updateUser);
router.delete('/users/:userId', verifyToken, createLimiter, deleteUser);
router.post('/users/:userId/send-upgrade-link', verifyToken, createLimiter, sendUpgradeLink);
router.put('/users/:userId/subscription', verifyToken, updateUserSubscription);

// Session routes
router.get('/users/:userId/sessions', verifyToken, getUserSessions);

export default router;
