import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import StatCard from '../../components/ui/StatCard';
import ProgressCircle from '../../components/ui/ProgressCircle';
import Table from '../../components/ui/Table';
import Skeleton from '../../components/ui/Skeleton';
import {
  Flame,
  Activity,
  CheckCircle2,
  Calendar,
  Video,
  ChevronRight,
  TrendingUp,
  Award,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const PatientDashboard = () => {
  const { user, API_BASE_URL } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/patients/dashboard`);
      if (res.data.success) {
        setDashboardData(res.data.dashboard);
      }
    } catch (err) {
      console.error('Failed to fetch patient dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

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

  const { stats, activeProgram, upcomingAppointment, recentSessions, insights } = dashboardData || {};

  return (
    <div className="space-y-6">
      {/* Greeting Banner */}
      <div className="bg-gradient-to-r from-sky-900 via-sky-800 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent)] pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="primary" className="bg-sky-500/20 text-sky-200 border-sky-400/30">
                Patient Recovery Portal
              </Badge>
              <span className="text-xs text-sky-200 font-medium">ACL & Joint Recovery</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Good morning, {user?.name || 'Rahul'} 👋
            </h1>
            <p className="text-xs sm:text-sm text-sky-100 max-w-xl mt-1 leading-relaxed">
              Here is your rehabilitation overview. Stay consistent with your exercises to maximize joint recovery and range of motion.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="primary"
              size="lg"
              className="bg-emerald-500 hover:bg-emerald-600 text-white border-0 shadow-lg cursor-pointer"
              icon={Video}
              onClick={() => navigate('/live-session')}
            >
              Start Today's AI Session
            </Button>
          </div>
        </div>
      </div>

      {/* Top Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Recovery Score Circle Card */}
        <Card className="flex flex-col items-center justify-center p-4 text-center border-slate-200">
          <ProgressCircle
            value={stats?.recoveryScore || 84}
            size={100}
            strokeWidth={9}
            color="#0284C7"
            label="Score"
            sublabel="Product Index"
          />
          <p className="text-xs font-bold text-slate-700 mt-2">Recovery Score</p>
          <p className="text-[10px] text-slate-400">Based on ROM, Form & Adherence</p>
        </Card>

        <StatCard
          title="Current Streak"
          value={`🔥 ${stats?.currentStreak || 7}`}
          unit="Days"
          icon={Flame}
          iconBg="bg-amber-50 text-amber-600"
          change="+1 day"
          changeType="positive"
          description="Active consecutive days"
        />

        <StatCard
          title="Average Form Quality"
          value={`${stats?.overallAvgQuality || 91}%`}
          icon={Activity}
          iconBg="bg-emerald-50 text-emerald-600"
          change="Optimal"
          changeType="positive"
          description="MediaPipe Landmark accuracy"
        />

        <StatCard
          title="Average ROM"
          value={`${stats?.overallAvgROM || 118}°`}
          icon={TrendingUp}
          iconBg="bg-sky-50 text-sky-600"
          change="+6° this week"
          changeType="positive"
          description="Joint Range of Motion"
        />
      </div>

      {/* Main Grid: Today's Plan & Upcoming Appointment */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Today's Program Plan */}
        <div className="lg:col-span-2 space-y-6">
          <Card
            title="Today's Rehabilitation Plan"
            subtitle={activeProgram?.name || 'Knee Recovery — Phase 2'}
            action={
              <Button variant="ghost" size="sm" onClick={() => navigate('/my-program')}>
                View Full Program <ChevronRight className="w-4 h-4" />
              </Button>
            }
          >
            {activeProgram?.exercises ? (
              <div className="space-y-3">
                {activeProgram.exercises.map((ex, idx) => (
                  <div
                    key={ex.exerciseSlug || idx}
                    className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-4 hover:border-sky-300 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-sm">
                        {idx + 1}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{ex.exerciseName}</h4>
                        <p className="text-xs text-slate-500">
                          {ex.sets} sets × {ex.reps} reps | Target ROM: {ex.targetROM}°
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/live-session?exercise=${ex.exerciseSlug}`)}
                    >
                      Start Exercise
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">No exercises assigned for today.</p>
            )}
          </Card>

          {/* AI Clinical Insights */}
          <Card title="AI Movement Insights" subtitle="Deterministic analytics from recent exercise sessions">
            <div className="space-y-3">
              {insights?.map((insight, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-sky-50/70 border border-sky-100 rounded-xl text-xs text-slate-800">
                  <Sparkles className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">{insight}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column: Upcoming Consultation & Quick Actions */}
        <div className="space-y-6">
          <Card title="Upcoming Appointment">
            {upcomingAppointment ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <img
                    src={upcomingAppointment.therapistId?.avatar || 'https://images.unsplash.com/photo-1594824813566-88855ce7896c?w=150&auto=format&fit=crop&q=80'}
                    alt={upcomingAppointment.therapistId?.name}
                    className="w-12 h-12 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{upcomingAppointment.therapistId?.name}</h4>
                    <p className="text-[11px] text-sky-600 font-semibold">Consultation Review</p>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Date:</span>
                    <span className="font-bold text-slate-900">{upcomingAppointment.date}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Time:</span>
                    <span className="font-bold text-slate-900">{upcomingAppointment.startTime} - {upcomingAppointment.endTime}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Type:</span>
                    <Badge variant="success">{upcomingAppointment.appointmentType}</Badge>
                  </div>
                </div>

                <Button variant="outline" className="w-full text-xs" onClick={() => navigate('/appointments')}>
                  Manage Appointments
                </Button>
              </div>
            ) : (
              <div className="text-center py-4 space-y-3">
                <p className="text-xs text-slate-500">No upcoming appointments booked.</p>
                <Button variant="primary" size="sm" onClick={() => navigate('/find-therapist')}>
                  Find a Therapist
                </Button>
              </div>
            )}
          </Card>

          {/* Recent Sessions List */}
          <Card title="Recent Activity" subtitle="Latest completed AI sessions">
            <div className="space-y-3">
              {recentSessions?.length ? (
                recentSessions.slice(0, 4).map((s) => (
                  <div key={s._id} className="flex items-center justify-between text-xs py-2 border-b border-slate-100 last:border-0">
                    <div>
                      <p className="font-bold text-slate-900">{s.exerciseName}</p>
                      <p className="text-[10px] text-slate-400">{new Date(s.completedAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-emerald-600">{s.qualityScore}% Quality</p>
                      <p className="text-[10px] text-slate-500">{s.averageROM}° ROM</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 text-center py-4">No recent sessions</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
