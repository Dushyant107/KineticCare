import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import Badge from '../../components/ui/Badge';
import { Clock, Plus, Trash2, CheckCircle2, Save } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const TherapistAvailabilityManager = () => {
  const { API_BASE_URL, user } = useAuth();
  const [slotDurationMinutes, setSlotDurationMinutes] = useState(30);
  const [bufferMinutes, setBufferMinutes] = useState(10);
  const [schedule, setSchedule] = useState(
    DAYS_OF_WEEK.map((day) => ({
      dayOfWeek: day,
      enabled: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].includes(day),
      intervals: [
        { startTime: '09:00', endTime: '13:00' },
        { startTime: '14:00', endTime: '17:00' },
      ],
    }))
  );
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchAvailability();
  }, []);

  const fetchAvailability = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/therapists/${user.id || user._id}/availability`);
      if (res.data.success && res.data.availability?.length > 0) {
        const availMap = new Map(res.data.availability.map(a => [a.dayOfWeek, a]));
        setSchedule(
          DAYS_OF_WEEK.map((day) => {
            const existing = availMap.get(day);
            return {
              dayOfWeek: day,
              enabled: existing ? existing.enabled : false,
              intervals: existing?.intervals?.length ? existing.intervals : [{ startTime: '09:00', endTime: '17:00' }],
            };
          })
        );
        if (res.data.availability[0]?.slotDurationMinutes) {
          setSlotDurationMinutes(res.data.availability[0].slotDurationMinutes);
        }
        if (res.data.availability[0]?.bufferMinutes) {
          setBufferMinutes(res.data.availability[0].bufferMinutes);
        }
      }
    } catch (err) {
      console.error('Failed to load availability:', err);
    }
  };

  const handleToggleDay = (dayIndex) => {
    const next = [...schedule];
    next[dayIndex].enabled = !next[dayIndex].enabled;
    setSchedule(next);
  };

  const handleAddInterval = (dayIndex) => {
    const next = [...schedule];
    next[dayIndex].intervals.push({ startTime: '14:00', endTime: '17:00' });
    setSchedule(next);
  };

  const handleRemoveInterval = (dayIndex, intIndex) => {
    const next = [...schedule];
    next[dayIndex].intervals.splice(intIndex, 1);
    setSchedule(next);
  };

  const handleIntervalChange = (dayIndex, intIndex, field, val) => {
    const next = [...schedule];
    next[dayIndex].intervals[intIndex][field] = val;
    setSchedule(next);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSuccessMsg('');
    try {
      const res = await axios.post(`${API_BASE_URL}/therapists/availability`, {
        weeklySchedule: schedule,
        slotDurationMinutes: Number(slotDurationMinutes),
        bufferMinutes: Number(bufferMinutes),
      });
      if (res.data.success) {
        setSuccessMsg('Working availability settings saved successfully!');
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      console.error('Failed to save availability:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Therapist Working Availability</h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure working days, time intervals, consultation duration, and slot buffer times.
          </p>
        </div>

        <Button variant="primary" icon={Save} isLoading={isSaving} onClick={handleSave}>
          Save Settings
        </Button>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Settings Bar */}
      <Card className="p-4 border-slate-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Consultation Duration"
            value={slotDurationMinutes}
            onChange={(e) => setSlotDurationMinutes(e.target.value)}
            options={[
              { value: '15', label: '15 Minutes' },
              { value: '30', label: '30 Minutes (Default)' },
              { value: '45', label: '45 Minutes' },
              { value: '60', label: '60 Minutes' },
            ]}
          />
          <Select
            label="Buffer Time Between Appointments"
            value={bufferMinutes}
            onChange={(e) => setBufferMinutes(e.target.value)}
            options={[
              { value: '0', label: '0 Minutes (Back to back)' },
              { value: '5', label: '5 Minutes' },
              { value: '10', label: '10 Minutes (Recommended)' },
              { value: '15', label: '15 Minutes' },
            ]}
          />
        </div>
      </Card>

      {/* Weekly Schedule Editor */}
      <div className="space-y-4">
        {schedule.map((dayItem, dayIdx) => (
          <Card key={dayItem.dayOfWeek} className="p-4 border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={dayItem.enabled}
                  onChange={() => handleToggleDay(dayIdx)}
                  className="w-4 h-4 text-sky-600 rounded-md focus:ring-sky-500 cursor-pointer"
                />
                <span className="text-sm font-bold text-slate-900 w-28">{dayItem.dayOfWeek}</span>
                <Badge variant={dayItem.enabled ? 'success' : 'neutral'}>
                  {dayItem.enabled ? 'Working Day' : 'Unavailable'}
                </Badge>
              </div>

              {dayItem.enabled && (
                <div className="flex-1 space-y-2 max-w-xl">
                  {dayItem.intervals.map((int, intIdx) => (
                    <div key={intIdx} className="flex items-center gap-2 text-xs">
                      <span className="text-slate-500">From</span>
                      <input
                        type="time"
                        value={int.startTime}
                        onChange={(e) => handleIntervalChange(dayIdx, intIdx, 'startTime', e.target.value)}
                        className="h-8 px-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none"
                      />
                      <span className="text-slate-500">To</span>
                      <input
                        type="time"
                        value={int.endTime}
                        onChange={(e) => handleIntervalChange(dayIdx, intIdx, 'endTime', e.target.value)}
                        className="h-8 px-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none"
                      />
                      <button
                        onClick={() => handleRemoveInterval(dayIdx, intIdx)}
                        className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <Button variant="ghost" size="sm" icon={Plus} onClick={() => handleAddInterval(dayIdx)}>
                    Add Shift Interval
                  </Button>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TherapistAvailabilityManager;
