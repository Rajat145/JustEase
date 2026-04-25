import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { register: authRegister } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await authRegister(data);
      toast.success('Account created! Welcome to JustEase.');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--cream)', padding:20 }}>
      <div style={{ width:'100%', maxWidth:500, background:'var(--white)', borderRadius:16, padding:40, boxShadow:'var(--shadow-md)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:28 }}>
          <div style={{ width:38, height:38, background:'var(--gold)', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>⚖️</div>
          <div style={{ fontFamily:'var(--font-head)', fontSize:22, color:'var(--navy)', fontWeight:700 }}>
            Just<span style={{ color:'var(--gold)' }}>Ease</span>
          </div>
        </div>

        <h2 style={{ fontFamily:'var(--font-head)', fontSize:26, marginBottom:4 }}>Create Account</h2>
        <p style={{ color:'var(--text3)', fontSize:14, marginBottom:24 }}>Join JustEase — start filing cases and generating documents today.</p>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input className="form-input" placeholder="Your full name"
                {...register('name', { required: 'Name is required' })} />
              {errors.name && <p className="form-error">{errors.name.message}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">Register as *</label>
              <select className="form-select" {...register('role')}>
                <option value="user">Case Filer (User)</option>
                <option value="judge">Judge / Legal Authority</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <input className="form-input" type="email" placeholder="you@example.com"
              {...register('email', { required: 'Email is required', pattern: { value:/^\S+@\S+\.\S+$/, message:'Valid email required' } })} />
            {errors.email && <p className="form-error">{errors.email.message}</p>}
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Password *</label>
              <input className="form-input" type="password" placeholder="Min. 6 characters"
                {...register('password', { required: 'Password required', minLength: { value:6, message:'Min 6 characters' } })} />
              {errors.password && <p className="form-error">{errors.password.message}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">Phone (optional)</label>
              <input className="form-input" placeholder="+91 XXXXX XXXXX" {...register('phone')} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Address (optional)</label>
            <input className="form-input" placeholder="Your residential address" {...register('address')} />
          </div>

          <button type="submit" className="btn btn-primary btn-lg" style={{ width:'100%', marginTop:8 }} disabled={loading}>
            {loading ? <span className="spinner" style={{ width:16, height:16 }} /> : 'Create Account →'}
          </button>
        </form>

        <p style={{ textAlign:'center', marginTop:18, fontSize:14, color:'var(--text3)' }}>
          Already have an account? <Link to="/login" style={{ color:'var(--gold)', fontWeight:500 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
