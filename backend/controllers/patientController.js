import User from '../models/User.js';
import PatientProfile from '../models/PatientProfile.js';
import RehabilitationProgram from '../models/RehabilitationProgram.js';
import {
  isDateKey,
  serverDateKey,
  loadSessions,
  summarizeSessions,
  buildRecommendations,
  exerciseBreakdown,
} from '../services/stats.js';

export const getPatientDashboard = async (req, res) => {
  try {
    const patientId = req.user._id;
    const today = isDateKey(req.query.today) ? req.query.today : serverDateKey();

    let profile = await PatientProfile.findOne({ userId: patientId }).populate('therapistId', 'name email avatar');
    if (!profile) {
      profile = await PatientProfile.create({ userId: patientId });
    }

    const [sessions, activeProgram] = await Promise.all([
      loadSessions(patientId),
      RehabilitationProgram.findOne({ patientId, status: 'ACTIVE' }).populate('therapistId', 'name email avatar'),
    ]);

    const stats = summarizeSessions(sessions, today);
    const recommendations = buildRecommendations(sessions, today).slice(0, 4);
    const breakdown = exerciseBreakdown(sessions, today);

    // Keep cached profile fields in sync (streak can decay without a new session).
    if (profile.currentStreak !== stats.currentStreak || profile.longestStreak !== stats.longestStreak) {
      profile.currentStreak = stats.currentStreak;
      profile.longestStreak = stats.longestStreak;
      profile.activeDaysCount = stats.activeDays;
      await profile.save();
    }

    const insights = [];
    if (!sessions.length) {
      insights.push('Complete your first Live AI Session to start tracking your streak, form quality and range of motion.');
    } else {
      insights.push(
        stats.activeToday
          ? `You've exercised today. Current streak: ${stats.currentStreak} day${stats.currentStreak === 1 ? '' : 's'}.`
          : stats.currentStreak > 0
            ? `Do one session today to extend your ${stats.currentStreak}-day streak.`
            : 'Your streak has reset. One session today starts a new one.'
      );
      if (stats.qualityChangeWeek != null) {
        insights.push(
          stats.qualityChangeWeek >= 0
            ? `Form quality is up ${stats.qualityChangeWeek} points compared with last week.`
            : `Form quality dropped ${Math.abs(stats.qualityChangeWeek)} points from last week. Slow down and use the full range.`
        );
      }
      const best = [...breakdown].sort((a, b) => b.avgQuality - a.avgQuality)[0];
      const weakest = [...breakdown].sort((a, b) => a.avgQuality - b.avgQuality)[0];
      if (best) insights.push(`Your best exercise is ${best.exerciseName} at ${best.avgQuality}% average form.`);
      if (weakest && weakest !== best && weakest.avgQuality < 75) {
        insights.push(`${weakest.exerciseName} needs work (${weakest.avgQuality}% form). It's near the top of My Program.`);
      }
    }

    res.json({
      success: true,
      today,
      dashboard: {
        profile,
        activeProgram,
        recentSessions: sessions.slice(0, 5),
        recommendations,
        stats,
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
