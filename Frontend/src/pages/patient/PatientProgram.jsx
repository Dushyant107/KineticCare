import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import { ClipboardList, Video, Calendar, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const PatientProgram = () => {
  const { API_BASE_URL } = useAuth();
  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProgram();
  }, []);

  const fetchProgram = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/programs/my`);
      if (res.data.success) {
        setProgram(res.data.program);
      }
    } catch (err) {
      console.error('Failed to fetch my program:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">My Rehabilitation Program</h1>
        <p className="text-xs text-slate-500 mt-1">
          Customized exercise plan assigned by your attending physiotherapist.
        </p>
      </div>

      {loading ? (
        <Skeleton height="h-64" />
      ) : !program ? (
        <EmptyState
          title="No Active Program Assigned"
          description="Book a consultation with a therapist to receive a tailored rehabilitation plan."
          actionLabel="Find a Therapist"
          onAction={() => navigate('/find-therapist')}
        />
      ) : (
        <div className="space-y-6">
          {/* Program Overview Card */}
          <Card className="bg-sky-900 text-white border-0 shadow-md p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <Badge variant="primary" className="bg-sky-500/20 text-sky-200 border-sky-400/30 mb-2">
                  Active Program
                </Badge>
                <h2 className="text-2xl font-extrabold">{program.name}</h2>
                <p className="text-xs text-sky-100 mt-1 max-w-xl">{program.description || program.goal}</p>
                <div className="flex items-center gap-4 text-xs text-sky-200 mt-4">
                  <span>Assigned by: <strong className="text-white">{program.therapistId?.name || 'Dr. Ananya Sharma'}</strong></span>
                </div>
              </div>
              <Button
                variant="primary"
                size="lg"
                className="bg-emerald-500 hover:bg-emerald-600 text-white border-0 shadow-md cursor-pointer"
                icon={Video}
                onClick={() => navigate('/live-session')}
              >
                Start AI Session
              </Button>
            </div>
          </Card>

          {/* Assigned Exercises List */}
          <Card title="Assigned Exercises" subtitle="Follow the prescribed sets, reps, and target ROM for optimal recovery">
            <div className="space-y-4">
              {program.exercises?.map((ex, idx) => (
                <div
                  key={ex.exerciseSlug || idx}
                  className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 font-bold flex items-center justify-center text-sm shrink-0">
                      {idx + 1}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{ex.exerciseName}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{ex.instructions}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-semibold shrink-0">
                    <span className="bg-white px-3 py-1.5 rounded-lg border border-slate-200">
                      {ex.sets} Sets × {ex.reps} Reps
                    </span>
                    <span className="bg-sky-50 text-sky-700 px-3 py-1.5 rounded-lg border border-sky-100 font-bold">
                      Target ROM: {ex.targetROM}°
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/live-session?exercise=${ex.exerciseSlug}`)}
                    >
                      Perform
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default PatientProgram;
