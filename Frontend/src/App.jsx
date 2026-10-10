import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Login from './components/Login';
import AppLayout from './components/layout/AppLayout';

// Patient Portal Pages
import PatientDashboard from './pages/patient/PatientDashboard';
import FindTherapist from './pages/patient/FindTherapist';
import PatientAppointments from './pages/patient/PatientAppointments';
import PatientProgram from './pages/patient/PatientProgram';
import ExerciseLibrary from './pages/patient/ExerciseLibrary';
import LiveSession from './pages/patient/LiveSession';
import PatientProgress from './pages/patient/PatientProgress';
import ActivityTimeline from './pages/patient/ActivityTimeline';
import PatientMessages from './pages/patient/PatientMessages';
import PatientReports from './pages/patient/PatientReports';

// Therapist Portal Pages
import TherapistDashboard from './pages/therapist/TherapistDashboard';
import TherapistPatients from './pages/therapist/TherapistPatients';
import TherapistAvailabilityManager from './pages/therapist/TherapistAvailabilityManager';
import ProgramBuilder from './pages/therapist/ProgramBuilder';

// Admin Portal Pages
import AdminDashboard from './pages/admin/AdminDashboard';

function ProtectedRoute({ children }) {
  const { token, loading } = useAuth();
  if (loading) return <div className="p-8 text-center text-xs text-slate-500">Loading KineticCare Portal...</div>;
  if (!token) return <Navigate to="/login" replace />;
  return <AppLayout>{children}</AppLayout>;
}

function App() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public Landing & Login */}
      <Route
        path="/"
        element={
          user ? (
            user.role === 'THERAPIST' ? (
              <Navigate to="/therapist/dashboard" replace />
            ) : user.role === 'ADMIN' ? (
              <Navigate to="/admin/dashboard" replace />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          ) : (
            <div className="min-h-screen bg-slate-50 flex flex-col">
              <Navbar />
              <Hero />
            </div>
          )
        }
      />

      <Route path="/login" element={<Login />} />

      {/* Patient Routes */}
      <Route path="/dashboard" element={<ProtectedRoute><PatientDashboard /></ProtectedRoute>} />
      <Route path="/find-therapist" element={<ProtectedRoute><FindTherapist /></ProtectedRoute>} />
      <Route path="/appointments" element={<ProtectedRoute><PatientAppointments /></ProtectedRoute>} />
      <Route path="/my-program" element={<ProtectedRoute><PatientProgram /></ProtectedRoute>} />
      <Route path="/exercises" element={<ProtectedRoute><ExerciseLibrary /></ProtectedRoute>} />
      <Route path="/live-session" element={<ProtectedRoute><LiveSession /></ProtectedRoute>} />
      <Route path="/progress" element={<ProtectedRoute><PatientProgress /></ProtectedRoute>} />
      <Route path="/activity" element={<ProtectedRoute><ActivityTimeline /></ProtectedRoute>} />
      <Route path="/messages" element={<ProtectedRoute><PatientMessages /></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute><PatientReports /></ProtectedRoute>} />

      {/* Therapist Routes */}
      <Route path="/therapist/dashboard" element={<ProtectedRoute><TherapistDashboard /></ProtectedRoute>} />
      <Route path="/therapist/patients" element={<ProtectedRoute><TherapistPatients /></ProtectedRoute>} />
      <Route path="/therapist/availability" element={<ProtectedRoute><TherapistAvailabilityManager /></ProtectedRoute>} />
      <Route path="/therapist/programs" element={<ProtectedRoute><ProgramBuilder /></ProtectedRoute>} />
      <Route path="/therapist/programs/create" element={<ProtectedRoute><ProgramBuilder /></ProtectedRoute>} />
      <Route path="/therapist/appointments" element={<ProtectedRoute><PatientAppointments /></ProtectedRoute>} />

      {/* Admin Routes */}
      <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
