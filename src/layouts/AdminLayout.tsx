import { NavLink, Outlet } from 'react-router-dom';
import '../styles/admin.css';

const navItems = [
  { to: '/admin/evaluate', icon: '📊', label: 'Evaluate' },
  { to: '/admin/ingest', icon: '📥', label: 'Ingest' },
  { to: '/admin/vectors/sources', icon: '📚', label: 'Sources' },
  { to: '/admin/vectors/reset', icon: '🔄', label: 'Reset' },
  { to: '/admin/vectors/delete-by-source', icon: '🗑', label: 'Delete' },
];

export default function AdminLayout() {
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-title">Admin Panel</div>
        <nav className="admin-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `admin-nav-item ${isActive ? 'active' : ''}`
              }
            >
              <span className="admin-nav-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
}
