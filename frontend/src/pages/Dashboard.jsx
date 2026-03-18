import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Calendar, Receipt, BedDouble, FlaskConical, Pill, TrendingUp, Clock, AlertCircle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { getDashboardStatsApi, getAppointmentsApi } from '../api';

const COLORS = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444'];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getDashboardStatsApi()
      .then((r) => setStats(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page"><div className="spinner-overlay"><div className="spinner" /></div></div>;
  if (!stats) return <div className="page"><p>Failed to load dashboard</p></div>;

  const { patients, appointments, billing, rooms, lab, pharmacy, doctors, staff } = stats.stats;

  const statCards = [
    { label: 'Total Patients', value: patients.total, sub: `${patients.admitted} admitted`, icon: Users, color: '#6366f1', bg: 'rgba(99,102,241,0.15)', link: '/patients' },
    { label: "Today's Appointments", value: appointments.today, sub: `${appointments.pending} pending`, icon: Calendar, color: '#0ea5e9', bg: 'rgba(14,165,233,0.15)', link: '/appointments' },
    { label: 'Total Revenue', value: `₹${billing.totalRevenue.toLocaleString()}`, sub: `₹${billing.monthRevenue.toLocaleString()} this month`, icon: Receipt, color: '#10b981', bg: 'rgba(16,185,129,0.15)', link: '/billing' },
    { label: 'Active Doctors', value: doctors, sub: `${staff} total staff`, icon: TrendingUp, color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
    { label: 'Available Rooms', value: rooms.available, sub: `${rooms.occupied}/${rooms.total} occupied`, icon: BedDouble, color: '#8b5cf6', bg: 'rgba(139,92,246,0.15)', link: '/rooms' },
    { label: 'Pending Lab Tests', value: lab.pending, sub: 'awaiting results', icon: FlaskConical, color: '#ef4444', bg: 'rgba(239,68,68,0.15)', link: '/lab' },
    { label: 'Pending Bills', value: billing.pending, sub: 'unpaid invoices', icon: AlertCircle, color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', link: '/billing' },
    { label: 'Low Stock Meds', value: pharmacy.lowStock, sub: 'need reorder', icon: Pill, color: '#ec4899', bg: 'rgba(236,72,153,0.15)', link: '/pharmacy' },
  ];

  // Prepare chart data
  const revenueData = (stats.revenueChart || []).map((d) => ({
    name: new Date(2024, d._id.month - 1).toLocaleString('default', { month: 'short' }),
    revenue: d.total,
  }));

  const pieData = [
    { name: 'General', value: rooms.total - rooms.available - rooms.occupied },
    { name: 'Available', value: rooms.available },
    { name: 'Occupied', value: rooms.occupied },
  ];

  const statusBadge = (status) => {
    const map = {
      Scheduled: 'badge-primary', Confirmed: 'badge-info', Arrived: 'badge-warning',
      'In Progress': 'badge-warning', Completed: 'badge-success', Cancelled: 'badge-danger', 'No Show': 'badge-secondary',
    };
    return map[status] || 'badge-secondary';
  };

  return (
    <div className="page">
      <div className="topbar">
        <div>
          <div className="topbar-title">Dashboard</div>
          <div className="topbar-sub">Welcome back — {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
        </div>
      </div>

      <div style={{ height: 28 }} />
      <div className="stats-grid">
        {statCards.map((c) => (
          <div key={c.label} className="stat-card" style={{ '--accent-color': c.color, cursor: c.link ? 'pointer' : 'default' }}
            onClick={() => c.link && navigate(c.link)}>
            <div>
              <div className="stat-value">{c.value}</div>
              <div className="stat-label">{c.label}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{c.sub}</div>
            </div>
            <div className="stat-icon" style={{ background: c.bg, color: c.color }}>
              <c.icon size={22} />
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 20 }}>
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Revenue Overview</div>
              <div className="card-sub">Monthly earnings (paid invoices)</div>
            </div>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#f1f5f9' }}
                  formatter={(v) => [`₹${v.toLocaleString()}`, 'Revenue']} />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} fill="url(#revenueGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Room Occupancy</div>
          </div>
          <div style={{ height: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <PieChart width={180} height={160}>
              <Pie data={pieData} cx={90} cy={75} innerRadius={45} outerRadius={70} dataKey="value">
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
            </PieChart>
            <div style={{ display: 'flex', gap: 12, marginTop: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
              {pieData.map((d, i) => (
                <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-muted)' }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: COLORS[i] }} />
                  {d.name} ({d.value})
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">Recent Appointments</div>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/appointments')}>View All</button>
        </div>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Patient</th><th>Doctor</th><th>Date & Time</th><th>Type</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {(stats.recentAppointments || []).map((a) => (
                <tr key={a._id}>
                  <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                    {a.patient?.firstName} {a.patient?.lastName}
                  </td>
                  <td>{a.doctor?.name}</td>
                  <td>{new Date(a.date).toLocaleDateString('en-IN')} {a.time}</td>
                  <td><span className="badge badge-secondary">{a.type}</span></td>
                  <td><span className={`badge ${statusBadge(a.status)}`}>{a.status}</span></td>
                </tr>
              ))}
              {!stats.recentAppointments?.length && (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>No recent appointments</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
