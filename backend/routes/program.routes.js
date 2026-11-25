import express from 'express';
import { createProgram, getMyProgram, getTherapistPrograms, getRecommendedProgram } from '../controllers/programController.js';
import { protect, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.post('/create', protect, requireRole(['THERAPIST', 'ADMIN']), createProgram);
router.get('/my', protect, getMyProgram);
router.get('/recommended', protect, getRecommendedProgram);
router.get('/therapist', protect, requireRole(['THERAPIST', 'ADMIN']), getTherapistPrograms);

export default router;
