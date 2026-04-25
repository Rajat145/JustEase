import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';

function StatCard({ icon, label, value, sub, color }) {
  return (
    <div className="stat-card fade-in-up">
      <div style={{ fontSize:22, marginBottom:8 }}>{icon}</div>
      <div className="stat-label">{label}</div>
      <div className="stat-value" style={color ? { color } : {}}>{value}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );
}

function HearingCard({ hearing }) {
  return (
    <div className="hearing-card">
      <div style={{ fontSize:12, color:'var(--text3)', marginBottom:3 }}>
        📅 {new Date(hearing.scheduledAt).toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' })} · {new Date(hearing.scheduledAt).toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' })}
      </div>
      <div style={{ fontSize:14, fontWeight:500, color:'var(--navy)', marginBottom:2 }}>{hearing.caseTitle}</div>
      <div style={{ fontSize:12, color:'var(--text3)' }}>{hearing.caseId} · {hearing.judgeName}</div>
    </div>
  );
}

function statusClass(s) {
  return { Pending:'badge-pending', 'In Progress':'badge-progress', Accepted:'badge-active', Rejected:'badge-rejected', Resolved:'badge-active' }[s] || 'badge-gray';
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const [cases,    setCases]    = useState([]);
  const [hearings, setHearings] = useState([]);
  const [stats,    setStats]    = useState(null);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [cRes, hRes] = await Promise.all([
          API.get('/cases?limit=5'),
          API.get('/hearings'),
        ]);
        setCases(cRes.data.cases || []);
        setHearings(hRes.data.hearings || []);
        if (user.role === 'admin') {
          const sRes = await API.get('/cases/stats/analytics');
          setStats(sRes.data.stats);
        }
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <div style={{ display:'flex', justifyContent:'center', padding:60 }}><div className="spinner" style={{ width:32, height:32 }} /></div>;

  const greet = () => {
    const h = new Date().getHours();
    return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  };

  return (
    <div className="fade-in-up">
      <div className="page-header">
        <h1>{greet()}, {user.name.split(' ')[0]} {user.role === 'admin' ? '👑' : user.role === 'judge' ? '⚖️' : '📋'}</h1>
        <p>Here's your JustEase overview for today</p>
      </div>

      <div className="disclaimer">
        <span>⚠️</span>
        <div>
          <strong>Legal Disclaimer: </strong>
          JustEase is a digital assistance platform, not an official government court. All generated documents require official verification.
        </div>
      </div>

      {/* ── Admin Stats ────────────────────────────────────── */}
      {user.role === 'admin' && stats && (
        <div className="grid-4 mb-24">
          <StatCard icon="📁" label="Total Cases"     value={stats.total}      sub="+3 this week" />
          <StatCard icon="⏳" label="Pending"         value={stats.pending}    sub="Awaiting assignment" />
          <StatCard icon="🔄" label="In Progress"     value={stats.inProgress} />
          <StatCard icon="✅" label="Resolved"        value={stats.resolved}   sub="This quarter" />
        </div>
      )}

      {/* ── Judge Stats ────────────────────────────────────── */}
      {user.role === 'judge' && (
        <div className="grid-3 mb-24">
          <StatCard icon="📁" label="Assigned Cases"      value={cases.length} />
          <StatCard icon="📅" label="Upcoming Hearings"   value={hearings.filter(h => new Date(h.scheduledAt) > new Date()).length} />
          <StatCard icon="✅" label="Resolved This Month" value={cases.filter(c => c.status === 'Resolved').length} />
        </div>
      )}

      {/* ── User Stats ─────────────────────────────────────── */}
      {user.role === 'user' && (
        <div className="grid-4 mb-24">
          <StatCard icon="📁" label="My Cases"      value={cases.length} />
          <StatCard icon="📄" label="Documents"     value="3" />
          <StatCard icon="📅" label="Next Hearing"  value={hearings[0] ? new Date(hearings[0].scheduledAt).toLocaleDateString('en-IN', { day:'numeric', month:'short' }) : '—'} />
          <StatCard icon="⏳" label="Pending Action" value={cases.filter(c => c.status === 'Pending').length} />
        </div>
      )}

      <div className="grid-2">
        {/* Recent Cases */}
        <div className="card">
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
            <h3>Recent Cases</h3>
            <button className="btn btn-sm btn-outline" onClick={() => navigate(user.role === 'user' ? '/my-cases' : user.role === 'judge' ? '/assigned-cases' : '/cases')}>
              View All →
            </button>
          </div>
          {cases.length === 0 ? (
            <div className="empty-state"><div className="icon">📁</div><p>No cases yet</p></div>
          ) : cases.slice(0, 4).map(c => (
            <div key={c._id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid var(--cream)' }}
              onClick={() => navigate(`/cases/${c._id}`)} className="cursor-pointer">
              <div>
                <div style={{ fontSize:14, fontWeight:500, color:'var(--navy)', marginBottom:2, cursor:'pointer' }}>{c.title}</div>
                <div style={{ fontSize:12, color:'var(--text3)' }}>{c.caseId} · {c.filerName}</div>
              </div>
              <span className={`badge ${statusClass(c.status)}`}>{c.status}</span>
            </div>
          ))}
        </div>

        {/* Upcoming Hearings */}
        <div className="card">
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
            <h3>Upcoming Hearings</h3>
            <button className="btn btn-sm btn-outline" onClick={() => navigate('/hearings')}>View All →</button>
          </div>
          {hearings.length === 0 ? (
            <div className="empty-state"><div className="icon">📅</div><p>No hearings scheduled</p></div>
          ) : hearings.filter(h => new Date(h.scheduledAt) >= new Date()).slice(0, 3).map(h => (
            <HearingCard key={h._id} hearing={h} />
          ))}
        </div>
      </div>

      {/* User quick actions */}
      {user.role === 'user' && (
        <div className="card mt-20">
          <h3 style={{ marginBottom:14 }}>Quick Actions</h3>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:10 }}>
            {[
              { icon:'✍️', label:'New Affidavit', path:'/affidavit', style:'btn-primary' },
              { icon:'📝', label:'File a Case',   path:'/file-case', style:'btn-gold' },
              { icon:'📁', label:'My Cases',      path:'/my-cases',  style:'btn-outline' },
              { icon:'💬', label:'Legal Help',    path:'/chat',      style:'btn-outline' },
            ].map(a => (
              <button key={a.path} className={`btn ${a.style}`} style={{ flexDirection:'column', gap:4, padding:'14px 10px', borderRadius:10 }}
                onClick={() => navigate(a.path)}>
                <span style={{ fontSize:20 }}>{a.icon}</span>
                <span style={{ fontSize:13 }}>{a.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
