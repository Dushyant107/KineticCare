import ExerciseSession from '../models/ExerciseSession.js';
import DailyProgress from '../models/DailyProgress.js';
import PatientProfile from '../models/PatientProfile.js';
import RehabilitationProgram from '../models/RehabilitationProgram.js';
import Notification from '../models/Notification.js';

export const saveSession = async (req, res) => {
  try {
    const patientId = req.user._id;
    const {
      exerciseSlug,
      exerciseName,
      programId,
      durationSeconds = 60,
      targetReps = 10,
      completedReps = 10,
      averageROM = 85,
      bestROM = 95,
      qualityScore = 90,
      feedbackEvents = [],
    } = req.body;

    const session = await ExerciseSession.create({
      patientId,
      exerciseSlug: exerciseSlug || 'knee_ext',
      exerciseName: exerciseName || 'Seated Knee Extension',
      programId,
      durationSeconds,
      targetReps,
      completedReps,
      averageROM,
      bestROM,
      qualityScore,
      feedbackEvents,
      completedAt: new Date(),
    });

    // Retrieve active program to compute program adherence
    const activeProgram = await RehabilitationProgram.findOne({
      patientId,
      status: 'ACTIVE',
    });

    const totalAssignedExercises = activeProgram?.exercises?.length || 1;

    // Fetch all sessions completed today by this patient
    const todayStr = new Date().toISOString().split('T')[0];
    const todayStart = new Date(todayStr);
    const todayEnd = new Date(todayStr);
    todayEnd.setDate(todayEnd.getDate() + 1);

    const todaySessions = await ExerciseSession.find({
      patientId,
      completedAt: { $gte: todayStart, $lt: todayEnd },
    });

    const uniqueCompletedSlugs = new Set(todaySessions.map(s => s.exerciseSlug));
    const exercisesCompletedCount = uniqueCompletedSlugs.size;
    const adherencePercentage = Math.min(100, Math.round((exercisesCompletedCount / totalAssignedExercises) * 100));

    // Update Daily Progress Aggregation
    let daily = await DailyProgress.findOne({ patientId, date: todayStr });

    if (!daily) {
      daily = new DailyProgress({
        patientId,
        date: todayStr,
        sessionsCompleted: 1,
        exercisesCompleted: exercisesCompletedCount,
        totalReps: completedReps,
        totalDurationSeconds: durationSeconds,
        averageQuality: qualityScore,
        averageROM: averageROM,
        bestROM: bestROM,
        adherencePercentage,
        activeDay: true,
      });
    } else {
      daily.sessionsCompleted += 1;
      daily.exercisesCompleted = exercisesCompletedCount;
      daily.totalReps += completedReps;
      daily.totalDurationSeconds += durationSeconds;
      daily.averageQuality = Math.round((daily.averageQuality + qualityScore) / 2);
      daily.averageROM = Math.round((daily.averageROM + averageROM) / 2);
      daily.bestROM = Math.max(daily.bestROM, bestROM);
      daily.adherencePercentage = Math.max(daily.adherencePercentage, adherencePercentage);
      daily.activeDay = true;
    }
    await daily.save();

    // Recalculate Streak
    const profile = await PatientProfile.findOne({ userId: patientId });
    if (profile) {
      const today = new Date(todayStr);
      const lastActive = profile.lastActiveDate ? new Date(new Date(profile.lastActiveDate).toISOString().split('T')[0]) : null;

      // Increment streak when daily program adherence reaches 100% or patient completes assigned routines
      const isProgramCompleteToday = adherencePercentage >= 100 || exercisesCompletedCount >= totalAssignedExercises;

      if (isProgramCompleteToday) {
        if (!lastActive) {
          profile.currentStreak = 1;
          profile.activeDaysCount = 1;
          profile.lastActiveDate = today;
        } else {
          const diffDays = Math.floor((today - lastActive) / (1000 * 60 * 60 * 24));
          if (diffDays === 1) {
            profile.currentStreak += 1;
            profile.activeDaysCount += 1;
            profile.lastActiveDate = today;
          } else if (diffDays > 1) {
            profile.currentStreak = 1;
            profile.activeDaysCount += 1;
            profile.lastActiveDate = today;
          } else if (diffDays === 0) {
            // Already active today; ensure minimum 1
            if (profile.currentStreak === 0) profile.currentStreak = 1;
          }
        }
        profile.longestStreak = Math.max(profile.longestStreak || 0, profile.currentStreak);
        await profile.save();

        if (profile.currentStreak === 3 || profile.currentStreak === 7 || profile.currentStreak === 14) {
          await Notification.create({
            userId: patientId,
            type: 'STREAK_MILESTONE',
            title: `🔥 ${profile.currentStreak}-Day Streak Reached!`,
            message: `Awesome work! You completed your daily rehabilitation program and maintained a ${profile.currentStreak}-day consecutive streak.`,
          });
        }
      }
    }

    res.status(201).json({
      success: true,
      message: 'Exercise session saved successfully',
      session,
      streak: profile ? profile.currentStreak : 1,
      adherencePercentage,
    });
  } catch (error) {
    console.error('saveSession error:', error);
    res.status(500).json({ success: false, message: 'Failed to save exercise session' });
  }
};

export const getMySessions = async (req, res) => {
  try {
    const patientId = req.user._id;
    const sessions = await ExerciseSession.find({ patientId })
      .sort({ completedAt: -1 });

    res.json({ success: true, count: sessions.length, sessions });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch sessions' });
  }
};

export const getPatientSessions = async (req, res) => {
  try {
    const { patientId } = req.params;
    const sessions = await ExerciseSession.find({ patientId })
      .sort({ completedAt: -1 });

    res.json({ success: true, count: sessions.length, sessions });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch patient sessions' });
  }
};
