import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';

function statusClass(s) {
  return { Pending:'badge-pending','In Progress':'badge-progress',Accepted:'badge-active',Rejected:'badge-rejected',Resolved:'badge-active',Adjourned:'badge-gray' }[s] || 'badge-gray';
}

export default function CasesPage() {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const [cases,   setCases]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [filter,  setFilter]  = useState('');

  const isAdmin = user.role === 'admin';
  const isJudge = user.role === 'judge';

  useEffect(() => {
    load();
  }, [filter]);

  const load = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter) params.status = filter;
      const res = await API.get('/cases', { params });
      setCases(res.data.cases || []);
    } catch {
      toast.error('Failed to load cases.');
    } finally {
      setLoading(false);
    }
  };

  const filtered = cases.filter(c =>
    !search || c.title.toLowerCase().includes(search.toLowerCase()) || c.caseId?.toLowerCase().includes(search.toLowerCase())
  );

  const title = isAdmin ? 'All Cases' : isJudge ? 'Assigned Cases' : 'My Cases';

  return (
    <div className="fade-in-up">
      <div className="page-header">
        <h1>{title}</h1>
        <p>{isAdmin ? 'Manage all filed cases' : isJudge ? 'Cases under your jurisdiction' : 'Track all your filed cases'}</p>
      </div>

      <div className="card">
        {/* Toolbar */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16, flexWrap:'wrap', gap:10 }}>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            {['','Pending','In Progress','Accepted','Resolved','Rejected'].map(s => (
              <button key={s} className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setFilter(s)}>
                {s || 'All'}
              </button>
            ))}
          </div>
          <input style={{ padding:'8px 12px', border:'1.5px solid var(--cream3)', borderRadius:8, fontSize:14, background:'var(--cream)', outline:'none' }}
            placeholder="🔍 Search cases..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {loading ? (
          <div style={{ display:'flex', justifyContent:'center', padding:40 }}><div className="spinner" style={{ width:28, height:28 }} /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state"><div className="icon">📁</div><p>No cases found</p></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Case ID</th>
                  <th>Title</th>
                  {!isJudge && <th>Filed By</th>}
                  <th>Judge</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Filed</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c._id}>
                    <td style={{ fontWeight:500, color:'var(--navy)', fontSize:13 }}>{c.caseId}</td>
                    <td style={{ maxWidth:200 }}>
                      <div style={{ fontWeight:500, color:'var(--navy)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{c.title}</div>
                      <div style={{ fontSize:11, color:'var(--text3)' }}>{c.category}</div>
                    </td>
                    {!isJudge && <td style={{ fontSize:13 }}>{c.filerName || c.filer?.name || '—'}</td>}
                    <td style={{ fontSize:13 }}>
                      {c.assignedJudgeName || c.assignedJudge?.name ||
                        <span style={{ color:'var(--text3)', fontStyle:'italic', fontSize:12 }}>Unassigned</span>}
                    </td>
                    <td><span className="badge badge-gray">{c.category}</span></td>
                    <td><span className={`badge ${statusClass(c.status)}`}>{c.status}</span></td>
                    <td style={{ fontSize:12, color:'var(--text3)' }}>
                      {new Date(c.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td>
                      <div style={{ display:'flex', gap:4 }}>
                        <button className="btn btn-sm btn-outline" onClick={() => navigate(`/cases/${c._id}`)}>View</button>
                        {isAdmin && !c.assignedJudge && (
                          <button className="btn btn-sm btn-gold" onClick={() => navigate('/assign')}>Assign</button>
                        )}
                        {isJudge && (
                          <button className="btn btn-sm btn-primary" onClick={() => navigate(`/cases/${c._id}`)}>Update</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
