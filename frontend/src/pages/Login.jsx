import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import { Eye, EyeOff } from 'lucide-react';

const quickLogins = [
  { label: 'Admin', email: 'admin@hospital.com', password: 'admin123' },
  { label: 'Doctor', email: 'dr.sarah@hospital.com', password: 'doctor123' },
  { label: 'Reception', email: 'reception@hospital.com', password: 'reception123' },
  { label: 'Pharmacy', email: 'pharmacy@hospital.com', password: 'pharma123' },
];

export default function Login() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await login(form.email, form.password);
    if (res.success) {
      toast.success('Welcome back!');
      navigate('/');
    } else {
      toast.error(res.error);
    }
  };

  const quickFill = (email, password) => setForm({ email, password });

  return (
    <div className="login-page">
      <div className="login-bg" />
      <div className="login-left">
        <div className="login-hero">
          <h1>Smart Hospital<br /><span>Management</span> System</h1>
          <p>A comprehensive platform to manage patients, appointments, billing, pharmacy, lab, and more — all in one place.</p>
          <ul className="feature-list">
            <li><span>✓</span> Real-time Patient Tracking & Admission</li>
            <li><span>✓</span> Appointment Scheduling & Management</li>
            <li><span>✓</span> Automated Billing & Invoice Generation</li>
            <li><span>✓</span> Pharmacy Inventory Management</li>
            <li><span>✓</span> Laboratory Test Ordering & Results</li>
            <li><span>✓</span> Role-Based Access Control (RBAC)</li>
          </ul>
        </div>
      </div>
      <div className="login-right">
        <div className="login-card">
          <div className="login-logo">
            <div className="login-logo-icon">🏥</div>
            <div>
              <div className="logo-text" style={{ fontSize: 18 }}>Hospital OS</div>
              <div className="logo-sub">Management System</div>
            </div>
          </div>
          <div className="login-form">
            <h2>Sign In</h2>
            <p>Enter your credentials to access the system</p>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="email">Email Address</label>
                <input type="email" id="email" className="form-control" placeholder="you@hospital.com"
                  value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              </div>
              <div className="form-group">
                  <label className="form-label" htmlFor="password">Password</label>
                  <div style={{ position: 'relative' }}>
                    <input type={showPass ? 'text' : 'password'} id="password" className="form-control"
                      placeholder="••••••••" value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })} required style={{ paddingRight: 40 }} />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px' }} disabled={isLoading}>
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div style={{ marginTop: 24 }}>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10, textAlign: 'center' }}>Quick Demo Login</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {quickLogins.map((q) => (
                  <button key={q.label} onClick={() => quickFill(q.email, q.password)}
                    className="btn btn-secondary btn-sm" style={{ justifyContent: 'center', fontSize: 12 }}>
                    {q.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
