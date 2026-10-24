import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { BarChart3, PieChart, TrendingUp, Users, Calendar, Award, CheckCircle } from 'lucide-react';

const ReportsAnalytics = () => {
  const [stats, setStats] = useState({
    employees: [],
    attendanceSummary: null,
    leaves: [],
    trainings: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [empRes, attRes, lveRes, trnRes] = await Promise.all([
          api.get('/employees'),
          api.get('/attendance/summary'),
          api.get('/leaves/all'),
          api.get('/trainings'),
        ]);

        setStats({
          employees: empRes.data.employees || [],
          attendanceSummary: attRes.data || null,
          leaves: lveRes.data.leaves || [],
          trainings: trnRes.data.trainings || [],
        });
      } catch (err) {
        console.error('Failed to load reports analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  if (loading) {
    return <p style={{ color: '#94a3b8' }}>Compiling organizational analytics...</p>;
  }

  // Calculate department breakdown
  const deptCounts = stats.employees.reduce((acc, emp) => {
    const dept = emp.department || 'Unassigned';
    acc[dept] = (acc[dept] || 0) + 1;
    return acc;
  }, {});

  // Calculate leave status breakdown
  const leaveStats = stats.leaves.reduce(
    (acc, l) => {
      acc[l.status] = (acc[l.status] || 0) + 1;
      return acc;
    },
    { Pending: 0, Approved: 0, Rejected: 0 }
  );

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1.25rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BarChart3 size={22} style={{ color: '#06b6d4' }} /> Organization Reports & Talent Analytics
        </h3>
        <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '4px 0 0' }}>
          Headcount distribution, attendance rates, leave trends, and development participation
        </p>
      </div>

      {/* Analytics Overview Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '28px' }}>
        {/* Department Headcount */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h4 style={{ fontSize: '1.05rem', color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={18} style={{ color: '#6366f1' }} /> Headcount by Department
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {Object.entries(deptCounts).map(([dept, count]) => {
              const total = stats.employees.length || 1;
              const pct = Math.round((count / total) * 100);
              return (
                <div key={dept}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                    <span style={{ color: '#cbd5e1' }}>{dept}</span>
                    <span style={{ fontWeight: 600, color: '#fff' }}>{count} ({pct}%)</span>
                  </div>
                  <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, #6366f1, #06b6d4)' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Leave Status Metrics */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h4 style={{ fontSize: '1.05rem', color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={18} style={{ color: '#38bdf8' }} /> Leave Request Distribution
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', textAlign: 'center', marginBottom: '20px' }}>
            <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.25)', padding: '14px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#fbbf24' }}>{leaveStats.Pending}</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>Pending</div>
            </div>
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)', padding: '14px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#34d399' }}>{leaveStats.Approved}</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>Approved</div>
            </div>
            <div style={{ background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.25)', padding: '14px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#fb7185' }}>{leaveStats.Rejected}</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>Rejected</div>
            </div>
          </div>
          <div style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.5 }}>
            Total Leave Requests Handled: <strong style={{ color: '#fff' }}>{stats.leaves.length}</strong>
          </div>
        </div>

        {/* Training & Upskilling Growth */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h4 style={{ fontSize: '1.05rem', color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award size={18} style={{ color: '#a855f7' }} /> L&D Program Engagement
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Active Training Programs</span>
              <span style={{ fontWeight: 600, color: '#fff' }}>{stats.trainings.length}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Total Employee Enrollments</span>
              <span style={{ fontWeight: 600, color: '#fff' }}>
                {stats.trainings.reduce((sum, t) => sum + (t.assignedTo?.length || 0), 0)}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Today Attendance Rate</span>
              <span style={{ fontWeight: 600, color: '#10b981' }}>
                {stats.attendanceSummary?.attendanceRate || 0}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsAnalytics;
