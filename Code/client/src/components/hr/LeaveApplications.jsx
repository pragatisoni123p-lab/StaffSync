import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Calendar, CheckCircle2, XCircle, Clock, CheckCircle, AlertCircle, ShieldAlert } from 'lucide-react';

const LeaveApplications = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [reviewModal, setReviewModal] = useState({ isOpen: false, leave: null, status: 'Approved', comment: '' });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const fetchLeaves = async () => {
    try {
      const res = await api.get(`/leaves/all?status=${statusFilter}&leaveType=${typeFilter}`);
      if (res.data.success) {
        setLeaves(res.data.leaves || []);
      }
    } catch (err) {
      console.error('Failed to load org leaves:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, [statusFilter, typeFilter]);

  const openReview = (leave, actionStatus) => {
    setReviewModal({
      isOpen: true,
      leave,
      status: actionStatus,
      comment: '',
    });
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const res = await api.put(`/leaves/${reviewModal.leave._id}/review`, {
        status: reviewModal.status,
        comment: reviewModal.comment || `HR Decision by Administrator`,
      });

      if (res.data.success) {
        setMessage({
          type: 'success',
          text: `Leave status updated to ${reviewModal.status}!`,
        });
        setReviewModal({ isOpen: false, leave: null, status: 'Approved', comment: '' });
        fetchLeaves();
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || err.message || 'Failed to update leave',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return <span className="badge badge-approved"><CheckCircle2 size={12} /> Approved</span>;
      case 'Rejected':
        return <span className="badge badge-rejected"><XCircle size={12} /> Rejected</span>;
      default:
        return <span className="badge badge-pending"><Clock size={12} /> Pending</span>;
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={20} style={{ color: '#c084fc' }} /> Global Leave Management & HR Override
          </h3>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '4px 0 0' }}>
            Two-tier oversight: View, approve, or override leave applications from any department
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: 'auto', padding: '6px 12px', fontSize: '0.875rem' }}
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>

          <select
            className="form-select"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{ width: 'auto', padding: '6px 12px', fontSize: '0.875rem' }}
          >
            <option value="All">All Categories</option>
            <option value="Casual">Casual</option>
            <option value="Sick">Sick</option>
            <option value="Annual">Annual</option>
            <option value="Emergency">Emergency</option>
          </select>
        </div>
      </div>

      {message && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '20px',
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

      {loading ? (
        <p style={{ color: '#94a3b8' }}>Loading requests...</p>
      ) : leaves.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
          No leave requests found matching filters.
        </div>
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Department</th>
                <th>Category</th>
                <th>Date Span</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Approver</th>
                <th>HR Actions</th>
              </tr>
            </thead>
            <tbody>
              {leaves.map((l) => {
                const s = new Date(l.startDate);
                const e = new Date(l.endDate);
                const diffDays = Math.ceil((e - s) / (1000 * 60 * 60 * 24)) + 1;

                return (
                  <tr key={l._id}>
                    <td>
                      <div style={{ fontWeight: 600, color: '#fff' }}>{l.employeeId?.name || 'Staff Member'}</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{l.employeeId?.email}</div>
                    </td>
                    <td>{l.employeeId?.department || '—'}</td>
                    <td>{l.leaveType}</td>
                    <td>
                      <div>{s.toLocaleDateString()} &rarr; {e.toLocaleDateString()}</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>({diffDays} day{diffDays > 1 ? 's' : ''})</div>
                    </td>
                    <td style={{ maxWidth: '200px', color: '#cbd5e1' }}>
                      <div>{l.reason}</div>
                      {l.comment && (
                        <div style={{ fontSize: '0.75rem', color: '#a5b4fc', marginTop: '4px' }}>
                          Note: {l.comment}
                        </div>
                      )}
                    </td>
                    <td>{getStatusBadge(l.status)}</td>
                    <td style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                      {l.reviewedBy ? `${l.reviewedBy.name} (${l.approverRole || 'Manager'})` : 'Pending'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {l.status !== 'Approved' && (
                          <button
                            type="button"
                            onClick={() => openReview(l, 'Approved')}
                            className="btn btn-sm btn-success"
                            title="Approve / Override leave"
                          >
                            Approve
                          </button>
                        )}
                        {l.status !== 'Rejected' && (
                          <button
                            type="button"
                            onClick={() => openReview(l, 'Rejected')}
                            className="btn btn-sm btn-danger"
                            title="Reject / Override leave"
                          >
                            Reject
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Review Modal */}
      {reviewModal.isOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ fontSize: '1.3rem', marginBottom: '8px' }}>
              HR Decision / Override: {reviewModal.status}
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '20px' }}>
              Employee: <strong style={{ color: '#fff' }}>{reviewModal.leave.employeeId?.name}</strong> ({reviewModal.leave.leaveType} Leave)
            </p>

            <form onSubmit={handleReviewSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="hr-rev-comment">HR Note / Reason</label>
                <textarea
                  id="hr-rev-comment"
                  rows="3"
                  className="form-control"
                  placeholder="Enter HR approval confirmation or administrative override rationale..."
                  value={reviewModal.comment}
                  onChange={(e) => setReviewModal({ ...reviewModal, comment: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button
                  type="button"
                  onClick={() => setReviewModal({ isOpen: false, leave: null, status: 'Approved', comment: '' })}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`btn ${reviewModal.status === 'Approved' ? 'btn-success' : 'btn-danger'}`}
                >
                  {submitting ? 'Applying...' : `Execute ${reviewModal.status}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveApplications;
