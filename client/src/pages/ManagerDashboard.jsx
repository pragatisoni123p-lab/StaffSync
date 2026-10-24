import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import LeaveApplications from '../components/manager/LeaveApplications';
import TrainingManagement from '../components/manager/TrainingManagement';
import TeamAttendance from '../components/manager/TeamAttendance';
import { Calendar, GraduationCap, Clock, Briefcase } from 'lucide-react';

const ManagerDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('leaves');

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
            <span className="badge badge-mgr">Team Leadership</span>
            <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{user?.department} Department</span>
          </div>
          <h1 style={{ fontSize: '1.85rem', margin: 0 }}>
            Welcome Back, Manager {user?.name}
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: '4px 0 0' }}>
            Review team leaves, monitor department attendance, and build training programs.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-header">
        <button
          type="button"
          onClick={() => setActiveTab('leaves')}
          className={`tab-btn ${activeTab === 'leaves' ? 'active' : ''}`}
        >
          <Calendar size={16} /> Team Leave Applications
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('training')}
          className={`tab-btn ${activeTab === 'training' ? 'active' : ''}`}
        >
          <GraduationCap size={16} /> Training & Development
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('attendance')}
          className={`tab-btn ${activeTab === 'attendance' ? 'active' : ''}`}
        >
          <Clock size={16} /> Team Attendance
        </button>
      </div>

      {/* Content */}
      <div>
        {activeTab === 'leaves' && <LeaveApplications />}
        {activeTab === 'training' && <TrainingManagement />}
        {activeTab === 'attendance' && <TeamAttendance />}
      </div>
    </div>
  );
};

export default ManagerDashboard;
