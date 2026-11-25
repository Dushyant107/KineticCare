import express from 'express';
import { saveSession, getMySessions, getPatientSessions, deleteSession } from '../controllers/sessionController.js';
import { protect, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.post('/save', protect, saveSession);
router.get('/my', protect, getMySessions);
router.delete('/:id', protect, deleteSession);
router.get('/patient/:patientId', protect, requireRole(['THERAPIST', 'ADMIN']), getPatientSessions);

export default router;
