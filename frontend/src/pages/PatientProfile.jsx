import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Phone, Calendar, Droplets, MapPin, Stethoscope, FlaskConical, Receipt, Edit } from 'lucide-react';
import { getPatientApi, getAppointmentsApi, getBillsApi, getLabTestsApi } from '../api';
import toast from 'react-hot-toast';

export default function PatientProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [bills, setBills] = useState([]);
  const [labTests, setLabTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');

  useEffect(() => {
    Promise.all([
      getPatientApi(id),
      getAppointmentsApi({ limit: 10 }),
      getBillsApi({ limit: 10 }),
      getLabTestsApi({ patientId: id }),
    ]).then(([p, a, b, l]) => {
      setPatient(p.data.patient);
      setAppointments(a.data.appointments.filter(x => x.patient?._id === id));
      setBills(b.data.bills.filter(x => x.patient?._id === id));
      setLabTests(l.data.tests);
    }).catch(() => toast.error('Failed to load patient')).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="page"><div className="spinner-overlay"><div className="spinner" /></div></div>;
  if (!patient) return <div className="page"><p>Patient not found.</p></div>;

  const age = patient.dateOfBirth ? Math.floor((Date.now() - new Date(patient.dateOfBirth)) / (365.25 * 24 * 3600 * 1000)) : 'N/A';
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'appointments', label: `Appointments (${appointments.length})` },
    { id: 'bills', label: `Billing (${bills.length})` },
    { id: 'lab', label: `Lab Tests (${labTests.length})` },
  ];

  return (
    <div>
      <div className="topbar">
        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/patients')}><ArrowLeft size={14} /> Back</button>
        <div style={{ flex: 1, marginLeft: 16 }}>
          <div className="topbar-title">{patient.firstName} {patient.lastName}</div>
          <div className="topbar-sub">{patient.patientId}</div>
        </div>
      </div>
      <div className="page">
        <div className="profile-header">
          <div className="profile-avatar">{patient.firstName[0]}{patient.lastName[0]}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{patient.firstName} {patient.lastName}</div>
            <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 8 }}>{patient.patientId} · {age} years · {patient.gender}</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <span className={`badge ${patient.status === 'Active' ? 'badge-success' : patient.status === 'Critical' ? 'badge-danger' : 'badge-secondary'}`}>{patient.status}</span>
              {patient.isAdmitted && <span className="badge badge-warning">Admitted</span>}
              {patient.bloodGroup && <span className="badge badge-primary">Blood: {patient.bloodGroup}</span>}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`btn ${tab === t.id ? 'btn-primary' : 'btn-secondary'} btn-sm`}>{t.label}</button>
          ))}
        </div>

        {tab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div className="card">
              <div className="card-title" style={{ marginBottom: 16 }}>Personal Information</div>
              {[
                { label: 'Full Name', value: `${patient.firstName} ${patient.lastName}` },
                { label: 'Date of Birth', value: patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString('en-IN') : '—' },
                { label: 'Age', value: `${age} years` },
                { label: 'Gender', value: patient.gender },
                { label: 'Blood Group', value: patient.bloodGroup || '—' },
                { label: 'Phone', value: patient.phone },
                { label: 'Email', value: patient.email || '—' },
                { label: 'City', value: patient.address?.city || '—' },
                { label: 'State', value: patient.address?.state || '—' },
              ].map(row => (
                <div key={row.label} className="info-row">
                  <div className="info-label">{row.label}</div>
                  <div className="info-value">{row.value}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="card">
                <div className="card-title" style={{ marginBottom: 16 }}>Clinical Information</div>
                {[
                  { label: 'Assigned Doctor', value: patient.assignedDoctor?.name || '—' },
                  { label: 'Specialization', value: patient.assignedDoctor?.specialization || '—' },
                  { label: 'Room', value: patient.room?.roomNumber ? `Room ${patient.room.roomNumber} (${patient.room.type})` : '—' },
                  { label: 'Admission Date', value: patient.admissionDate ? new Date(patient.admissionDate).toLocaleDateString('en-IN') : '—' },
                  { label: 'Discharge Date', value: patient.dischargeDate ? new Date(patient.dischargeDate).toLocaleDateString('en-IN') : '—' },
                ].map(row => (
                  <div key={row.label} className="info-row">
                    <div className="info-label">{row.label}</div>
                    <div className="info-value">{row.value}</div>
                  </div>
                ))}
              </div>
              <div className="card">
                <div className="card-title" style={{ marginBottom: 12 }}>Medical History</div>
                {patient.medicalHistory?.length ? patient.medicalHistory.map(m => (
                  <span key={m} className="badge badge-warning" style={{ marginRight: 6, marginBottom: 6 }}>{m}</span>
                )) : <span style={{ color: 'var(--text-muted)' }}>No history recorded</span>}
                <div className="card-title" style={{ margin: '16px 0 12px' }}>Allergies</div>
                {patient.allergies?.length ? patient.allergies.map(a => (
                  <span key={a} className="badge badge-danger" style={{ marginRight: 6, marginBottom: 6 }}>{a}</span>
                )) : <span style={{ color: 'var(--text-muted)' }}>No known allergies</span>}
              </div>
            </div>
          </div>
        )}

        {tab === 'appointments' && (
          <div className="card">
            <div className="table-wrapper">
              <table className="table">
                <thead><tr><th>Date</th><th>Doctor</th><th>Type</th><th>Reason</th><th>Status</th></tr></thead>
                <tbody>
                  {appointments.map(a => (
                    <tr key={a._id}>
                      <td>{new Date(a.date).toLocaleDateString('en-IN')} {a.time}</td>
                      <td>{a.doctor?.name}</td>
                      <td>{a.type}</td>
                      <td>{a.reason || '—'}</td>
                      <td><span className="badge badge-primary">{a.status}</span></td>
                    </tr>
                  ))}
                  {!appointments.length && <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 24 }}>No appointments found</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'bills' && (
          <div className="card">
            <div className="table-wrapper">
              <table className="table">
                <thead><tr><th>Invoice #</th><th>Date</th><th>Amount</th><th>Status</th><th>Payment</th></tr></thead>
                <tbody>
                  {bills.map(b => (
                    <tr key={b._id}>
                      <td style={{ fontFamily: 'monospace', color: 'var(--primary)' }}>{b.invoiceNumber}</td>
                      <td>{new Date(b.createdAt).toLocaleDateString('en-IN')}</td>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>₹{b.totalAmount?.toLocaleString()}</td>
                      <td><span className={`badge ${b.status === 'Paid' ? 'badge-success' : b.status === 'Pending' ? 'badge-warning' : 'badge-secondary'}`}>{b.status}</span></td>
                      <td>{b.paymentMethod}</td>
                    </tr>
                  ))}
                  {!bills.length && <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 24 }}>No bills found</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'lab' && (
          <div className="card">
            <div className="table-wrapper">
              <table className="table">
                <thead><tr><th>Test Name</th><th>Category</th><th>Ordered By</th><th>Status</th><th>Result</th></tr></thead>
                <tbody>
                  {labTests.map(t => (
                    <tr key={t._id}>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{t.testName}</td>
                      <td>{t.category}</td>
                      <td>{t.orderedBy?.name}</td>
                      <td><span className={`badge ${t.status === 'Completed' ? 'badge-success' : t.status === 'Pending' ? 'badge-warning' : 'badge-primary'}`}>{t.status}</span></td>
                      <td>{t.result || '—'}</td>
                    </tr>
                  ))}
                  {!labTests.length && <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 24 }}>No lab tests found</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
