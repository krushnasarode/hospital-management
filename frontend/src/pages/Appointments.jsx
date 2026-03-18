import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Filter, CalendarDays } from 'lucide-react';
import toast from 'react-hot-toast';
import { getAppointmentsApi, createAppointmentApi, updateAppointmentStatusApi, getPatientsApi, getUsersApi } from '../api';
import useAuthStore from '../store/authStore';

const STATUS_OPTS = ['Scheduled', 'Confirmed', 'Arrived', 'In Progress', 'Completed', 'Cancelled', 'No Show'];
const STATUS_BADGE = { Scheduled: 'badge-primary', Confirmed: 'badge-info', Arrived: 'badge-warning', 'In Progress': 'badge-warning', Completed: 'badge-success', Cancelled: 'badge-danger', 'No Show': 'badge-secondary' };

function BookModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ patient: '', doctor: '', date: '', time: '', type: 'General', reason: '' });
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getPatientsApi({ limit: 100 }).then(r => setPatients(r.data.patients));
    getUsersApi({ role: 'Doctor' }).then(r => setDoctors(r.data.users));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await createAppointmentApi(form);
      toast.success('Appointment booked!');
      onCreated(res.data.appointment);
      onClose();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to book'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">Book Appointment</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group"><label className="form-label">Patient *</label>
              <select required className="form-control" value={form.patient} onChange={e => setForm({ ...form, patient: e.target.value })}>
                <option value="">Select Patient</option>
                {patients.map(p => <option key={p._id} value={p._id}>{p.firstName} {p.lastName} ({p.patientId})</option>)}
              </select>
            </div>
            <div className="form-group"><label className="form-label">Doctor *</label>
              <select required className="form-control" value={form.doctor} onChange={e => setForm({ ...form, doctor: e.target.value })}>
                <option value="">Select Doctor</option>
                {doctors.map(d => <option key={d._id} value={d._id}>{d.name} — {d.specialization}</option>)}
              </select>
            </div>
            <div className="grid-2">
              <div className="form-group"><label className="form-label">Date *</label>
                <input required type="date" className="form-control" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
              </div>
              <div className="form-group"><label className="form-label">Time *</label>
                <input required type="time" className="form-control" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} />
              </div>
            </div>
            <div className="form-group"><label className="form-label">Type</label>
              <select className="form-control" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                {['General', 'Follow-up', 'Emergency', 'Consultation'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group"><label className="form-label">Reason</label>
              <textarea className="form-control" rows={3} placeholder="Chief complaint..." value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} />
            </div>
            <div className="modal-footer" style={{ padding: '16px 0 0' }}>
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Booking...' : 'Book Appointment'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function Appointments() {
  const { user } = useAuthStore();
  const [appointments, setAppointments] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchApt = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAppointmentsApi({ date: dateFilter, status: statusFilter });
      setAppointments(res.data.appointments);
      setTotal(res.data.total);
    } catch { toast.error('Failed to load appointments'); }
    finally { setLoading(false); }
  }, [dateFilter, statusFilter]);

  useEffect(() => { fetchApt(); }, [fetchApt]);

  const handleStatusChange = async (id, status) => {
    try {
      await updateAppointmentStatusApi(id, { status });
      setAppointments(prev => prev.map(a => a._id === id ? { ...a, status } : a));
      toast.success('Status updated');
    } catch { toast.error('Failed to update'); }
  };

  const canBook = ['Admin', 'Receptionist', 'Doctor'].includes(user?.role);

  return (
    <div>
      {showModal && <BookModal onClose={() => setShowModal(false)} onCreated={() => fetchApt()} />}
      <div className="topbar">
        <div>
          <div className="topbar-title">Appointments</div>
          <div className="topbar-sub">{total} total</div>
        </div>
        {canBook && <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={16} /> Book Appointment</button>}
      </div>
      <div className="page">
        <div className="search-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CalendarDays size={16} style={{ color: 'var(--text-muted)' }} />
            <input type="date" className="form-control" style={{ width: 160 }} value={dateFilter} onChange={e => setDateFilter(e.target.value)} />
          </div>
          <select className="form-control" style={{ width: 160 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All Status</option>
            {STATUS_OPTS.map(s => <option key={s}>{s}</option>)}
          </select>
          {(dateFilter || statusFilter) && (
            <button className="btn btn-secondary btn-sm" onClick={() => { setDateFilter(''); setStatusFilter(''); }}>Clear</button>
          )}
        </div>

        <div className="card">
          {loading ? (
            <div className="spinner-overlay"><div className="spinner" /></div>
          ) : appointments.length === 0 ? (
            <div className="empty-state">
              <CalendarDays size={64} />
              <h3>No appointments found</h3>
              <p>Try a different date or book a new one</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr><th>Patient</th><th>Doctor</th><th>Date & Time</th><th>Type</th><th>Reason</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {appointments.map(a => (
                    <tr key={a._id}>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{a.patient?.firstName} {a.patient?.lastName}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{a.patient?.patientId}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{a.doctor?.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{a.doctor?.specialization}</div>
                      </td>
                      <td>{new Date(a.date).toLocaleDateString('en-IN')} · {a.time}</td>
                      <td><span className="badge badge-secondary">{a.type}</span></td>
                      <td style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.reason || '—'}</td>
                      <td>
                        <select
                          className="form-control"
                          style={{ padding: '4px 8px', width: 'auto', fontSize: 12 }}
                          value={a.status}
                          onChange={e => handleStatusChange(a._id, e.target.value)}
                          disabled={!['Admin', 'Doctor', 'Nurse', 'Receptionist'].includes(user?.role)}
                        >
                          {STATUS_OPTS.map(s => <option key={s}>{s}</option>)}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
