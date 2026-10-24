import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Calendar, CheckCircle2, XCircle, Clock, MessageSquare, AlertCircle, Sparkles, BrainCircuit } from 'lucide-react';

const LeaveApplications = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [reviewModal, setReviewModal] = useState({ isOpen: false, leave: null, status: 'Approved', comment: '' });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const fetchTeamLeaves = async () => {
    try {
      const res = await api.get('/leaves/team');
      if (res.data.success) {
        setLeaves(res.data.leaves || []);
      }
    } catch (err) {
      console.error('Failed to load team leaves:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamLeaves();
  }, []);

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
        comment: reviewModal.comment,
      });

      if (res.data.success) {
        setMessage({
          type: 'success',
          text: `Leave application successfully ${reviewModal.status.toLowerCase()}! Employee has been notified.`,
        });
        setReviewModal({ isOpen: false, leave: null, status: 'Approved', comment: '' });
        fetchTeamLeaves();
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

  const filteredLeaves = leaves.filter((l) => (filter === 'All' ? true : l.status === filter));

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
    <div>
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={20} style={{ color: '#06b6d4' }} /> Department Team Leave Requests
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '4px 0 0' }}>
              Review, approve, or reject absence requests submitted by your team members
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            {['All', 'Pending', 'Approved', 'Rejected'].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setFilter(status)}
                className={`btn btn-sm ${filter === status ? 'btn-primary' : 'btn-secondary'}`}
              >
                {status}
              </button>
            ))}
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
            {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            {message.text}
          </div>
        )}

        {loading ? (
          <p style={{ color: '#94a3b8' }}>Loading team requests...</p>
        ) : filteredLeaves.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
            No {filter !== 'All' ? filter.toLowerCase() : ''} leave requests found.
          </div>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Type</th>
                  <th>Dates</th>
                  <th>Duration</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeaves.map((l) => {
                  const s = new Date(l.startDate);
                  const e = new Date(l.endDate);
                  const diffDays = Math.ceil((e - s) / (1000 * 60 * 60 * 24)) + 1;

                  return (
                    <tr key={l._id}>
                      <td>
                        <div style={{ fontWeight: 600, color: '#fff' }}>{l.employeeId?.name || 'Staff Member'}</div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{l.employeeId?.email}</div>
                      </td>
                      <td>{l.leaveType}</td>
                      <td>
                        {s.toLocaleDateString()} &rarr; {e.toLocaleDateString()}
                      </td>
                      <td>{diffDays} day{diffDays > 1 ? 's' : ''}</td>
                      <td style={{ maxWidth: '240px', color: '#cbd5e1' }}>
                        <div>{l.reason}</div>
                        {l.comment && (
                          <div style={{ fontSize: '0.75rem', color: '#a5b4fc', marginTop: '4px' }}>
                            Note: {l.comment}
                          </div>
                        )}
                      </td>
                      <td>{getStatusBadge(l.status)}</td>
                      <td>
                        {l.status === 'Pending' ? (
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              type="button"
                              onClick={() => openReview(l, 'Approved')}
                              className="btn btn-sm btn-success"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => openReview(l, 'Rejected')}
                              className="btn btn-sm btn-danger"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                            Decided by {l.reviewedBy?.name || 'Manager'}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {reviewModal.isOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ fontSize: '1.3rem', marginBottom: '8px' }}>
              {reviewModal.status === 'Approved' ? 'Approve Leave Request' : 'Reject Leave Request'}
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '20px' }}>
              Employee: <strong style={{ color: '#fff' }}>{reviewModal.leave.employeeId?.name}</strong> ({reviewModal.leave.leaveType} Leave)
            </p>

            <form onSubmit={handleReviewSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="rev-comment">
                  Manager Feedback / Comment (Optional)
                </label>
                <textarea
                  id="rev-comment"
                  rows="3"
                  className="form-control"
                  placeholder={reviewModal.status === 'Approved' ? 'e.g. Approved. Please ensure tasks are handed off.' : 'e.g. Due to upcoming production deployment, please reschedule.'}
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
                  {submitting ? 'Confirming...' : `Confirm ${reviewModal.status}`}
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
