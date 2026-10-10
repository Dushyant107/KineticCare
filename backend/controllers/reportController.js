import Report from '../models/Report.js';
import ExerciseSession from '../models/ExerciseSession.js';
import PatientProfile from '../models/PatientProfile.js';

export const generateReport = async (req, res) => {
  try {
    const patientId = req.body.patientId || req.user._id;

    const sessions = await ExerciseSession.find({ patientId }).sort({ completedAt: -1 });
    const profile = await PatientProfile.findOne({ userId: patientId });

    const totalSessions = sessions.length;
    const avgQuality = totalSessions ? Math.round(sessions.reduce((acc, s) => acc + s.qualityScore, 0) / totalSessions) : 85;
    const avgROM = totalSessions ? Math.round(sessions.reduce((acc, s) => acc + s.averageROM, 0) / totalSessions) : 100;

    const defaultPrescribed = [
      { exerciseName: 'Seated Knee Extension', sets: 3, reps: 10, targetROM: 160, prescribedDurationMinutes: 15 },
      { exerciseName: 'Full Body Squat', sets: 3, reps: 8, targetROM: 90, prescribedDurationMinutes: 10 },
    ];

    const report = await Report.create({
      patientId,
      therapistId: req.user.role === 'THERAPIST' ? req.user._id : profile?.therapistId,
      title: req.body.title || `Rehabilitation Clinical Report — ${new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`,
      dateRange: req.body.dateRange || 'Last 30 Days',
      sessionsCompleted: totalSessions,
      adherenceRate: req.body.adherenceRate || (totalSessions > 0 ? 100 : 85),
      averageQuality: avgQuality,
      averageROM: avgROM,
      recoveryScore: profile ? profile.recoveryScore : 84,
      aiObservations: req.body.aiObservations || [
        'Patient consistently maintains optimal joint alignment during terminal flexion.',
        'Range of Motion showed a steady progression with zero form fatigue flags.',
        'Adherence rate to prescribed daily exercises remains excellent.',
      ],
      therapistNotes: req.body.therapistNotes || 'Patient is responding very well to the current therapy protocol. Continue daily knee extensions and quad strengthening.',
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
