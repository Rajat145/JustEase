// import React, { createContext, useContext, useState, useEffect } from 'react';
// import API from '../utils/api';

// const AuthContext = createContext(null);

// export function AuthProvider({ children }) {
//   const [user, setUser]       = useState(null);
//   const [loading, setLoading] = useState(true);

//   // Restore session on mount
//   useEffect(() => {
//     const stored = localStorage.getItem('je_user');
//     const token  = localStorage.getItem('je_token');
//     if (stored && token) {
//       try { setUser(JSON.parse(stored)); } catch {}
//     }
//     setLoading(false);
//   }, []);

//   const login = async (email, password) => {
//     const { data } = await API.post('/auth/login', { email, password });
//     localStorage.setItem('je_token', data.token);
//     localStorage.setItem('je_user', JSON.stringify(data.user));
//     setUser(data.user);
//     return data.user;
//   };

//   const register = async (payload) => {
//     const { data } = await API.post('/auth/register', payload);
//     localStorage.setItem('je_token', data.token);
//     localStorage.setItem('je_user', JSON.stringify(data.user));
//     setUser(data.user);
//     return data.user;
//   };

//   const logout = () => {
//     localStorage.removeItem('je_token');
//     localStorage.removeItem('je_user');
//     setUser(null);
//   };

//   const updateUser = (updated) => {
//     const merged = { ...user, ...updated };
//     localStorage.setItem('je_user', JSON.stringify(merged));
//     setUser(merged);
//   };

//   return (
//     <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export const useAuth = () => {
//   const ctx = useContext(AuthContext);
//   if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
//   return ctx;
// };
import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('je_user');
    const token  = localStorage.getItem('je_token');
    if (stored && token) {
      try { setUser(JSON.parse(stored)); } catch {}
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    // Hits: https://justease-oup9.onrender.com/api/auth/login
    const { data } = await API.post('/auth/login', { email, password });
    localStorage.setItem('je_token', data.token);
    localStorage.setItem('je_user',  JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const register = async (payload) => {
    // Hits: https://justease-oup9.onrender.com/api/auth/register
    const { data } = await API.post('/auth/register', payload);
    localStorage.setItem('je_token', data.token);
    localStorage.setItem('je_user',  JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('je_token');
    localStorage.removeItem('je_user');
    setUser(null);
  };

  const updateUser = (updated) => {
    const merged = { ...user, ...updated };
    localStorage.setItem('je_user', JSON.stringify(merged));
    setUser(merged);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
