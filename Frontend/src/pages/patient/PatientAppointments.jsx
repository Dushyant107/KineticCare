import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Tabs from '../../components/ui/Tabs';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import { Calendar, Clock, Video, UserCheck, MapPin } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const PatientAppointments = () => {
  const { API_BASE_URL } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/appointments/my`);
      if (res.data.success) {
        setAppointments(res.data.appointments);
      }
    } catch (err) {
      console.error('Failed to fetch appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const upcomingList = appointments.filter(a => a.date >= todayStr && a.status !== 'CANCELLED');
  const pastList = appointments.filter(a => a.date < todayStr || a.status === 'COMPLETED');
  const cancelledList = appointments.filter(a => a.status === 'CANCELLED');

  const displayedList = activeTab === 'upcoming' ? upcomingList : activeTab === 'past' ? pastList : cancelledList;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">My Consultations & Appointments</h1>
        <p className="text-xs text-slate-500 mt-1">
          View scheduled online and in-person consultations with your assigned physiotherapist.
        </p>
      </div>

      <Tabs
        tabs={[
          { id: 'upcoming', label: 'Upcoming', badge: upcomingList.length },
          { id: 'past', label: 'Past Sessions', badge: pastList.length },
          { id: 'cancelled', label: 'Cancelled', badge: cancelledList.length },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {loading ? (
        <div className="space-y-4">
          <Skeleton height="h-28" />
          <Skeleton height="h-28" />
        </div>
      ) : displayedList.length === 0 ? (
        <EmptyState
          title={`No ${activeTab} appointments`}
          description="Schedule a consultation with a verified therapist to discuss your rehabilitation progress."
        />
      ) : (
        <div className="space-y-4">
          {displayedList.map((app) => (
            <Card key={app._id} className="border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img
                    src={app.therapistId?.avatar || 'https://images.unsplash.com/photo-1594824813566-88855ce7896c?w=150&auto=format&fit=crop&q=80'}
                    alt={app.therapistId?.name}
                    className="w-14 h-14 rounded-2xl object-cover border border-slate-200"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">{app.therapistId?.name || 'Therapist'}</h3>
                      <Badge variant={app.status === 'CONFIRMED' ? 'success' : app.status === 'COMPLETED' ? 'info' : 'danger'}>
                        {app.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-sky-600" />
                        {app.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-sky-600" />
                        {app.startTime} - {app.endTime}
                      </span>
                      <span className="flex items-center gap-1">
                        <Video className="w-3.5 h-3.5 text-emerald-600" />
                        {app.appointmentType}
                      </span>
                    </div>
                    {app.notes && (
                      <p className="text-xs text-slate-600 mt-2 bg-slate-50 p-2 rounded-lg border border-slate-100 italic">
                        "{app.notes}"
                      </p>
                    )}
                  </div>
                </div>

                {app.status === 'CONFIRMED' && (
                  <Button variant="primary" size="sm" icon={Video}>
                    Join Consultation
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientAppointments;
