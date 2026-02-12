import { NavLink } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <NavLink to="/" className="navbar-brand">
          <span className="navbar-logo">◆</span>
          <span className="navbar-title">Humbet AI</span>
        </NavLink>
        <div className="navbar-links">
          <NavLink
            to="/chat"
            className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}
          >
            💬 Chat
          </NavLink>
          <NavLink
            to="/admin"
            className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}
          >
            ⚙ Admin
          </NavLink>
        </div>
      </div>
    </nav>
  );
}
