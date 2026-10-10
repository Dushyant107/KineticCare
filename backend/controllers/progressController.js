import DailyProgress from '../models/DailyProgress.js';
import ExerciseSession from '../models/ExerciseSession.js';

export const getAnalytics = async (req, res) => {
  try {
    const patientId = req.query.patientId || req.user._id;
    const days = parseInt(req.query.days) || 30;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const dailyProgress = await DailyProgress.find({
      patientId,
      createdAt: { $gte: startDate },
    }).sort({ date: 1 });

    const sessions = await ExerciseSession.find({
      patientId,
      completedAt: { $gte: startDate },
    }).sort({ completedAt: 1 });

    // Format ROM & Quality & Adherence trend data
    const romTrend = dailyProgress.map(dp => ({
      date: dp.date.slice(5), // "MM-DD"
      avgROM: dp.averageROM,
      bestROM: dp.bestROM || dp.averageROM + 6,
      targetROM: 160,
    }));

    const qualityTrend = dailyProgress.map(dp => ({
      date: dp.date.slice(5),
      quality: dp.averageQuality,
    }));

    const activityDuration = dailyProgress.map(dp => ({
      date: dp.date.slice(5),
      minutes: Math.round(dp.totalDurationSeconds / 60) || 5,
      reps: dp.totalReps,
    }));

    const adherenceTrend = dailyProgress.map(dp => ({
      date: dp.date.slice(5),
      adherence: dp.adherencePercentage || 100,
    }));

    // Calculate Exercise Distribution
    const distributionMap = {};
    sessions.forEach(s => {
      const name = s.exerciseName || s.exerciseSlug;
      distributionMap[name] = (distributionMap[name] || 0) + 1;
    });

    const distribution = Object.keys(distributionMap).map(name => ({
      name,
      value: distributionMap[name],
    }));

    res.json({
      success: true,
      days,
      analytics: {
        romTrend,
        qualityTrend,
        activityDuration,
        adherenceTrend,
        distribution,
        totalSessions: sessions.length,
      },
    });
  } catch (error) {
    console.error('getAnalytics error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch analytics' });
  }
};

export const getActivityCalendar = async (req, res) => {
  try {
    const patientId = req.query.patientId || req.user._id;
    const progressList = await DailyProgress.find({ patientId });

    const calendarMap = {};
    progressList.forEach(p => {
      calendarMap[p.date] = {
        active: p.activeDay,
        sessions: p.sessionsCompleted,
        reps: p.totalReps,
        quality: p.averageQuality,
        avgROM: p.averageROM,
      };
    });

    res.json({ success: true, calendar: calendarMap });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch activity calendar' });
  }
};
