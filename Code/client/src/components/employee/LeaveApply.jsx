import React, { useState } from 'react';
import api from '../../services/api';
import { Calendar, Sparkles, Send, AlertCircle, CheckCircle, BrainCircuit } from 'lucide-react';

const LeaveApply = ({ onLeaveSubmitted }) => {
  const [formData, setFormData] = useState({
    leaveType: 'Casual',
    startDate: '',
    endDate: '',
    reason: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [message, setMessage] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setAiResult(null); // Reset AI assessment if details change
  };

  const handleAiAnalyze = async () => {
    if (!formData.startDate || !formData.endDate || !formData.reason.trim()) {
      setMessage({ type: 'error', text: 'Please fill in Start Date, End Date, and Reason before running AI analysis.' });
      return;
    }

    setAnalyzing(true);
    setMessage(null);
    try {
      const res = await api.post('/ai/analyze-leave', formData);
      if (res.data.success) {
        setAiResult(res.data);
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'AI analysis failed: ' + (err.response?.data?.message || err.message) });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const res = await api.post('/leaves/apply', formData);
      if (res.data.success) {
        setMessage({ type: 'success', text: 'Leave application submitted successfully! Your manager has been notified.' });
        setFormData({
          leaveType: 'Casual',
          startDate: '',
          endDate: '',
          reason: '',
        });
        setAiResult(null);
        if (onLeaveSubmitted) onLeaveSubmitted();
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || err.message || 'Failed to submit leave application',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '28px', maxWidth: '680px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8' }}>
          <Calendar size={20} />
        </div>
        <div>
          <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Apply for Leave</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>
            Submit your time-off request with automated Manager & HR notifications
          </p>
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

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="leave-type">Leave Category</label>
          <select
            id="leave-type"
            name="leaveType"
            className="form-select"
            value={formData.leaveType}
            onChange={handleChange}
          >
            <option value="Casual">Casual Leave</option>
            <option value="Sick">Sick / Medical Leave</option>
            <option value="Annual">Annual Paid Vacation</option>
            <option value="Maternity">Maternity Leave</option>
            <option value="Paternity">Paternity Leave</option>
            <option value="Emergency">Emergency Leave</option>
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="start-date">Start Date</label>
            <input
              id="start-date"
              name="startDate"
              type="date"
              className="form-control"
              value={formData.startDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="end-date">End Date</label>
            <input
              id="end-date"
              name="endDate"
              type="date"
              className="form-control"
              value={formData.endDate}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="leave-reason">Reason for Absence</label>
          <textarea
            id="leave-reason"
            name="reason"
            rows="3"
            className="form-control"
            placeholder="Briefly state reason for your leave request..."
            value={formData.reason}
            onChange={handleChange}
            required
          />
        </div>

        {/* AI Pre-Assessment Box */}
        {aiResult && (
          <div
            style={{
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(99, 102, 241, 0.08)',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              marginBottom: '20px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600, color: '#a5b4fc' }}>
                <BrainCircuit size={16} /> AI Impact Evaluation
              </span>
              <span
                className="badge"
                style={{
                  background: aiResult.riskLevel === 'Low' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                  color: aiResult.riskLevel === 'Low' ? '#34d399' : '#fbbf24',
                }}
              >
                {aiResult.riskLevel} Risk ({aiResult.impactScore}/100)
              </span>
            </div>
            <p style={{ fontSize: '0.825rem', color: '#cbd5e1', lineHeight: 1.4, margin: '6px 0' }}>
              {aiResult.analysis}
            </p>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic', marginTop: '4px' }}>
              Recommendation: {aiResult.recommendation}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
          <button
            type="button"
            onClick={handleAiAnalyze}
            disabled={analyzing}
            className="btn btn-secondary btn-ai"
            style={{ flex: 1 }}
          >
            <Sparkles size={16} />
            {analyzing ? 'Evaluating...' : 'AI Impact Check'}
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary"
            style={{ flex: 2 }}
          >
            <Send size={16} />
            {submitting ? 'Submitting Application...' : 'Submit Application'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LeaveApply;
