import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Attendance from '../components/employee/Attendance';
import LeaveApply from '../components/employee/LeaveApply';
import LeaveList from '../components/employee/LeaveList';
import Announcements from '../components/employee/Announcements';
import Profile from '../components/employee/Profile';
import AssignedTrainings from '../components/employee/AssignedTrainings';
import { Clock, Calendar, FileText, Megaphone, User, GraduationCap } from 'lucide-react';

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('attendance');
  const [leaveRefresh, setLeaveRefresh] = useState(0);

  const handleLeaveSubmitted = () => {
    setLeaveRefresh((prev) => prev + 1);
    setActiveTab('leave-history');
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px 80px' }}>
      {/* Header Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '28px 32px',
          marginBottom: '28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge badge-emp">Employee Self-Service</span>
            <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{user?.department} Team</span>
          </div>
          <h1 style={{ fontSize: '1.85rem', margin: 0 }}>
            Welcome Back, {user?.name}
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: '4px 0 0' }}>
            Manage your daily check-in, leave applications, company bulletins, and skill training.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            onClick={() => setActiveTab('leave-apply')}
            className="btn btn-primary btn-sm"
          >
            <Calendar size={15} /> Apply for Leave
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="tabs-header">
        <button
          type="button"
          onClick={() => setActiveTab('attendance')}
          className={`tab-btn ${activeTab === 'attendance' ? 'active' : ''}`}
        >
          <Clock size={16} /> Daily Attendance
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('leave-apply')}
          className={`tab-btn ${activeTab === 'leave-apply' ? 'active' : ''}`}
        >
          <Calendar size={16} /> Apply Leave
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('leave-history')}
          className={`tab-btn ${activeTab === 'leave-history' ? 'active' : ''}`}
        >
          <FileText size={16} /> My Leaves
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('announcements')}
          className={`tab-btn ${activeTab === 'announcements' ? 'active' : ''}`}
        >
          <Megaphone size={16} /> Announcements
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('trainings')}
          className={`tab-btn ${activeTab === 'trainings' ? 'active' : ''}`}
        >
          <GraduationCap size={16} /> Training & Upskilling
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
        >
          <User size={16} /> My Profile
        </button>
      </div>

      {/* Tab Content Panes */}
      <div>
        {activeTab === 'attendance' && <Attendance />}
        {activeTab === 'leave-apply' && <LeaveApply onLeaveSubmitted={handleLeaveSubmitted} />}
        {activeTab === 'leave-history' && <LeaveList refreshTrigger={leaveRefresh} />}
        {activeTab === 'announcements' && <Announcements />}
        {activeTab === 'trainings' && <AssignedTrainings />}
        {activeTab === 'profile' && <Profile />}
      </div>
    </div>
  );
};

export default EmployeeDashboard;
