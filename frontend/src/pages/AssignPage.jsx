import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import API from '../utils/api';

export default function AssignPage() {
  const [unassigned, setUnassigned] = useState([]);
  const [judges,     setJudges]     = useState([]);
  const [allCases,   setAllCases]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [selected,   setSelected]   = useState({}); // caseId -> judgeId
  const [saving,     setSaving]     = useState(null);

  useEffect(() => {
    Promise.all([
      API.get('/cases?limit=50'),
      API.get('/users/judges'),
    ]).then(([cRes, jRes]) => {
      const cases = cRes.data.cases || [];
      setAllCases(cases);
      setUnassigned(cases.filter(c => !c.assignedJudge && c.status === 'Pending'));
      setJudges(jRes.data.judges || []);
    }).catch(() => toast.error('Failed to load.')).finally(() => setLoading(false));
  }, []);

  const assign = async (caseId) => {
    const judgeId = selected[caseId];
    if (!judgeId) return toast.error('Please select a judge first.');
    const judge = judges.find(j => j._id === judgeId);
    setSaving(caseId);
    try {
      await API.put(`/cases/${caseId}/assign`, { judgeId, judgeName: judge.name });
      setUnassigned(u => u.filter(c => c._id !== caseId));
      toast.success(`Case assigned to ${judge.name}!`);
    } catch {
      toast.error('Assignment failed.');
    } finally {
      setSaving(null);
    }
  };

  // Count cases per judge
  const judgeLoad = judges.map(j => ({
    ...j,
    count: allCases.filter(c => c.assignedJudge?._id === j._id || c.assignedJudgeName === j.name).length,
  }));

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" style={{ width: 28, height: 28 }} /></div>;

  return (
    <div className="fade-in-up">
      <div className="page-header">
        <h1>Case Assignment ⚖️</h1>
        <p>Assign pending cases to available judges</p>
      </div>

      <div className="grid-2">
        {/* Unassigned cases */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3>Unassigned Cases</h3>
            <span className="badge badge-pending">{unassigned.length} pending</span>
          </div>

          {unassigned.length === 0 ? (
            <div className="empty-state"><div className="icon">✅</div><p>All cases are assigned!</p></div>
          ) : unassigned.map(c => (
            <div key={c._id} style={{ background: 'var(--cream)', borderRadius: 10, padding: 14, marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--navy)', marginBottom: 2 }}>{c.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text3)' }}>
                    {c.caseId} · {c.category} · Filed by {c.filerName}
                  </div>
                </div>
                <span className={`badge ${c.urgency === 'Urgent' || c.urgency === 'Very Urgent' ? 'badge-rejected' : 'badge-gray'}`}>
                  {c.urgency}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <select
                  className="form-select"
                  style={{ flex: 1, padding: '7px 10px', fontSize: 13 }}
                  value={selected[c._id] || ''}
                  onChange={e => setSelected(s => ({ ...s, [c._id]: e.target.value }))}
                >
                  <option value="">Select Judge...</option>
                  {judges.map(j => (
                    <option key={j._id} value={j._id}>{j.name}</option>
                  ))}
                </select>
                <button
                  className="btn btn-gold btn-sm"
                  onClick={() => assign(c._id)}
                  disabled={saving === c._id || !selected[c._id]}
                >
                  {saving === c._id ? <span className="spinner" style={{ width: 14, height: 14 }} /> : 'Assign →'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Judge workload */}
        <div className="card" style={{ alignSelf: 'flex-start' }}>
          <h3 style={{ marginBottom: 16 }}>Judge Workload</h3>
          {judgeLoad.length === 0 ? (
            <div className="empty-state"><div className="icon">⚖️</div><p>No judges registered</p></div>
          ) : judgeLoad.map(j => {
            const pct = Math.min((j.count / 10) * 100, 100);
            return (
              <div key={j._id} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--navy)' }}>{j.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text3)' }}>{j.email}</div>
                  </div>
                  <span className="badge badge-gold">{j.count} case{j.count !== 1 ? 's' : ''}</span>
                </div>
                <div style={{ height: 6, background: 'var(--cream2)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: 3, transition: 'width 0.4s',
                    background: pct > 70 ? 'var(--red)' : pct > 40 ? 'var(--amber)' : 'var(--green)',
                    width: `${pct}%`,
                  }} />
                </div>
                <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 3 }}>
                  {pct > 70 ? '⚠️ High load' : pct > 40 ? '🟡 Moderate' : '🟢 Available'}
                </div>
              </div>
            );
          })}

          <hr className="divider" />
          <div style={{ fontSize: 13, color: 'var(--text3)', lineHeight: 1.6 }}>
            <strong style={{ color: 'var(--navy)', display: 'block', marginBottom: 4 }}>Assignment Tips</strong>
            Consider case complexity, category match, and judge availability when assigning. Urgent cases should be prioritized.
          </div>
        </div>
      </div>
    </div>
  );
}
