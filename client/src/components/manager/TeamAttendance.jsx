import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Clock, Calendar, Users, CheckCircle, AlertCircle } from 'lucide-react';

const TeamAttendance = () => {
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState({ total: 0, present: 0 });
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
  const [loading, setLoading] = useState(true);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/attendance/team?date=${selectedDate}`);
      if (res.data.success) {
        setRecords(res.data.records || []);
        setStats({
          total: res.data.totalDepartmentMembers || 0,
          present: res.data.presentCount || 0,
        });
      }
    } catch (err) {
      console.error('Failed to load team attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [selectedDate]);

  return (
    <div>
      {/* Top Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="glass-panel kpi-card">
          <div className="kpi-icon" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#22d3ee' }}>
            <Users size={22} />
          </div>
          <div>
            <div className="kpi-value">{stats.total}</div>
            <div className="kpi-label">Department Members</div>
          </div>
        </div>

        <div className="glass-panel kpi-card">
          <div className="kpi-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
            <CheckCircle size={22} />
          </div>
          <div>
            <div className="kpi-value">{stats.present}</div>
            <div className="kpi-label">Present On Date</div>
          </div>
        </div>

        <div className="glass-panel kpi-card">
          <div className="kpi-icon" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
            <Clock size={22} />
          </div>
          <div>
            <div className="kpi-value">
              {stats.total > 0 ? `${Math.round((stats.present / stats.total) * 100)}%` : '0%'}
            </div>
            <div className="kpi-label">Attendance Rate</div>
          </div>
        </div>
      </div>

      {/* Filter and Table */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={20} style={{ color: '#06b6d4' }} /> Department Attendance Log
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '4px 0 0' }}>
              Real-time daily presence tracking for your direct department reports
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={16} style={{ color: '#94a3b8' }} />
            <input
              type="date"
              className="form-control"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{ width: 'auto', padding: '6px 12px', fontSize: '0.875rem' }}
            />
          </div>
        </div>

        {loading ? (
          <p style={{ color: '#94a3b8' }}>Loading records...</p>
        ) : records.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px 0', color: '#64748b' }}>
            No attendance records logged for {selectedDate}.
          </div>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Check-In</th>
                  <th>Check-Out</th>
                  <th>Work Hours</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r._id}>
                    <td>
                      <div style={{ fontWeight: 600, color: '#fff' }}>{r.employeeId?.name || 'Staff Member'}</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{r.employeeId?.email}</div>
                    </td>
                    <td>{r.checkIn ? new Date(r.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                    <td>{r.checkOut ? new Date(r.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Still on shift'}</td>
                    <td>{r.workHours ? `${r.workHours} hrs` : 'In progress'}</td>
                    <td>
                      <span className={`badge ${r.status === 'Present' ? 'badge-approved' : r.status === 'Half Day' ? 'badge-pending' : 'badge-rejected'}`}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamAttendance;
