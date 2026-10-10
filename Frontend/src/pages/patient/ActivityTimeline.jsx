import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Card from '../../components/ui/Card';
import StatCard from '../../components/ui/StatCard';
import Badge from '../../components/ui/Badge';
import Skeleton from '../../components/ui/Skeleton';
import CalendarView from '../../components/ui/CalendarView';
import { Flame, Calendar as CalendarIcon, Activity, TrendingUp, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const ActivityTimeline = () => {
  const { user, API_BASE_URL } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [calendarMap, setCalendarMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sessRes, calRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/sessions/my`),
        axios.get(`${API_BASE_URL}/progress/calendar`),
      ]);
      if (sessRes.data.success) setSessions(sessRes.data.sessions);
      if (calRes.data.success) setCalendarMap(calRes.data.calendar);
    } catch (err) {
      console.error('Failed to fetch activity data:', err);
    } finally {
      setLoading(false);
    }
  };

  const streak = user?.profile?.currentStreak || 7;
  const longestStreak = user?.profile?.longestStreak || 12;

  // Exercise Comparison Logic (Latest vs Previous)
  const latestSession = sessions[0];
  const previousSession = sessions[1];
  const romDiff = (latestSession?.averageROM || 118) - (previousSession?.averageROM || 112);
  const qualityDiff = (latestSession?.qualityScore || 92) - (previousSession?.qualityScore || 88);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Daily Activity & Streaks</h1>
        <p className="text-xs text-slate-500 mt-1">
          Longitudinal rehabilitation timeline tracking consecutive active days, daily progress logs, and historical session diffs.
        </p>
      </div>

      {/* Top Streak Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Current Streak"
          value={`🔥 ${streak}`}
          unit="Days"
          icon={Flame}
          iconBg="bg-amber-50 text-amber-600"
          description="Active rehabilitation streak"
        />
        <StatCard
          title="Longest Streak"
          value={`${longestStreak}`}
          unit="Days"
          icon={TrendingUp}
          iconBg="bg-sky-50 text-sky-600"
          description="Personal record"
        />
        <StatCard
          title="Total Active Days"
          value={`${user?.profile?.activeDaysCount || 18}`}
          unit="Days"
          icon={Activity}
          iconBg="bg-emerald-50 text-emerald-600"
          description="This month"
        />
      </div>

      {/* Historical Exercise Comparison Card */}
      {latestSession && previousSession && (
        <Card title="Historical Performance Comparison" subtitle="Comparing your latest session vs previous session">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase">Range of Motion (ROM)</span>
                <Badge variant={romDiff >= 0 ? 'success' : 'danger'}>
                  {romDiff >= 0 ? `+${romDiff}° Improvement` : `${romDiff}°`}
                </Badge>
              </div>
              <div className="flex items-baseline justify-between">
                <div>
                  <p className="text-[10px] text-slate-400">Latest Session</p>
                  <p className="text-xl font-black text-slate-900">{latestSession.averageROM}°</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400">Previous Session</p>
                  <p className="text-xl font-bold text-slate-500">{previousSession.averageROM}°</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase">Movement Quality</span>
                <Badge variant={qualityDiff >= 0 ? 'success' : 'danger'}>
                  {qualityDiff >= 0 ? `+${qualityDiff}% Form Score` : `${qualityDiff}%`}
                </Badge>
              </div>
              <div className="flex items-baseline justify-between">
                <div>
                  <p className="text-[10px] text-slate-400">Latest Session</p>
                  <p className="text-xl font-black text-slate-900">{latestSession.qualityScore}%</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400">Previous Session</p>
                  <p className="text-xl font-bold text-slate-500">{previousSession.qualityScore}%</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Activity Calendar Grid */}
      <CalendarView calendarData={calendarMap} monthName="September 2026 Activity Grid" />

      {/* Chronological Activity Timeline List */}
      <Card title="Rehabilitation Activity Log" subtitle="Detailed breakdown of completed exercise sessions">
        {loading ? (
          <Skeleton height="h-32" />
        ) : sessions.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6">No activity recorded yet</p>
        ) : (
          <div className="space-y-4">
            {sessions.map((s) => (
              <div
                key={s._id}
                className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{s.exerciseName}</h4>
                    <p className="text-xs text-slate-500">
                      {new Date(s.completedAt).toLocaleString()} | Duration: {Math.round((s.durationSeconds || 300) / 60)} min
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-semibold">
                  <div className="text-right">
                    <p className="text-slate-400 text-[10px] uppercase">Reps</p>
                    <p className="font-bold text-slate-900">{s.completedReps} / {s.targetReps}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-400 text-[10px] uppercase">Avg ROM</p>
                    <p className="font-bold text-sky-600">{s.averageROM}°</p>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-400 text-[10px] uppercase">Form Quality</p>
                    <p className="font-bold text-emerald-600">{s.qualityScore}%</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default ActivityTimeline;
