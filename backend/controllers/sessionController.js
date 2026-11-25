import ExerciseSession from '../models/ExerciseSession.js';
import DailyProgress from '../models/DailyProgress.js';
import PatientProfile from '../models/PatientProfile.js';
import Notification from '../models/Notification.js';
import {
  EXERCISE_CATALOG,
  isDateKey,
  serverDateKey,
  loadSessions,
  summarizeSessions,
  sessionDateKey,
} from '../services/stats.js';

const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : null);

// Rebuild the DailyProgress row for one day from that day's sessions.
const refreshDailyProgress = async (patientId, dateKey, allSessions) => {
  const day = allSessions.filter((s) => sessionDateKey(s) === dateKey);
  if (!day.length) return;
  const avgOf = (f) => Math.round(day.reduce((a, s) => a + (s[f] || 0), 0) / day.length);

  await DailyProgress.findOneAndUpdate(
    { patientId, date: dateKey },
    {
      sessionsCompleted: day.length,
      exercisesCompleted: new Set(day.map((s) => s.exerciseSlug)).size,
      totalReps: day.reduce((a, s) => a + (s.completedReps || 0), 0),
      totalDurationSeconds: day.reduce((a, s) => a + (s.durationSeconds || 0), 0),
      averageQuality: avgOf('qualityScore'),
      averageROM: avgOf('averageROM'),
      bestROM: Math.max(...day.map((s) => s.bestROM || 0)),
      activeDay: true,
    },
    { upsert: true, new: true }
  );
};

export const saveSession = async (req, res) => {
  try {
    const patientId = req.user._id;
    const body = req.body || {};

    const exerciseSlug = String(body.exerciseSlug || '');
    const catalog = EXERCISE_CATALOG[exerciseSlug];
    if (!catalog) {
      return res.status(400).json({ success: false, message: `Unknown exercise "${exerciseSlug}"` });
    }

    const completedReps = num(body.completedReps);
    if (!completedReps || completedReps < 1) {
      return res.status(400).json({ success: false, message: 'At least one completed repetition is required to save a session' });
    }

    const localDate = isDateKey(body.localDate) ? body.localDate : serverDateKey();
    const repDetails = Array.isArray(body.repDetails)
      ? body.repDetails.slice(0, 200).map((r) => ({
          rom: clamp(Math.round(num(r.rom) || 0), 0, 180),
          durationSeconds: clamp(Math.round((num(r.durationSeconds) || 0) * 10) / 10, 0, 600),
          score: clamp(Math.round(num(r.score) || 0), 0, 100),
        }))
      : [];

    const session = await ExerciseSession.create({
      patientId,
      exerciseSlug,
      exerciseName: catalog.name,
      programId: body.programId || undefined,
      durationSeconds: clamp(Math.round(num(body.durationSeconds) || 0), 0, 4 * 60 * 60),
      targetReps: clamp(Math.round(num(body.targetReps) || completedReps), 1, 200),
      completedReps: clamp(Math.round(completedReps), 1, 500),
      averageROM: clamp(Math.round(num(body.averageROM) || 0), 0, 180),
      bestROM: clamp(Math.round(num(body.bestROM) || 0), 0, 180),
      qualityScore: clamp(Math.round(num(body.qualityScore) || 0), 0, 100),
      trackingRatio: clamp(num(body.trackingRatio) ?? 1, 0, 1),
      repDetails,
      feedbackEvents: Array.isArray(body.feedbackEvents) ? body.feedbackEvents.slice(0, 20).map(String) : [],
      localDate,
      completedAt: new Date(),
    });

    const sessions = await loadSessions(patientId);
    await refreshDailyProgress(patientId, localDate, sessions);

    const stats = summarizeSessions(sessions, localDate);

    // Keep the profile's cached streak fields in sync (used by the topbar / therapist views).
    const profile = await PatientProfile.findOneAndUpdate(
      { userId: patientId },
      {
        currentStreak: stats.currentStreak,
        longestStreak: stats.longestStreak,
        activeDaysCount: stats.activeDays,
        lastActiveDate: new Date(),
        ...(stats.recoveryScore != null ? { recoveryScore: stats.recoveryScore } : {}),
      },
      { upsert: true, new: true }
    );

    const firstSessionToday = sessions.filter((s) => sessionDateKey(s) === localDate).length === 1;
    if (firstSessionToday && [3, 7, 14, 30].includes(stats.currentStreak)) {
      await Notification.create({
        userId: patientId,
        type: 'STREAK_MILESTONE',
        title: `🔥 ${stats.currentStreak}-Day Streak!`,
        message: `You've exercised ${stats.currentStreak} days in a row. Keep it going!`,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Exercise session saved',
      session,
      streak: stats.currentStreak,
      stats,
      profile,
    });
  } catch (error) {
    console.error('saveSession error:', error);
    res.status(500).json({ success: false, message: 'Failed to save exercise session' });
  }
};

export const getMySessions = async (req, res) => {
  try {
    const sessions = await loadSessions(req.user._id);
    res.json({ success: true, count: sessions.length, sessions });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch sessions' });
  }
};

export const getPatientSessions = async (req, res) => {
  try {
    const sessions = await loadSessions(req.params.patientId);
    res.json({ success: true, count: sessions.length, sessions });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch patient sessions' });
  }
};

export const deleteSession = async (req, res) => {
  try {
    const patientId = req.user._id;
    const session = await ExerciseSession.findOneAndDelete({ _id: req.params.id, patientId });
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });

    const dateKey = sessionDateKey(session);
    const sessions = await loadSessions(patientId);
    if (sessions.some((s) => sessionDateKey(s) === dateKey)) {
      await refreshDailyProgress(patientId, dateKey, sessions);
    } else {
      await DailyProgress.deleteOne({ patientId, date: dateKey });
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete session' });
  }
};
