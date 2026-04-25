import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [saving,   setSaving]   = useState(false);
  const [changePw, setChangePw] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name:             user?.name    || '',
      phone:            user?.phone   || '',
      address:          user?.address || '',
      barRegistration:  user?.barRegistration || '',
    },
  });

  const { register: pwReg, handleSubmit: pwSubmit, reset: pwReset, formState: { errors: pwErrors } } = useForm();

  const onSave = async (data) => {
    setSaving(true);
    try {
      const res = await API.put('/auth/profile', data);
      updateUser(res.data.user);
      toast.success('Profile updated!');
    } catch {
      toast.error('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const onChangePw = async (data) => {
    if (data.newPassword !== data.confirmPassword) return toast.error('Passwords do not match.');
    setPwSaving(true);
    try {
      await API.put('/auth/change-password', { currentPassword: data.currentPassword, newPassword: data.newPassword });
      toast.success('Password changed successfully!');
      setChangePw(false);
      pwReset();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setPwSaving(false);
    }
  };

  const initials = user?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const roleLabel = { admin: 'Administrator', judge: 'Legal Authority / Judge', user: 'Case Filer' }[user?.role];

  return (
    <div className="fade-in-up">
      <div className="page-header">
        <h1>My Profile</h1>
        <p>Manage your account details and security settings</p>
      </div>

      <div className="grid-2" style={{ alignItems: 'flex-start' }}>
        {/* Profile form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            {/* Avatar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%', background: 'var(--gold)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: 22, color: 'var(--navy)', flexShrink: 0,
              }}>{initials}</div>
              <div>
                <div style={{ fontFamily: 'var(--font-head)', fontSize: 20, color: 'var(--navy)', fontWeight: 600 }}>{user?.name}</div>
                <div style={{ fontSize: 13, color: 'var(--text3)' }}>{user?.email}</div>
                <span className={`badge ${user?.role === 'judge' ? 'badge-gold' : user?.role === 'admin' ? 'badge-purple' : 'badge-gray'}`} style={{ marginTop: 4 }}>
                  {roleLabel}
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSave)}>
              <h3 style={{ fontSize: 16, marginBottom: 14 }}>Personal Information</h3>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" {...register('name', { required: 'Name is required' })} />
                {errors.name && <p className="form-error">{errors.name.message}</p>}
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input className="form-input" placeholder="+91 XXXXX XXXXX" {...register('phone')} />
                </div>
                <div className="form-group">
                  <label className="form-label">Email (read-only)</label>
                  <input className="form-input" value={user?.email} disabled style={{ opacity: 0.6 }} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Address</label>
                <textarea className="form-textarea" style={{ minHeight: 70 }} placeholder="Your residential address" {...register('address')} />
              </div>
              {user?.role === 'judge' && (
                <div className="form-group">
                  <label className="form-label">Bar Registration Number</label>
                  <input className="form-input" placeholder="BAR-DL-XXXX-XXXX" {...register('barRegistration')} />
                </div>
              )}
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? <span className="spinner" style={{ width: 14, height: 14 }} /> : 'Save Changes'}
              </button>
            </form>
          </div>

          {/* Change password */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: changePw ? 16 : 0 }}>
              <h3 style={{ fontSize: 16 }}>Security</h3>
              <button className="btn btn-outline btn-sm" onClick={() => setChangePw(v => !v)}>
                {changePw ? 'Cancel' : 'Change Password'}
              </button>
            </div>
            {changePw && (
              <form onSubmit={pwSubmit(onChangePw)}>
                <div className="form-group">
                  <label className="form-label">Current Password</label>
                  <input className="form-input" type="password" {...pwReg('currentPassword', { required: true })} />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">New Password</label>
                    <input className="form-input" type="password" {...pwReg('newPassword', { required: true, minLength: { value: 6, message: 'Min 6 chars' } })} />
                    {pwErrors.newPassword && <p className="form-error">{pwErrors.newPassword.message}</p>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Confirm New Password</label>
                    <input className="form-input" type="password" {...pwReg('confirmPassword', { required: true })} />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary btn-sm" disabled={pwSaving}>
                  {pwSaving ? <span className="spinner" style={{ width: 14, height: 14 }} /> : 'Update Password'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Account info */}
        <div className="card" style={{ alignSelf: 'flex-start' }}>
          <h3 style={{ marginBottom: 16, fontSize: 16 }}>Account Summary</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { label: 'Member Since',    value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : '—' },
              { label: 'Last Login',      value: user?.lastLogin  ? new Date(user.lastLogin).toLocaleDateString('en-IN') : 'Just now' },
              { label: 'Account Type',    value: roleLabel },
              { label: 'Account Status',  value: user?.isActive !== false ? '✅ Active' : '🔴 Suspended' },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--cream)' }}>
                <span style={{ fontSize: 13, color: 'var(--text3)' }}>{label}</span>
                <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--navy)' }}>{value}</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 20, padding: 14, background: 'rgba(201,168,76,0.08)', borderRadius: 10, fontSize: 13, color: '#8B6914' }}>
            <strong style={{ display: 'block', marginBottom: 4 }}>⚠️ Reminder</strong>
            JustEase is a legal assistance platform. All documents generated here must be verified by appropriate legal authorities before official submission.
          </div>
        </div>
      </div>
    </div>
  );
}
