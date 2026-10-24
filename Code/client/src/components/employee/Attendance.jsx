import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Clock, CheckCircle, LogOut, Calendar, Award, AlertCircle } from 'lucide-react';

const Attendance = () => {
  const [data, setData] = useState({ today: null, history: [] });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  // Live digital clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchAttendance = async () => {
    try {
      const res = await api.get('/attendance/me');
      if (res.data.success) {
        setData({
          today: res.data.today,
          history: res.data.history || [],
        });
      }
    } catch (err) {
      console.error('Failed to load attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const handleMark = async () => {
    setSubmitting(true);
    setMessage(null);
    try {
      const res = await api.post('/attendance/mark');
      if (res.data.success) {
        setMessage({ type: 'success', text: res.data.message });
        fetchAttendance();
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || err.message || 'Failed to record attendance',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const today = data.today;
  const isCheckedIn = !!today;
  const isCheckedOut = !!today?.checkOut;

  const getStatusBadge = (status) => {
    if (status === 'Present') return <span className="badge badge-approved">Present</span>;
    if (status === 'Half Day') return <span className="badge badge-pending">Half Day</span>;
    return <span className="badge badge-rejected">Absent</span>;
  };

  return (
    <div>
      {/* Attendance Action Header */}
      <div
        className="glass-panel"
        style={{
          padding: '28px',
          marginBottom: '28px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '24px',
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.9))',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '0.85rem' }}>
            <Calendar size={16} />
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
          <div style={{ fontSize: '2.4rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: '#fff', letterSpacing: '-0.03em', margin: '6px 0' }}>
            {currentTime}
          </div>
          <div style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>
            {isCheckedOut ? (
              <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle size={16} /> Completed day! Logged: {today.workHours} hours.
              </span>
            ) : isCheckedIn ? (
              <span style={{ color: '#06b6d4', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={16} /> Checked in at {new Date(today.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. Click Check-Out when finishing work.
              </span>
            ) : (
              <span style={{ color: '#fbbf24' }}>
                You have not checked in yet for today. Click below to begin your workday.
              </span>
            )}
          </div>
        </div>

        <div>
          {!isCheckedIn ? (
            <button
              type="button"
              onClick={handleMark}
              disabled={submitting}
              className="btn btn-primary btn-lg"
              style={{ background: 'linear-gradient(135deg, #10b981, #059669)', padding: '14px 28px' }}
            >
              <CheckCircle size={20} />
              {submitting ? 'Recording Check-In...' : 'Mark Check-In'}
            </button>
          ) : !isCheckedOut ? (
            <button
              type="button"
              onClick={handleMark}
              disabled={submitting}
              className="btn btn-danger btn-lg"
              style={{ padding: '14px 28px' }}
            >
              <LogOut size={20} />
              {submitting ? 'Recording Check-Out...' : 'Mark Check-Out'}
            </button>
          ) : (
            <div style={{ padding: '10px 18px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 'var(--radius-md)', color: '#34d399', fontWeight: 600 }}>
              ✓ Shift Complete for Today
            </div>
          )}
        </div>
      </div>

      {message && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: message.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            border: `1px solid ${message.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
            color: message.type === 'success' ? '#6ee7b7' : '#fca5a5',
          }}
        >
          {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          {message.text}
        </div>
      )}

      {/* Attendance History */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={20} style={{ color: '#6366f1' }} /> Attendance Log & History
        </h3>

        {loading ? (
          <p style={{ color: '#94a3b8' }}>Loading records...</p>
        ) : data.history.length === 0 ? (
          <p style={{ color: '#64748b', textAlign: 'center', padding: '32px 0' }}>
            No attendance history recorded yet.
          </p>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Check-In Time</th>
                  <th>Check-Out Time</th>
                  <th>Total Duration</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.history.map((record) => (
                  <tr key={record._id}>
                    <td style={{ fontWeight: 600 }}>{record.date}</td>
                    <td>{record.checkIn ? new Date(record.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                    <td>{record.checkOut ? new Date(record.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Pending Check-out'}</td>
                    <td>{record.workHours ? `${record.workHours} hrs` : record.checkIn && !record.checkOut ? 'In progress' : '0 hrs'}</td>
                    <td>{getStatusBadge(record.status)}</td>
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

export default Attendance;
