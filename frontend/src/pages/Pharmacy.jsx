import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, AlertTriangle, Pill } from 'lucide-react';
import toast from 'react-hot-toast';
import { getMedicinesApi, createMedicineApi, updateMedicineApi } from '../api';
import useAuthStore from '../store/authStore';

function AddMedicineModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ name: '', category: '', manufacturer: '', stock: 0, unit: 'Tablets', price: 0, expiryDate: '', reorderLevel: 10 });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createMedicineApi(form);
      toast.success('Medicine added to inventory');
      onCreated();
      onClose();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-md" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">Add Medicine</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group"><label className="form-label">Medicine Name *</label>
              <input required className="form-control" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            <div className="grid-2">
              <div className="form-group"><label className="form-label">Category</label>
                <input className="form-control" placeholder="e.g. Antibiotic" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Manufacturer</label>
                <input className="form-control" value={form.manufacturer} onChange={e => setForm({ ...form, manufacturer: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Stock *</label>
                <input type="number" required className="form-control" value={form.stock} onChange={e => setForm({ ...form, stock: Number(e.target.value) })} min={0} /></div>
              <div className="form-group"><label className="form-label">Unit</label>
                <select className="form-control" value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })}>
                  {['Tablets', 'Capsules', 'Syrup (ml)', 'Injection', 'Ointment'].map(u => <option key={u}>{u}</option>)}
                </select>
              </div>
              <div className="form-group"><label className="form-label">Price (₹)</label>
                <input type="number" className="form-control" value={form.price} onChange={e => setForm({ ...form, price: Number(e.target.value) })} min={0} /></div>
              <div className="form-group"><label className="form-label">Reorder Level</label>
                <input type="number" className="form-control" value={form.reorderLevel} onChange={e => setForm({ ...form, reorderLevel: Number(e.target.value) })} min={0} /></div>
              <div className="form-group" style={{ gridColumn: '1/-1' }}><label className="form-label">Expiry Date</label>
                <input type="date" className="form-control" value={form.expiryDate} onChange={e => setForm({ ...form, expiryDate: e.target.value })} /></div>
            </div>
            <div className="modal-footer" style={{ padding: '16px 0 0' }}>
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Adding...' : 'Add Medicine'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function Pharmacy() {
  const { user } = useAuthStore();
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);

  const fetchMeds = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getMedicinesApi({ search });
      setMedicines(res.data.medicines);
    } catch { toast.error('Failed to load inventory'); }
    finally { setLoading(false); }
  }, [search]);

  useEffect(() => { const t = setTimeout(fetchMeds, 300); return () => clearTimeout(t); }, [fetchMeds]);

  const updateStock = async (id, delta) => {
    const med = medicines.find(m => m._id === id);
    const newStock = Math.max(0, (med.stock || 0) + delta);
    try {
      await updateMedicineApi(id, { stock: newStock });
      setMedicines(prev => prev.map(m => m._id === id ? { ...m, stock: newStock } : m));
      toast.success('Stock updated');
    } catch { toast.error('Failed to update stock'); }
  };

  const lowStockCount = medicines.filter(m => m.stock <= m.reorderLevel).length;

  return (
    <div>
      {showModal && <AddMedicineModal onClose={() => setShowModal(false)} onCreated={fetchMeds} />}
      <div className="topbar">
        <div>
          <div className="topbar-title">Pharmacy Inventory</div>
          <div className="topbar-sub">{medicines.length} items total · {lowStockCount} low stock</div>
        </div>
        {(user?.role === 'Admin' || user?.role === 'Pharmacist') && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={16} /> Add Medicine</button>
        )}
      </div>
      <div className="page">
        <div className="search-bar">
          <div className="input-group" style={{ flex: 1, maxWidth: 360 }}>
            <Search size={16} className="input-icon" />
            <input className="form-control" placeholder="Search medicines..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        {lowStockCount > 0 && (
          <div style={{ background: 'rgba(239,68,68,0.1)', borderLeft: '4px solid #ef4444', padding: '12px 16px', borderRadius: 8, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
            <AlertTriangle size={20} style={{ color: '#ef4444' }} />
            <div style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 600 }}>
              {lowStockCount} items are below the reorder level. Please restock soon.
            </div>
          </div>
        )}

        <div className="card">
          {loading ? (
            <div className="spinner-overlay"><div className="spinner" /></div>
          ) : (
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr><th>Medicine</th><th>Category</th><th>Price</th><th>Stock</th><th>Expiry</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {medicines.map(m => (
                    <tr key={m._id}>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{m.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{m.manufacturer || '—'}</div>
                      </td>
                      <td><span className="badge badge-secondary">{m.category || 'General'}</span></td>
                      <td style={{ fontWeight: 600 }}>₹{m.price}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontWeight: 700, color: m.stock <= m.reorderLevel ? 'var(--danger)' : 'var(--text-primary)' }}>{m.stock}</span>
                          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{m.unit}</span>
                        </div>
                        {m.stock <= m.reorderLevel && <div style={{ fontSize: 10, color: 'var(--danger)', fontWeight: 600 }}>Low Stock</div>}
                      </td>
                      <td>
                        <div style={{ fontSize: 13, color: new Date(m.expiryDate) < new Date() ? 'var(--danger)' : 'var(--text-muted)' }}>
                          {m.expiryDate ? new Date(m.expiryDate).toLocaleDateString() : '—'}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-secondary btn-xs" onClick={() => updateStock(m._id, 1)}>+1</button>
                          <button className="btn btn-secondary btn-xs" onClick={() => updateStock(m._id, -1)} disabled={m.stock === 0}>-1</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!medicines.length && (
                    <tr><td colSpan={6} style={{ textAlign: 'center', padding: 32 }}><Pill size={48} style={{ opacity: 0.2, marginBottom: 8 }} /><br />No medicines found</td></tr>
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
