import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Lock, User, ArrowRight, ShieldCheck } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Menggunakan useNavigate dari React Router untuk transisi halaman yang halus (SPA)
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Pastikan endpoint ini sesuai dengan backend Anda
      const response = await axios.post('/api/login', {
        email: email,
        password: password
      });

      // Simpan token otentikasi ke penyimpanan browser (localStorage)
      if (response.data && response.data.token) {
        localStorage.setItem('admin_token', response.data.token);
        
        // Navigasi mulus ke halaman admin
        navigate('/admin'); 
      } else {
        setError('Respons server tidak valid. Token tidak ditemukan.');
      }
    } catch (err) {
      // Tangkap pesan error dari backend, atau gunakan pesan default
      setError(err.response?.data?.message || 'Email atau password salah! Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center relative overflow-hidden font-sans">
      
      {/* Background Pattern: Dot Matrix Premium */}
      <style>{`
        .bg-dot-pattern {
          background-image: radial-gradient(#cbd5e1 1.5px, transparent 1.5px);
          background-size: 32px 32px;
        }
      `}</style>
      <div className="absolute inset-0 bg-dot-pattern opacity-60 z-0 pointer-events-none"></div>

      {/* Card Login Utama */}
      <div className="relative z-10 w-full max-w-md px-6 animate-[slideUpFade_0.5s_ease-out]">
        <div className="bg-white rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.08)] border border-slate-100 overflow-hidden">
          
          {/* Header Card (Warna Biru SMANERE) */}
          <div className="bg-blue-600 p-8 text-center relative overflow-hidden">
            {/* Tekstur halus di bagian biru */}
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
            
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center mb-4 p-2">
                <img src="/logo.png" alt="Logo SMANERE" className="w-full h-full object-contain" />
              </div>
              <h1 className="text-2xl font-black text-white tracking-tight">Admin Portal</h1>
              <p className="text-blue-200 text-xs font-bold mt-1 uppercase tracking-widest">
                Digital Signage SMANERE
              </p>
            </div>
          </div>

          {/* Form Login */}
          <div className="p-8">
            
            {/* Peringatan Error (Akan muncul jika gagal login) */}
            {error && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-sm font-bold flex items-center gap-3 animate-pulse">
                <ShieldCheck size={20} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              
              {/* Input Email */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
                  Email / Username
                </label>
                <div className="relative">
                  <User size={18} className="absolute left-4 top-3.5 text-slate-400" />
                  <input 
                    type="email" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                    placeholder="admin@email.id"
                  />
                </div>
              </div>

              {/* Input Password */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <Lock size={18} className="absolute left-4 top-3.5 text-slate-400" />
                  <input 
                    type="password" 
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {/* Tombol Submit */}
              <button 
                type="submit" 
                disabled={loading}
                className="w-full mt-2 bg-slate-900 hover:bg-blue-600 text-white font-bold py-3.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-md disabled:opacity-70 disabled:cursor-not-allowed group"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Memverifikasi...
                  </>
                ) : (
                  <>
                    Masuk ke Sistem
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
        
        {/* Footer Text */}
        <p className="text-center text-slate-400 text-xs font-bold mt-8 tracking-wider uppercase">
          &copy; 2026 Pengumuman Digital SMAN 1 Turen
        </p>
      </div>
    </div>
  );
};

export default Login;