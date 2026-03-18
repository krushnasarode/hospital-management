import { useState, useEffect, useCallback } from 'react';
import { Plus, Receipt } from 'lucide-react';
import toast from 'react-hot-toast';
import { getBillsApi, createBillApi, updateBillStatusApi, getPatientsApi } from '../api';
import useAuthStore from '../store/authStore';

function CreateBillModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ patient: '', items: [{ description: '', quantity: 1, unitPrice: 0 }], notes: '' });
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { getPatientsApi({ limit: 100 }).then(r => setPatients(r.data.patients)); }, []);

  const addItem = () => setForm(f => ({ ...f, items: [...f.items, { description: '', quantity: 1, unitPrice: 0 }] }));
  const removeItem = (i) => setForm(f => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }));
  const updateItem = (i, key, val) => setForm(f => {
    const items = [...f.items];
    items[i] = { ...items[i], [key]: key === 'quantity' || key === 'unitPrice' ? Number(val) : val };
    return { ...f, items };
  });

  const subtotal = form.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + tax;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await createBillApi({ ...form, subtotal, tax, totalAmount: total });
      toast.success('Invoice created!');
      onCreated(res.data.bill);
      onClose();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to create bill'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">Create Invoice</div>
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
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label className="form-label" style={{ margin: 0 }}>Billing Items</label>
                <button type="button" className="btn btn-secondary btn-xs" onClick={addItem}>+ Add Item</button>
              </div>
              {form.items.map((item, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 80px 100px auto', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                  <input className="form-control" placeholder="Description" value={item.description} onChange={e => updateItem(i, 'description', e.target.value)} required />
                  <input type="number" className="form-control" placeholder="Qty" value={item.quantity} onChange={e => updateItem(i, 'quantity', e.target.value)} min={1} />
                  <input type="number" className="form-control" placeholder="Price (₹)" value={item.unitPrice} onChange={e => updateItem(i, 'unitPrice', e.target.value)} min={0} />
                  {form.items.length > 1 && <button type="button" className="btn btn-danger btn-xs" onClick={() => removeItem(i)}>✕</button>}
                </div>
              ))}
            </div>
            <div style={{ background: 'var(--bg-base)', borderRadius: 8, padding: 14, marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                <span style={{ color: 'var(--text-muted)' }}>Subtotal</span><span>₹{subtotal.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                <span style={{ color: 'var(--text-muted)' }}>Tax (5%)</span><span>₹{tax.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 700, borderTop: '1px solid var(--border)', paddingTop: 10 }}>
                <span>Total</span><span style={{ color: 'var(--primary)' }}>₹{total.toLocaleString()}</span>
              </div>
            </div>
            <div className="form-group"><label className="form-label">Notes</label>
              <textarea className="form-control" rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
            </div>
            <div className="modal-footer" style={{ padding: '16px 0 0' }}>
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Creating...' : 'Create Invoice'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function Billing() {
  const { user } = useAuthStore();
  const [bills, setBills] = useState([]);
  const [stats, setStats] = useState({ totalRevenue: 0, pendingAmount: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchBills = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getBillsApi({ status: statusFilter });
      setBills(res.data.bills);
      setStats({ totalRevenue: res.data.totalRevenue, pendingAmount: res.data.pendingAmount, total: res.data.total });
    } catch { toast.error('Failed to load bills'); }
    finally { setLoading(false); }
  }, [statusFilter]);

  useEffect(() => { fetchBills(); }, [fetchBills]);

  const markPaid = async (id) => {
    try {
      await updateBillStatusApi(id, { status: 'Paid' });
      toast.success('Marked as paid!');
      fetchBills();
    } catch { toast.error('Failed'); }
  };

  const canCreate = ['Admin', 'Receptionist'].includes(user?.role);

  return (
    <div>
      {showModal && <CreateBillModal onClose={() => setShowModal(false)} onCreated={() => fetchBills()} />}
      <div className="topbar">
        <div>
          <div className="topbar-title">Billing & Invoices</div>
          <div className="topbar-sub">{stats.total} total invoices</div>
        </div>
        {canCreate && <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={16} /> Create Invoice</button>}
      </div>
      <div className="page">
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 20 }}>
          {[
            { label: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString()}`, color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
            { label: 'Pending Amount', value: `₹${stats.pendingAmount.toLocaleString()}`, color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
            { label: 'Total Invoices', value: stats.total, color: '#6366f1', bg: 'rgba(99,102,241,0.15)' },
          ].map(c => (
            <div key={c.label} className="stat-card" style={{ '--accent-color': c.color }}>
              <div>
                <div className="stat-value">{c.value}</div>
                <div className="stat-label">{c.label}</div>
              </div>
              <div className="stat-icon" style={{ background: c.bg, color: c.color }}><Receipt size={22} /></div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
          {['', 'Pending', 'Paid', 'Partially Paid', 'Cancelled'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`btn btn-sm ${statusFilter === s ? 'btn-primary' : 'btn-secondary'}`}>
              {s || 'All'}
            </button>
          ))}
        </div>

        <div className="card">
          {loading ? (
            <div className="spinner-overlay"><div className="spinner" /></div>
          ) : (
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr><th>Invoice #</th><th>Patient</th><th>Date</th><th>Items</th><th>Amount</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {bills.map(b => (
                    <tr key={b._id}>
                      <td style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--primary)' }}>{b.invoiceNumber}</td>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{b.patient?.firstName} {b.patient?.lastName}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{b.patient?.patientId}</div>
                      </td>
                      <td>{new Date(b.createdAt).toLocaleDateString('en-IN')}</td>
                      <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{b.items?.length} item(s)</td>
                      <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>₹{b.totalAmount?.toLocaleString()}</td>
                      <td><span className={`badge ${b.status === 'Paid' ? 'badge-success' : b.status === 'Pending' ? 'badge-warning' : b.status === 'Cancelled' ? 'badge-danger' : 'badge-secondary'}`}>{b.status}</span></td>
                      <td>
                        {b.status === 'Pending' && canCreate && (
                          <button className="btn btn-success btn-xs" onClick={() => markPaid(b._id)}>Mark Paid</button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {!bills.length && (
                    <tr><td colSpan={7} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>No invoices found</td></tr>
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
