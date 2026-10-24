import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Megaphone, Calendar, User, ShieldAlert } from 'lucide-react';

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAnnouncements = async () => {
    try {
      const res = await api.get('/announcements');
      if (res.data.success) {
        setAnnouncements(res.data.announcements || []);
      }
    } catch (err) {
      console.error('Failed to load announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'Urgent':
        return <span className="badge badge-rejected"><ShieldAlert size={12} /> Urgent</span>;
      case 'High':
        return <span className="badge badge-pending">High Priority</span>;
      default:
        return <span className="badge badge-mgr">Standard</span>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <Megaphone size={20} style={{ color: '#f59e0b' }} />
        <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Company Announcements & Bulletins</h3>
      </div>

      {loading ? (
        <p style={{ color: '#94a3b8' }}>Loading announcements...</p>
      ) : announcements.length === 0 ? (
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
          No announcements published yet.
        </div>
      ) : (
        announcements.map((item) => (
          <div key={item._id} className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
              <div>
                <h4 style={{ fontSize: '1.15rem', color: '#fff', marginBottom: '6px' }}>{item.title}</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.8rem', color: '#94a3b8' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <User size={13} /> {item.createdBy?.name || 'HR Admin'} ({item.createdBy?.role || 'HR'})
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={13} /> {new Date(item.createdAt).toLocaleDateString()} at {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
              <div>{getPriorityBadge(item.priority)}</div>
            </div>

            <div style={{ color: '#cbd5e1', fontSize: '0.925rem', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
              {item.message}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Announcements;
