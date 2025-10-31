import { Router } from 'express';
import { addCompany, getCompanies, updateCompany, deleteCompany, getAllUsers, updateUserSubscription } from '../controllers/admin.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/add-company', verifyToken, addCompany);
router.get('/companies', verifyToken, getCompanies);
router.put('/update-company/:companyId', verifyToken, updateCompany);
router.delete('/delete-company/:companyId', verifyToken, deleteCompany);

router.get('/users', verifyToken, getAllUsers);
router.put('/users/:userId/subscription', verifyToken, updateUserSubscription);

export default router;
