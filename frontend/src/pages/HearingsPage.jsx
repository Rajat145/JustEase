// ─────────────────────────────────────────────────────────────
// HearingsPage.jsx
// ─────────────────────────────────────────────────────────────
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';

export function HearingsPage() {
  const { user } = useAuth();
  const [hearings, setHearings] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [cases,    setCases]    = useState([]);
  const [form,     setForm]     = useState({ caseId:'', scheduledAt:'', venue:'', notes:'' });
  const [saving,   setSaving]   = useState(false);

  useEffect(() => {
    Promise.all([
      API.get('/hearings'),
      (user.role !== 'user') ? API.get('/cases') : Promise.resolve({ data: { cases: [] } }),
    ]).then(([hRes, cRes]) => {
      setHearings(hRes.data.hearings || []);
      setCases(cRes.data.cases || []);
    }).catch(() => toast.error('Failed to load hearings.')).finally(() => setLoading(false));
  }, []);

  const schedule = async () => {
    if (!form.caseId || !form.scheduledAt) return toast.error('Case and date are required.');
    setSaving(true);
    try {
      const res = await API.post('/hearings', form);
      setHearings(h => [res.data.hearing, ...h]);
      toast.success('Hearing scheduled! Notification sent.');
      setForm({ caseId:'', scheduledAt:'', venue:'', notes:'' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to schedule.');
    } finally {
      setSaving(false);
    }
  };

  const upcoming = hearings.filter(h => new Date(h.scheduledAt) >= new Date());
  const past     = hearings.filter(h => new Date(h.scheduledAt) <  new Date());

  if (loading) return <div style={{ display:'flex', justifyContent:'center', padding:60 }}><div className="spinner" style={{ width:28, height:28 }} /></div>;

  return (
    <div className="fade-in-up">
      <div className="page-header"><h1>Hearing Schedule 📅</h1><p>View and manage case hearings</p></div>
      <div className="disclaimer">⚠️ <div>Hearings scheduled here are for platform tracking. Official hearings are conducted through government court systems.</div></div>

      <div className="grid-2">
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <div className="card">
            <h3 style={{ marginBottom:14 }}>Upcoming Hearings ({upcoming.length})</h3>
            {upcoming.length === 0 ? (
              <div className="empty-state"><div className="icon">📅</div><p>No upcoming hearings</p></div>
            ) : upcoming.map(h => (
              <div key={h._id} className="hearing-card" style={{ marginBottom:10 }}>
                <div style={{ fontSize:12, color:'var(--text3)', marginBottom:3 }}>
                  📅 {new Date(h.scheduledAt).toLocaleDateString('en-IN', { weekday:'short', day:'numeric', month:'long' })} · {new Date(h.scheduledAt).toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' })}
                </div>
                <div style={{ fontSize:14, fontWeight:500, color:'var(--navy)', marginBottom:2 }}>{h.caseTitle}</div>
                <div style={{ fontSize:12, color:'var(--text3)' }}>{h.caseId} · {h.judgeName}</div>
                {h.venue && <div style={{ fontSize:11, color:'var(--text3)', marginTop:3 }}>📍 {h.venue}</div>}
                {h.notes && <div style={{ fontSize:12, color:'var(--text2)', marginTop:4, fontStyle:'italic' }}>"{h.notes}"</div>}
                {h.notificationSent && <span className="badge badge-active" style={{ marginTop:6, display:'inline-flex' }}>✅ Notified</span>}
              </div>
            ))}
          </div>

          {past.length > 0 && (
            <div className="card">
              <h3 style={{ marginBottom:14 }}>Past Hearings</h3>
              {past.map(h => (
                <div key={h._id} style={{ padding:'10px 0', borderBottom:'1px solid var(--cream)', opacity:0.65 }}>
                  <div style={{ fontSize:12, color:'var(--text3)' }}>{new Date(h.scheduledAt).toLocaleDateString('en-IN')}</div>
                  <div style={{ fontSize:13, fontWeight:500, color:'var(--navy)' }}>{h.caseTitle}</div>
                  <span className={`badge ${h.status === 'Completed' ? 'badge-active' : 'badge-gray'}`}>{h.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Schedule form for judge/admin */}
        {(user.role === 'judge' || user.role === 'admin') && (
          <div className="card" style={{ alignSelf:'flex-start' }}>
            <h3 style={{ marginBottom:16 }}>Schedule New Hearing</h3>
            <div className="form-group">
              <label className="form-label">Select Case *</label>
              <select className="form-select" value={form.caseId} onChange={e => setForm(f => ({ ...f, caseId: e.target.value }))}>
                <option value="">Choose a case...</option>
                {cases.map(c => <option key={c._id} value={c._id}>{c.caseId} — {c.title.slice(0,40)}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Date & Time *</label>
              <input className="form-input" type="datetime-local" value={form.scheduledAt}
                onChange={e => setForm(f => ({ ...f, scheduledAt: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Venue</label>
              <input className="form-input" placeholder="e.g. Courtroom 3, District Court" value={form.venue}
                onChange={e => setForm(f => ({ ...f, venue: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Notes / Instructions</label>
              <textarea className="form-textarea" style={{ minHeight:70 }} placeholder="Any specific instructions for parties..."
                value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
            <div style={{ background:'rgba(26,107,69,0.08)', borderRadius:8, padding:10, fontSize:13, color:'var(--green)', marginBottom:14 }}>
              📧 Email notification will be sent automatically to all parties.
            </div>
            <button className="btn btn-primary" style={{ width:'100%' }} onClick={schedule} disabled={saving}>
              {saving ? <span className="spinner" style={{ width:16, height:16 }} /> : '📅 Schedule & Notify →'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default HearingsPage;
