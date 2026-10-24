import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import EmployeeCRUD from '../components/hr/EmployeeCRUD';
import AttendanceSummary from '../components/hr/AttendanceSummary';
import LeaveApplications from '../components/hr/LeaveApplications';
import AnnouncementsManager from '../components/hr/AnnouncementsManager';
import ReportsAnalytics from '../components/hr/ReportsAnalytics';
import { Users, Clock, Calendar, Megaphone, BarChart3, ShieldCheck } from 'lucide-react';

const HrDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('employees');

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '32px 24px 80px' }}>
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
            <span className="badge badge-hr">Human Resources Administration</span>
            <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>StaffSync Enterprise</span>
          </div>
          <h1 style={{ fontSize: '1.85rem', margin: 0 }}>
            Welcome, HR Director {user?.name}
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: '4px 0 0' }}>
            Full governance across talent directories, organizational attendance, leave escalations, and broadcasts.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-header">
        <button
          type="button"
          onClick={() => setActiveTab('employees')}
          className={`tab-btn ${activeTab === 'employees' ? 'active' : ''}`}
        >
          <Users size={16} /> Employee Directory
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('attendance')}
          className={`tab-btn ${activeTab === 'attendance' ? 'active' : ''}`}
        >
          <Clock size={16} /> Attendance Summary
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('leaves')}
          className={`tab-btn ${activeTab === 'leaves' ? 'active' : ''}`}
        >
          <Calendar size={16} /> Leave Applications
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
          onClick={() => setActiveTab('analytics')}
          className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
        >
          <BarChart3 size={16} /> Reports & Analytics
        </button>
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === 'employees' && <EmployeeCRUD />}
        {activeTab === 'attendance' && <AttendanceSummary />}
        {activeTab === 'leaves' && <LeaveApplications />}
        {activeTab === 'announcements' && <AnnouncementsManager />}
        {activeTab === 'analytics' && <ReportsAnalytics />}
      </div>
    </div>
  );
};

export default HrDashboard;
