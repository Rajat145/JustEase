import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import API from '../utils/api';

const CASE_TYPES = [
  { id:'Civil',    icon:'🏠', desc:'Property, inheritance, tenancy disputes' },
  { id:'Criminal', icon:'⚠️', desc:'Cognizable / non-cognizable offences' },
  { id:'Labour',   icon:'👷', desc:'Employment, wages, termination' },
  { id:'Consumer', icon:'🛍️', desc:'Product / service complaints' },
  { id:'Family',   icon:'👨‍👩‍👧', desc:'Matrimonial, custody, maintenance' },
  { id:'Financial',icon:'💰', desc:'Cheque bounce, loan disputes' },
];

const STEPS = ['Case Type', 'Parties', 'Description', 'Documents', 'Submit'];

function StepBar({ current }) {
  return (
    <div className="step-bar" style={{ marginBottom:28 }}>
      {STEPS.map((label, i) => (
        <React.Fragment key={label}>
          <div className={`step-item step-${i < current ? 'done' : i === current ? 'active' : 'idle'}`}>
            <div className="step-circle">{i < current ? '✓' : i + 1}</div>
            <div className="step-label">{label}</div>
          </div>
          {i < STEPS.length - 1 && (
            <div className="step-connector">
              <div className={`step-connector-line ${i < current ? 'done' : ''}`} />
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

export default function FileCase() {
  const navigate  = useNavigate();
  const [step, setStep]         = useState(0);
  const [category, setCategory] = useState(null);
  const [caseData, setCaseData] = useState(null);
  const [files, setFiles]       = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const next = () => setStep(s => s + 1);
  const back = () => setStep(s => s - 1);

  const onSubmitDetails = (data) => {
    setCaseData({ ...data, category });
    next();
  };

  const submitCase = async () => {
    setSubmitting(true);
    try {
      const res = await API.post('/cases', { ...caseData });
      toast.success(`Case filed! ID: ${res.data.case.caseId}`);
      next();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to file case.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fade-in-up">
      <div className="page-header">
        <h1>File a Case 📝</h1>
        <p>Submit your case for review by the legal authority</p>
      </div>
      <div className="disclaimer">
        ⚠️ <div>This is a simulated filing system. For real court proceedings, consult a registered advocate and file through official court portals.</div>
      </div>

      <div className="card">
        <StepBar current={step} />

        {/* Step 0 */}
        {step === 0 && (
          <div>
            <h3 style={{ fontSize:16, marginBottom:14 }}>Select Case Category</h3>
            <div className="grid-2" style={{ gap:10 }}>
              {CASE_TYPES.map(t => (
                <div key={t.id} onClick={() => setCategory(t.id)} style={{
                  display:'flex', alignItems:'center', gap:12, padding:14,
                  background: category === t.id ? 'var(--white)' : 'var(--cream)',
                  border: category === t.id ? '2px solid var(--gold)' : '1px solid transparent',
                  borderRadius:10, cursor:'pointer', transition:'all 0.18s',
                }}>
                  <div style={{ fontSize:24 }}>{t.icon}</div>
                  <div>
                    <div style={{ fontSize:14, fontWeight:500, color:'var(--navy)' }}>{t.id}</div>
                    <div style={{ fontSize:12, color:'var(--text3)' }}>{t.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 1 */}
        {step === 1 && (
          <form id="case-form" onSubmit={handleSubmit(onSubmitDetails)}>
            <h3 style={{ fontSize:16, marginBottom:14 }}>Parties Involved</h3>
            <div style={{ background:'var(--cream)', borderRadius:10, padding:16, marginBottom:14 }}>
              <div style={{ fontSize:13, fontWeight:600, color:'var(--navy)', marginBottom:10 }}>Petitioner (You)</div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input className="form-input" {...register('filerName', { required: true })} placeholder="Your full name" />
                </div>
                <div className="form-group">
                  <label className="form-label">Contact Number</label>
                  <input className="form-input" {...register('filerContact')} placeholder="+91 XXXXX XXXXX" />
                </div>
              </div>
            </div>
            <div style={{ background:'var(--cream)', borderRadius:10, padding:16 }}>
              <div style={{ fontSize:13, fontWeight:600, color:'var(--navy)', marginBottom:10 }}>Respondent</div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Full Name / Organization *</label>
                  <input className="form-input" {...register('respondentName', { required: true })} placeholder="Opposing party name" />
                </div>
                <div className="form-group">
                  <label className="form-label">Contact (if known)</label>
                  <input className="form-input" {...register('respondentContact')} placeholder="+91 XXXXX XXXXX" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Advocate Details (optional)</label>
                <input className="form-input" {...register('lawyerName')} placeholder="Advocate name & bar registration number" />
              </div>
            </div>
          </form>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <form id="case-form" onSubmit={handleSubmit(onSubmitDetails)}>
            <h3 style={{ fontSize:16, marginBottom:14 }}>Case Description</h3>
            <div className="form-group">
              <label className="form-label">Case Title *</label>
              <input className="form-input" {...register('title', { required: 'Title is required' })} placeholder="e.g. Property dispute vs. Ramesh Kumar" />
              {errors.title && <p className="form-error">{errors.title.message}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">Detailed Description *</label>
              <textarea className="form-textarea" style={{ minHeight:130 }}
                {...register('description', { required: 'Description is required' })}
                placeholder="Provide full details — timeline of events, nature of dispute, any previous attempts at resolution..." />
              {errors.description && <p className="form-error">{errors.description.message}</p>}
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Relief Sought</label>
                <input className="form-input" {...register('reliefSought')} placeholder="e.g. Removal of encroachment + ₹50,000 damages" />
              </div>
              <div className="form-group">
                <label className="form-label">Urgency Level</label>
                <select className="form-select" {...register('urgency')}>
                  <option value="Low">Low</option>
                  <option value="Normal" selected>Normal</option>
                  <option value="Urgent">Urgent</option>
                  <option value="Very Urgent">Very Urgent</option>
                </select>
              </div>
            </div>
          </form>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div>
            <h3 style={{ fontSize:16, marginBottom:14 }}>Supporting Documents</h3>
            <div className="upload-zone" onClick={() => document.getElementById('file-inp').click()} style={{ marginBottom:14 }}>
              <div style={{ fontSize:28 }}>📎</div>
              <div style={{ fontSize:14, color:'var(--text3)', marginTop:6 }}>
                <strong style={{ color:'var(--navy)' }}>Click to upload</strong> or drag & drop
              </div>
              <div style={{ fontSize:12, color:'var(--text3)', marginTop:4 }}>PDF, JPG, PNG — max 10MB each</div>
              <input id="file-inp" type="file" multiple accept=".pdf,.jpg,.jpeg,.png"
                style={{ display:'none' }}
                onChange={e => setFiles(Array.from(e.target.files))} />
            </div>
            {files.length > 0 && (
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {files.map((f, i) => (
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', background:'var(--cream)', borderRadius:8 }}>
                    <span style={{ fontSize:18 }}>📄</span>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13, fontWeight:500 }}>{f.name}</div>
                      <div style={{ fontSize:11, color:'var(--text3)' }}>{(f.size / 1024).toFixed(1)} KB</div>
                    </div>
                    <span className="badge badge-active">Ready</span>
                  </div>
                ))}
              </div>
            )}
            <p style={{ fontSize:13, color:'var(--text3)', marginTop:10 }}>You can also upload documents after filing. At least one supporting document is recommended.</p>
          </div>
        )}

        {/* Step 4: Success */}
        {step === 4 && caseData && (
          <div style={{ textAlign:'center', padding:'20px 0' }}>
            <div style={{ fontSize:52, marginBottom:14 }}>⚖️</div>
            <h2 style={{ marginBottom:8 }}>Case Filed Successfully!</h2>
            <div style={{ background:'var(--cream)', borderRadius:12, padding:20, margin:'16px auto', maxWidth:280 }}>
              <div style={{ fontSize:12, color:'var(--text3)', marginBottom:4 }}>Your Case ID</div>
              <div style={{ fontFamily:'var(--font-head)', fontSize:28, color:'var(--navy)', fontWeight:700 }}>Pending Assignment</div>
              <div style={{ fontSize:12, color:'var(--text3)', marginTop:4 }}>Filed · {new Date().toLocaleDateString('en-IN')}</div>
            </div>
            <p style={{ color:'var(--text3)', fontSize:14, marginBottom:20 }}>
              Your case is under review. You'll be notified by email when it's assigned to a judge.
            </p>
            <div style={{ display:'flex', gap:12, justifyContent:'center' }}>
              <button className="btn btn-primary" onClick={() => navigate('/my-cases')}>📁 View My Cases →</button>
              <button className="btn btn-outline" onClick={() => { setStep(0); setCategory(null); setCaseData(null); }}>File Another</button>
            </div>
          </div>
        )}

        {/* Navigation */}
        {step < 4 && (
          <div style={{ display:'flex', justifyContent:'space-between', marginTop:24, paddingTop:16, borderTop:'1px solid var(--cream2)' }}>
            <button className="btn btn-outline" onClick={back} style={{ visibility: step > 0 ? 'visible' : 'hidden' }}>← Back</button>
            {step === 1 || step === 2 ? (
              <button className="btn btn-primary" form="case-form" type="submit">Continue →</button>
            ) : step === 3 ? (
              <button className="btn btn-gold btn-lg" onClick={submitCase} disabled={submitting}>
                {submitting ? <span className="spinner" style={{ width:16, height:16 }} /> : '⚖️ Submit Case →'}
              </button>
            ) : (
              <button className="btn btn-primary" onClick={next} disabled={step === 0 && !category}>
                Continue →
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
