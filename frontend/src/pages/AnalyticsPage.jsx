import React, { useEffect, useState } from 'react';
import API from '../utils/api';
import toast from 'react-hot-toast';

function ProgressBar({ value, max, color = 'var(--navy)' }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text3)', marginBottom: 4 }}>
        <span>{value} cases</span><span>{pct}%</span>
      </div>
      <div style={{ height: 8, background: 'var(--cream2)', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 4, transition: 'width 0.5s' }} />
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/cases/stats/analytics')
      .then(r => setStats(r.data.stats))
      .catch(() => toast.error('Failed to load analytics.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" style={{ width: 28, height: 28 }} /></div>;
  if (!stats)  return <div className="empty-state"><div className="icon">📈</div><p>No data available</p></div>;

  const resolutionRate = stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0;

  const statusData = [
    { label: 'Pending',     value: stats.pending,    color: '#F59E0B' },
    { label: 'In Progress', value: stats.inProgress, color: '#3B82F6' },
    { label: 'Resolved',    value: stats.resolved,   color: 'var(--green)' },
    { label: 'Rejected',    value: stats.rejected,   color: 'var(--red)' },
  ];

  const catColors = ['var(--navy)', 'var(--gold)', 'var(--green)', 'var(--purple)', '#E05C3A', '#0891B2'];

  return (
    <div className="fade-in-up">
      <div className="page-header">
        <h1>Analytics 📈</h1>
        <p>Platform-wide case statistics and performance metrics</p>
      </div>

      {/* KPI row */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        {[
          { icon: '📁', label: 'Total Cases Filed',    value: stats.total },
          { icon: '✅', label: 'Resolution Rate',      value: `${resolutionRate}%` },
          { icon: '⏳', label: 'Pending Review',       value: stats.pending },
          { icon: '🔄', label: 'Active Cases',         value: stats.inProgress },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div style={{ fontSize: 22, marginBottom: 8 }}>{s.icon}</div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid-2">
        {/* Status breakdown */}
        <div className="card">
          <h3 style={{ marginBottom: 20 }}>Status Breakdown</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {statusData.map(s => (
              <div key={s.label}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 14, fontWeight: 500 }}>{s.label}</span>
                </div>
                <ProgressBar value={s.value} max={stats.total} color={s.color} />
              </div>
            ))}
          </div>

          {/* Mini pie-style legend */}
          <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
            {statusData.map(s => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text3)' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.color }} />
                {s.label} ({s.value})
              </div>
            ))}
          </div>
        </div>

        {/* By category */}
        <div className="card">
          <h3 style={{ marginBottom: 20 }}>Cases by Category</h3>
          {(stats.byCategory || []).length === 0 ? (
            <div className="empty-state"><div className="icon">📊</div><p>No category data yet</p></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {stats.byCategory.map((cat, i) => (
                <div key={cat._id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 500 }}>{cat._id || 'Other'}</span>
                    <span style={{ fontSize: 12, color: 'var(--text3)' }}>{cat.count}</span>
                  </div>
                  <ProgressBar value={cat.count} max={stats.total} color={catColors[i % catColors.length]} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Resolution summary */}
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>Resolution Summary</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { label: 'Resolved',      value: stats.resolved,   icon: '✅', bg: '#D1FAE5', color: 'var(--green)' },
              { label: 'Rejected',      value: stats.rejected,   icon: '❌', bg: '#FEE2E2', color: 'var(--red)' },
              { label: 'In Progress',   value: stats.inProgress, icon: '🔄', bg: '#DBEAFE', color: '#1E40AF' },
              { label: 'Pending',       value: stats.pending,    icon: '⏳', bg: '#FEF3C7', color: '#92400E' },
            ].map(s => (
              <div key={s.label} style={{ background: s.bg, borderRadius: 10, padding: 14, textAlign: 'center' }}>
                <div style={{ fontSize: 22 }}>{s.icon}</div>
                <div style={{ fontFamily: 'var(--font-head)', fontSize: 26, color: s.color, fontWeight: 700 }}>{s.value}</div>
                <div style={{ fontSize: 12, color: s.color, fontWeight: 500 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Platform health */}
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>Platform Health</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { label: 'Assignment Rate', value: stats.total > 0 ? Math.round(((stats.total - stats.pending) / stats.total) * 100) : 0, color: 'var(--green)' },
              { label: 'Resolution Rate', value: resolutionRate, color: 'var(--navy)' },
              { label: 'Active Case Load', value: stats.total > 0 ? Math.round((stats.inProgress / stats.total) * 100) : 0, color: 'var(--gold)' },
            ].map(m => (
              <div key={m.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 13 }}>{m.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: m.color }}>{m.value}%</span>
                </div>
                <div style={{ height: 8, background: 'var(--cream2)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${m.value}%`, background: m.color, borderRadius: 4, transition: 'width 0.6s' }} />
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16, padding: 12, background: 'var(--cream)', borderRadius: 8, fontSize: 13, color: 'var(--text3)' }}>
            📊 Data reflects all cases registered on the JustEase platform. For official court statistics, refer to government judicial records.
          </div>
        </div>
      </div>
    </div>
  );
}
