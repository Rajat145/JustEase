import React, { useEffect, useState, useRef } from 'react';
import toast from 'react-hot-toast';
import API from '../utils/api';

export default function DocumentsPage() {
  const [docs,    setDocs]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [form,    setForm]    = useState({ name:'', type:'Other', relatedCase:'' });
  const fileRef = useRef();

  useEffect(() => {
    API.get('/documents').then(r => setDocs(r.data.documents || [])).catch(() => toast.error('Failed to load.')).finally(() => setLoading(false));
  }, []);

  const upload = async () => {
    const file = fileRef.current?.files[0];
    if (!file) return toast.error('Select a file first.');
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('document', file);
      fd.append('name', form.name || file.name);
      fd.append('type', form.type);
      if (form.relatedCase) fd.append('relatedCase', form.relatedCase);
      const res = await API.post('/documents', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setDocs(d => [res.data.document, ...d]);
      toast.success('Document uploaded!');
      setForm({ name:'', type:'Other', relatedCase:'' });
      fileRef.current.value = '';
    } catch {
      toast.error('Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const deleteDoc = async (id) => {
    if (!confirm('Delete this document?')) return;
    await API.delete(`/documents/${id}`);
    setDocs(d => d.filter(x => x._id !== id));
    toast.success('Deleted.');
  };

  const typeIcon = t => ({ Affidavit:'📜', Evidence:'📎', 'Court Order':'⚖️', 'ID Proof':'🪪', 'Property Document':'🏠', Other:'📄' }[t] || '📄');

  if (loading) return <div style={{ display:'flex', justifyContent:'center', padding:60 }}><div className="spinner" style={{ width:28, height:28 }} /></div>;

  return (
    <div className="fade-in-up">
      <div className="page-header"><h1>Documents 📄</h1><p>Upload, manage, and download your legal documents</p></div>

      <div className="grid-2" style={{ alignItems:'flex-start' }}>
        <div className="card">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
            <h3>My Documents ({docs.length})</h3>
          </div>
          {docs.length === 0 ? (
            <div className="empty-state"><div className="icon">📄</div><p>No documents uploaded yet</p></div>
          ) : docs.map(d => (
            <div key={d._id} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 0', borderBottom:'1px solid var(--cream)' }}>
              <div style={{ fontSize:26, flexShrink:0 }}>{typeIcon(d.type)}</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:14, fontWeight:500, color:'var(--navy)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{d.name}</div>
                <div style={{ fontSize:12, color:'var(--text3)' }}>{d.type} · {new Date(d.createdAt).toLocaleDateString('en-IN')}</div>
              </div>
              <div style={{ display:'flex', gap:4, flexShrink:0 }}>
                <a href={d.fileUrl} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline">⬇</a>
                <button className="btn btn-sm btn-danger" onClick={() => deleteDoc(d._id)}>🗑</button>
              </div>
            </div>
          ))}
        </div>

        <div className="card" style={{ alignSelf:'flex-start' }}>
          <h3 style={{ marginBottom:16 }}>Upload New Document</h3>
          <div className="form-group">
            <label className="form-label">Document Name</label>
            <input className="form-input" placeholder="e.g. Property Registration Certificate" value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Document Type</label>
            <select className="form-select" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
              {['Affidavit','Evidence','Court Order','ID Proof','Property Document','Other'].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Related Case ID (optional)</label>
            <input className="form-input" placeholder="JE-2024-XXXX" value={form.relatedCase}
              onChange={e => setForm(f => ({ ...f, relatedCase: e.target.value }))} />
          </div>
          <div className="upload-zone" onClick={() => fileRef.current?.click()} style={{ marginBottom:14 }}>
            <div style={{ fontSize:28 }}>📁</div>
            <div style={{ fontSize:14, color:'var(--text3)', marginTop:6 }}>
              <strong style={{ color:'var(--navy)' }}>Click to choose file</strong>
            </div>
            <div style={{ fontSize:12, color:'var(--text3)', marginTop:4 }}>PDF, JPG, PNG — max 10MB</div>
            <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" style={{ display:'none' }} />
          </div>
          <button className="btn btn-primary" style={{ width:'100%' }} onClick={upload} disabled={uploading}>
            {uploading ? <span className="spinner" style={{ width:16, height:16 }} /> : '⬆ Upload Document'}
          </button>
        </div>
      </div>
    </div>
  );
}
