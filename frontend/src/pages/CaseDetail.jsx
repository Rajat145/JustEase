import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { generateCaseSummaryPDF } from '../utils/pdfGenerator';

function statusClass(s) {
  return { Pending:'badge-pending','In Progress':'badge-progress',Accepted:'badge-active',Rejected:'badge-rejected',Resolved:'badge-active',Adjourned:'badge-gray' }[s] || 'badge-gray';
}

export default function CaseDetail() {
  const { id }    = useParams();
  const { user }  = useAuth();
  const navigate  = useNavigate();
  const [c,       setC]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [status,  setStatus]  = useState('');
  const [remark,  setRemark]  = useState('');
  const [saving,  setSaving]  = useState(false);

  useEffect(() => {
    API.get(`/cases/${id}`)
      .then(r => { setC(r.data.case); setStatus(r.data.case.status); })
      .catch(() => toast.error('Case not found.'))
      .finally(() => setLoading(false));
  }, [id]);

  const updateStatus = async () => {
    setSaving(true);
    try {
      const res = await API.put(`/cases/${id}/status`, { status, remark });
      setC(res.data.case);
      toast.success('Status updated!');
      setRemark('');
    } catch {
      toast.error('Failed to update status.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ display:'flex', justifyContent:'center', padding:60 }}><div className="spinner" style={{ width:32, height:32 }} /></div>;
  if (!c) return <div className="empty-state"><div className="icon">📁</div><p>Case not found</p></div>;

  return (
    <div className="fade-in-up">
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)}>← Back</button>
        <div style={{ flex:1 }}>
          <h1 style={{ fontSize:22 }}>{c.title}</h1>
          <div style={{ fontSize:13, color:'var(--text3)' }}>{c.caseId} · {c.category}</div>
        </div>
        <span className={`badge ${statusClass(c.status)}`} style={{ fontSize:13, padding:'5px 14px' }}>{c.status}</span>
        <button className="btn btn-outline btn-sm" onClick={() => generateCaseSummaryPDF(c)}>⬇ Export PDF</button>
      </div>

      <div className="grid-2">
        {/* Case Info */}
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <div className="card">
            <h3 style={{ marginBottom:14 }}>Case Details</h3>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              {[
                ['Filed By',      c.filerName || c.filer?.name],
                ['Contact',       c.filerContact || c.filer?.phone || '—'],
                ['Category',      c.category],
                ['Urgency',       c.urgency],
                ['Judge',         c.assignedJudgeName || c.assignedJudge?.name || 'Unassigned'],
                ['Next Hearing',  c.nextHearing ? new Date(c.nextHearing).toLocaleDateString('en-IN') : '—'],
                ['Filed On',      new Date(c.createdAt).toLocaleDateString('en-IN')],
                ['Relief Sought', c.reliefSought || '—'],
              ].map(([label, val]) => (
                <div key={label}>
                  <div style={{ fontSize:11, color:'var(--text3)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:2 }}>{label}</div>
                  <div style={{ fontSize:13, color:'var(--text2)', fontWeight:500 }}>{val}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 style={{ marginBottom:10 }}>Description</h3>
            <p style={{ fontSize:14, lineHeight:1.7, color:'var(--text2)' }}>{c.description}</p>
          </div>

          {c.respondent?.name && (
            <div className="card">
              <h3 style={{ marginBottom:10 }}>Respondent</h3>
              <div style={{ fontSize:14, color:'var(--text2)' }}>
                <div><strong>Name:</strong> {c.respondent.name}</div>
                {c.respondent.contact && <div><strong>Contact:</strong> {c.respondent.contact}</div>}
                {c.respondent.address && <div><strong>Address:</strong> {c.respondent.address}</div>}
              </div>
            </div>
          )}
        </div>

        {/* Right panel */}
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {/* Judge update panel */}
          {(user.role === 'judge' || user.role === 'admin') && (
            <div className="card">
              <h3 style={{ marginBottom:14 }}>Update Case Status</h3>
              <div className="form-group">
                <label className="form-label">New Status</label>
                <select className="form-select" value={status} onChange={e => setStatus(e.target.value)}>
                  {['Pending','Accepted','In Progress','Adjourned','Rejected','Resolved','Closed'].map(s => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Remarks</label>
                <textarea className="form-textarea" style={{ minHeight:80 }} placeholder="Add your remarks or observations..."
                  value={remark} onChange={e => setRemark(e.target.value)} />
              </div>
              <div style={{ display:'flex', gap:8 }}>
                <button className="btn btn-primary btn-sm" onClick={updateStatus} disabled={saving}>
                  {saving ? <span className="spinner" style={{ width:14, height:14 }} /> : 'Save Update'}
                </button>
                <button className="btn btn-success btn-sm" onClick={() => { setStatus('Accepted'); setTimeout(updateStatus, 100); }}>✅ Accept</button>
                <button className="btn btn-danger btn-sm" onClick={() => { setStatus('Rejected'); setTimeout(updateStatus, 100); }}>❌ Reject</button>
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="card">
            <h3 style={{ marginBottom:14 }}>Case Timeline</h3>
            <div className="timeline">
              {(c.timeline || []).length === 0 ? (
                <p style={{ fontSize:13, color:'var(--text3)' }}>No timeline events yet.</p>
              ) : (c.timeline || []).map((t, i) => (
                <div key={i} className="timeline-item">
                  <div className={`timeline-dot ${i === 0 ? 'gold' : i % 2 === 0 ? 'green' : ''}`} />
                  <div className="timeline-content">
                    <strong>{t.event}</strong>
                    {t.description && <div style={{ marginTop:1 }}>{t.description}</div>}
                    <div className="timeline-time">{t.actor} · {new Date(t.createdAt).toLocaleDateString('en-IN')}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Remarks */}
          {(c.remarks || []).length > 0 && (
            <div className="card">
              <h3 style={{ marginBottom:14 }}>Judge Remarks</h3>
              {c.remarks.map((r, i) => (
                <div key={i} style={{ padding:'10px 0', borderBottom:'1px solid var(--cream)', fontSize:14 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                    <strong style={{ color:'var(--navy)' }}>{r.authorName}</strong>
                    <span style={{ fontSize:11, color:'var(--text3)' }}>{new Date(r.createdAt).toLocaleDateString('en-IN')}</span>
                  </div>
                  <div style={{ color:'var(--text2)' }}>{r.text}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
