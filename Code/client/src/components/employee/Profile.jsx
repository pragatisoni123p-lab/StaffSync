import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Building, Briefcase, Phone, MapPin, Calendar, DollarSign, CheckCircle, AlertCircle } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/employees/profile/me');
      if (res.data.success) {
        setProfile(res.data.employee);
        setPhone(res.data.employee.phone || '');
        setAddress(res.data.employee.address || '');
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await api.put(`/employees/${profile._id}`, { phone, address });
      if (res.data.success) {
        setMessage({ type: 'success', text: 'Contact details updated successfully!' });
        setProfile(res.data.employee);
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || err.message || 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p style={{ color: '#94a3b8' }}>Loading profile...</p>;
  }

  return (
    <div style={{ maxWidth: '780px', margin: '0 auto' }}>
      <div className="glass-panel" style={{ padding: '32px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '28px' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.6rem',
              fontWeight: 700,
              color: 'white',
            }}
          >
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <h2 style={{ fontSize: '1.6rem', margin: 0 }}>{profile?.name || user?.name}</h2>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '6px' }}>
              <span className="badge badge-emp">{user?.role}</span>
              <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{profile?.position || 'Staff Member'}</span>
            </div>
          </div>
        </div>

        {/* Read-Only Organizational Details */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '28px' }}>
          <div style={{ background: 'rgba(0,0,0,0.2)', padding: '14px', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', fontSize: '0.8rem', marginBottom: '4px' }}>
              <Mail size={14} /> Email
            </div>
            <div style={{ fontWeight: 500, fontSize: '0.9rem', color: '#fff' }}>{profile?.email || user?.email}</div>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.2)', padding: '14px', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', fontSize: '0.8rem', marginBottom: '4px' }}>
              <Building size={14} /> Department
            </div>
            <div style={{ fontWeight: 500, fontSize: '0.9rem', color: '#fff' }}>{profile?.department || user?.department}</div>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.2)', padding: '14px', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', fontSize: '0.8rem', marginBottom: '4px' }}>
              <Calendar size={14} /> Joining Date
            </div>
            <div style={{ fontWeight: 500, fontSize: '0.9rem', color: '#fff' }}>
              {profile?.joinDate ? new Date(profile.joinDate).toLocaleDateString() : 'Active Member'}
            </div>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.2)', padding: '14px', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', fontSize: '0.8rem', marginBottom: '4px' }}>
              <DollarSign size={14} /> Base Compensation
            </div>
            <div style={{ fontWeight: 500, fontSize: '0.9rem', color: '#34d399' }}>
              ${profile?.salary ? profile.salary.toLocaleString() : '50,000'} / year
            </div>
          </div>
        </div>

        {/* Update Contact Details */}
        <h3 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Personal Contact Information</h3>

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

        <form onSubmit={handleUpdate}>
          <div className="form-group">
            <label className="form-label" htmlFor="prof-phone">Phone Number</label>
            <div style={{ position: 'relative' }}>
              <input
                id="prof-phone"
                type="tel"
                className="form-control"
                placeholder="+1-555-0123"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{ paddingLeft: '38px' }}
              />
              <Phone size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: '#64748b' }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="prof-addr">Mailing Address</label>
            <div style={{ position: 'relative' }}>
              <input
                id="prof-addr"
                type="text"
                className="form-control"
                placeholder="123 Silicon Blvd, Tech City"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                style={{ paddingLeft: '38px' }}
              />
              <MapPin size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: '#64748b' }} />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary"
            style={{ marginTop: '10px' }}
          >
            {saving ? 'Saving changes...' : 'Save Contact Updates'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
