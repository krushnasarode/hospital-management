import { useState, useEffect } from 'react';
import { Plus, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { getDepartmentsApi, createDepartmentApi, getUsersApi } from '../api';

function AddDeptModal({ onClose, onCreated, doctors }) {
  const [form, setForm] = useState({ name: '', description: '', location: '', phone: '', head: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createDepartmentApi(form);
      toast.success('Department created!');
      onCreated();
      onClose();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">Add Department</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group"><label className="form-label">Name *</label>
              <input required className="form-control" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            <div className="form-group"><label className="form-label">Description</label>
              <textarea className="form-control" rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
            <div className="grid-2">
              <div className="form-group"><label className="form-label">Location</label>
                <input className="form-control" placeholder="Block A, Floor 2" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Phone</label>
                <input className="form-control" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
            </div>
            <div className="form-group"><label className="form-label">Department Head</label>
              <select className="form-control" value={form.head} onChange={e => setForm({ ...form, head: e.target.value })}>
                <option value="">Select Doctor</option>
                {doctors.map(d => <option key={d._id} value={d._id}>{d.name} — {d.specialization}</option>)}
              </select>
            </div>
            <div className="modal-footer" style={{ padding: '16px 0 0' }}>
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Creating...' : 'Create'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

const DEPT_COLORS = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

export default function Departments() {
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [dRes, uRes] = await Promise.all([getDepartmentsApi(), getUsersApi({ role: 'Doctor' })]);
      setDepartments(dRes.data.departments);
      setDoctors(uRes.data.users);
    } catch { toast.error('Failed'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <div>
      {showModal && <AddDeptModal onClose={() => setShowModal(false)} onCreated={fetchData} doctors={doctors} />}
      <div className="topbar">
        <div>
          <div className="topbar-title">Departments</div>
          <div className="topbar-sub">{departments.length} active departments</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={16} /> Add Department</button>
      </div>
      <div className="page">
        {loading ? (
          <div className="spinner-overlay"><div className="spinner" /></div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
            {departments.map((d, i) => (
              <div key={d._id} className="card" style={{ borderTop: `3px solid ${DEPT_COLORS[i % DEPT_COLORS.length]}` }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 14 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 10, background: `${DEPT_COLORS[i % DEPT_COLORS.length]}22`, color: DEPT_COLORS[i % DEPT_COLORS.length], display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Building2 size={22} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)', marginBottom: 4 }}>{d.name}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{d.description}</div>
                  </div>
                </div>
                <div style={{ fontSize: 13, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {d.head && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ color: 'var(--text-muted)' }}>Head:</span>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{d.head.name}</span>
                      <span className="badge badge-secondary" style={{ fontSize: 10 }}>{d.head.specialization}</span>
                    </div>
                  )}
                  {d.location && <div style={{ color: 'var(--text-muted)' }}>📍 {d.location}</div>}
                  {d.phone && <div style={{ color: 'var(--text-muted)' }}>📞 {d.phone}</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
