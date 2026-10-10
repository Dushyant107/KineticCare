import express from 'express';
import { getPatientDashboard, updateOnboarding } from '../controllers/patientController.js';
import { protect, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/dashboard', protect, requireRole(['PATIENT']), getPatientDashboard);
router.post('/onboarding', protect, requireRole(['PATIENT']), updateOnboarding);

export default router;
