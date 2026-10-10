import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import Table from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';
import { Search, Eye, FileText, Activity, Plus, CheckCircle2, FilePlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const TherapistPatients = () => {
  const { API_BASE_URL } = useAuth();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [reportTitle, setReportTitle] = useState('Monthly Rehabilitation Progress & Evaluation');
  const [therapistNotes, setTherapistNotes] = useState('');
  const [prescribedDuration, setPrescribedDuration] = useState(25);
  const [isPublishing, setIsPublishing] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/appointments/my`);
      if (res.data.success && res.data.appointments?.length > 0) {
        const patientMap = new Map();
        res.data.appointments.forEach((app) => {
          if (app.patientId && !patientMap.has(app.patientId._id)) {
            patientMap.set(app.patientId._id, {
              _id: app.patientId._id,
              name: app.patientId.name || 'Patient',
              email: app.patientId.email || 'patient@kineticcare.com',
              condition: app.notes || 'Post-Op Joint Rehabilitation',
              recoveryScore: 84,
              streak: 7,
              adherence: 92,
              lastSession: app.date || 'Recent',
            });
          }
        });
        setPatients(Array.from(patientMap.values()));
      } else {
        // Fallback demo patient if no active appointment records yet
        setPatients([
          {
            _id: '668f12345678901234567899',
            name: 'Rahul Sharma',
            email: 'rahul.sharma@gmail.com',
            condition: 'ACL Surgery Recovery (Left Knee)',
            recoveryScore: 84,
            streak: 7,
            adherence: 92,
            lastSession: 'Today, 09:30 AM',
          },
        ]);
      }
    } catch (err) {
      console.error('Failed to fetch patients:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePublishReport = async () => {
    if (!selectedPatient) return;
    setIsPublishing(true);
    setSuccessMsg('');
    try {
      const res = await axios.post(`${API_BASE_URL}/reports/generate`, {
        patientId: selectedPatient._id,
        title: reportTitle,
        therapistNotes: therapistNotes || 'Patient is making consistent progress. Continue daily knee extensions for 15 mins and quad strengthening.',
        prescribedDailyDurationMinutes: Number(prescribedDuration),
        prescribedExercises: [
          { exerciseName: 'Seated Knee Extension', sets: 3, reps: 10, targetROM: 160, prescribedDurationMinutes: 15 },
          { exerciseName: 'Full Body Squat', sets: 3, reps: 8, targetROM: 90, prescribedDurationMinutes: 10 },
        ],
      });

      if (res.data.success) {
        setSuccessMsg(`Clinical report successfully published to ${selectedPatient.name}'s portal!`);
        setTimeout(() => {
          setSuccessMsg('');
          setSelectedPatient(null);
        }, 2500);
      }
    } catch (err) {
      console.error('Failed to publish report:', err);
    } finally {
      setIsPublishing(false);
    }
  };

  const filteredPatients = patients.filter(
    (p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.condition.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      header: 'Patient Name',
      key: 'name',
      render: (val, row) => (
        <div>
          <p className="font-bold text-slate-900">{val}</p>
          <p className="text-[11px] text-slate-500">{row.email}</p>
        </div>
      ),
    },
    {
      header: 'Condition / Goal',
      key: 'condition',
    },
    {
      header: 'Recovery Score',
      key: 'recoveryScore',
      render: (val) => <span className="font-black text-sky-600">{val} / 100</span>,
    },
    {
      header: 'Adherence',
      key: 'adherence',
      render: (val) => <Badge variant={val >= 80 ? 'success' : 'warning'}>{val}%</Badge>,
    },
    {
      header: 'Streak',
      key: 'streak',
      render: (val) => <span className="font-bold text-amber-600">🔥 {val} Days</span>,
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (_, row) => (
        <Button variant="outline" size="sm" icon={FilePlus} onClick={() => setSelectedPatient(row)}>
          Prepare Report
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Patient Roster & Clinical Audit</h1>
        <p className="text-xs text-slate-500 mt-1">
          Monitor assigned rehabilitation patients, review AI motion metrics, and generate clinical reports with exercise duration guidelines.
        </p>
      </div>

      <Card className="p-4 border-slate-200">
        <Input
          placeholder="Search patient by name or condition..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={Search}
        />
      </Card>

      <Table columns={columns} data={filteredPatients} />

      {/* Patient Report Preparation Modal */}
      <Modal
        isOpen={!!selectedPatient}
        onClose={() => setSelectedPatient(null)}
        title={`Clinical Report for ${selectedPatient?.name}`}
        subtitle={selectedPatient?.condition}
        maxWidth="max-w-2xl"
      >
        {selectedPatient && (
          <div className="space-y-5">
            {successMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Recovery Score</span>
                <span className="text-xl font-extrabold text-sky-600">{selectedPatient.recoveryScore}</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Adherence Rate</span>
                <span className="text-xl font-extrabold text-emerald-600">{selectedPatient.adherence}%</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Current Streak</span>
                <span className="text-xl font-extrabold text-amber-600">🔥 {selectedPatient.streak} Days</span>
              </div>
            </div>

            {/* Report Form */}
            <div className="space-y-4 pt-2">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1">Report Title</label>
                <input
                  type="text"
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1">Recommended Daily Exercise Duration (Minutes)</label>
                <input
                  type="number"
                  value={prescribedDuration}
                  onChange={(e) => setPrescribedDuration(e.target.value)}
                  className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1">Therapist Clinical Notes & Guidelines</label>
                <textarea
                  rows={3}
                  value={therapistNotes}
                  onChange={(e) => setTherapistNotes(e.target.value)}
                  placeholder="Enter clinical observations, ROM feedback, daily exercise needs, and form guidelines..."
                  className="w-full p-3 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <Button variant="outline" onClick={() => setSelectedPatient(null)}>Cancel</Button>
              <Button
                variant="primary"
                icon={FileText}
                isLoading={isPublishing}
                onClick={handlePublishReport}
              >
                Publish Report to Patient Window
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TherapistPatients;
