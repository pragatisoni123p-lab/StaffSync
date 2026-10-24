import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { GraduationCap, Plus, Calendar, UserCheck, Sparkles, Trash2, Edit, CheckCircle, AlertCircle, Users } from 'lucide-react';

const TrainingManagement = () => {
  const [trainings, setTrainings] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [generatingAi, setGeneratingAi] = useState(false);
  const [message, setMessage] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    trainer: '',
    status: 'Scheduled',
    assignedTo: [],
  });

  const fetchData = async () => {
    try {
      const [tRes, eRes] = await Promise.all([
        api.get('/trainings'),
        api.get('/employees'),
      ]);

      if (tRes.data.success) setTrainings(tRes.data.trainings || []);
      if (eRes.data.success) setEmployees(eRes.data.employees || []);
    } catch (err) {
      console.error('Failed to load training management data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAiCurriculum = async () => {
    if (!formData.title.trim()) {
      setMessage({ type: 'error', text: 'Please enter a Training Title / Topic before generating curriculum with AI.' });
      return;
    }

    setGeneratingAi(true);
    setMessage(null);
    try {
      const res = await api.post('/ai/generate-curriculum', {
        topic: formData.title,
        duration: '4 Weeks',
      });

      if (res.data.success) {
        const curriculum = res.data;
        const formattedModules = curriculum.modules
          ? curriculum.modules.map((m) => `• Week ${m.week}: ${m.topic} - ${m.summary}`).join('\n')
          : '';

        const fullDescription = `${curriculum.description}\n\nSyllabus:\n${formattedModules}\n\nLearning Outcomes:\n${(curriculum.learningOutcomes || []).map((o) => `✓ ${o}`).join('\n')}`;

        setFormData((prev) => ({
          ...prev,
          title: curriculum.title || prev.title,
          description: fullDescription,
        }));

        setMessage({ type: 'success', text: `Curriculum generated with ${curriculum.source}!` });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'AI generation failed: ' + (err.response?.data?.message || err.message) });
    } finally {
      setGeneratingAi(false);
    }
  };

  const handleToggleEmployee = (userId) => {
    setFormData((prev) => {
      const exists = prev.assignedTo.includes(userId);
      return {
        ...prev,
        assignedTo: exists
          ? prev.assignedTo.filter((id) => id !== userId)
          : [...prev.assignedTo, userId],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    try {
      const res = await api.post('/trainings', formData);
      if (res.data.success) {
        setMessage({ type: 'success', text: 'Training program created and assigned employees notified!' });
        setModalOpen(false);
        setFormData({
          title: '',
          description: '',
          date: '',
          trainer: '',
          status: 'Scheduled',
          assignedTo: [],
        });
        fetchData();
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || err.message || 'Failed to create training program',
      });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this training program?')) return;
    try {
      await api.delete(`/trainings/${id}`);
      fetchData();
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <GraduationCap size={22} style={{ color: '#a855f7' }} /> Training & Development Programs
          </h3>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '4px 0 0' }}>
            Build curriculums, organize workshops, and assign team members to skill tracks
          </p>
        </div>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="btn btn-primary"
        >
          <Plus size={16} /> Create Training Program
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
        <p style={{ color: '#94a3b8' }}>Loading training programs...</p>
      ) : trainings.length === 0 ? (
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
          No training programs active yet. Click "Create Training Program" above.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
          {trainings.map((t) => (
            <div key={t._id} className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <h4 style={{ fontSize: '1.15rem', color: '#fff', margin: 0 }}>{t.title}</h4>
                  <button
                    type="button"
                    onClick={() => handleDelete(t._id)}
                    style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', padding: '4px' }}
                    title="Delete training program"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <p style={{ color: '#cbd5e1', fontSize: '0.85rem', lineHeight: 1.5, marginBottom: '16px', whiteSpace: 'pre-line' }}>
                  {t.description}
                </p>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#a5b4fc', marginBottom: '8px' }}>
                  <Users size={14} /> Assigned Participants ({t.assignedTo?.length || 0}):
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
                  {t.assignedTo && t.assignedTo.length > 0 ? (
                    t.assignedTo.map((u) => (
                      <span key={u._id} className="badge badge-emp" style={{ fontSize: '0.7rem' }}>
                        {u.name}
                      </span>
                    ))
                  ) : (
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Open enrollment / none assigned</span>
                  )}
                </div>

                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#94a3b8' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <UserCheck size={14} style={{ color: '#818cf8' }} /> Trainer: {t.trainer}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={14} style={{ color: '#06b6d4' }} /> {new Date(t.date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Training Modal */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '640px' }}>
            <h3 style={{ fontSize: '1.35rem', marginBottom: '6px' }}>Create New Training Program</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '20px' }}>
              Assign upskilling sessions to your team with instant Gemini AI curriculum assistance
            </p>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="train-title">
                  Course Topic / Title
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    id="train-title"
                    type="text"
                    className="form-control"
                    placeholder="e.g. Modern Full-Stack MERN Architecture"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    onClick={handleAiCurriculum}
                    disabled={generatingAi}
                    className="btn btn-secondary btn-ai"
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    <Sparkles size={15} />
                    {generatingAi ? 'Generating...' : 'Gemini AI Plan'}
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="train-date">Session Date</label>
                  <input
                    id="train-date"
                    type="date"
                    className="form-control"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="train-trainer">Lead Trainer</label>
                  <input
                    id="train-trainer"
                    type="text"
                    className="form-control"
                    placeholder="e.g. Adnan Sai"
                    value={formData.trainer}
                    onChange={(e) => setFormData({ ...formData, trainer: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="train-desc">Curriculum & Description</label>
                <textarea
                  id="train-desc"
                  rows="4"
                  className="form-control"
                  placeholder="Outline course objectives, prerequisites, and session milestones..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Assign Team Participants ({formData.assignedTo.length} selected)</label>
                <div
                  style={{
                    maxHeight: '130px',
                    overflowY: 'auto',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '8px',
                    background: 'rgba(0,0,0,0.2)',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '6px',
                  }}
                >
                  {employees.map((emp) => {
                    const checked = formData.assignedTo.includes(emp.userId?._id);
                    return (
                      <label
                        key={emp._id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '0.8rem',
                          color: checked ? '#fff' : '#94a3b8',
                          padding: '4px 6px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          background: checked ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => handleToggleEmployee(emp.userId?._id)}
                        />
                        {emp.name} ({emp.department})
                      </label>
                    );
                  })}
                </div>
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
                  Publish Training Program
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainingManagement;
