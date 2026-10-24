import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { GraduationCap, Calendar, UserCheck, CheckCircle2, Clock } from 'lucide-react';

const AssignedTrainings = () => {
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTrainings = async () => {
    try {
      const res = await api.get('/trainings/my');
      if (res.data.success) {
        setTrainings(res.data.trainings || []);
      }
    } catch (err) {
      console.error('Failed to load my trainings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainings();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Completed':
        return <span className="badge badge-approved"><CheckCircle2 size={12} /> Completed</span>;
      case 'Ongoing':
        return <span className="badge badge-mgr">In Progress</span>;
      default:
        return <span className="badge badge-pending"><Clock size={12} /> Scheduled</span>;
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
        <GraduationCap size={22} style={{ color: '#a855f7' }} />
        <h3 style={{ fontSize: '1.25rem', margin: 0 }}>My Enrolled Training & Development Programs</h3>
      </div>

      {loading ? (
        <p style={{ color: '#94a3b8' }}>Loading assigned training programs...</p>
      ) : trainings.length === 0 ? (
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
          You have no active training assignments currently. Check back later!
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {trainings.map((t) => (
            <div key={t._id} className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <h4 style={{ fontSize: '1.15rem', color: '#fff', margin: 0 }}>{t.title}</h4>
                  <div>{getStatusBadge(t.status)}</div>
                </div>

                <p style={{ color: '#cbd5e1', fontSize: '0.875rem', lineHeight: 1.5, marginBottom: '16px' }}>
                  {t.description}
                </p>
              </div>

              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#94a3b8' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <UserCheck size={14} style={{ color: '#818cf8' }} /> Trainer: {t.trainer || 'StaffSync L&D'}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar size={14} style={{ color: '#06b6d4' }} /> {new Date(t.date).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AssignedTrainings;
