import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Card from '../../components/ui/Card';
import StatCard from '../../components/ui/StatCard';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { Flame, Activity, TrendingUp, Repeat, Trash2, LineChart as LineIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { todayKey, formatDateKey, formatDuration } from '../../utils/date';

const tooltipStyle = { backgroundColor: '#FFF', borderRadius: '8px', fontSize: '12px', border: '1px solid #E2E8F0' };

const heatColor = (n) =>
  n === 0 ? 'bg-slate-100' : n === 1 ? 'bg-emerald-200' : n === 2 ? 'bg-emerald-400' : 'bg-emerald-600';

export const PatientProgress = () => {
  const { API_BASE_URL } = useAuth();
  const navigate = useNavigate();
  const [days, setDays] = useState(30);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [romExercise, setRomExercise] = useState('');

  const fetchAnalytics = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/progress/analytics`, { params: { days, today: todayKey() } });
      if (res.data.success) {
        setAnalytics(res.data.analytics);
        const slugs = Object.keys(res.data.analytics.romByExercise);
        setRomExercise((cur) => (slugs.includes(cur) ? cur : slugs[0] || ''));
      }
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [days]);

  const deleteSession = async (id) => {
    if (!window.confirm('Delete this session? Your stats will be recalculated.')) return;
    try {
      await axios.delete(`${API_BASE_URL}/sessions/${id}`);
      fetchAnalytics();
    } catch (err) {
      console.error('Failed to delete session:', err);
    }
  };

  const { summary = {}, period = {}, daily = [], romByExercise = {}, exercises = [], heatmap = [], recentSessions = [] } =
    analytics || {};
  const romSeries = romByExercise[romExercise];
  const hasAnyData = summary.totalSessions > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Progress Analytics</h1>
          <p className="text-xs text-slate-500 mt-1">Built from every Live AI Session you complete.</p>
        </div>

        <div className="flex items-center bg-slate-100 p-1 rounded-xl">
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => {
                if (d !== days) {
                  setLoading(true);
                  setDays(d);
                }
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                days === d ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {d} Days
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[0, 1, 2, 3].map((i) => <Skeleton key={i} height="h-28" />)}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton height="h-72" />
            <Skeleton height="h-72" />
          </div>
        </div>
      ) : !hasAnyData ? (
        <EmptyState
          icon={LineIcon}
          title="No sessions recorded yet"
          description="Complete a Live AI Session and your streak, form quality and range-of-motion trends will appear here."
          actionLabel="Start a Live AI Session"
          onAction={() => navigate('/live-session')}
        />
      ) : (
        <>
          {/* Summary */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Current Streak"
              value={`🔥 ${summary.currentStreak}`}
              unit={summary.currentStreak === 1 ? 'Day' : 'Days'}
              icon={Flame}
              iconBg="bg-amber-50 text-amber-600"
              description={`Longest ${summary.longestStreak} · ${summary.activeDays} active days`}
            />
            <StatCard
              title={`Sessions (${days}d)`}
              value={period.sessions}
              icon={Repeat}
              iconBg="bg-sky-50 text-sky-600"
              description={`${period.reps} reps · ${period.minutes} min`}
            />
            <StatCard
              title={`Form Quality (${days}d)`}
              value={period.avgQuality == null ? '–' : `${period.avgQuality}%`}
              icon={Activity}
              iconBg="bg-emerald-50 text-emerald-600"
              description={`All-time ${summary.avgQuality}%`}
            />
            <StatCard
              title="Best ROM"
              value={`${summary.bestROM}°`}
              icon={TrendingUp}
              iconBg="bg-indigo-50 text-indigo-600"
              description={`Avg ${summary.avgROM}° per rep`}
            />
          </div>

          {period.sessions === 0 ? (
            <EmptyState
              title={`No sessions in the last ${days} days`}
              description="Pick a longer range or complete a new session."
            />
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* ROM per exercise */}
                <Card
                  title="Range of Motion"
                  subtitle="Joint range per rep (°), by exercise"
                  action={
                    <select
                      value={romExercise}
                      onChange={(e) => setRomExercise(e.target.value)}
                      className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white"
                    >
                      {Object.entries(romByExercise).map(([slug, ex]) => (
                        <option key={slug} value={slug}>{ex.exerciseName}</option>
                      ))}
                    </select>
                  }
                >
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={romSeries?.points || []}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                        <XAxis dataKey="label" stroke="#94A3B8" fontSize={11} />
                        <YAxis stroke="#94A3B8" fontSize={11} domain={[0, (max) => Math.max(max, romSeries?.targetROM || 0) + 10]} />
                        <Tooltip contentStyle={tooltipStyle} />
                        {romSeries?.targetROM && (
                          <ReferenceLine
                            y={romSeries.targetROM}
                            stroke="#94A3B8"
                            strokeDasharray="5 5"
                            label={{ value: `Target ${romSeries.targetROM}°`, fontSize: 10, fill: '#64748B', position: 'insideTopRight' }}
                          />
                        )}
                        <Line type="monotone" dataKey="bestROM" name="Best ROM (°)" stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} />
                        <Line type="monotone" dataKey="avgROM" name="Avg ROM (°)" stroke="#0284C7" strokeWidth={3} dot={{ r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                {/* Quality */}
                <Card title="Form Quality" subtitle="Daily average score (0–100%)">
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={daily}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                        <XAxis dataKey="label" stroke="#94A3B8" fontSize={11} />
                        <YAxis stroke="#94A3B8" fontSize={11} domain={[0, 100]} />
                        <Tooltip contentStyle={tooltipStyle} />
                        <ReferenceLine y={80} stroke="#CBD5E1" strokeDasharray="4 4" />
                        <Line type="monotone" dataKey="quality" name="Quality (%)" stroke="#10B981" strokeWidth={3} dot={{ r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Reps per day */}
                <Card title="Daily Reps" subtitle="Total repetitions per active day" className="lg:col-span-2">
                  <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={daily}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                        <XAxis dataKey="label" stroke="#94A3B8" fontSize={11} />
                        <YAxis stroke="#94A3B8" fontSize={11} allowDecimals={false} />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Bar dataKey="reps" name="Reps" fill="#0284C7" radius={[6, 6, 0, 0]} maxBarSize={40} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                {/* Activity heatmap */}
                <Card title="Activity" subtitle="Last 5 weeks">
                  <div className="grid grid-cols-7 gap-1.5">
                    {heatmap.map((d) => (
                      <div
                        key={d.date}
                        title={`${formatDateKey(d.date)}: ${d.sessions} session${d.sessions === 1 ? '' : 's'}, ${d.reps} reps`}
                        className={`aspect-square rounded-md ${heatColor(Math.min(d.sessions, 3))} ${d.date === todayKey() ? 'ring-2 ring-sky-500' : ''}`}
                      />
                    ))}
                  </div>
                  <div className="flex items-center justify-end gap-1.5 mt-3 text-[10px] text-slate-400">
                    Less
                    {[0, 1, 2, 3].map((n) => <span key={n} className={`w-3 h-3 rounded-sm ${heatColor(n)}`} />)}
                    More
                  </div>
                </Card>
              </div>

              {/* Per-exercise breakdown */}
              <Card title="By Exercise" subtitle={`Last ${days} days`} bodyClassName="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="text-left font-bold px-6 py-3">Exercise</th>
                        <th className="text-right font-bold px-4 py-3">Sessions</th>
                        <th className="text-right font-bold px-4 py-3">Reps</th>
                        <th className="text-right font-bold px-4 py-3">Avg form</th>
                        <th className="text-right font-bold px-4 py-3">Avg ROM</th>
                        <th className="text-right font-bold px-4 py-3">Best ROM</th>
                        <th className="text-right font-bold px-6 py-3">Last done</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {exercises.map((ex) => (
                        <tr key={ex.exerciseSlug} className="text-slate-700">
                          <td className="px-6 py-3 font-bold text-slate-900">{ex.exerciseName}</td>
                          <td className="px-4 py-3 text-right">{ex.timesPerformed}</td>
                          <td className="px-4 py-3 text-right">{ex.totalReps}</td>
                          <td className="px-4 py-3 text-right">
                            <Badge variant={ex.avgQuality >= 80 ? 'success' : ex.avgQuality >= 60 ? 'warning' : 'danger'}>{ex.avgQuality}%</Badge>
                          </td>
                          <td className="px-4 py-3 text-right">{ex.avgROM}°{ex.targetROM ? <span className="text-slate-400"> / {ex.targetROM}°</span> : null}</td>
                          <td className="px-4 py-3 text-right">{ex.bestROM}°</td>
                          <td className="px-6 py-3 text-right text-slate-500">{formatDateKey(ex.lastPerformedDate)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* Session log */}
              <Card title="Session History" subtitle="Most recent first" bodyClassName="p-0">
                <div className="divide-y divide-slate-100">
                  {recentSessions.map((s) => (
                    <div key={s._id} className="px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900">{s.exerciseName}</p>
                        <p className="text-slate-400">
                          {new Date(s.completedAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                          {' · '}
                          {formatDuration(s.durationSeconds)}
                        </p>
                      </div>
                      <div className="flex items-center gap-5">
                        <div className="text-right">
                          <p className="text-slate-400 text-[10px] uppercase">Reps</p>
                          <p className="font-bold text-slate-900">{s.completedReps}/{s.targetReps}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-slate-400 text-[10px] uppercase">Avg ROM</p>
                          <p className="font-bold text-sky-600">{s.averageROM}°</p>
                        </div>
                        <div className="text-right">
                          <p className="text-slate-400 text-[10px] uppercase">Form</p>
                          <p className="font-bold text-emerald-600">{s.qualityScore}%</p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => deleteSession(s._id)} aria-label="Delete session">
                          <Trash2 className="w-3.5 h-3.5 text-slate-400" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default PatientProgress;
