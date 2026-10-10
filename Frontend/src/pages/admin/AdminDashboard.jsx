import React from 'react';
import Card from '../../components/ui/Card';
import StatCard from '../../components/ui/StatCard';
import Badge from '../../components/ui/Badge';
import Table from '../../components/ui/Table';
import { Users, Stethoscope, Dumbbell, ShieldCheck, Activity } from 'lucide-react';

export const AdminDashboard = () => {
  const usersList = [
    { name: 'Rahul Sharma', role: 'PATIENT', email: 'rahul.sharma@gmail.com', joined: '2026-08-15' },
    { name: 'Dr. Ananya Sharma', role: 'THERAPIST', email: 'ananya.sharma@kineticcare.com', joined: '2026-08-10' },
  ];

  const columns = [
    { header: 'Name', key: 'name' },
    { header: 'Email', key: 'email' },
    {
      header: 'Role',
      key: 'role',
      render: (val) => (
        <Badge variant={val === 'THERAPIST' ? 'info' : 'primary'}>{val}</Badge>
      ),
    },
    { header: 'Joined Date', key: 'joined' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">System Admin Control Center</h1>
        <p className="text-xs text-slate-500 mt-1">
          Platform usage metrics, user directory oversight, and database health monitoring.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Platform Users" value="142" icon={Users} iconBg="bg-sky-50 text-sky-600" />
        <StatCard title="Verified Therapists" value="18" icon={Stethoscope} iconBg="bg-emerald-50 text-emerald-600" />
        <StatCard title="Registered Patients" value="124" icon={Activity} iconBg="bg-amber-50 text-amber-600" />
        <StatCard title="API System Health" value="100%" icon={ShieldCheck} iconBg="bg-blue-50 text-blue-600" description="All services live" />
      </div>

      <Card title="User Directory Oversight" subtitle="Platform patient and therapist account management">
        <Table columns={columns} data={usersList} />
      </Card>
    </div>
  );
};

export default AdminDashboard;
