import User from '../models/User.js';
import PatientProfile from '../models/PatientProfile.js';
import RehabilitationProgram from '../models/RehabilitationProgram.js';
import ExerciseSession from '../models/ExerciseSession.js';
import DailyProgress from '../models/DailyProgress.js';
import Appointment from '../models/Appointment.js';

export const getPatientDashboard = async (req, res) => {
  try {
    const patientId = req.user._id;

    // Get Patient Profile
    let profile = await PatientProfile.findOne({ userId: patientId }).populate('therapistId', 'name email avatar');
    if (!profile) {
      profile = await PatientProfile.create({ userId: patientId });
    }

    // Lazy streak decay evaluation
    const todayStr = new Date().toISOString().split('T')[0];
    const today = new Date(todayStr);
    if (profile.lastActiveDate) {
      const lastActive = new Date(new Date(profile.lastActiveDate).toISOString().split('T')[0]);
      const diffDays = Math.floor((today - lastActive) / (1000 * 60 * 60 * 24));
      if (diffDays > 1 && profile.currentStreak > 0) {
        profile.currentStreak = 0;
        await profile.save();
      }
    }

    // Get Active Program
    const activeProgram = await RehabilitationProgram.findOne({
      patientId,
      status: 'ACTIVE',
    }).populate('therapistId', 'name email avatar');

    // Get Recent Sessions
    const recentSessions = await ExerciseSession.find({ patientId })
      .sort({ completedAt: -1 })
      .limit(5);

    // Get Today's Progress
    const todayProgress = await DailyProgress.findOne({ patientId, date: todayStr });

    // Get Upcoming Appointment
    const upcomingAppointment = await Appointment.findOne({
      patientId,
      date: { $gte: todayStr },
      status: { $in: ['CONFIRMED', 'PENDING'] },
    })
      .populate('therapistId', 'name email avatar')
      .sort({ date: 1, startTime: 1 });

    // Calculate deterministic insights
    const totalSessions = await ExerciseSession.countDocuments({ patientId });
    const avgQualityAgg = await ExerciseSession.aggregate([
      { $match: { patientId } },
      { $group: { _id: null, avgQuality: { $avg: '$qualityScore' }, avgROM: { $avg: '$averageROM' } } },
    ]);

    const overallAvgQuality = avgQualityAgg.length ? Math.round(avgQualityAgg[0].avgQuality) : 85;
    const overallAvgROM = avgQualityAgg.length ? Math.round(avgQualityAgg[0].avgROM) : 105;

    const insights = [
      `Your current rehabilitation streak is ${profile.currentStreak || 0} days. Keep up the consistent effort!`,
      `Your average movement quality is ${overallAvgQuality}%, indicating strong adherence to form guidelines.`,
      totalSessions > 0
        ? `You have completed ${totalSessions} total exercise sessions so far.`
        : 'Complete your first AI-guided exercise session to generate detailed progress metrics.',
    ];

    res.json({
      success: true,
      dashboard: {
        profile,
        activeProgram,
        todayProgress,
        recentSessions,
        upcomingAppointment,
        stats: {
          recoveryScore: profile.recoveryScore || 75,
          currentStreak: profile.currentStreak || 0,
          longestStreak: profile.longestStreak || 0,
          activeDaysCount: profile.activeDaysCount || 0,
          overallAvgQuality,
          overallAvgROM,
          totalSessions,
        },
        insights,
      },
    });
  } catch (error) {
    console.error('getPatientDashboard error:', error);
    res.status(500).json({ success: false, message: 'Failed to load patient dashboard' });
  }
};

export const updateOnboarding = async (req, res) => {
  try {
    const patientId = req.user._id;
    const { age, gender, rehabilitationGoal, affectedAreas, conditionDescription, activityLevel, exerciseFrequency, therapistId } = req.body;

    const updatedProfile = await PatientProfile.findOneAndUpdate(
      { userId: patientId },
      {
        age,
        gender,
        rehabilitationGoal,
        affectedAreas,
        conditionDescription,
        activityLevel,
        exerciseFrequency,
        therapistId: therapistId || null,
      },
      { upsert: true, new: true }
    );

    await User.findByIdAndUpdate(patientId, { onboardingCompleted: true });

    res.json({
      success: true,
      message: 'Onboarding completed successfully',
      profile: updatedProfile,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to save onboarding data' });
  }
};
