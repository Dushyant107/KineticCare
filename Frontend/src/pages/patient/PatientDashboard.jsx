import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import StatCard from '../../components/ui/StatCard';
import ProgressCircle from '../../components/ui/ProgressCircle';
import Skeleton from '../../components/ui/Skeleton';
import { Flame, Activity, Video, ChevronRight, TrendingUp, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { todayKey, formatDateKey, daysAgoLabel } from '../../utils/date';

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
};

const weekChange = (delta, unit) => {
  if (delta == null) return { change: undefined, changeType: 'neutral' };
  return {
    change: `${delta >= 0 ? '+' : ''}${delta}${unit} vs last week`,
    changeType: delta > 0 ? 'positive' : delta < 0 ? 'negative' : 'neutral',
  };
};

export const PatientDashboard = () => {
  const { user, API_BASE_URL } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/patients/dashboard`, { params: { today: todayKey() } });
        if (res.data.success) setData(res.data.dashboard);
      } catch (err) {
        console.error('Failed to fetch patient dashboard:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton height="h-32" rounded="rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Skeleton height="h-28" />
          <Skeleton height="h-28" />
          <Skeleton height="h-28" />
          <Skeleton height="h-28" />
        </div>
        <Skeleton height="h-64" />
      </div>
    );
  }

  const { stats = {}, recommendations = [], recentSessions = [], insights = [] } = data || {};
  const hasData = stats.totalSessions > 0;
  const quality = weekChange(stats.qualityChangeWeek, ' pts');
  const rom = weekChange(stats.romChangeWeek, '°');

  return (
    <div className="space-y-6">
      {/* Greeting Banner */}
      <div className="bg-gradient-to-r from-sky-900 via-sky-800 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              {greeting()}, {user?.name || user?.username} 👋
            </h1>
            <p className="text-xs sm:text-sm text-sky-100 max-w-xl mt-1 leading-relaxed">
              {hasData
                ? stats.activeToday
                  ? `Nice work, you've already exercised today. ${stats.totalSessions} sessions logged so far.`
                  : `You haven't exercised yet today. One session keeps your streak going.`
                : 'Start your first AI-tracked session. Your streak, form quality and range of motion will show up here.'}
            </p>
          </div>
          <Button
            variant="primary"
            size="lg"
            className="bg-emerald-500 hover:bg-emerald-600 text-white border-0 shadow-lg cursor-pointer shrink-0"
            icon={Video}
            onClick={() => navigate(recommendations[0] ? `/live-session?exercise=${recommendations[0].exerciseSlug}&target=${recommendations[0].recommendedReps}` : '/live-session')}
          >
            Start Today's AI Session
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200" bodyClassName="p-4 flex flex-col items-center justify-center text-center h-full">
          <ProgressCircle
            value={stats.recoveryScore ?? 0}
            size={100}
            strokeWidth={9}
            color="#0284C7"
            display={stats.recoveryScore == null ? '–' : undefined}
            sublabel="Recovery"
          />
          <p className="text-xs font-bold text-slate-700 mt-2">Recovery Score</p>
          <p className="text-[10px] text-slate-400">Form 50% · ROM 30% · Consistency 20%</p>
        </Card>

        <StatCard
          title="Current Streak"
          value={`🔥 ${stats.currentStreak ?? 0}`}
          unit={stats.currentStreak === 1 ? 'Day' : 'Days'}
          icon={Flame}
          iconBg="bg-amber-50 text-amber-600"
          change={`Best: ${stats.longestStreak ?? 0}`}
          changeType="neutral"
          description={stats.activeToday ? 'Done today ✓' : 'Not yet today'}
        />

        <StatCard
          title="Average Form Quality"
          value={hasData ? `${stats.avgQuality}%` : '–'}
          icon={Activity}
          iconBg="bg-emerald-50 text-emerald-600"
          change={quality.change}
          changeType={quality.changeType}
          description={hasData ? `${stats.totalSessions} sessions` : 'No sessions yet'}
        />

        <StatCard
          title="Average ROM"
          value={hasData ? `${stats.avgROM}°` : '–'}
          icon={TrendingUp}
          iconBg="bg-sky-50 text-sky-600"
          change={rom.change}
          changeType={rom.changeType}
          description={hasData ? `Best ${stats.bestROM}°` : 'Per-rep joint range'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: recommended plan + insights */}
        <div className="lg:col-span-2 space-y-6">
          <Card
            title="Today's Plan"
            subtitle="Exercises you've done before, with today's suggested goal"
            action={
              <Button variant="ghost" size="sm" onClick={() => navigate('/my-program')}>
                My Program <ChevronRight className="w-4 h-4" />
              </Button>
            }
          >
            {recommendations.length ? (
              <div className="space-y-3">
                {recommendations.map((ex, idx) => (
                  <div
                    key={ex.exerciseSlug}
                    className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 ${ex.doneToday ? 'bg-emerald-100 text-emerald-700' : 'bg-sky-100 text-sky-700'}`}>
                        {ex.doneToday ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-slate-900">{ex.exerciseName}</h4>
                        <p className="text-xs text-slate-500 truncate">
                          Goal {ex.recommendedReps} reps · last {daysAgoLabel(ex.daysSinceLast).toLowerCase()} at {ex.lastQuality}% form
                        </p>
                      </div>
                    </div>
                    <Button
                      variant={ex.doneToday ? 'outline' : 'primary'}
                      size="sm"
                      onClick={() => navigate(`/live-session?exercise=${ex.exerciseSlug}&target=${ex.recommendedReps}`)}
                    >
                      {ex.doneToday ? 'Again' : 'Start'}
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 space-y-3">
                <p className="text-xs text-slate-500">Your plan builds itself from the exercises you do. Pick one to start.</p>
                <Button variant="primary" size="sm" onClick={() => navigate('/exercises')}>
                  Browse Exercise Library
                </Button>
              </div>
            )}
          </Card>

          <Card title="Insights" subtitle="Based on your recorded sessions">
            <div className="space-y-3">
              {insights.map((insight, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-sky-50/70 border border-sky-100 rounded-xl text-xs text-slate-800">
                  <Sparkles className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">{insight}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right: week strip + recent sessions */}
        <div className="space-y-6">
          <Card title="This Week" subtitle={`${stats.sessionsThisWeek ?? 0} sessions in the last 7 days`}>
            <div className="grid grid-cols-7 gap-1.5">
              {(stats.last7Days || []).map((d) => (
                <div key={d.date} className="flex flex-col items-center gap-1">
                  <div
                    title={d.date}
                    className={`w-full aspect-square rounded-lg flex items-center justify-center text-sm ${d.active ? 'bg-amber-100 border border-amber-200' : 'bg-slate-50 border border-slate-200'}`}
                  >
                    {d.active ? '🔥' : ''}
                  </div>
                  <span className="text-[10px] font-semibold text-slate-400">
                    {formatDateKey(d.date, { weekday: 'narrow' })}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          <Card
            title="Recent Sessions"
            action={
              hasData && (
                <Button variant="ghost" size="sm" onClick={() => navigate('/progress')}>
                  All <ChevronRight className="w-4 h-4" />
                </Button>
              )
            }
          >
            {recentSessions.length ? (
              <div className="divide-y divide-slate-100">
                {recentSessions.map((s) => (
                  <div key={s._id} className="flex items-center justify-between gap-3 text-xs py-2.5">
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 truncate">{s.exerciseName}</p>
                      <p className="text-[10px] text-slate-400">
                        {new Date(s.completedAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })} · {s.completedReps}/{s.targetReps} reps
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <Badge variant={s.qualityScore >= 80 ? 'success' : s.qualityScore >= 60 ? 'warning' : 'danger'}>
                        {s.qualityScore}%
                      </Badge>
                      <p className="text-[10px] text-slate-500 mt-0.5">{s.averageROM}° ROM</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-4">No sessions yet</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
