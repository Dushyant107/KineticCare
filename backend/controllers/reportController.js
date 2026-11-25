import Report from '../models/Report.js';
import ExerciseSession from '../models/ExerciseSession.js';
import PatientProfile from '../models/PatientProfile.js';
import { serverDateKey, summarizeSessions, exerciseBreakdown, EXERCISE_CATALOG } from '../services/stats.js';

export const generateReport = async (req, res) => {
  try {
    const patientId = req.body.patientId || req.user._id;

    const sessions = await ExerciseSession.find({ patientId }).sort({ completedAt: -1 }).lean();
    const profile = await PatientProfile.findOne({ userId: patientId });
    const stats = summarizeSessions(sessions, serverDateKey());
    const breakdown = exerciseBreakdown(sessions, serverDateKey());

    const totalSessions = sessions.length;
    const avgQuality = stats.avgQuality ?? 0;
    const avgROM = stats.avgROM ?? 0;

    const defaultPrescribed = breakdown.slice(0, 4).map((ex) => ({
      exerciseName: ex.exerciseName,
      sets: 3,
      reps: ex.lastTargetReps || 10,
      targetROM: EXERCISE_CATALOG[ex.exerciseSlug]?.targetROM || 90,
      prescribedDurationMinutes: 10,
    }));

    const observations = totalSessions
      ? [
          `${totalSessions} AI-tracked sessions completed, ${stats.totalReps} total repetitions over ${stats.activeDays} active days.`,
          `Average form quality ${avgQuality}% and average range of motion ${avgROM}°.`,
          `Current streak ${stats.currentStreak} days (longest ${stats.longestStreak}).`,
        ]
      : ['No AI-tracked sessions recorded yet.'];

    const report = await Report.create({
      patientId,
      therapistId: req.user.role === 'THERAPIST' ? req.user._id : profile?.therapistId,
      title: req.body.title || `Rehabilitation Clinical Report — ${new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`,
      dateRange: req.body.dateRange || 'Last 30 Days',
      sessionsCompleted: totalSessions,
      adherenceRate: req.body.adherenceRate ?? Math.round((stats.activeDays ? Math.min(stats.activeDays, 30) / 30 : 0) * 100),
      averageQuality: avgQuality,
      averageROM: avgROM,
      recoveryScore: stats.recoveryScore ?? 0,
      aiObservations: req.body.aiObservations || observations,
      therapistNotes: req.body.therapistNotes || 'Auto-generated from AI session data. No therapist review yet.',
      prescribedExercises: req.body.prescribedExercises || defaultPrescribed,
      prescribedDailyDurationMinutes: req.body.prescribedDailyDurationMinutes || 25,
      status: 'PUBLISHED',
    });

    res.status(201).json({ success: true, report });
  } catch (error) {
    console.error('generateReport error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate clinical report' });
  }
};

export const getMyReports = async (req, res) => {
  try {
    const patientId = req.user._id;
    const reports = await Report.find({ patientId })
      .populate('therapistId', 'name email avatar')
      .sort({ createdAt: -1 });

    res.json({ success: true, reports });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch reports' });
  }
};

export const getPatientReports = async (req, res) => {
  try {
    const { patientId } = req.params;
    const reports = await Report.find({ patientId })
      .populate('therapistId', 'name email avatar')
      .sort({ createdAt: -1 });

    res.json({ success: true, reports });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch patient reports' });
  }
};
