import {
  isDateKey,
  serverDateKey,
  shiftDateKey,
  loadSessions,
  summarizeSessions,
  exerciseBreakdown,
  sessionDateKey,
} from '../services/stats.js';

const resolvePatientId = (req) =>
  req.user.role === 'PATIENT' ? req.user._id : req.query.patientId || req.user._id;

const resolveToday = (req) => (isDateKey(req.query.today) ? req.query.today : serverDateKey());

const avg = (arr) => (arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : null);

// Daily trend points for a list of sessions (one point per active day).
const dailyTrend = (sessions) => {
  const byDay = new Map();
  for (const s of sessions) {
    const k = sessionDateKey(s);
    if (!byDay.has(k)) byDay.set(k, []);
    byDay.get(k).push(s);
  }
  return [...byDay.entries()]
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([date, list]) => ({
      date,
      label: date.slice(5),
      avgROM: avg(list.map((s) => s.averageROM)),
      bestROM: Math.max(...list.map((s) => s.bestROM || 0)),
      quality: avg(list.map((s) => s.qualityScore)),
      reps: list.reduce((a, s) => a + (s.completedReps || 0), 0),
      minutes: Math.round((list.reduce((a, s) => a + (s.durationSeconds || 0), 0) / 60) * 10) / 10,
      sessions: list.length,
    }));
};

export const getAnalytics = async (req, res) => {
  try {
    const patientId = resolvePatientId(req);
    const today = resolveToday(req);
    const days = Math.min(365, Math.max(1, parseInt(req.query.days, 10) || 30));
    const fromKey = shiftDateKey(today, -(days - 1));

    const allSessions = await loadSessions(patientId);
    const inRange = allSessions.filter((s) => {
      const k = sessionDateKey(s);
      return k >= fromKey && k <= today;
    });

    // ROM only makes sense per exercise, so return a trend for each one.
    const romByExercise = {};
    for (const ex of exerciseBreakdown(inRange, today)) {
      romByExercise[ex.exerciseSlug] = {
        exerciseName: ex.exerciseName,
        targetROM: ex.targetROM,
        points: dailyTrend(inRange.filter((s) => s.exerciseSlug === ex.exerciseSlug)),
      };
    }

    // Activity heatmap: last 35 days ending today.
    const activeMap = new Map(dailyTrend(allSessions).map((d) => [d.date, d]));
    const heatmap = Array.from({ length: 35 }, (_, i) => {
      const date = shiftDateKey(today, i - 34);
      const d = activeMap.get(date);
      return { date, sessions: d?.sessions || 0, reps: d?.reps || 0 };
    });

    res.json({
      success: true,
      days,
      today,
      analytics: {
        summary: summarizeSessions(allSessions, today),
        period: {
          sessions: inRange.length,
          reps: inRange.reduce((a, s) => a + (s.completedReps || 0), 0),
          minutes: Math.round(inRange.reduce((a, s) => a + (s.durationSeconds || 0), 0) / 60),
          avgQuality: avg(inRange.map((s) => s.qualityScore)),
        },
        daily: dailyTrend(inRange),
        romByExercise,
        exercises: exerciseBreakdown(inRange, today),
        heatmap,
        recentSessions: inRange.slice(0, 20),
      },
    });
  } catch (error) {
    console.error('getAnalytics error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch analytics' });
  }
};

export const getActivityCalendar = async (req, res) => {
  try {
    const sessions = await loadSessions(resolvePatientId(req));
    const calendar = {};
    for (const d of dailyTrend(sessions)) {
      calendar[d.date] = { active: true, sessions: d.sessions, reps: d.reps, quality: d.quality, avgROM: d.avgROM };
    }
    res.json({ success: true, calendar });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch activity calendar' });
  }
};
