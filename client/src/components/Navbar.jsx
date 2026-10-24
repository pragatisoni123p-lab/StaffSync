import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationDropdown from './NotificationDropdown';
import { LogOut, User, ShieldCheck, Briefcase, Sparkles } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'HR':
        return 'badge badge-hr';
      case 'Manager':
        return 'badge badge-mgr';
      default:
        return 'badge badge-emp';
    }
  };

  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '0 24px',
        height: '68px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      {/* Brand */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(99, 102, 241, 0.5)',
          }}
        >
          <Sparkles size={20} color="white" />
        </div>
        <div>
          <span
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.3rem',
              fontWeight: 800,
              background: 'linear-gradient(90deg, #ffffff, #cbd5e1)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.02em',
            }}
          >
            StaffSync
          </span>
          <span
            style={{
              fontSize: '0.65rem',
              background: 'rgba(99, 102, 241, 0.2)',
              color: '#818cf8',
              padding: '1px 6px',
              borderRadius: '4px',
              marginLeft: '6px',
              fontWeight: 600,
              verticalAlign: 'middle',
            }}
          >
            AI HRMS
          </span>
        </div>
      </Link>

      {/* Right controls */}
      {user ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          {/* Quick dashboard nav */}
          <div style={{ display: 'flex', gap: '12px' }}>
            {user.role === 'HR' && (
              <Link
                to="/hr"
                className={`btn btn-sm ${location.pathname === '/hr' ? 'btn-primary' : 'btn-secondary'}`}
              >
                <ShieldCheck size={14} /> HR Operations
              </Link>
            )}
            {user.role === 'Manager' && (
              <Link
                to="/manager"
                className={`btn btn-sm ${location.pathname === '/manager' ? 'btn-primary' : 'btn-secondary'}`}
              >
                <Briefcase size={14} /> Team Portal
              </Link>
            )}
            <Link
              to="/employee"
              className={`btn btn-sm ${location.pathname === '/employee' ? 'btn-primary' : 'btn-secondary'}`}
            >
              <User size={14} /> Employee Workspace
            </Link>
          </div>

          {/* Notifications */}
          <NotificationDropdown />

          {/* User profile capsule */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '6px 14px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-full)',
            }}
          >
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff', lineHeight: 1.2 }}>
                {user.name}
              </div>
              <div style={{ fontSize: '0.725rem', color: '#94a3b8' }}>
                {user.department || 'Staff'}
              </div>
            </div>
            <span className={getRoleBadgeClass(user.role)}>{user.role}</span>
          </div>

          {/* Logout */}
          <button
            type="button"
            onClick={handleLogout}
            className="btn btn-secondary btn-sm"
            style={{ borderRadius: 'var(--radius-full)', padding: '8px 12px' }}
            title="Sign out of StaffSync"
          >
            <LogOut size={16} />
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link to="/login" className="btn btn-secondary btn-sm">
            Sign In
          </Link>
          <Link to="/register" className="btn btn-primary btn-sm">
            Register
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
