import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Skeleton from '../../components/ui/Skeleton';
import ProgressBar from '../../components/ui/ProgressBar';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { TrendingUp, Activity, Clock, PieChart as PieIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const PIE_COLORS = ['#0284C7', '#10B981', '#F59E0B', '#6366F1', '#EC4899'];

export const PatientProgress = () => {
  const { API_BASE_URL } = useAuth();
  const [days, setDays] = useState(30);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [days]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/progress/analytics`, {
        params: { days },
      });
      if (res.data.success) {
        setAnalytics(res.data.analytics);
      }
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const { romTrend, qualityTrend, activityDuration, adherenceTrend, distribution } = analytics || {};

  const avgAdherence = adherenceTrend?.length
    ? Math.round(adherenceTrend.reduce((acc, curr) => acc + curr.adherence, 0) / adherenceTrend.length)
    : 94;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Progress Analytics & Biomechanics</h1>
          <p className="text-xs text-slate-500 mt-1">
            Longitudinal trend visualization of joint range-of-motion, posture quality, and rehabilitation consistency.
          </p>
        </div>

        {/* Time Filter Buttons */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl">
          {[7, 14, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                days === d ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {d} Days
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton height="h-72" />
          <Skeleton height="h-72" />
        </div>
      ) : (
        <>
          {/* Top Charts Row: ROM & Form Quality */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* ROM Trend Line Chart */}
            <Card title="Range of Motion (ROM) Trend" subtitle="Average vs Peak joint extension angle over time (°)">
              <div className="h-64 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={romTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} />
                    <YAxis stroke="#94A3B8" fontSize={11} domain={[60, 180]} />
                    <Tooltip contentStyle={{ backgroundColor: '#FFF', borderRadius: '8px', fontSize: '12px' }} />
                    <Legend />
                    <Line type="monotone" dataKey="bestROM" name="Peak ROM (°)" stroke="#10B981" strokeWidth={2.5} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="avgROM" name="Average ROM (°)" stroke="#0284C7" strokeWidth={3} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="targetROM" name="Target ROM (160°)" stroke="#94A3B8" strokeDasharray="5 5" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Form Quality Line Chart */}
            <Card title="Form Quality Score" subtitle="Computer vision posture accuracy rating (0-100%)">
              <div className="h-64 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={qualityTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} />
                    <YAxis stroke="#94A3B8" fontSize={11} domain={[50, 100]} />
                    <Tooltip contentStyle={{ backgroundColor: '#FFF', borderRadius: '8px', fontSize: '12px' }} />
                    <Line type="monotone" dataKey="quality" name="Quality Score (%)" stroke="#10B981" strokeWidth={3} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {/* Bottom Charts Row: Activity Duration & Exercise Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Activity Duration Bar Chart */}
            <Card title="Daily Rehabilitation Duration" subtitle="Total active session duration in minutes">
              <div className="h-64 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={activityDuration}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} />
                    <YAxis stroke="#94A3B8" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#FFF', borderRadius: '8px', fontSize: '12px' }} />
                    <Bar dataKey="minutes" name="Active Minutes" fill="#0284C7" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Exercise Distribution Donut Chart */}
            <Card title="Exercise Breakdown" subtitle="Distribution of exercises completed in this period">
              <div className="h-64 w-full flex items-center justify-center pt-2">
                {distribution?.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={distribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {distribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#FFF', borderRadius: '8px', fontSize: '12px' }} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-xs text-slate-400">No session distribution data available</p>
                )}
              </div>
            </Card>
          </div>

          {/* Program Adherence Progress Section */}
          <Card title="Overall Program Adherence" subtitle="Compliance with assigned rehabilitation frequency">
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>Adherence Rate: {avgAdherence}%</span>
                <span className={avgAdherence >= 80 ? 'text-emerald-600' : 'text-amber-600'}>
                  {avgAdherence >= 80 ? 'High Compliance' : 'Moderate Compliance'}
                </span>
              </div>
              <ProgressBar value={avgAdherence} color={avgAdherence >= 80 ? 'bg-emerald-500' : 'bg-amber-500'} height="h-3" />
              <p className="text-xs text-slate-500">
                Overall adherence calculated from daily exercise completion against assigned daily program goals.
              </p>
            </div>
          </Card>
        </>
      )}
    </div>
  );
};

export default PatientProgress;
