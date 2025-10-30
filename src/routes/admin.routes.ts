import { Router } from 'express';
import { addCompany, getCompanies, updateCompany, deleteCompany } from '../controllers/admin.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/add-company', verifyToken, addCompany);
router.get('/companies', verifyToken, getCompanies);
router.put('/update-company/:companyId', verifyToken, updateCompany);
router.delete('/delete-company/:companyId', verifyToken, deleteCompany);

export default router;
