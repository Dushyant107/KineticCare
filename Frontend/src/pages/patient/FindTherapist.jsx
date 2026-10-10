import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import BookAppointmentModal from '../../components/appointments/BookAppointmentModal';
import { Search, Star, Calendar, MapPin, Award, Stethoscope, Video } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const FindTherapist = () => {
  const { API_BASE_URL } = useAuth();
  const [therapists, setTherapists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [mode, setMode] = useState('');
  const [selectedTherapist, setSelectedTherapist] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bookingSuccessMsg, setBookingSuccessMsg] = useState('');

  useEffect(() => {
    fetchTherapists();
  }, [search, mode]);

  const fetchTherapists = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/therapists`, {
        params: { search, mode },
      });
      if (res.data.success) {
        setTherapists(res.data.therapists);
      }
    } catch (err) {
      console.error('Failed to fetch therapists:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenBooking = (t) => {
    setSelectedTherapist(t);
    setIsModalOpen(true);
  };

  const handleBooked = (appointment) => {
    setBookingSuccessMsg(`Appointment booked with ${selectedTherapist?.user?.name} for ${appointment.date} at ${appointment.startTime}!`);
    setTimeout(() => setBookingSuccessMsg(''), 6000);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900">Find a Physiotherapist</h1>
        <p className="text-xs text-slate-500 mt-1">
          Discover verified clinical specialists, view working availability, and book online or in-person consultations.
        </p>
      </div>

      {bookingSuccessMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-xs font-semibold flex items-center justify-between">
          <span>✅ {bookingSuccessMsg}</span>
        </div>
      )}

      {/* Filters Bar */}
      <Card className="p-4 bg-white border-slate-200">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
          <div className="sm:col-span-2">
            <Input
              placeholder="Search therapist by name, specialization, or clinic..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={Search}
            />
          </div>
          <div>
            <Select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              options={[
                { value: '', label: 'All Consultation Modes' },
                { value: 'ONLINE', label: 'Online Consultation' },
                { value: 'IN_PERSON', label: 'In-Person Clinic Visit' },
              ]}
            />
          </div>
        </div>
      </Card>

      {/* Directory Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton height="h-64" rounded="rounded-xl" />
          <Skeleton height="h-64" rounded="rounded-xl" />
        </div>
      ) : therapists.length === 0 ? (
        <EmptyState
          title="No therapists found"
          description="No clinical specialists match your search criteria. Try adjusting your filters."
          icon={Stethoscope}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {therapists.map(({ user, profile }) => (
            <Card key={user._id} className="hover:shadow-md transition-all border-slate-200 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <img
                    src={user.avatar || 'https://images.unsplash.com/photo-1594824813566-88855ce7896c?w=150&auto=format&fit=crop&q=80'}
                    alt={user.name}
                    className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shrink-0"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-slate-900">{user.name}</h3>
                      <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full text-xs font-bold border border-amber-200">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{profile?.rating || 4.9}</span>
                      </div>
                    </div>
                    <p className="text-xs font-semibold text-sky-600 mt-0.5">{profile?.specialization}</p>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{profile?.clinic || 'KineticCare Center'}</span>
                    </p>
                  </div>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {profile?.bio || 'Clinical physiotherapy specialist dedicated to evidence-based joint rehabilitation.'}
                </p>

                <div className="flex flex-wrap gap-2 text-xs">
                  <Badge variant="neutral">
                    <Award className="w-3 h-3 text-slate-500 mr-1" />
                    {profile?.experienceYears || 5}+ Yrs Exp
                  </Badge>
                  {profile?.languages?.map((lang) => (
                    <Badge key={lang} variant="primary">{lang}</Badge>
                  ))}
                  {profile?.consultationModes?.map((cm) => (
                    <Badge key={cm} variant="success">
                      <Video className="w-3 h-3 mr-1" />
                      {cm}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">
                  {profile?.totalPatients || 20}+ Patients Treated
                </span>
                <Button
                  variant="primary"
                  size="sm"
                  icon={Calendar}
                  onClick={() => handleOpenBooking({ user, profile })}
                >
                  Book Appointment
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Booking Modal */}
      <BookAppointmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        therapist={selectedTherapist}
        onBooked={handleBooked}
      />
    </div>
  );
};

export default FindTherapist;
