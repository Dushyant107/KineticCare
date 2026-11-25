// Patient statistics derived from stored ExerciseSession records.
// Everything shown on the dashboard, progress analytics and My Program pages
// is computed here from real session data, so the numbers always reflect what
// the patient actually did in the live AI sessions.

import ExerciseSession from '../models/ExerciseSession.js';

// Exercises the live AI tracker (public/exercise.html) can measure, with the
// target range of motion (degrees of joint excursion per rep) used for scoring.
export const EXERCISE_CATALOG = {
  knee_ext: { name: 'Seated Knee Extension', bodyPart: 'Knee', targetROM: 70, defaultReps: 10 },
  left_curl: { name: 'Left Arm Bicep Curl', bodyPart: 'Arm', targetROM: 110, defaultReps: 10 },
  right_curl: { name: 'Right Arm Bicep Curl', bodyPart: 'Arm', targetROM: 110, defaultReps: 10 },
  squat: { name: 'Full Body Squat', bodyPart: 'Full Body', targetROM: 80, defaultReps: 8 },
  shoulder_lat: { name: 'Lateral Shoulder Raise', bodyPart: 'Shoulder', targetROM: 80, defaultReps: 10 },
  shoulder_front: { name: 'Front Shoulder Raise', bodyPart: 'Shoulder', targetROM: 80, defaultReps: 10 },
};

const DAY_MS = 24 * 60 * 60 * 1000;

// "YYYY-MM-DD" validation for dates sent by the browser (patient's local day).
export const isDateKey = (s) => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s);

export const serverDateKey = (d = new Date()) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const keyToUTC = (key) => {
  const [y, m, d] = key.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
};

export const shiftDateKey = (key, deltaDays) => {
  const d = new Date(keyToUTC(key) + deltaDays * DAY_MS);
  return d.toISOString().slice(0, 10);
};

const dayDiff = (a, b) => Math.round((keyToUTC(a) - keyToUTC(b)) / DAY_MS);

// Older sessions may not have a localDate; fall back to the server-local day.
export const sessionDateKey = (s) => s.localDate || serverDateKey(new Date(s.completedAt));

const avg = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);
const round = (n) => Math.round(n);

// Current streak counts consecutive active days ending today, or ending
// yesterday if the patient hasn't exercised yet today (streak still alive).
export const computeStreaks = (dateKeys, today) => {
  const days = [...new Set(dateKeys)].sort();
  if (!days.length) return { currentStreak: 0, longestStreak: 0, activeDays: 0, activeToday: false };

  let longest = 1;
  let run = 1;
  for (let i = 1; i < days.length; i++) {
    run = dayDiff(days[i], days[i - 1]) === 1 ? run + 1 : 1;
    longest = Math.max(longest, run);
  }

  const set = new Set(days);
  const activeToday = set.has(today);
  let cursor = activeToday ? today : shiftDateKey(today, -1);
  let current = 0;
  while (set.has(cursor)) {
    current++;
    cursor = shiftDateKey(cursor, -1);
  }

  return { currentStreak: current, longestStreak: longest, activeDays: days.length, activeToday };
};

const romPercent = (s) => {
  const target = EXERCISE_CATALOG[s.exerciseSlug]?.targetROM || s.targetROM || 90;
  return Math.min(100, (s.averageROM / target) * 100);
};

// Recovery score: 50% form quality, 30% ROM vs target, 20% consistency
// (active days in the last 14).
const computeRecoveryScore = (sessions, today) => {
  if (!sessions.length) return null;
  const recent = sessions.slice(0, 10);
  const quality = avg(recent.map((s) => s.qualityScore));
  const rom = avg(recent.map(romPercent));
  const windowStart = shiftDateKey(today, -13);
  const activeRecent = new Set(sessions.map(sessionDateKey).filter((d) => d >= windowStart && d <= today)).size;
  const consistency = (activeRecent / 14) * 100;
  return round(quality * 0.5 + rom * 0.3 + consistency * 0.2);
};

export const loadSessions = (patientId) =>
  ExerciseSession.find({ patientId }).sort({ completedAt: -1 }).lean();

export const summarizeSessions = (sessions, today) => {
  const streaks = computeStreaks(sessions.map(sessionDateKey), today);

  const weekStart = shiftDateKey(today, -6);
  const prevWeekStart = shiftDateKey(today, -13);
  const thisWeek = sessions.filter((s) => sessionDateKey(s) >= weekStart);
  const lastWeek = sessions.filter((s) => {
    const k = sessionDateKey(s);
    return k >= prevWeekStart && k < weekStart;
  });

  const weekDelta = (field) =>
    thisWeek.length && lastWeek.length
      ? round(avg(thisWeek.map((s) => s[field])) - avg(lastWeek.map((s) => s[field])))
      : null;

  // Last 7 days, oldest first, for the dashboard week strip.
  const activeSet = new Set(sessions.map(sessionDateKey));
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = shiftDateKey(today, i - 6);
    return { date, active: activeSet.has(date) };
  });

  return {
    totalSessions: sessions.length,
    totalReps: sessions.reduce((a, s) => a + (s.completedReps || 0), 0),
    totalMinutes: round(sessions.reduce((a, s) => a + (s.durationSeconds || 0), 0) / 60),
    avgQuality: sessions.length ? round(avg(sessions.map((s) => s.qualityScore))) : null,
    avgROM: sessions.length ? round(avg(sessions.map((s) => s.averageROM))) : null,
    bestROM: sessions.length ? Math.max(...sessions.map((s) => s.bestROM || 0)) : null,
    qualityChangeWeek: weekDelta('qualityScore'),
    romChangeWeek: weekDelta('averageROM'),
    sessionsThisWeek: thisWeek.length,
    recoveryScore: computeRecoveryScore(sessions, today),
    last7Days,
    ...streaks,
  };
};

// Per-exercise history, most recently performed first.
export const exerciseBreakdown = (sessions, today) => {
  const map = new Map();
  for (const s of sessions) {
    if (!map.has(s.exerciseSlug)) map.set(s.exerciseSlug, []);
    map.get(s.exerciseSlug).push(s);
  }

  return [...map.entries()].map(([slug, list]) => {
    const latest = list[0];
    const catalog = EXERCISE_CATALOG[slug];
    const lastDate = sessionDateKey(latest);
    return {
      exerciseSlug: slug,
      exerciseName: catalog?.name || latest.exerciseName,
      bodyPart: catalog?.bodyPart || 'General',
      targetROM: catalog?.targetROM || null,
      timesPerformed: list.length,
      totalReps: list.reduce((a, s) => a + (s.completedReps || 0), 0),
      avgQuality: round(avg(list.map((s) => s.qualityScore))),
      avgROM: round(avg(list.map((s) => s.averageROM))),
      bestROM: Math.max(...list.map((s) => s.bestROM || 0)),
      lastQuality: latest.qualityScore,
      lastROM: latest.averageROM,
      lastReps: latest.completedReps,
      lastTargetReps: latest.targetReps,
      lastPerformedAt: latest.completedAt,
      lastPerformedDate: lastDate,
      daysSinceLast: dayDiff(today, lastDate),
      doneToday: list.some((s) => sessionDateKey(s) === today),
    };
  }).sort((a, b) => new Date(b.lastPerformedAt) - new Date(a.lastPerformedAt));
};

// Turn exercise history into a "do these again" list with a simple
// progression rule: if the last session hit its rep goal with good form,
// raise the goal by 2 reps; if form was poor, keep it and focus on form.
export const buildRecommendations = (sessions, today) => {
  const breakdown = exerciseBreakdown(sessions, today);

  return breakdown.map((ex) => {
    const hitGoal = ex.lastReps >= ex.lastTargetReps;
    let recommendedReps = ex.lastTargetReps || EXERCISE_CATALOG[ex.exerciseSlug]?.defaultReps || 10;
    let reason;

    if (hitGoal && ex.lastQuality >= 80) {
      recommendedReps = Math.min(recommendedReps + 2, 30);
      reason = `Last time you hit ${ex.lastReps} reps at ${ex.lastQuality}% form. Try ${recommendedReps} reps.`;
    } else if (ex.lastQuality < 60) {
      reason = `Form was ${ex.lastQuality}% last time. Keep ${recommendedReps} reps and focus on slow, full movements.`;
    } else if (!hitGoal) {
      reason = `You finished ${ex.lastReps}/${ex.lastTargetReps} reps last time. Repeat the same goal.`;
    } else {
      reason = `Keep ${recommendedReps} reps and aim for form above 80%.`;
    }

    const romGap = ex.targetROM ? ex.targetROM - ex.lastROM : null;
    if (romGap && romGap > 10) {
      reason += ` Range of motion is ${romGap}° short of the ${ex.targetROM}° target.`;
    }

    // Priority: not done today first, then the one left longest.
    const priority = (ex.doneToday ? 0 : 1000) + ex.daysSinceLast * 10 + (100 - ex.lastQuality) / 10;

    return { ...ex, recommendedReps, reason, priority: round(priority) };
  }).sort((a, b) => b.priority - a.priority);
};
