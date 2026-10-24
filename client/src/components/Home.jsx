import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  Briefcase,
  Users,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Clock,
  CalendarCheck,
  Megaphone,
  GraduationCap,
} from 'lucide-react';

const Home = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const handleQuickDemoLogin = async (email, password, role) => {
    try {
      const loggedUser = await login(email, password);
      if (loggedUser.role === 'HR') navigate('/hr');
      else if (loggedUser.role === 'Manager') navigate('/manager');
      else navigate('/employee');
    } catch (err) {
      alert('Demo login failed: ' + err.message);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 24px 80px' }}>
      {/* Hero Section */}
      <section style={{ textAlign: 'center', marginBottom: '64px' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 16px',
            background: 'rgba(99, 102, 241, 0.12)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            borderRadius: 'var(--radius-full)',
            color: '#a5b4fc',
            fontSize: '0.85rem',
            fontWeight: 500,
            marginBottom: '20px',
          }}
        >
          <Sparkles size={16} /> Next-Gen AI-Powered Human Resource Management System
        </div>

        <h1
          style={{
            fontSize: 'clamp(2.5rem, 5vw, 3.8rem)',
            fontWeight: 800,
            lineHeight: 1.15,
            marginBottom: '20px',
            background: 'linear-gradient(135deg, #ffffff 40%, #cbd5e1 70%, #94a3b8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Empower Your Workforce with <br />
          <span style={{ background: 'linear-gradient(90deg, #6366f1, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            StaffSync Portal
          </span>
        </h1>

        <p
          style={{
            fontSize: '1.15rem',
            color: '#94a3b8',
            maxWidth: '720px',
            margin: '0 auto 36px',
            lineHeight: 1.6,
          }}
        >
          Streamline employee records, daily attendance tracking, two-tier leave approvals, company announcements, and career training in one unified, role-governed web application.
        </p>

        {user ? (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <Link
              to={user.role === 'HR' ? '/hr' : user.role === 'Manager' ? '/manager' : '/employee'}
              className="btn btn-primary btn-lg"
            >
              Go to Your Dashboard ({user.role}) <ArrowRight size={18} />
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <Link to="/login" className="btn btn-primary btn-lg">
              Sign In to Portal <ArrowRight size={18} />
            </Link>
            <Link to="/register" className="btn btn-secondary btn-lg">
              Create Account
            </Link>
          </div>
        )}
      </section>

      {/* 1-Click Interactive Demo Accounts */}
      <section style={{ marginBottom: '64px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <h2 style={{ fontSize: '1.6rem', marginBottom: '8px' }}>Test Instantly with 1-Click Demo Accounts</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
            Click any role below to automatically authenticate and experience the full workflow.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {/* HR Card */}
          <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(168, 85, 247, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c084fc' }}>
                  <ShieldCheck size={22} />
                </div>
                <span className="badge badge-hr">HR Administrator</span>
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>HR Operations</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '16px', lineHeight: 1.5 }}>
                Manage employee lifecycle (add, edit, deactivate), oversee company-wide attendance, review & override leave requests, publish announcements with AI.
              </p>
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '10px 12px', borderRadius: '6px', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '20px' }}>
                <code>hr@staffsync.com</code> | <code>password123</code>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('hr@staffsync.com', 'password123', 'HR')}
              className="btn btn-primary"
              style={{ width: '100%', background: 'linear-gradient(135deg, #a855f7, #7c3aed)' }}
            >
              Sign In as HR Admin <ArrowRight size={16} />
            </button>
          </div>

          {/* Manager Card */}
          <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(6, 182, 212, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22d3ee' }}>
                  <Briefcase size={22} />
                </div>
                <span className="badge badge-mgr">Team Manager</span>
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Manager Dashboard</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '16px', lineHeight: 1.5 }}>
                Lead your department: Review and approve team leave applications with AI risk scoring, track department attendance, and build curriculum for team trainings.
              </p>
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '10px 12px', borderRadius: '6px', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '20px' }}>
                <code>manager@staffsync.com</code> | <code>password123</code>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('manager@staffsync.com', 'password123', 'Manager')}
              className="btn btn-primary"
              style={{ width: '100%', background: 'linear-gradient(135deg, #06b6d4, #0284c7)' }}
            >
              Sign In as Manager <ArrowRight size={16} />
            </button>
          </div>

          {/* Employee Card */}
          <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399' }}>
                  <Users size={22} />
                </div>
                <span className="badge badge-emp">Staff Employee</span>
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Employee Workspace</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '16px', lineHeight: 1.5 }}>
                Self-service hub: Instant daily check-in & check-out, submit leave requests with instant AI impact assessment, view company updates, and access training programs.
              </p>
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '10px 12px', borderRadius: '6px', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '20px' }}>
                <code>employee@staffsync.com</code> | <code>password123</code>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('employee@staffsync.com', 'password123', 'Employee')}
              className="btn btn-primary"
              style={{ width: '100%', background: 'linear-gradient(135deg, #10b981, #059669)' }}
            >
              Sign In as Employee <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '10px' }}>Comprehensive Human Capital Features</h2>
          <p style={{ color: '#94a3b8' }}>Built precisely to specification matching the StaffSync Technical Report and PRD.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
          <div className="glass-panel" style={{ padding: '24px' }}>
            <Clock size={28} style={{ color: '#6366f1', marginBottom: '14px' }} />
            <h4 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Smart Attendance</h4>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', lineHeight: 1.5 }}>
              Check-in and check-out recording with automatic work-hour calculations and Half Day threshold detection.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '24px' }}>
            <CalendarCheck size={28} style={{ color: '#06b6d4', marginBottom: '14px' }} />
            <h4 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Two-Tier Leave Approvals</h4>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', lineHeight: 1.5 }}>
              Leave application with date validation, manager department approvals, and HR organizational override authority.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '24px' }}>
            <Megaphone size={28} style={{ color: '#f59e0b', marginBottom: '14px' }} />
            <h4 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Targeted Broadcasts</h4>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', lineHeight: 1.5 }}>
              Publish company news with role-targeted delivery (All, Manager, Employee) and automatic in-app alerts.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '24px' }}>
            <GraduationCap size={28} style={{ color: '#a855f7', marginBottom: '14px' }} />
            <h4 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Training & Upskilling</h4>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', lineHeight: 1.5 }}>
              Design courses, assign team members, track statuses, and generate 4-week module outlines with Gemini AI.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
