import express from 'express';
import { generateReport, getMyReports, getPatientReports } from '../controllers/reportController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/generate', protect, generateReport);
router.get('/my', protect, getMyReports);
router.get('/patient/:patientId', protect, getPatientReports);

export default router;
