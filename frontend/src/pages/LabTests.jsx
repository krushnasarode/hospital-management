import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, FlaskConical, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import { getLabTestsApi, createLabTestApi, updateLabTestStatusApi, getPatientsApi, getUsersApi } from '../api';
import useAuthStore from '../store/authStore';

const STATUS_OPTS = ['Pending', 'Processing', 'Completed', 'Cancelled'];
const STATUS_BADGE = { Pending: 'badge-warning', Processing: 'badge-primary', Completed: 'badge-success', Cancelled: 'badge-danger' };

function AddLabTestModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ patient: '', testName: '', category: 'Blood Test', results: '', normalRange: '', price: 0, orderedBy: '' });
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
      await createLabTestApi(form);
      toast.success('Lab test ordered');
      onCreated();
      onClose();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">New Lab Order</div>
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
            <div className="form-group"><label className="form-label">Test Name *</label>
              <input required className="form-control" placeholder="e.g. CBC, Lipid Profile" value={form.testName} onChange={e => setForm({ ...form, testName: e.target.value })} /></div>
            <div className="grid-2">
              <div className="form-group"><label className="form-label">Category</label>
                <select className="form-control" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  {['Blood Test', 'Urine Test', 'X-Ray', 'MRI', 'CT Scan', 'Biopsy'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group"><label className="form-label">Price (₹)</label>
                <input type="number" className="form-control" value={form.price} onChange={e => setForm({ ...form, price: Number(e.target.value) })} min={0} /></div>
            </div>
            <div className="form-group"><label className="form-label">Ordered By</label>
              <select className="form-control" value={form.orderedBy} onChange={e => setForm({ ...form, orderedBy: e.target.value })}>
                <option value="">Select Doctor</option>
                {doctors.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
              </select>
            </div>
            <div className="modal-footer" style={{ padding: '16px 0 0' }}>
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Ordering...' : 'Place Order'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function LabTests() {
  const { user } = useAuthStore();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);

  const fetchTests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getLabTestsApi({ status: statusFilter, search });
      setTests(res.data.tests);
    } catch { toast.error('Failed to load lab tests'); }
    finally { setLoading(false); }
  }, [statusFilter, search]);

  useEffect(() => { const t = setTimeout(fetchTests, 300); return () => clearTimeout(t); }, [fetchTests]);

  const updateStatus = async (id, status) => {
    try {
      await updateLabTestStatusApi(id, { status });
      setTests(prev => prev.map(t => t._id === id ? { ...t, status } : t));
      toast.success('Lab test status updated');
    } catch { toast.error('Failed'); }
  };

  const isLabOrDoctor = ['Admin', 'Doctor', 'LabTechnician'].includes(user?.role);

  return (
    <div>
      {showModal && <AddLabTestModal onClose={() => setShowModal(false)} onCreated={fetchTests} />}
      <div className="topbar">
        <div>
          <div className="topbar-title">Laboratory Management</div>
          <div className="topbar-sub">{tests.length} test(s) found</div>
        </div>
        {isLabOrDoctor && <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={16} /> New Lab Order</button>}
      </div>
      <div className="page">
        <div className="search-bar">
          <div className="input-group" style={{ flex: 1, maxWidth: 360 }}>
            <Search size={16} className="input-icon" />
            <input className="form-control" placeholder="Search by test or patient..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="form-control" style={{ width: 140 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All Status</option>
            {STATUS_OPTS.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>

        <div className="card">
          {loading ? (
            <div className="spinner-overlay"><div className="spinner" /></div>
          ) : (
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr><th>Test Name</th><th>Patient</th><th>Category</th><th>Result</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {tests.map(t => (
                    <tr key={t._id}>
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{t.testName}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Ordered by: {t.orderedBy?.name || 'Unknown'}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{t.patient?.firstName} {t.patient?.lastName}</div>
                      </td>
                      <td><span className="badge badge-secondary">{t.category}</span></td>
                      <td style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {t.result || <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Pending results...</span>}
                      </td>
                      <td><span className={`badge ${STATUS_BADGE[t.status] || 'badge-secondary'}`}>{t.status}</span></td>
                      <td>
                        <select className="form-control" style={{ fontSize: 11, padding: '4px 8px', width: 'auto' }} value={t.status} onChange={e => updateStatus(t._id, e.target.value)}>
                          {STATUS_OPTS.map(s => <option key={s}>{s}</option>)}
                        </select>
                      </td>
                    </tr>
                  ))}
                  {!tests.length && (
                    <tr><td colSpan={6} style={{ textAlign: 'center', padding: 32 }}><FlaskConical size={48} style={{ opacity: 0.2, marginBottom: 8 }} /><br />No tests found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
