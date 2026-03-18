import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Calendar, Receipt, Stethoscope, Building2, BedDouble, Pill, FlaskConical, LogOut, X } from 'lucide-react';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/', roles: ['Admin', 'Doctor', 'Nurse', 'Receptionist', 'Pharmacist', 'LabTechnician'] },
  { section: 'Clinical' },
  { label: 'Patients', icon: Users, to: '/patients', roles: ['Admin', 'Doctor', 'Nurse', 'Receptionist'] },
  { label: 'Appointments', icon: Calendar, to: '/appointments', roles: ['Admin', 'Doctor', 'Nurse', 'Receptionist'] },
  { label: 'Lab Tests', icon: FlaskConical, to: '/lab', roles: ['Admin', 'Doctor', 'Nurse', 'LabTechnician'] },
  { section: 'Operations' },
  { label: 'Billing', icon: Receipt, to: '/billing', roles: ['Admin', 'Receptionist'] },
  { label: 'Pharmacy', icon: Pill, to: '/pharmacy', roles: ['Admin', 'Pharmacist', 'Doctor', 'Nurse'] },
  { label: 'Rooms & Wards', icon: BedDouble, to: '/rooms', roles: ['Admin', 'Nurse', 'Receptionist'] },
  { section: 'Administration' },
  { label: 'Staff', icon: Stethoscope, to: '/staff', roles: ['Admin'] },
  { label: 'Departments', icon: Building2, to: '/departments', roles: ['Admin'] },
];

export default function Layout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const visible = navItems.filter((item) =>
    item.section || (item.roles && item.roles.includes(user?.role))
  );

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">🏥</div>
          <div>
            <div className="logo-text">Hospital OS</div>
            <div className="logo-sub">Management System</div>
          </div>
        </div>
        <nav className="sidebar-nav">
          {visible.map((item, i) =>
            item.section ? (
              <div className="nav-section" key={i}>
                <div className="nav-section-title">{item.section}</div>
              </div>
            ) : (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <item.icon size={18} className="nav-icon" />
                {item.label}
              </NavLink>
            )
          )}
        </nav>
        <div className="sidebar-footer">
          <div className="user-badge">
            <div className="user-avatar">{user?.name?.[0] || 'U'}</div>
            <div>
              <div className="user-name">{user?.name}</div>
              <div className="user-role">{user?.role}</div>
            </div>
          </div>
          <button className="btn-logout" onClick={handleLogout}>
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
