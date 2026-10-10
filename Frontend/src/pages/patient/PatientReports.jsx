import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import { FileText, Download, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const PatientReports = () => {
  const { API_BASE_URL } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/reports/my`);
      if (res.data.success) {
        setReports(res.data.reports);
      }
    } catch (err) {
      console.error('Failed to fetch reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/reports/generate`, {});
      if (res.data.success) {
        setReports([res.data.report, ...reports]);
      }
    } catch (err) {
      console.error('Error generating report:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Rehabilitation Reports</h1>
          <p className="text-xs text-slate-500 mt-1">
            Structured clinical progress reports summarizing exercise sessions, ROM trends, and therapist notes.
          </p>
        </div>

        <Button variant="primary" icon={FileText} onClick={handleGenerate}>
          Generate Monthly Report
        </Button>
      </div>

      {loading ? (
        <Skeleton height="h-48" />
      ) : reports.length === 0 ? (
        <EmptyState
          title="No Reports Generated Yet"
          description="Click 'Generate Monthly Report' to compile your recent AI movement data into a structured clinical document."
          actionLabel="Generate Report Now"
          onAction={handleGenerate}
        />
      ) : (
        <div className="space-y-6">
          {reports.map((report) => (
            <Card key={report._id} className="border-slate-200 p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <Badge variant="primary" className="mb-1">Clinical Summary</Badge>
                  <h3 className="text-lg font-bold text-slate-900">{report.title}</h3>
                  <p className="text-xs text-slate-500">Period: {report.dateRange} | Generated: {new Date(report.createdAt).toLocaleDateString()}</p>
                </div>
                <Button variant="outline" size="sm" icon={Download} onClick={() => alert('Report downloaded as PDF.')}>
                  Download PDF
                </Button>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Sessions</span>
                  <span className="text-lg font-extrabold text-slate-900">{report.sessionsCompleted}</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Avg Quality</span>
                  <span className="text-lg font-extrabold text-emerald-600">{report.averageQuality}%</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Avg ROM</span>
                  <span className="text-lg font-extrabold text-sky-600">{report.averageROM}°</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Recovery Score</span>
                  <span className="text-lg font-extrabold text-slate-900">{report.recoveryScore} / 100</span>
                </div>
              </div>

              {/* Doctor Prescribed Exercises & Recommended Duration */}
              {report.prescribedExercises && report.prescribedExercises.length > 0 && (
                <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-950 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Doctor Prescribed Rehabilitation Routine
                    </h4>
                    <Badge variant="success">
                      Prescribed Daily Duration: {report.prescribedDailyDurationMinutes || 20} Mins/Day
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {report.prescribedExercises.map((ex, idx) => (
                      <div key={idx} className="p-3 bg-white border border-emerald-100 rounded-lg text-xs text-slate-800 space-y-1">
                        <div className="font-bold text-slate-900">{ex.exerciseName}</div>
                        <div className="text-slate-500 flex justify-between">
                          <span>Target: {ex.sets} Sets × {ex.reps} Reps</span>
                          <span>Target ROM: {ex.targetROM}°</span>
                        </div>
                        <div className="text-[11px] text-emerald-700 font-semibold">
                          Duration: {ex.prescribedDurationMinutes || 10} minutes per day
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Observations */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">AI Observations</h4>
                <div className="space-y-1.5">
                  {report.aiObservations?.map((obs, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                      <Sparkles className="w-3.5 h-3.5 text-sky-600 shrink-0 mt-0.5" />
                      <span>{obs}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Therapist Notes */}
              {report.therapistNotes && (
                <div className="p-3 bg-sky-50/70 border border-sky-100 rounded-xl text-xs text-sky-950">
                  <span className="font-bold">Therapist Clinical Notes:</span> {report.therapistNotes}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientReports;
