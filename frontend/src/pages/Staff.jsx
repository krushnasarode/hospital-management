import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, UserCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { getUsersApi, registerStaffApi, getDepartmentsApi } from '../api';

const ROLES = ['Doctor', 'Nurse', 'Receptionist', 'Pharmacist', 'LabTechnician'];
const ROLE_BADGE = { Doctor: 'badge-primary', Nurse: 'badge-info', Receptionist: 'badge-success', Pharmacist: 'badge-purple', LabTechnician: 'badge-warning' };

function AddStaffModal({ onClose, onCreated, departments }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'Doctor', phone: '', gender: 'Male', specialization: '', department: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await registerStaffApi(form);
      toast.success('Staff member added!');
      onCreated();
      onClose();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">Add Staff Member</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="grid-2">
              <div className="form-group"><label className="form-label">Full Name *</label>
                <input required className="form-control" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Email *</label>
                <input required type="email" className="form-control" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Password *</label>
                <input required type="password" className="form-control" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Phone</label>
                <input className="form-control" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Role *</label>
                <select required className="form-control" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                  {ROLES.map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div className="form-group"><label className="form-label">Gender</label>
                <select className="form-control" value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}>
                  <option>Male</option><option>Female</option><option>Other</option>
                </select>
              </div>
              <div className="form-group"><label className="form-label">Specialization</label>
                <input className="form-control" placeholder="e.g. Cardiologist" value={form.specialization} onChange={e => setForm({ ...form, specialization: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Department</label>
                <select className="form-control" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })}>
                  <option value="">Select Department</option>
                  {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                </select>
              </div>
            </div>
            <div className="modal-footer" style={{ padding: '16px 0 0' }}>
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Adding...' : 'Add Staff'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function Staff() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [departments, setDepartments] = useState([]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getUsersApi({ role: roleFilter, search });
      setUsers(res.data.users);
    } catch { toast.error('Failed to load staff'); }
    finally { setLoading(false); }
  }, [roleFilter, search]);

  useEffect(() => { const t = setTimeout(fetchUsers, 300); return () => clearTimeout(t); }, [fetchUsers]);
  useEffect(() => { getDepartmentsApi().then(r => setDepartments(r.data.departments)); }, []);

  return (
    <div>
      {showModal && <AddStaffModal onClose={() => setShowModal(false)} onCreated={fetchUsers} departments={departments} />}
      <div className="topbar">
        <div>
          <div className="topbar-title">Staff Management</div>
          <div className="topbar-sub">{users.length} active staff members</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={16} /> Add Staff</button>
      </div>
      <div className="page">
        <div className="search-bar">
          <div className="input-group" style={{ flex: 1, maxWidth: 360 }}>
            <Search size={16} className="input-icon" />
            <input className="form-control" placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {['', ...ROLES].map(r => (
              <button key={r} onClick={() => setRoleFilter(r)}
                className={`btn btn-sm ${roleFilter === r ? 'btn-primary' : 'btn-secondary'}`}>
                {r || 'All'}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {loading ? (
            <div className="spinner-overlay" style={{ gridColumn: '1/-1' }}><div className="spinner" /></div>
          ) : users.length === 0 ? (
            <div className="empty-state" style={{ gridColumn: '1/-1' }}>
              <UserCheck size={64} />
              <h3>No staff found</h3>
              <p>Add your first staff member</p>
            </div>
          ) : users.map(u => (
            <div key={u._id} className="card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                <div className="user-avatar" style={{ width: 48, height: 48, fontSize: 18 }}>{u.name[0]}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>{u.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{u.email}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                <span className={`badge ${ROLE_BADGE[u.role] || 'badge-secondary'}`}>{u.role}</span>
                {u.specialization && <span className="badge badge-secondary">{u.specialization}</span>}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                {u.department?.name && <div>🏥 {u.department.name}</div>}
                {u.phone && <div>📞 {u.phone}</div>}
                <div>📅 Joined {new Date(u.createdAt).toLocaleDateString('en-IN')}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
