import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Calendar, CheckCircle2, XCircle, Clock, MessageSquare } from 'lucide-react';

const LeaveList = ({ refreshTrigger }) => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  const fetchLeaves = async () => {
    try {
      const res = await api.get('/leaves/me');
      if (res.data.success) {
        setLeaves(res.data.leaves || []);
      }
    } catch (err) {
      console.error('Failed to load leaves:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, [refreshTrigger]);

  const filteredLeaves = leaves.filter((leave) => {
    if (filter === 'All') return true;
    return leave.status === filter;
  });

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <h3 style={{ fontSize: '1.25rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar size={20} style={{ color: '#06b6d4' }} /> My Leave Applications
        </h3>

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

      {loading ? (
        <p style={{ color: '#94a3b8' }}>Loading leave history...</p>
      ) : filteredLeaves.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
          No {filter !== 'All' ? filter.toLowerCase() : ''} leave applications found.
        </div>
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Dates</th>
                <th>Duration</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Reviewer Notes</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeaves.map((l) => {
                const s = new Date(l.startDate);
                const e = new Date(l.endDate);
                const diffDays = Math.ceil((e - s) / (1000 * 60 * 60 * 24)) + 1;

                return (
                  <tr key={l._id}>
                    <td style={{ fontWeight: 600 }}>{l.leaveType}</td>
                    <td>
                      {s.toLocaleDateString()} &rarr; {e.toLocaleDateString()}
                    </td>
                    <td>{diffDays} day{diffDays > 1 ? 's' : ''}</td>
                    <td style={{ maxWidth: '240px', color: '#cbd5e1' }}>{l.reason}</td>
                    <td>{getStatusBadge(l.status)}</td>
                    <td style={{ fontSize: '0.825rem', color: '#94a3b8' }}>
                      {l.comment ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#cbd5e1' }}>
                          <MessageSquare size={13} /> {l.comment}
                        </div>
                      ) : (
                        l.reviewedBy ? `Reviewed by ${l.reviewedBy.name}` : 'Awaiting review'
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
  );
};

export default LeaveList;
