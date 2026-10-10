import express from 'express';
import {
  getAllTherapists,
  getTherapistById,
  getTherapistAvailability,
  updateTherapistAvailability,
} from '../controllers/therapistController.js';
import { protect, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getAllTherapists);
router.get('/:id', getTherapistById);
router.get('/:id/availability', getTherapistAvailability);
router.post('/availability', protect, requireRole(['THERAPIST']), updateTherapistAvailability);

export default router;
