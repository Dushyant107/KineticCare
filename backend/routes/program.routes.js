import express from 'express';
import { createProgram, getMyProgram, getTherapistPrograms } from '../controllers/programController.js';
import { protect, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.post('/create', protect, requireRole(['THERAPIST', 'ADMIN']), createProgram);
router.get('/my', protect, getMyProgram);
router.get('/therapist', protect, requireRole(['THERAPIST', 'ADMIN']), getTherapistPrograms);

export default router;
