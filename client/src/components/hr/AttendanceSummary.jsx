import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Clock, Calendar, Users, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

const AttendanceSummary = () => {
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
  const [deptFilter, setDeptFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  const fetchSummaryAndRecords = async () => {
    setLoading(true);
    try {
      const [sumRes, recRes] = await Promise.all([
        api.get('/attendance/summary'),
        api.get(`/attendance/all?date=${selectedDate}&department=${deptFilter}&status=${statusFilter}`),
      ]);

      if (sumRes.data.success) setSummary(sumRes.data);
      if (recRes.data.success) setRecords(recRes.data.records || []);
    } catch (err) {
      console.error('Failed to load attendance summary:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummaryAndRecords();
  }, [selectedDate, deptFilter, statusFilter]);

  return (
    <div>
      {/* Top Organization KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="glass-panel kpi-card">
          <div className="kpi-icon" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
            <Users size={22} />
          </div>
          <div>
            <div className="kpi-value">{summary?.totalEmployees || 0}</div>
            <div className="kpi-label">Active Employees</div>
          </div>
        </div>

        <div className="glass-panel kpi-card">
          <div className="kpi-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
            <CheckCircle size={22} />
          </div>
          <div>
            <div className="kpi-value">{summary?.todayPresent || 0}</div>
            <div className="kpi-label">Present Today</div>
          </div>
        </div>

        <div className="glass-panel kpi-card">
          <div className="kpi-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
            <AlertTriangle size={22} />
          </div>
          <div>
            <div className="kpi-value">{summary?.todayHalfDay || 0}</div>
            <div className="kpi-label">Half Day Logs</div>
          </div>
        </div>

        <div className="glass-panel kpi-card">
          <div className="kpi-icon" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171' }}>
            <XCircle size={22} />
          </div>
          <div>
            <div className="kpi-value">{summary?.todayAbsent || 0}</div>
            <div className="kpi-label">Not Checked In</div>
          </div>
        </div>

        <div className="glass-panel kpi-card">
          <div className="kpi-icon" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#22d3ee' }}>
            <Clock size={22} />
          </div>
          <div>
            <div className="kpi-value">{summary?.attendanceRate || 0}%</div>
            <div className="kpi-label">Attendance Rate</div>
          </div>
        </div>
      </div>

      {/* Filter and Table */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={20} style={{ color: '#818cf8' }} /> Organization Attendance Log
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '4px 0 0' }}>
              Inspect punch-in records, shift completion, and daily presence across departments
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={16} style={{ color: '#94a3b8' }} />
              <input
                type="date"
                className="form-control"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                style={{ width: 'auto', padding: '6px 12px', fontSize: '0.875rem' }}
              />
            </div>

            <select
              className="form-select"
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              style={{ width: 'auto', padding: '6px 12px', fontSize: '0.875rem' }}
            >
              <option value="All">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Human Resources">Human Resources</option>
              <option value="Marketing">Marketing</option>
              <option value="Finance">Finance</option>
              <option value="Sales">Sales</option>
            </select>

            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ width: 'auto', padding: '6px 12px', fontSize: '0.875rem' }}
            >
              <option value="All">All Statuses</option>
              <option value="Present">Present</option>
              <option value="Half Day">Half Day</option>
              <option value="Absent">Absent</option>
            </select>
          </div>
        </div>

        {loading ? (
          <p style={{ color: '#94a3b8' }}>Loading records...</p>
        ) : records.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
            No attendance records logged for {selectedDate} with selected filters.
          </div>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Date</th>
                  <th>Check-In</th>
                  <th>Check-Out</th>
                  <th>Hours</th>
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
                    <td>{r.employeeId?.department || '—'}</td>
                    <td>{r.date}</td>
                    <td>{r.checkIn ? new Date(r.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                    <td>{r.checkOut ? new Date(r.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'On Shift'}</td>
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

export default AttendanceSummary;
