import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import ProgressBar from '../../components/ui/ProgressBar';
import { ClipboardList, Video, CheckCircle2, Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { todayKey, daysAgoLabel } from '../../utils/date';

const startUrl = (slug, reps) => `/live-session?exercise=${slug}${reps ? `&target=${reps}` : ''}`;

export const PatientProgram = () => {
  const { API_BASE_URL } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/programs/recommended`, { params: { today: todayKey() } });
        if (res.data.success) setData(res.data);
      } catch (err) {
        console.error('Failed to fetch program:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const recs = data?.recommendations || [];
  const notTried = data?.notTried || [];
  const assigned = data?.assignedProgram;
  const doneToday = data?.completedToday || 0;
  const next = recs.find((r) => !r.doneToday);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">My Program</h1>
        <p className="text-xs text-slate-500 mt-1">
          Built from the exercises you've already done. Goals go up as your form improves.
        </p>
      </div>

      {loading ? (
        <Skeleton height="h-64" />
      ) : (
        <>
          {recs.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title="Your program starts with your first session"
              description="Do any exercise from the list below or the Exercise Library. It'll show up here with a suggested goal for next time."
              actionLabel="Open Exercise Library"
              onAction={() => navigate('/exercises')}
            />
          ) : (
            <>
              {/* Today's progress */}
              <div className="bg-gradient-to-r from-sky-900 to-slate-900 text-white rounded-xl shadow-md p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-xs font-bold uppercase tracking-wider text-sky-300">Today</p>
                    <h2 className="text-2xl font-extrabold mt-1">
                      {doneToday} of {recs.length} exercises done
                    </h2>
                    <div className="mt-3 max-w-md">
                      <ProgressBar value={Math.round((doneToday / recs.length) * 100)} color="bg-emerald-400" height="h-2" />
                    </div>
                  </div>
                  {next ? (
                    <Button
                      variant="primary"
                      size="lg"
                      className="bg-emerald-500 hover:bg-emerald-600 text-white border-0 shadow-md"
                      icon={Video}
                      onClick={() => navigate(startUrl(next.exerciseSlug, next.recommendedReps))}
                    >
                      Next: {next.exerciseName}
                    </Button>
                  ) : (
                    <span className="px-4 py-2 rounded-lg bg-emerald-500 text-white text-sm font-bold">
                      All done for today 🎉
                    </span>
                  )}
                </div>
              </div>

              <Card title="Recommended Again" subtitle="Your exercises, ordered by what needs attention first">
                <div className="space-y-3">
                  {recs.map((ex) => (
                    <div
                      key={ex.exerciseSlug}
                      className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${ex.doneToday ? 'bg-emerald-50/50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${ex.doneToday ? 'bg-emerald-100 text-emerald-700' : 'bg-sky-100 text-sky-700'}`}>
                          {ex.doneToday ? <CheckCircle2 className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-900">{ex.exerciseName}</h4>
                            <Badge variant="neutral" size="sm">{ex.bodyPart}</Badge>
                            {ex.doneToday && <Badge variant="success" size="sm">Done today</Badge>}
                          </div>
                          <p className="text-xs text-slate-600 mt-1 leading-relaxed">{ex.reason}</p>
                          <p className="text-[11px] text-slate-400 mt-1">
                            Done {ex.timesPerformed}× · last {daysAgoLabel(ex.daysSinceLast).toLowerCase()} · best ROM {ex.bestROM}° · avg form {ex.avgQuality}%
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700">
                          Goal: {ex.recommendedReps} reps
                        </span>
                        <Button
                          variant={ex.doneToday ? 'outline' : 'primary'}
                          size="sm"
                          onClick={() => navigate(startUrl(ex.exerciseSlug, ex.recommendedReps))}
                        >
                          {ex.doneToday ? 'Do again' : 'Start'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </>
          )}

          {assigned?.exercises?.length > 0 && (
            <Card
              title={`Assigned by therapist: ${assigned.name}`}
              subtitle={assigned.therapistId?.name ? `From ${assigned.therapistId.name}` : undefined}
            >
              <div className="space-y-2">
                {assigned.exercises.map((ex) => (
                  <div key={ex.exerciseSlug} className="flex items-center justify-between gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                    <span className="font-bold text-slate-900">{ex.exerciseName}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-500">{ex.sets} × {ex.reps} reps</span>
                      <Button variant="outline" size="sm" onClick={() => navigate(startUrl(ex.exerciseSlug, ex.reps))}>
                        Start
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {notTried.length > 0 && (
            <Card title="Try Something New" subtitle="AI-tracked exercises you haven't done yet">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {notTried.map((ex) => (
                  <button
                    key={ex.exerciseSlug}
                    onClick={() => navigate(startUrl(ex.exerciseSlug, ex.recommendedReps))}
                    className="text-left p-3 rounded-xl border border-dashed border-slate-300 hover:border-sky-400 hover:bg-sky-50/50 transition-all cursor-pointer flex items-center justify-between gap-2"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-900">{ex.exerciseName}</p>
                      <p className="text-[11px] text-slate-400">{ex.bodyPart} · {ex.recommendedReps} reps</p>
                    </div>
                    <Plus className="w-4 h-4 text-slate-400" />
                  </button>
                ))}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default PatientProgram;
