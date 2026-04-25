import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const DEMO = {
  admin: { email: 'admin@justease.in', password: 'Admin@123' },
  judge: { email: 'judge@justease.in', password: 'Judge@123' },
  user:  { email: 'user@justease.in',  password: 'User@123'  },
};

export default function LoginPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, setValue, formState: { errors } } = useForm();

  const fillDemo = (role) => {
    setValue('email',    DEMO[role].email);
    setValue('password', DEMO[role].password);
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await login(data.email, data.password);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'var(--navy)' }}>
      {/* Left panel */}
      <div style={{
        flex:1, padding:'60px', display:'flex', flexDirection:'column',
        justifyContent:'space-between', position:'relative', overflow:'hidden',
      }}>
        <div style={{
          position:'absolute', top:-100, right:-100, width:400, height:400,
          border:'1px solid rgba(201,168,76,0.15)', borderRadius:'50%', pointerEvents:'none',
        }} />
        <div style={{
          position:'absolute', bottom:-150, left:-80, width:350, height:350,
          border:'1px solid rgba(201,168,76,0.1)', borderRadius:'50%', pointerEvents:'none',
        }} />

        <div style={{ position:'relative', zIndex:1 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:40 }}>
            <div style={{ width:44, height:44, background:'var(--gold)', borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center', fontSize:24 }}>⚖️</div>
            <div style={{ fontFamily:'var(--font-head)', fontSize:26, color:'#fff', fontWeight:700 }}>
              Just<span style={{ color:'var(--gold)' }}>Ease</span>
            </div>
          </div>
          <h1 style={{ fontFamily:'var(--font-head)', fontSize:40, color:'#fff', lineHeight:1.2, marginBottom:16, fontWeight:700 }}>
            Legal Processes,<br /><span style={{ color:'var(--gold2)' }}>Simplified.</span>
          </h1>
          <p style={{ color:'rgba(255,255,255,0.55)', fontSize:15, lineHeight:1.7, maxWidth:380 }}>
            India's trusted platform for digital legal assistance — generate affidavits, file cases, and track hearings from one dashboard.
          </p>
        </div>

        <div style={{ position:'relative', zIndex:1, display:'flex', flexDirection:'column', gap:10 }}>
          {[
            '✨ AI-powered affidavit generation',
            '📁 Case filing & real-time tracking',
            '📅 Hearing scheduling & notifications',
            '🌐 Multilingual — English & हिंदी',
          ].map(f => (
            <div key={f} style={{ display:'flex', alignItems:'center', gap:10, color:'rgba(255,255,255,0.65)', fontSize:14 }}>
              <div style={{ width:6, height:6, background:'var(--gold)', borderRadius:'50%', flexShrink:0 }} />
              {f}
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — Login form */}
      <div style={{
        width:480, background:'var(--white)', display:'flex',
        alignItems:'center', justifyContent:'center', padding:40,
      }}>
        <div style={{ width:'100%', maxWidth:380 }}>
          {/* Demo quick-fill */}
          <div style={{ background:'var(--cream)', borderRadius:10, padding:14, marginBottom:24 }}>
            <p style={{ fontSize:12, color:'var(--text3)', fontWeight:600, marginBottom:8 }}>🎭 DEMO — Click to auto-fill</p>
            <div style={{ display:'flex', gap:6 }}>
              {['admin','judge','user'].map(r => (
                <button key={r} onClick={() => fillDemo(r)} style={{
                  padding:'5px 12px', background:'var(--white)', border:'1px solid var(--cream3)',
                  borderRadius:6, fontSize:12, cursor:'pointer', color:'var(--text2)',
                  fontFamily:'var(--font-body)', transition:'all 0.15s',
                }}
                  onMouseEnter={e => { e.target.style.background='var(--navy)'; e.target.style.color='#fff'; }}
                  onMouseLeave={e => { e.target.style.background='var(--white)'; e.target.style.color='var(--text2)'; }}
                >
                  {r === 'admin' ? '👑 Admin' : r === 'judge' ? '⚖️ Judge' : '📋 User'}
                </button>
              ))}
            </div>
          </div>

          <h2 style={{ fontFamily:'var(--font-head)', fontSize:28, color:'var(--navy)', marginBottom:4 }}>Welcome back</h2>
          <p style={{ color:'var(--text3)', fontSize:14, marginBottom:28 }}>Sign in to your JustEase account</p>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="form-group">
              <label className="form-label">Email address</label>
              <input className="form-input" type="email" placeholder="you@example.com"
                {...register('email', { required: 'Email is required' })} />
              {errors.email && <p className="form-error">{errors.email.message}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" type="password" placeholder="••••••••"
                {...register('password', { required: 'Password is required' })} />
              {errors.password && <p className="form-error">{errors.password.message}</p>}
            </div>
            <button type="submit" className="btn btn-primary btn-lg" style={{ width:'100%', marginTop:8 }} disabled={loading}>
              {loading ? <span className="spinner" style={{ width:16, height:16 }} /> : 'Sign In →'}
            </button>
          </form>

          <p style={{ textAlign:'center', marginTop:20, fontSize:14, color:'var(--text3)' }}>
            Don't have an account? <Link to="/register" style={{ color:'var(--gold)', fontWeight:500 }}>Create one free</Link>
          </p>

          <div style={{ marginTop:24, padding:12, background:'rgba(201,168,76,0.08)', borderRadius:8 }}>
            <p style={{ fontSize:11, color:'#8B6914', textAlign:'center', lineHeight:1.5 }}>
              ⚠️ JustEase is a legal assistance platform, not an official government court system.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
