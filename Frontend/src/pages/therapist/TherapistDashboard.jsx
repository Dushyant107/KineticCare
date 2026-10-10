import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Card from '../../components/ui/Card';
import StatCard from '../../components/ui/StatCard';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Skeleton from '../../components/ui/Skeleton';
import { Users, AlertTriangle, Activity, Calendar, Clock, ClipboardList, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const TherapistDashboard = () => {
  const { user, API_BASE_URL } = useAuth();
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [programs, setPrograms] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTherapistData();
  }, []);

  const fetchTherapistData = async () => {
    setLoading(true);
    try {
      const [appRes, progRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/appointments/my`),
        axios.get(`${API_BASE_URL}/programs/therapist`),
      ]);
      if (appRes.data.success) setAppointments(appRes.data.appointments);
      if (progRes.data.success) setPrograms(progRes.data.programs);
    } catch (err) {
      console.error('Failed to fetch therapist dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const attentionAlerts = [
    { patientName: 'Rahul Sharma', issue: 'Adherence threshold warning', detail: 'Completed 2/4 exercises this week', severity: 'warning' },
    { patientName: 'Priya Patel', issue: 'No recent exercise session logged', detail: 'Inactive for >3 days', severity: 'danger' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900">Clinical Management Dashboard</h1>
        <p className="text-xs text-slate-500 mt-1">
          Welcome, {user?.name || 'Dr. Ananya Sharma'}. Monitor patient progress, review AI exercise data, and adjust rehabilitation programs.
        </p>
      </div>

      {/* Top Clinical Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Patients"
          value="24"
          icon={Users}
          iconBg="bg-sky-50 text-sky-600"
          description="Assigned patient roster"
        />
        <StatCard
          title="Active Programs"
          value={programs.length || 12}
          icon={ClipboardList}
          iconBg="bg-emerald-50 text-emerald-600"
          description="Published rehabilitation plans"
        />
        <StatCard
          title="Sessions This Week"
          value="48"
          icon={Activity}
          iconBg="bg-amber-50 text-amber-600"
          description="AI tracked exercise sessions"
        />
        <StatCard
          title="Attention Required"
          value={attentionAlerts.length}
          icon={AlertTriangle}
          iconBg="bg-red-50 text-red-600"
          change="Rule Engine Alerts"
          changeType="negative"
        />
      </div>

      {/* Main Grid: Attention Required & Appointments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Attention Required Rule Engine */}
        <div className="lg:col-span-2 space-y-6">
          <Card
            title="Patient Attention System"
            subtitle="Rule-based monitoring flags (Low Adherence, Inactivity, ROM Plateau)"
          >
            <div className="space-y-3">
              {attentionAlerts.map((alert, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${
                    alert.severity === 'danger'
                      ? 'bg-red-50/50 border-red-200 text-red-900'
                      : 'bg-amber-50/50 border-amber-200 text-amber-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <AlertTriangle className={`w-5 h-5 ${alert.severity === 'danger' ? 'text-red-500' : 'text-amber-500'}`} />
                    <div>
                      <h4 className="text-xs font-bold">{alert.patientName} — {alert.issue}</h4>
                      <p className="text-[11px] opacity-80 mt-0.5">{alert.detail}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => navigate('/therapist/patients')}>
                    Review Patient
                  </Button>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="hover:border-sky-300 transition-all cursor-pointer" onClick={() => navigate('/therapist/programs/create')}>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-sky-100 text-sky-700 rounded-xl">
                  <ClipboardList className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Create Rehabilitation Program</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Assign exercises, sets & target ROM</p>
                </div>
              </div>
            </Card>

            <Card className="hover:border-sky-300 transition-all cursor-pointer" onClick={() => navigate('/therapist/availability')}>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Configure Availability</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Set working hours & appointment slots</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Right Column: Consultations */}
        <div className="space-y-6">
          <Card title="Today's Consultation Schedule" subtitle="Booked patient appointments">
            {appointments.length ? (
              <div className="space-y-3">
                {appointments.slice(0, 4).map((app) => (
                  <div key={app._id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-900">{app.patientId?.name || 'Patient'}</p>
                      <p className="text-slate-500">{app.startTime} - {app.endTime} | {app.appointmentType}</p>
                    </div>
                    <Badge variant={app.status === 'CONFIRMED' ? 'success' : 'neutral'}>{app.status}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-4">No appointments scheduled for today</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TherapistDashboard;
