import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import API from '../utils/api';

export default function UsersPage() {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  useEffect(() => { load(); }, [roleFilter]);

  const load = async () => {
    setLoading(true);
    try {
      const params = {};
      if (roleFilter) params.role = roleFilter;
      const res = await API.get('/users', { params });
      setUsers(res.data.users || []);
    } catch { toast.error('Failed to load users.'); }
    finally { setLoading(false); }
  };

  const toggleStatus = async (id) => {
    try {
      const res = await API.put(`/users/${id}/toggle-status`);
      setUsers(u => u.map(x => x._id === id ? res.data.user : x));
      toast.success('Status updated!');
    } catch { toast.error('Failed.'); }
  };

  const filtered = users.filter(u =>
    !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
  );

  const roleLabel = { admin: '👑 Admin', judge: '⚖️ Judge', user: '📋 User' };

  return (
    <div className="fade-in-up">
      <div className="page-header">
        <h1>User Management 👥</h1>
        <p>Manage all registered users and their roles</p>
      </div>

      <div className="grid-4" style={{ marginBottom: 24 }}>
        {[
          { label: 'Total Users',  value: users.length,                              icon: '👥' },
          { label: 'Admins',       value: users.filter(u => u.role === 'admin').length, icon: '👑' },
          { label: 'Judges',       value: users.filter(u => u.role === 'judge').length, icon: '⚖️' },
          { label: 'Case Filers',  value: users.filter(u => u.role === 'user').length,  icon: '📋' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div style={{ fontSize: 22, marginBottom: 8 }}>{s.icon}</div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            {['', 'admin', 'judge', 'user'].map(r => (
              <button key={r} className={`btn btn-sm ${roleFilter === r ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setRoleFilter(r)}>
                {r ? roleLabel[r] : 'All'}
              </button>
            ))}
          </div>
          <input
            style={{ padding: '8px 12px', border: '1.5px solid var(--cream3)', borderRadius: 8, fontSize: 14, background: 'var(--cream)', outline: 'none' }}
            placeholder="🔍 Search users..."
            value={search} onChange={e => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><div className="spinner" style={{ width: 28, height: 28 }} /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state"><div className="icon">👥</div><p>No users found</p></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th>Last Login</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => {
                  const initials = u.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
                  return (
                    <tr key={u._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            width: 34, height: 34, borderRadius: '50%',
                            background: u.role === 'admin' ? 'var(--gold)' : u.role === 'judge' ? 'var(--navy)' : 'var(--cream3)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 12, fontWeight: 600,
                            color: u.role === 'admin' ? 'var(--navy)' : u.role === 'judge' ? '#fff' : 'var(--text2)',
                            flexShrink: 0,
                          }}>{initials}</div>
                          <div style={{ fontWeight: 500, color: 'var(--navy)' }}>{u.name}</div>
                        </div>
                      </td>
                      <td style={{ color: 'var(--text3)', fontSize: 13 }}>{u.email}</td>
                      <td><span className={`badge ${u.role === 'judge' ? 'badge-gold' : u.role === 'admin' ? 'badge-purple' : 'badge-gray'}`}>{roleLabel[u.role]}</span></td>
                      <td style={{ fontSize: 12, color: 'var(--text3)' }}>{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                      <td style={{ fontSize: 12, color: 'var(--text3)' }}>{u.lastLogin ? new Date(u.lastLogin).toLocaleDateString('en-IN') : '—'}</td>
                      <td><span className={`badge ${u.isActive ? 'badge-active' : 'badge-rejected'}`}>{u.isActive ? 'Active' : 'Suspended'}</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button
                            className={`btn btn-sm ${u.isActive ? 'btn-danger' : 'btn-success'}`}
                            onClick={() => toggleStatus(u._id)}
                          >
                            {u.isActive ? 'Suspend' : 'Restore'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
