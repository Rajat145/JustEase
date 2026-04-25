import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV = {
  admin: [
    { to: '/dashboard',  icon: '📊', label: 'Dashboard' },
    { to: '/cases',      icon: '📁', label: 'All Cases' },
    { to: '/assign',     icon: '⚖️', label: 'Case Assignment' },
    { to: '/users',      icon: '👥', label: 'User Management' },
    { to: '/hearings',   icon: '📅', label: 'Hearings' },
    { to: '/documents',  icon: '📄', label: 'Documents' },
    { to: '/analytics',  icon: '📈', label: 'Analytics' },
    { to: '/chat',       icon: '💬', label: 'Legal Assistant' },
  ],
  judge: [
    { to: '/dashboard',       icon: '📊', label: 'My Dashboard' },
    { to: '/assigned-cases',  icon: '📁', label: 'Assigned Cases' },
    { to: '/hearings',        icon: '📅', label: 'Hearing Schedule' },
    { to: '/documents',       icon: '📄', label: 'Documents' },
    { to: '/chat',            icon: '💬', label: 'Legal Assistant' },
  ],
  user: [
    { to: '/dashboard',  icon: '📊', label: 'My Dashboard' },
    { to: '/affidavit',  icon: '✍️',  label: 'Affidavit Generator' },
    { to: '/file-case',  icon: '📝', label: 'File a Case' },
    { to: '/my-cases',   icon: '📁', label: 'My Cases' },
    { to: '/hearings',   icon: '📅', label: 'My Hearings' },
    { to: '/documents',  icon: '📄', label: 'My Documents' },
    { to: '/chat',       icon: '💬', label: 'Legal Assistant' },
  ],
};

export default function AppShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [lang, setLang] = useState('EN');

  const navLinks = NAV[user?.role] || [];
  const initials = user?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const roleLabel = { admin: 'Administrator', judge: 'Legal Authority', user: 'Case Filer' }[user?.role];

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)}
          style={{ position:'fixed',inset:0,background:'rgba(11,31,58,0.4)',zIndex:99,display:'none' }}
          className="mobile-overlay"
        />
      )}

      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside style={{
        width: 'var(--sidebar)', background: 'var(--navy)', display: 'flex',
        flexDirection: 'column', position: 'fixed', top: 0, left: 0,
        height: '100vh', zIndex: 100, flexShrink: 0,
      }}>
        {/* Logo */}
        <div style={{ padding: '22px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)', display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:38, height:38, background:'var(--gold)', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>⚖️</div>
          <div style={{ fontFamily:'var(--font-head)', fontSize:22, color:'#fff', fontWeight:700 }}>
            Just<span style={{ color:'var(--gold)' }}>Ease</span>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex:1, padding:'12px 0', overflowY:'auto' }}>
          {navLinks.map(({ to, icon, label }) => (
            <NavLink key={to} to={to} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 20px', color: isActive ? 'var(--gold2)' : 'rgba(255,255,255,0.6)',
              fontSize: 14, textDecoration: 'none',
              background: isActive ? 'rgba(201,168,76,0.1)' : 'transparent',
              borderLeft: isActive ? '3px solid var(--gold)' : '3px solid transparent',
              transition: 'all 0.18s',
            })}>
              <span style={{ fontSize: 16, width: 20, textAlign: 'center' }}>{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div style={{ padding: '14px 18px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10, cursor:'pointer' }}
            onClick={() => navigate('/profile')}>
            <div style={{
              width:36, height:36, borderRadius:'50%', background:'var(--gold)',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontWeight:600, fontSize:13, color:'var(--navy)', flexShrink:0,
            }}>{initials}</div>
            <div>
              <div style={{ fontSize:13, fontWeight:500, color:'#fff' }}>{user?.name}</div>
              <div style={{ fontSize:11, color:'var(--gold2)' }}>{roleLabel}</div>
            </div>
          </div>
          <button onClick={handleLogout} style={{
            width:'100%', padding:'8px', background:'rgba(255,255,255,0.06)',
            border:'1px solid rgba(255,255,255,0.1)', borderRadius:7,
            color:'rgba(255,255,255,0.5)', fontSize:13, transition:'all 0.18s',
          }}
            onMouseEnter={e => { e.target.style.background='rgba(255,255,255,0.12)'; e.target.style.color='#fff'; }}
            onMouseLeave={e => { e.target.style.background='rgba(255,255,255,0.06)'; e.target.style.color='rgba(255,255,255,0.5)'; }}
          >Sign Out</button>
        </div>
      </aside>

      {/* ── Main ────────────────────────────────────────────── */}
      <div style={{ marginLeft: 'var(--sidebar)', flex: 1, display:'flex', flexDirection:'column', minHeight:'100vh' }}>
        {/* Topbar */}
        <header style={{
          background: 'var(--white)', borderBottom: '1px solid var(--cream2)',
          height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 32px', position: 'sticky', top: 0, zIndex: 50,
        }}>
          <div /> {/* Breadcrumb could go here */}
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            {/* Language toggle */}
            <div style={{ display:'flex', background:'var(--cream)', borderRadius:8, padding:3, gap:2 }}>
              {['EN', 'हि'].map(l => (
                <button key={l} onClick={() => setLang(l)} style={{
                  padding:'4px 12px', borderRadius:6, border:'none', fontSize:12, fontWeight:500,
                  cursor:'pointer', background: lang===l ? 'var(--white)' : 'transparent',
                  color: lang===l ? 'var(--navy)' : 'var(--text3)',
                  boxShadow: lang===l ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                  transition:'all 0.15s',
                }}>{l}</button>
              ))}
            </div>
            {/* Notification bell */}
            <button style={{
              width:38, height:38, borderRadius:8, background:'var(--cream)',
              border:'none', fontSize:17, display:'flex', alignItems:'center',
              justifyContent:'center', position:'relative',
            }}>
              🔔
              <span style={{
                position:'absolute', top:6, right:6, width:8, height:8,
                background:'var(--red)', borderRadius:'50%', border:'2px solid var(--white)',
              }} />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main style={{ padding: '28px 32px', flex: 1 }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
