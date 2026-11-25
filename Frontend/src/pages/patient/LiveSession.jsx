import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { Video, CheckCircle2, ArrowLeft, Flame, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { todayKey, formatDuration } from '../../utils/date';

// Exercises the live tracker can measure (must match public/exercise.html).
const TRACKED = ['knee_ext', 'left_curl', 'right_curl', 'squat', 'shoulder_lat', 'shoulder_front'];

export const LiveSession = () => {
  const [searchParams] = useSearchParams();
  const requested = searchParams.get('exercise');
  const target = searchParams.get('target');
  const unsupported = requested && !TRACKED.includes(requested);
  const initialExercise = requested && !unsupported ? requested : 'knee_ext';

  const { API_BASE_URL } = useAuth();
  const navigate = useNavigate();
  const iframeRef = useRef(null);
  const savingRef = useRef(false);

  const [frameHeight, setFrameHeight] = useState(720);
  const [frameKey, setFrameKey] = useState(0);
  const [summary, setSummary] = useState(null);
  const [notice, setNotice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const iframeSrc = `/exercise.html?exercise=${initialExercise}${target ? `&target=${encodeURIComponent(target)}` : ''}`;

  const saveSession = async (payload) => {
    if (savingRef.current) return;
    savingRef.current = true;
    setIsSubmitting(true);
    setNotice('');
    try {
      const metrics = { ...payload };
      delete metrics.type;
      const res = await axios.post(`${API_BASE_URL}/sessions/save`, { ...metrics, localDate: todayKey() });
      if (res.data.success) {
        setSummary({ ...res.data.session, stats: res.data.stats });
      }
    } catch (err) {
      console.error('Error saving session:', err);
      setNotice(err.response?.data?.message || 'Could not save the session. Is the backend running?');
    } finally {
      savingRef.current = false;
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.origin !== window.location.origin || !event.data?.type) return;
      const { type } = event.data;
      if (type === 'KINETICCARE_SESSION_COMPLETE') saveSession(event.data);
      if (type === 'KINETICCARE_SESSION_EMPTY') {
        setIsSubmitting(false);
        setNotice('Complete at least one rep before saving the session.');
      }
      if (type === 'KINETICCARE_RESIZE' && event.data.height) {
        setFrameHeight(Math.ceil(event.data.height) + 4);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Ask the tracker for its current numbers; it replies with SESSION_COMPLETE or SESSION_EMPTY.
  const handleComplete = () => {
    setIsSubmitting(true);
    iframeRef.current?.contentWindow?.postMessage({ type: 'KINETICCARE_FINISH' }, window.location.origin);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={() => navigate(-1)}>
            Back
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900">Live AI Exercise Tracker</h1>
              <Badge variant="success">
                <Video className="w-3 h-3 mr-1" />
                Live
              </Badge>
            </div>
            <p className="text-xs text-slate-500">Pose tracking runs in your browser. Only the session summary is saved.</p>
          </div>
        </div>

        <Button
          variant="primary"
          size="sm"
          className="bg-emerald-600 hover:bg-emerald-700"
          onClick={handleComplete}
          isLoading={isSubmitting}
        >
          Complete Session
        </Button>
      </div>

      {unsupported && (
        <div className="flex items-start gap-2 p-3 rounded-xl border border-amber-200 bg-amber-50 text-xs text-amber-900">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>AI tracking isn't available for that exercise yet. Pick one of the tracked exercises below.</span>
        </div>
      )}

      {notice && (
        <div className="flex items-start gap-2 p-3 rounded-xl border border-amber-200 bg-amber-50 text-xs text-amber-900">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>{notice}</span>
        </div>
      )}

      <div className="w-full bg-slate-50 rounded-2xl overflow-hidden border border-slate-200">
        <iframe
          key={frameKey}
          ref={iframeRef}
          src={iframeSrc}
          title="KineticCare Live AI Session"
          allow="camera; microphone"
          style={{ height: frameHeight }}
          className="w-full border-0 block"
        />
      </div>

      <Modal
        isOpen={!!summary}
        onClose={() => setSummary(null)}
        title="Session saved"
        subtitle="Your dashboard, progress and program have been updated."
      >
        {summary && (
          <div className="space-y-5 text-center">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mb-2">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-extrabold text-emerald-950">{summary.exerciseName}</h3>
              <p className="text-xs text-emerald-700 mt-0.5">
                {summary.completedReps}/{summary.targetReps} reps in {formatDuration(summary.durationSeconds)}
              </p>
            </div>

            <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl flex items-center justify-center gap-2 text-amber-900 text-xs font-bold">
              <Flame className="w-5 h-5 text-amber-500" />
              <span>
                Current streak: {summary.stats?.currentStreak ?? 1} day{summary.stats?.currentStreak === 1 ? '' : 's'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                ['Form quality', `${summary.qualityScore}%`],
                ['Avg ROM / rep', `${summary.averageROM}°`],
                ['Best ROM', `${summary.bestROM}°`],
              ].map(([label, value]) => (
                <div key={label} className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{label}</span>
                  <span className="text-xl font-extrabold text-slate-900">{value}</span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-100 flex flex-wrap justify-center gap-3">
              <Button variant="outline" onClick={() => { setSummary(null); setFrameKey((k) => k + 1); }}>
                Do another set
              </Button>
              <Button variant="outline" onClick={() => navigate('/progress')}>
                View progress
              </Button>
              <Button variant="primary" onClick={() => navigate('/dashboard')}>
                Dashboard
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default LiveSession;
