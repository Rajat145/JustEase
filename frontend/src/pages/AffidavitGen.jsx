import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import API from '../utils/api';
import { generateAffidavitPDF } from '../utils/pdfGenerator';

const TEMPLATES = [
  { id:'Name Change',        icon:'📝', desc:'For legally changing your name in records' },
  { id:'Address Proof',      icon:'🏠', desc:'Declaration of current residential address' },
  { id:'General',            icon:'📜', desc:'Custom general purpose affidavit' },
  { id:'Income Declaration', icon:'💰', desc:'Declaration of income / financial status' },
  { id:'Vehicle Transfer',   icon:'🚗', desc:'Vehicle ownership transfer declaration' },
  { id:'Relationship Proof', icon:'👨‍👩‍👧', desc:'Proof of relationship or dependency' },
];

const STEPS = ['Template', 'Your Details', 'Review Content', 'Sign & Finalize', 'Download'];

function StepBar({ current }) {
  return (
    <div className="step-bar" style={{ marginBottom:28 }}>
      {STEPS.map((label, i) => (
        <React.Fragment key={label}>
          <div className={`step-item step-${i < current ? 'done' : i === current ? 'active' : 'idle'}`}>
            <div className="step-circle">
              {i < current ? '✓' : i + 1}
            </div>
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

export default function AffidavitGen() {
  const [step, setStep]             = useState(0);
  const [template, setTemplate]     = useState(null);
  const [affidavit, setAffidavit]   = useState(null);
  const [signature, setSignature]   = useState(false);
  const [saving, setSaving]         = useState(false);
  const { register, handleSubmit, getValues, formState: { errors } } = useForm();

  const next = () => setStep(s => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep(s => Math.max(s - 1, 0));

  const saveAffidavit = async (data) => {
    setSaving(true);
    try {
      const res = await API.post('/affidavits', { ...data, template });
      setAffidavit(res.data.affidavit);
      toast.success('Affidavit saved!');
      next();
    } catch {
      toast.error('Failed to save affidavit.');
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = () => {
    if (affidavit) {
      generateAffidavitPDF(affidavit);
      toast.success('PDF downloaded!');
    }
  };

  return (
    <div className="fade-in-up">
      <div className="page-header">
        <h1>Affidavit Generator ✍️</h1>
        <p>Create legally formatted affidavits in minutes</p>
      </div>

      <div className="disclaimer">
        ⚠️ <div>Generated affidavits must be attested by a Notary Public or First Class Magistrate before official submission.</div>
      </div>

      <div className="card">
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
          <h3>Step-by-step Affidavit Builder</h3>
          <span className="ai-chip">✨ AI-assisted</span>
        </div>

        <StepBar current={step} />

        {/* ── Step 0: Template ── */}
        {step === 0 && (
          <div>
            <h3 style={{ marginBottom:14, fontSize:16 }}>Choose a Template</h3>
            <div className="grid-2" style={{ gap:12 }}>
              {TEMPLATES.map(t => (
                <div key={t.id} onClick={() => setTemplate(t.id)}
                  style={{
                    display:'flex', alignItems:'center', gap:14, padding:14,
                    background: template === t.id ? 'var(--white)' : 'var(--cream)',
                    border: template === t.id ? '2px solid var(--gold)' : '1px solid transparent',
                    borderRadius:10, cursor:'pointer', transition:'all 0.18s',
                  }}>
                  <div style={{ fontSize:26 }}>{t.icon}</div>
                  <div>
                    <div style={{ fontSize:14, fontWeight:500, color:'var(--navy)' }}>{t.id}</div>
                    <div style={{ fontSize:12, color:'var(--text3)' }}>{t.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Step 1: Details ── */}
        {step === 1 && (
          <form id="aff-form" onSubmit={handleSubmit(saveAffidavit)}>
            <h3 style={{ marginBottom:14, fontSize:16 }}>Your Personal Details</h3>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Full Name (as per Aadhaar) *</label>
                <input className="form-input" placeholder="Priya Sharma"
                  {...register('fullName', { required: 'Full name is required' })} />
                {errors.fullName && <p className="form-error">{errors.fullName.message}</p>}
              </div>
              <div className="form-group">
                <label className="form-label">Father's / Spouse's Name</label>
                <input className="form-input" placeholder="Ramesh Sharma" {...register('fathersName')} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Date of Birth</label>
                <input className="form-input" type="date" {...register('dateOfBirth')} />
              </div>
              <div className="form-group">
                <label className="form-label">Aadhaar Number</label>
                <input className="form-input" placeholder="XXXX XXXX XXXX" {...register('aadhaarNumber')} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Current Address *</label>
              <textarea className="form-textarea" placeholder="Full residential address..."
                {...register('address', { required: 'Address is required' })} />
              {errors.address && <p className="form-error">{errors.address.message}</p>}
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">State</label>
                <select className="form-select" {...register('state')}>
                  {['Delhi','Maharashtra','Karnataka','Tamil Nadu','Uttar Pradesh','Gujarat','Rajasthan','West Bengal','Kerala','Telangana','Other'].map(s => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Purpose of Affidavit *</label>
                <input className="form-input" placeholder="Name correction in school records..."
                  {...register('purpose', { required: 'Purpose is required' })} />
                {errors.purpose && <p className="form-error">{errors.purpose.message}</p>}
              </div>
            </div>
            <div style={{ background:'rgba(83,74,183,0.07)', borderRadius:8, padding:12, marginTop:4 }}>
              <span className="ai-chip" style={{ marginBottom:6, display:'inline-flex' }}>✨ AI Suggestion</span>
              <p style={{ fontSize:13, color:'var(--text2)', marginTop:6, lineHeight:1.6 }}>
                Based on your selected template ({template}), I'll generate a standard formatted affidavit including the required Magistrate attestation placeholder and e-stamp section.
              </p>
            </div>
          </form>
        )}

        {/* ── Step 2: Review ── */}
        {step === 2 && affidavit && (
          <div>
            <h3 style={{ marginBottom:14, fontSize:16 }}>Review Affidavit Content</h3>
            <div style={{ background:'var(--cream)', borderRadius:10, padding:24, fontFamily:'Georgia, serif', lineHeight:1.8, color:'var(--text2)', whiteSpace:'pre-wrap', fontSize:14 }}>
              <div style={{ textAlign:'center', marginBottom:16 }}>
                <div style={{ fontFamily:'var(--font-head)', fontSize:18, color:'var(--navy)', fontWeight:700 }}>AFFIDAVIT</div>
                <div style={{ fontSize:12, color:'var(--text3)' }}>{affidavit.template}</div>
              </div>
              {affidavit.content}
              <div style={{ marginTop:24, borderTop:'1px solid var(--cream3)', paddingTop:14, display:'flex', justifyContent:'space-between', alignItems:'flex-end' }}>
                <div>
                  <div style={{ fontSize:12, color:'var(--text3)' }}>Deponent's Signature</div>
                  <div style={{ height:28, borderBottom:'1px solid var(--navy)', width:130, marginTop:8 }} />
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontSize:12, color:'var(--text3)' }}>E-Stamp Placeholder</div>
                  <div style={{ width:80, height:50, border:'1px dashed var(--cream3)', borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, color:'var(--text3)', marginTop:4 }}>Upload<br />E-Stamp</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Step 3: Sign ── */}
        {step === 3 && (
          <div>
            <h3 style={{ marginBottom:14, fontSize:16 }}>E-Signature & Finalize</h3>
            <div className="grid-2">
              <div>
                <div style={{ fontSize:14, fontWeight:500, marginBottom:10 }}>Draw / Click to Sign</div>
                <div style={{
                  background:'var(--white)', border:'1.5px solid var(--cream3)', borderRadius:10,
                  height:120, display:'flex', alignItems:'center', justifyContent:'center',
                  cursor:'pointer', transition:'all 0.2s',
                  color: signature ? 'var(--navy)' : 'var(--text3)',
                  fontFamily: signature ? 'Georgia, serif' : 'inherit',
                  fontSize: signature ? 26 : 14,
                }} onClick={() => setSignature(true)}>
                  {signature ? (affidavit?.ownerName || 'Signed') : 'Click here to sign'}
                </div>
                {signature && <button className="btn btn-sm btn-ghost" style={{ marginTop:6, fontSize:12 }} onClick={() => setSignature(false)}>Clear</button>}
              </div>
              <div>
                <div style={{ fontSize:14, fontWeight:500, marginBottom:10 }}>Upload E-Stamp (Optional)</div>
                <div className="upload-zone" style={{ height:120 }}>
                  <div style={{ fontSize:22 }}>🏷️</div>
                  <div style={{ fontSize:13, color:'var(--text3)', marginTop:4 }}><strong>Upload e-stamp</strong></div>
                  <div style={{ fontSize:11, color:'var(--text3)' }}>Add later if needed</div>
                </div>
              </div>
            </div>
            <div style={{ marginTop:14, background:'rgba(26,107,69,0.08)', borderRadius:8, padding:12, fontSize:13, color:'var(--green)' }}>
              ✅ Once finalized, download your affidavit and get it attested by a Notary or First Class Magistrate.
            </div>
          </div>
        )}

        {/* ── Step 4: Done ── */}
        {step === 4 && (
          <div style={{ textAlign:'center', padding:'20px 0' }}>
            <div style={{ fontSize:52, marginBottom:14 }}>🎉</div>
            <h2 style={{ marginBottom:8 }}>Affidavit Ready!</h2>
            <p style={{ color:'var(--text3)', fontSize:14, marginBottom:24 }}>
              Your affidavit has been generated and saved. Document ID: <strong>{affidavit?.affidavitId}</strong>
            </p>
            <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
              <button className="btn btn-primary btn-lg" onClick={handleDownload}>⬇ Download PDF</button>
              <button className="btn btn-outline btn-lg" onClick={() => { setStep(0); setTemplate(null); setAffidavit(null); setSignature(false); }}>
                + New Affidavit
              </button>
            </div>
            <div style={{ marginTop:14, fontSize:12, color:'var(--text3)' }}>
              Saved on {new Date().toLocaleDateString('en-IN')} · View in My Documents
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        {step < 4 && (
          <div style={{ display:'flex', justifyContent:'space-between', marginTop:24, paddingTop:16, borderTop:'1px solid var(--cream2)' }}>
            <button className="btn btn-outline" onClick={back} style={{ visibility: step > 0 ? 'visible' : 'hidden' }}>← Back</button>
            {step === 1 ? (
              <button className="btn btn-primary" form="aff-form" type="submit" disabled={saving}>
                {saving ? <span className="spinner" style={{ width:16, height:16 }} /> : 'Save & Continue →'}
              </button>
            ) : (
              <button className="btn btn-primary" onClick={next}
                disabled={(step === 0 && !template) || (step === 3 && !signature)}>
                {step === 3 ? 'Finalize →' : 'Next →'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
