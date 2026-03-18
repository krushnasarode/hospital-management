import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Eye, Trash2, Filter, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { getPatientsApi, createPatientApi, deletePatientApi, getUsersApi } from '../api';
import useAuthStore from '../store/authStore';

const STATUS_COLORS = { Active: 'badge-success', Discharged: 'badge-secondary', Critical: 'badge-danger' };

function AddPatientModal({ onClose, onCreated, doctors }) {
  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '', gender: 'Male', bloodGroup: '', dateOfBirth: '', email: '', assignedDoctor: '', 'address.city': '', 'address.state': '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = {
        firstName: form.firstName, lastName: form.lastName, phone: form.phone,
        gender: form.gender, bloodGroup: form.bloodGroup || undefined,
        dateOfBirth: form.dateOfBirth || undefined, email: form.email || undefined,
        assignedDoctor: form.assignedDoctor || undefined,
        address: { city: form['address.city'], state: form['address.state'] },
      };
      const res = await createPatientApi(data);
      toast.success(`Patient ${res.data.patient.firstName} registered!`);
      onCreated(res.data.patient);
      onClose();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to add patient'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">Register New Patient</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="grid-2">
              <div className="form-group"><label className="form-label">First Name *</label><input required className="form-control" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Last Name *</label><input required className="form-control" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Phone *</label><input required className="form-control" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Email</label><input type="email" className="form-control" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Gender *</label>
                <select required className="form-control" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                  <option>Male</option><option>Female</option><option>Other</option>
                </select>
              </div>
              <div className="form-group"><label className="form-label">Blood Group</label>
                <select className="form-control" value={form.bloodGroup} onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}>
                  <option value="">Select</option>
                  {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(b => <option key={b}>{b}</option>)}
                </select>
              </div>
              <div className="form-group"><label className="form-label">Date of Birth</label><input type="date" className="form-control" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Assign Doctor</label>
                <select className="form-control" value={form.assignedDoctor} onChange={(e) => setForm({ ...form, assignedDoctor: e.target.value })}>
                  <option value="">Select Doctor</option>
                  {doctors.map(d => <option key={d._id} value={d._id}>{d.name} — {d.specialization}</option>)}
                </select>
              </div>
              <div className="form-group"><label className="form-label">City</label><input className="form-control" value={form['address.city']} onChange={(e) => setForm({ ...form, 'address.city': e.target.value })} /></div>
              <div className="form-group"><label className="form-label">State</label><input className="form-control" value={form['address.state']} onChange={(e) => setForm({ ...form, 'address.state': e.target.value })} /></div>
            </div>
            <div className="modal-footer" style={{ padding: '16px 0 0', margin: 0 }}>
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Registering...' : 'Register Patient'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function Patients() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [patients, setPatients] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [doctors, setDoctors] = useState([]);

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getPatientsApi({ search, status: statusFilter });
      setPatients(res.data.patients);
      setTotal(res.data.total);
    } catch { toast.error('Failed to load patients'); }
    finally { setLoading(false); }
  }, [search, statusFilter]);

  useEffect(() => {
    const t = setTimeout(fetchPatients, 300);
    return () => clearTimeout(t);
  }, [fetchPatients]);

  useEffect(() => {
    getUsersApi({ role: 'Doctor' }).then((r) => setDoctors(r.data.users)).catch(() => {});
  }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete patient ${name}?`)) return;
    try {
      await deletePatientApi(id);
      toast.success('Patient deleted');
      fetchPatients();
    } catch { toast.error('Failed to delete'); }
  };

  const canAdd = ['Admin', 'Receptionist', 'Doctor'].includes(user?.role);

  return (
    <div>
      {showModal && <AddPatientModal onClose={() => setShowModal(false)} onCreated={() => fetchPatients()} doctors={doctors} />}
      <div className="topbar">
        <div>
          <div className="topbar-title">Patients</div>
          <div className="topbar-sub">{total} total patients</div>
        </div>
        {canAdd && <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={16} /> Register Patient</button>}
      </div>
      <div className="page">
        <div className="search-bar">
          <div className="input-group" style={{ flex: 1, maxWidth: 380 }}>
            <Search size={16} className="input-icon" />
            <input className="form-control" placeholder="Search by name, ID, phone..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Filter size={14} style={{ color: 'var(--text-muted)' }} />
            <select className="form-control" style={{ width: 140 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All Status</option>
              <option>Active</option><option>Discharged</option><option>Critical</option>
            </select>
          </div>
        </div>

        <div className="card">
          {loading ? (
            <div className="spinner-overlay"><div className="spinner" /></div>
          ) : patients.length === 0 ? (
            <div className="empty-state">
              <Users size={64} />
              <h3>No patients found</h3>
              <p>{search ? 'Try a different search term' : 'Register your first patient'}</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr><th>ID</th><th>Name</th><th>Age / Gender</th><th>Blood</th><th>Doctor</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {patients.map((p) => {
                    const age = p.dateOfBirth ? Math.floor((Date.now() - new Date(p.dateOfBirth)) / (365.25 * 24 * 3600 * 1000)) : '—';
                    return (
                      <tr key={p._id}>
                        <td style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--primary)' }}>{p.patientId}</td>
                        <td>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.firstName} {p.lastName}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.phone}</div>
                        </td>
                        <td>{age} yrs / {p.gender}</td>
                        <td>{p.bloodGroup || '—'}</td>
                        <td>{p.assignedDoctor?.name || '—'}</td>
                        <td><span className={`badge ${STATUS_COLORS[p.status] || 'badge-secondary'}`}>{p.status}</span></td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button className="btn btn-secondary btn-xs" onClick={() => navigate(`/patients/${p._id}`)}>
                              <Eye size={13} /> View
                            </button>
                            {user?.role === 'Admin' && (
                              <button className="btn btn-danger btn-xs" onClick={() => handleDelete(p._id, p.firstName)}>
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
