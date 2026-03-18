import { useState, useEffect, useCallback } from 'react';
import { Plus, BedDouble } from 'lucide-react';
import toast from 'react-hot-toast';
import { getRoomsApi, createRoomApi, updateRoomApi, getDepartmentsApi } from '../api';

const ROOM_TYPES = ['General', 'Private', 'ICU', 'Emergency', 'Operation Theatre', 'Lab'];
const STATUS_COLORS = { Available: 'badge-success', Occupied: 'badge-danger', Maintenance: 'badge-warning', Reserved: 'badge-info' };
const TYPE_ICONS = { General: '🛏️', Private: '🏠', ICU: '💊', Emergency: '🚨', 'Operation Theatre': '🔬', Lab: '🧪' };

function AddRoomModal({ onClose, onCreated, departments }) {
  const [form, setForm] = useState({ roomNumber: '', type: 'General', floor: 1, capacity: 1, pricePerDay: 0, department: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createRoomApi(form);
      toast.success('Room added!');
      onCreated();
      onClose();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">Add Room / Ward</div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="grid-2">
              <div className="form-group"><label className="form-label">Room Number *</label>
                <input required className="form-control" placeholder="e.g. 101" value={form.roomNumber} onChange={e => setForm({ ...form, roomNumber: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Type *</label>
                <select required className="form-control" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                  {ROOM_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group"><label className="form-label">Floor</label>
                <input type="number" className="form-control" value={form.floor} onChange={e => setForm({ ...form, floor: Number(e.target.value) })} min={0} /></div>
              <div className="form-group"><label className="form-label">Capacity</label>
                <input type="number" className="form-control" value={form.capacity} onChange={e => setForm({ ...form, capacity: Number(e.target.value) })} min={1} /></div>
              <div className="form-group"><label className="form-label">Price Per Day (₹)</label>
                <input type="number" className="form-control" value={form.pricePerDay} onChange={e => setForm({ ...form, pricePerDay: Number(e.target.value) })} min={0} /></div>
              <div className="form-group"><label className="form-label">Department</label>
                <select className="form-control" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })}>
                  <option value="">Select</option>
                  {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                </select>
              </div>
            </div>
            <div className="modal-footer" style={{ padding: '16px 0 0' }}>
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Adding...' : 'Add Room'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const fetchRooms = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getRoomsApi({ status: statusFilter, type: typeFilter });
      setRooms(res.data.rooms);
    } catch { toast.error('Failed to load rooms'); }
    finally { setLoading(false); }
  }, [statusFilter, typeFilter]);

  useEffect(() => { fetchRooms(); }, [fetchRooms]);
  useEffect(() => { getDepartmentsApi().then(r => setDepartments(r.data.departments)); }, []);

  const available = rooms.filter(r => r.status === 'Available').length;
  const occupied = rooms.filter(r => r.status === 'Occupied').length;

  const changeStatus = async (id, status) => {
    try {
      await updateRoomApi(id, { status });
      setRooms(prev => prev.map(r => r._id === id ? { ...r, status } : r));
      toast.success('Room status updated');
    } catch { toast.error('Failed'); }
  };

  return (
    <div>
      {showModal && <AddRoomModal onClose={() => setShowModal(false)} onCreated={fetchRooms} departments={departments} />}
      <div className="topbar">
        <div>
          <div className="topbar-title">Rooms & Wards</div>
          <div className="topbar-sub">{available} available · {occupied} occupied · {rooms.length} total</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={16} /> Add Room</button>
      </div>
      <div className="page">
        <div className="search-bar">
          <select className="form-control" style={{ width: 140 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All Status</option>
            {['Available', 'Occupied', 'Maintenance', 'Reserved'].map(s => <option key={s}>{s}</option>)}
          </select>
          <select className="form-control" style={{ width: 180 }} value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
            <option value="">All Types</option>
            {ROOM_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="spinner-overlay"><div className="spinner" /></div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {rooms.map(r => (
              <div key={r._id} className="card" style={{ padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 22 }}>{TYPE_ICONS[r.type] || '🛏️'}</div>
                    <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--text-primary)', marginTop: 4 }}>Room {r.roomNumber}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{r.type} · Floor {r.floor}</div>
                  </div>
                  <span className={`badge ${STATUS_COLORS[r.status] || 'badge-secondary'}`}>{r.status}</span>
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>
                  <div>Capacity: {r.capacity} bed(s)</div>
                  {r.department?.name && <div>Dept: {r.department.name}</div>}
                  {r.pricePerDay > 0 && <div style={{ color: 'var(--success)', fontWeight: 600 }}>₹{r.pricePerDay.toLocaleString()} / day</div>}
                  {r.currentPatient && <div style={{ color: 'var(--warning)' }}>Patient: {r.currentPatient.firstName} {r.currentPatient.lastName}</div>}
                </div>
                <select className="form-control" style={{ fontSize: 12, padding: '5px 8px' }} value={r.status} onChange={e => changeStatus(r._id, e.target.value)}>
                  {['Available', 'Occupied', 'Maintenance', 'Reserved'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            ))}
            {!rooms.length && (
              <div className="empty-state" style={{ gridColumn: '1/-1' }}>
                <BedDouble size={64} />
                <h3>No rooms found</h3>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
