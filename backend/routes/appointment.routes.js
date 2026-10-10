import express from 'express';
import {
  getSlots,
  bookAppointment,
  getMyAppointments,
  updateAppointmentStatus,
} from '../controllers/appointmentController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/slots', getSlots);
router.post('/book', protect, bookAppointment);
router.get('/my', protect, getMyAppointments);
router.patch('/:id/status', protect, updateAppointmentStatus);

export default router;
