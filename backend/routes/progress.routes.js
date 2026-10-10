import express from 'express';
import { getAnalytics, getActivityCalendar } from '../controllers/progressController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/analytics', protect, getAnalytics);
router.get('/calendar', protect, getActivityCalendar);

export default router;
