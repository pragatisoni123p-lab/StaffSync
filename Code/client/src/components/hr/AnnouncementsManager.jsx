import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Megaphone, Plus, Trash2, Calendar, Sparkles, CheckCircle, AlertCircle, ShieldAlert } from 'lucide-react';

const AnnouncementsManager = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [draftingAi, setDraftingAi] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [aiTone, setAiTone] = useState('Professional & Clear');
  const [message, setMessage] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    message: '',
    targetAudience: 'All',
    priority: 'Normal',
  });

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

  const handleAiDraft = async () => {
    if (!aiTopic.trim()) {
      setMessage({ type: 'error', text: 'Please enter a Topic / Key Points for Gemini AI to draft.' });
      return;
    }

    setDraftingAi(true);
    setMessage(null);
    try {
      const res = await api.post('/ai/draft-announcement', {
        topic: aiTopic,
        tone: aiTone,
        audience: formData.targetAudience,
      });

      if (res.data.success) {
        setFormData((prev) => ({
          ...prev,
          title: res.data.title || prev.title,
          message: res.data.message || prev.message,
        }));
        setMessage({ type: 'success', text: `Draft generated with ${res.data.source}!` });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'AI generation failed: ' + (err.response?.data?.message || err.message) });
    } finally {
      setDraftingAi(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    try {
      const res = await api.post('/announcements', formData);
      if (res.data.success) {
        setMessage({ type: 'success', text: 'Announcement published successfully! Alerts broadcasted.' });
        setModalOpen(false);
        setFormData({
          title: '',
          message: '',
          targetAudience: 'All',
          priority: 'Normal',
        });
        setAiTopic('');
        fetchAnnouncements();
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || err.message || 'Failed to publish' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this announcement?')) return;
    try {
      await api.delete(`/announcements/${id}`);
      setMessage({ type: 'success', text: 'Announcement removed.' });
      fetchAnnouncements();
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'Urgent':
        return <span className="badge badge-rejected"><ShieldAlert size={12} /> Urgent</span>;
      case 'High':
        return <span className="badge badge-pending">High Priority</span>;
      default:
        return <span className="badge badge-mgr">Normal</span>;
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Megaphone size={22} style={{ color: '#f59e0b' }} /> Company Communications & Announcements
          </h3>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '4px 0 0' }}>
            Broadcast news, policy shifts, and updates across all or selected workforce tiers
          </p>
        </div>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="btn btn-primary"
        >
          <Plus size={16} /> Broadcast Announcement
        </button>
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
        <p style={{ color: '#94a3b8' }}>Loading announcements...</p>
      ) : announcements.length === 0 ? (
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
          No announcements published yet.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {announcements.map((item) => (
            <div key={item._id} className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
                <div>
                  <h4 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '6px' }}>{item.title}</h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.8rem', color: '#94a3b8' }}>
                    <span>Target Audience: <strong style={{ color: '#a5b4fc' }}>{item.targetAudience}</strong></span>
                    <span>Posted By: <strong style={{ color: '#fff' }}>{item.createdBy?.name || 'HR Admin'}</strong></span>
                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {getPriorityBadge(item.priority)}
                  <button
                    type="button"
                    onClick={() => handleDelete(item._id)}
                    style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', padding: '4px' }}
                    title="Delete announcement"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <p style={{ color: '#cbd5e1', fontSize: '0.925rem', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                {item.message}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Broadcast Modal */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '640px' }}>
            <h3 style={{ fontSize: '1.35rem', marginBottom: '6px' }}>Broadcast New Announcement</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '20px' }}>
              Reach your team with AI drafting assistance
            </p>

            {/* AI Assistant Section */}
            <div
              style={{
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(99, 102, 241, 0.08)',
                border: '1px solid rgba(99, 102, 241, 0.25)',
                marginBottom: '20px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600, color: '#a5b4fc', marginBottom: '10px' }}>
                <Sparkles size={16} /> Gemini AI Announcement Drafter
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '8px' }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Topic / key bullets (e.g. Annual holiday schedule and remote work guidelines)"
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  style={{ flex: 1, minWidth: '220px' }}
                />
                <button
                  type="button"
                  onClick={handleAiDraft}
                  disabled={draftingAi}
                  className="btn btn-secondary btn-ai"
                  style={{ whiteSpace: 'nowrap' }}
                >
                  <Sparkles size={15} />
                  {draftingAi ? 'Drafting...' : 'Generate with Gemini'}
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="ann-title">Announcement Headline</label>
                <input
                  id="ann-title"
                  type="text"
                  className="form-control"
                  placeholder="e.g. Office Relocation & Remote Work Policy Update"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="ann-aud">Target Audience</label>
                  <select
                    id="ann-aud"
                    className="form-select"
                    value={formData.targetAudience}
                    onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                  >
                    <option value="All">All Employees & Managers</option>
                    <option value="Employee">Employees Only</option>
                    <option value="Manager">Managers Only</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="ann-priority">Priority Level</label>
                  <select
                    id="ann-priority"
                    className="form-select"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  >
                    <option value="Normal">Normal</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="ann-msg">Announcement Message Content</label>
                <textarea
                  id="ann-msg"
                  rows="5"
                  className="form-control"
                  placeholder="Enter message body or let Gemini AI draft it above..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Publish & Broadcast News
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnnouncementsManager;
