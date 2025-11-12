import { Router } from 'express';
import { addRep, getTeamMembers, removeRep } from '../controllers/coach.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/add-rep', verifyToken, addRep);
router.get('/team-members', verifyToken, getTeamMembers);
router.delete('/remove-rep/:repId', verifyToken, removeRep);

export default router;
