import { Router } from 'express';
import { addRep, getTeamMembers, removeRep, getTeamCallSessions, getTeamAnalytics } from '../controllers/coach.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/add-rep', verifyToken, addRep);
router.get('/team-members', verifyToken, getTeamMembers);
router.delete('/remove-rep/:repId', verifyToken, removeRep);
router.get('/team-sessions', verifyToken, getTeamCallSessions);
router.get('/team-analytics', verifyToken, getTeamAnalytics);

export default router;
