import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from './ui/Button';
import Input from './ui/Input';
import Card from './ui/Card';
import Badge from './ui/Badge';
import { User, Stethoscope, Mail, Lock, UserCheck } from 'lucide-react';

export const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState('PATIENT'); // 'PATIENT' or 'THERAPIST'
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    name: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isLogin) {
        const res = await login(formData.username, formData.password);
        if (res.user?.role === 'THERAPIST') {
          navigate('/therapist/dashboard');
        } else if (res.user?.role === 'ADMIN') {
          navigate('/admin/dashboard');
        } else {
          navigate('/dashboard');
        }
      } else {
        const res = await register({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          name: formData.name || formData.username,
          role,
        });
        if (res.user?.role === 'THERAPIST') {
          navigate('/therapist/dashboard');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md space-y-6">
        {/* Header Branding */}
        <div className="flex flex-col items-center text-center">
          <img src="/logo.svg" alt="KineticCare" className="h-12 mb-3" />
          <h1 className="text-2xl font-black text-slate-900">
            {isLogin ? 'Welcome Back to KineticCare' : 'Create Your KineticCare Account'}
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xs">
            AI-Powered Digital Physiotherapy & Rehabilitation Platform
          </p>
        </div>

        <Card className="shadow-lg border-slate-200">
          {/* Toggle Login vs Register */}
          <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => { setIsLogin(true); setError(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                isLogin ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setIsLogin(false); setError(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                !isLogin ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Register
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3.5 py-2.5 rounded-lg text-xs font-semibold mb-4">
              {error}
            </div>
          )}

          {!isLogin && (
            <div className="mb-6">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-2">
                I am registering as a:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('PATIENT')}
                  className={`p-3 border rounded-xl flex flex-col items-center gap-1.5 transition-all text-left cursor-pointer ${
                    role === 'PATIENT'
                      ? 'border-sky-600 bg-sky-50 text-sky-900 font-bold ring-2 ring-sky-500/20'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <User className="w-5 h-5 text-sky-600" />
                  <span className="text-xs font-bold">Patient</span>
                  <span className="text-[10px] text-slate-500 text-center">Start AI exercises & recovery</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('THERAPIST')}
                  className={`p-3 border rounded-xl flex flex-col items-center gap-1.5 transition-all text-left cursor-pointer ${
                    role === 'THERAPIST'
                      ? 'border-sky-600 bg-sky-50 text-sky-900 font-bold ring-2 ring-sky-500/20'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <Stethoscope className="w-5 h-5 text-sky-600" />
                  <span className="text-xs font-bold">Therapist</span>
                  <span className="text-[10px] text-slate-500 text-center">Manage patients & programs</span>
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <Input
                label="Full Name"
                name="name"
                placeholder="e.g. Rahul Sharma"
                value={formData.name}
                onChange={handleChange}
                icon={UserCheck}
                required
              />
            )}

            {!isLogin && (
              <Input
                label="Email Address"
                name="email"
                type="email"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                icon={Mail}
                required
              />
            )}

            <Input
              label="Username"
              name="username"
              placeholder="Enter your username"
              value={formData.username}
              onChange={handleChange}
              icon={User}
              required
            />

            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              icon={Lock}
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              isLoading={isLoading}
            >
              {isLogin ? 'Sign In to Portal' : `Create ${role === 'PATIENT' ? 'Patient' : 'Therapist'} Account`}
            </Button>
          </form>
        </Card>

        {/* Demo Scenario Credentials Card */}
        <div className="bg-sky-50/70 border border-sky-200 rounded-xl p-4 text-xs text-sky-950 space-y-2">
          <div className="flex items-center justify-between font-bold border-b border-sky-200/60 pb-1.5">
            <span>💡 Demo Accounts for Testing</span>
            <Badge variant="primary">Pre-Seeded</Badge>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="bg-white p-2 rounded-lg border border-sky-100">
              <p className="font-bold text-sky-900">Patient Persona</p>
              <p className="text-slate-600">User: <code className="font-mono">rahul_sharma</code></p>
              <p className="text-slate-600">Pass: <code className="font-mono">password123</code></p>
            </div>
            <div className="bg-white p-2 rounded-lg border border-sky-100">
              <p className="font-bold text-sky-900">Therapist Persona</p>
              <p className="text-slate-600">User: <code className="font-mono">dr_ananya</code></p>
              <p className="text-slate-600">Pass: <code className="font-mono">password123</code></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;