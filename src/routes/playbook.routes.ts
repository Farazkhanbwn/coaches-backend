import express from 'express';
import {
  createPlaybook,
  getPlaybooks,
  getPlaybookById,
  updatePlaybook,
  deletePlaybook,
} from '../controllers/playbook.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes are protected with verifyToken
router.post('/', verifyToken, createPlaybook);
router.get('/', verifyToken, getPlaybooks);
router.get('/:id', verifyToken, getPlaybookById);
router.put('/:id', verifyToken, updatePlaybook);
router.delete('/:id', verifyToken, deletePlaybook);

export default router;
