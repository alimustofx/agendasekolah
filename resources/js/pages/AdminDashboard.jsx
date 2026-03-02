import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  CalendarDays, Megaphone, Plus, Trash2, Edit, 
  Save, Clock, MapPin, User, Users, ChevronRight, X,
  CheckCircle, AlertCircle, LogOut, ShieldCheck, QrCode, Trophy
} from 'lucide-react';

const AdminDashboard = () => {
  const [agendas, setAgendas] = useState([]);
  const [contextText, setContextText] = useState('');
  const [wakaList, setWakaList] = useState([{ jabatan: '', status: 'Hadir' }]);
  const [piketList, setPiketList] = useState(['', '']); 
  const [prestasiList, setPrestasiList] = useState([{ kategori: '', judul: '' }]); // State Baru untuk Prestasi

  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    start_time: '', end_time: '', audience: '', location: '', officer: '', items: ['']
  });

  const token = localStorage.getItem('admin_token');
  const axiosConfig = { headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' } };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    window.location.href = '/login';
  };

  const fetchData = async () => {
    try {
      const response = await axios.get('/api/public/today');
      setAgendas(response.data.agendas || []);
      const ctx = response.data.context;
      
      if (ctx) {
        setContextText(ctx.description || '');
        
        // Parsing waka_status
        try {
          if (typeof ctx.waka_status === 'string') {
            const parsedWaka = JSON.parse(ctx.waka_status);
            setWakaList(Array.isArray(parsedWaka) ? parsedWaka : [{ jabatan: '', status: 'Hadir' }]);
          } else if (Array.isArray(ctx.waka_status)) {
            setWakaList(ctx.waka_status);
          }
        } catch (e) { setWakaList([{ jabatan: '', status: 'Hadir' }]); }

        // Parsing guru_piket
        try {
          if (typeof ctx.guru_piket === 'string') {
            const parsedPiket = JSON.parse(ctx.guru_piket);
            setPiketList(Array.isArray(parsedPiket) ? parsedPiket : ['', '']);
          } else if (Array.isArray(ctx.guru_piket)) {
            setPiketList(ctx.guru_piket);
          }
        } catch (e) { setPiketList(['', '']); }

        // Parsing prestasi (BARU)
        try {
          if (typeof ctx.prestasi === 'string') {
            const parsedPrestasi = JSON.parse(ctx.prestasi);
            setPrestasiList(Array.isArray(parsedPrestasi) && parsedPrestasi.length > 0 ? parsedPrestasi : [{ kategori: '', judul: '' }]);
          } else if (Array.isArray(ctx.prestasi)) {
            setPrestasiList(ctx.prestasi.length > 0 ? ctx.prestasi : [{ kategori: '', judul: '' }]);
          }
        } catch (e) { setPrestasiList([{ kategori: '', judul: '' }]); }
      }
      setLoading(false);
    } catch (error) {
      console.error("Gagal mengambil data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) window.location.href = '/login';
    else fetchData();
  }, [token]);

  const handleContextSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/admin/context', { 
        description: contextText,
        waka_status: wakaList.filter(w => w.jabatan.trim() !== ''),
        guru_piket: piketList.filter(p => p.trim() !== ''),
        prestasi: prestasiList.filter(p => p.judul.trim() !== '') // Kirim data prestasi
      }, axiosConfig);
      showToast('Kontrol Harian berhasil diperbarui!', 'success');
      fetchData();
    } catch (error) {
      showToast('Gagal memperbarui informasi.', 'error');
    }
  };

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleItemChange = (index, value) => {
    const newItems = [...formData.items];
    newItems[index] = value;
    setFormData({ ...formData, items: newItems });
  };
  const addItemField = () => setFormData({ ...formData, items: [...formData.items, ''] });
  const removeItemField = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems.length ? newItems : [''] });
  };

  const resetForm = () => {
    setFormData({ start_time: '', end_time: '', audience: '', location: '', officer: '', items: [''] });
    setIsEditing(false);
    setEditingId(null);
  };

  const handleEditClick = (agenda) => {
    setFormData({
      start_time: agenda.start_time.substring(0, 5),
      end_time: agenda.end_time ? agenda.end_time.substring(0, 5) : '',
      audience: agenda.audience || '', location: agenda.location || '', officer: agenda.officer || '',
      items: agenda.items.length > 0 ? agenda.items.map(item => item.description) : ['']
    });
    setIsEditing(true);
    setEditingId(agenda.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAgendaSubmit = async (e) => {
    e.preventDefault();
    const cleanedItems = formData.items.filter(item => item.trim() !== '');
    const payload = { ...formData, items: cleanedItems };
    try {
      if (isEditing) {
        await axios.put(`/api/admin/agendas/${editingId}`, payload, axiosConfig);
        showToast('Agenda berhasil diperbarui!', 'success');
      } else {
        await axios.post('/api/admin/agendas', payload, axiosConfig);
        showToast('Agenda baru berhasil ditambahkan!', 'success');
      }
      resetForm();
      fetchData();
    } catch (error) {
      showToast('Terjadi kesalahan saat menyimpan agenda.', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Yakin ingin menghapus agenda ini?')) {
      try {
        await axios.delete(`/api/admin/agendas/${id}`, axiosConfig);
        showToast('Agenda berhasil dihapus!', 'success');
        fetchData();
      } catch (error) {
        showToast('Gagal menghapus agenda.', 'error');
      }
    }
  };

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div></div>;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col relative">
      <style>{`.bg-dot-pattern { background-image: radial-gradient(#cbd5e1 1.5px, transparent 1.5px); background-size: 32px 32px; }`}</style>
      <div className="absolute inset-0 bg-dot-pattern opacity-40 z-0 pointer-events-none fixed"></div>

      <div className={`fixed top-24 right-6 z-[100] transition-all duration-500 transform ${toast.show ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0 pointer-events-none'}`}>
        <div className={`flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border ${toast.type === 'success' ? 'bg-teal-50 border-teal-200 text-teal-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
          {toast.type === 'success' ? <CheckCircle size={20} className="text-teal-500" /> : <AlertCircle size={20} className="text-rose-500" />}
          <span className="font-bold text-sm">{toast.message}</span>
        </div>
      </div>

      <header className="z-[50] w-full px-8 py-4 flex justify-between items-center bg-white/80 backdrop-blur-xl shadow-sm border-b border-slate-200 sticky top-0">
        <div className="flex items-center gap-5">
          <div className="bg-white p-2 rounded-xl shadow-slate-200 shadow-lg border border-slate-100">
            <img src="/logo.png" alt="Logo" className="h-8 w-auto object-contain" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-slate-900 leading-none">Admin Dashboard V2</h1>
            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-1">SMAN 1 Turen System</p>
          </div>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-all font-bold text-xs border border-rose-100 shadow-sm shadow-rose-100">
          <LogOut size={14} /> Keluar
        </button>
      </header>

      <main className="relative z-10 flex-1 w-full max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
          
          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden transition-all hover:shadow-2xl hover:shadow-slate-200/60">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-4 flex items-center gap-3">
              <ShieldCheck className="text-white" size={20} />
              <h2 className="font-bold text-white text-sm uppercase tracking-wider">Kontrol Harian</h2>
            </div>
            <form onSubmit={handleContextSubmit} className="p-5 space-y-5">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Headline Informasi</label>
                <textarea 
                  value={contextText} 
                  onChange={(e) => setContextText(e.target.value)} 
                  placeholder="Ketik informasi penting di sini..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none resize-none h-24 font-medium transition-all" 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Status Pimpinan</label>
                  <div className="space-y-2">
                    {wakaList.map((waka, idx) => (
                      <div key={idx} className="flex flex-col gap-1 p-2 bg-slate-50 rounded-xl border border-slate-100">
                        <input value={waka.jabatan} onChange={(e) => {
                          const next = [...wakaList]; next[idx].jabatan = e.target.value; setWakaList(next);
                        }} placeholder="Jabatan" className="bg-transparent text-[11px] font-bold outline-none border-b border-slate-200 pb-1 focus:border-amber-500" />
                        <div className="flex justify-between items-center mt-1">
                          <select value={waka.status} onChange={(e) => {
                            const next = [...wakaList]; next[idx].status = e.target.value; setWakaList(next);
                          }} className="bg-transparent text-[10px] font-black uppercase text-amber-600 outline-none cursor-pointer">
                            <option value="Hadir">Hadir</option>
                            <option value="Dinas Luar">Dinas Luar</option>
                            <option value="Izin">Izin</option>
                          </select>
                          <button type="button" onClick={() => setWakaList(wakaList.filter((_,i)=>i!==idx))} className="text-slate-300 hover:text-rose-500"><Trash2 size={12}/></button>
                        </div>
                      </div>
                    ))}
                    <button type="button" onClick={() => setWakaList([...wakaList, {jabatan:'', status:'Hadir'}])} className="w-full py-2 border-2 border-dashed border-slate-200 rounded-xl text-[10px] font-black text-slate-400 hover:border-amber-500 hover:text-amber-500 transition-all">+ TAMBAH JABATAN</button>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Petugas Piket</label>
                  <div className="space-y-2">
                    {piketList.map((piket, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-100">
                        <input value={piket} onChange={(e) => {
                          const next = [...piketList]; next[idx] = e.target.value; setPiketList(next);
                        }} placeholder={`Petugas ${idx+1}`} className="flex-1 bg-transparent text-[11px] font-bold outline-none" />
                        <button type="button" onClick={() => setPiketList(piketList.filter((_,i)=>i!==idx))} className="text-slate-300 hover:text-rose-500"><Trash2 size={12}/></button>
                      </div>
                    ))}
                    <button type="button" onClick={() => setPiketList([...piketList, ''])} className="w-full py-2 border-2 border-dashed border-slate-200 rounded-xl text-[10px] font-black text-slate-400 hover:border-amber-500 hover:text-amber-500 transition-all">+ TAMBAH PIKET</button>
                  </div>
                </div>
              </div>

              {/* SECTION PRESTASI (BARU) */}
              <div className="pt-2 border-t border-slate-100">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Trophy size={12} className="text-amber-500" /> Prestasi Siswa (Max 2)
                </label>
                <div className="space-y-3">
                  {prestasiList.map((pres, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                      <div className="flex justify-between items-center">
                        <input 
                          value={pres.kategori} 
                          onChange={(e) => {
                            const next = [...prestasiList]; next[idx].kategori = e.target.value; setPrestasiList(next);
                          }} 
                          placeholder="Contoh: Nasional - IT" 
                          className="bg-transparent text-[10px] font-black uppercase text-blue-600 outline-none w-full border-b border-slate-200 pb-1 focus:border-blue-400" 
                        />
                        <button type="button" onClick={() => setPrestasiList(prestasiList.filter((_,i)=>i!==idx))} className="text-slate-300 hover:text-rose-500 ml-2"><Trash2 size={12}/></button>
                      </div>
                      <input 
                        value={pres.judul} 
                        onChange={(e) => {
                          const next = [...prestasiList]; next[idx].judul = e.target.value; setPrestasiList(next);
                        }} 
                        placeholder="Juara 1 Lomba..." 
                        className="bg-transparent text-[11px] font-bold text-slate-800 outline-none w-full" 
                      />
                    </div>
                  ))}
                  {prestasiList.length < 2 && (
                    <button type="button" onClick={() => setPrestasiList([...prestasiList, {kategori:'', judul:''}])} className="w-full py-2 border-2 border-dashed border-slate-200 rounded-xl text-[10px] font-black text-slate-400 hover:border-blue-500 hover:text-blue-500 transition-all">+ TAMBAH PRESTASI</button>
                  )}
                </div>
              </div>

              <button type="submit" className="w-full bg-slate-900 hover:bg-black text-white font-black py-3.5 rounded-2xl transition-all flex items-center justify-center gap-3 text-xs tracking-widest shadow-lg shadow-slate-200">
                <Save size={16} /> SIMPAN KONTROL HARIAN
              </button>
            </form>
          </div>

          <div className={`bg-white rounded-3xl shadow-xl border-2 transition-all duration-500 overflow-hidden ${isEditing ? 'border-blue-500 shadow-blue-100' : 'border-transparent shadow-slate-200/50'}`}>
            <div className={`p-4 flex items-center justify-between ${isEditing ? 'bg-blue-500 text-white' : 'bg-slate-900 text-white'}`}>
              <h2 className="font-bold text-xs uppercase tracking-widest flex items-center gap-2"> 
                {isEditing ? <Edit size={16}/> : <Plus size={16}/>} 
                {isEditing ? 'Mode Edit Agenda' : 'Tambah Agenda Baru'}
              </h2>
              {isEditing && <button onClick={resetForm} className="hover:rotate-90 transition-transform"><X size={18}/></button>}
            </div>
            <form onSubmit={handleAgendaSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-slate-400 ml-1">MULAI</span>
                  <input type="time" name="start_time" required value={formData.start_time} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-500/10 outline-none focus:border-blue-500" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-slate-400 ml-1">SELESAI</span>
                  <input type="time" name="end_time" value={formData.end_time} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-500/10 outline-none focus:border-blue-500" />
                </div>
              </div>
              <div className="space-y-1">
                  <span className="text-[10px] font-black text-slate-400 ml-1">SASARAN / AUDIENCE</span>
                  <input type="text" name="audience" placeholder="Contoh: Seluruh Siswa Kelas X" value={formData.audience} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-500/10 outline-none focus:border-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-slate-400 ml-1">LOKASI</span>
                  <input type="text" name="location" placeholder="Aula Utama" value={formData.location} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-500/10 outline-none focus:border-blue-500" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-slate-400 ml-1">PEMBINA / PETUGAS</span>
                  <input type="text" name="officer" placeholder="Nama Guru" value={formData.officer} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-500/10 outline-none focus:border-blue-500" />
                </div>
              </div>
              <div className="space-y-3">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Detail Kegiatan</label>
                {formData.items.map((item, index) => (
                  <div key={index} className="flex gap-2 group">
                    <input type="text" required value={item} onChange={(e) => handleItemChange(index, e.target.value)} placeholder={`Poin kegiatan ${index + 1}...`} className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-blue-500/10 outline-none focus:border-blue-500 transition-all" />
                    <button type="button" onClick={() => removeItemField(index)} className="p-3 text-slate-300 hover:text-rose-500 transition-colors"><Trash2 size={16} /></button>
                  </div>
                ))}
                <button type="button" onClick={addItemField} className="text-[10px] font-black text-blue-600 px-4 py-2 bg-blue-50 rounded-xl hover:bg-blue-100 transition-all tracking-widest">+ TAMBAH POIN KEGIATAN</button>
              </div>
              <button type="submit" className={`w-full py-4 rounded-2xl font-black text-xs tracking-[0.2em] text-white transition-all shadow-lg ${isEditing ? 'bg-blue-600 shadow-blue-200 hover:bg-blue-700' : 'bg-slate-900 shadow-slate-200 hover:bg-black'}`}>
                {isEditing ? 'UPDATE PERUBAHAN' : 'PUBLIKASIKAN AGENDA'}
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-100 p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white rounded-2xl shadow-sm text-blue-600">
                    <CalendarDays size={24} />
                </div>
                <div>
                    <h2 className="font-black text-lg text-slate-900 tracking-tight">Agenda Terjadwal</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hari Ini</p>
                </div>
              </div>
              <span className="bg-blue-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black shadow-lg shadow-blue-100 uppercase tracking-widest">
                {agendas.length} Agenda
              </span>
            </div>
            
            <div className="p-6 flex flex-col gap-6">
              {agendas.length === 0 ? (
                <div className="py-20 text-center space-y-4">
                    <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto text-slate-200">
                        <CalendarDays size={40} />
                    </div>
                    <p className="text-slate-400 font-bold text-sm tracking-wide">Belum ada agenda untuk hari ini.</p>
                </div>
              ) : agendas.map(agenda => (
                <div key={agenda.id} className="group relative bg-white border border-slate-100 rounded-3xl p-6 transition-all hover:border-blue-200 hover:shadow-2xl hover:shadow-slate-200/50">
                  <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                    <button onClick={() => handleEditClick(agenda)} className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"><Edit size={16} /></button>
                    <button onClick={() => handleDelete(agenda.id)} className="p-2.5 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-sm"><Trash2 size={16} /></button>
                  </div>

                  <div className="flex gap-6 flex-col md:flex-row">
                    <div className="md:w-32 shrink-0 space-y-1">
                      <div className="text-3xl font-black text-slate-900 tracking-tighter">
                        {agenda.start_time.substring(0,5)}
                      </div>
                      {agenda.end_time && (
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          s/d {agenda.end_time.substring(0,5)}
                        </div>
                      )}
                      <div className="pt-3">
                         <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[9px] font-black rounded-lg uppercase tracking-tighter border border-blue-100">
                            {agenda.audience || 'Umum'}
                         </span>
                      </div>
                    </div>

                    <div className="flex-1 space-y-4">
                      <ul className="space-y-3">
                        {agenda.items.map(item => (
                          <li key={item.id} className="flex items-start gap-3 group/item">
                            <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 group-hover/item:scale-150 transition-transform shadow-lg shadow-blue-200" />
                            <span className="font-bold text-slate-700 text-sm leading-relaxed">{item.description}</span>
                          </li>
                        ))}
                      </ul>
                      
                      <div className="flex flex-wrap gap-6 text-[10px] font-black uppercase text-slate-400 tracking-widest border-t border-slate-50 pt-4">
                        {agenda.location && (
                            <span className="flex items-center gap-2 hover:text-blue-600 transition-colors">
                                <MapPin size={12} className="text-amber-500"/> {agenda.location}
                            </span>
                        )}
                        {agenda.officer && (
                            <span className="flex items-center gap-2 hover:text-blue-600 transition-colors">
                                <User size={12} className="text-indigo-500"/> {agenda.officer}
                            </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 bg-slate-900 rounded-[2rem] p-8 text-white flex flex-col md:flex-row items-center gap-8 border border-slate-800">
             <div className="bg-white p-4 rounded-[2rem] shadow-2xl">
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=https://wa.me/6282264928953`} alt="QR" className="w-24 h-24" />
             </div>
             <div className="text-center md:text-left space-y-2">
                <h3 className="font-black text-xl tracking-tight">Butuh Bantuan Teknis?</h3>
                <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-sm">Scan QR Code ini untuk terhubung dengan Developer Sistem jika ada kendala pada monitor TV atau sinkronisasi data.</p>
                <div className="pt-2 flex flex-wrap justify-center md:justify-start gap-4">
                    <div className="flex items-center gap-2 text-[10px] font-black tracking-widest text-blue-400 uppercase">
                        <QrCode size={14} /> WhatsApp Support
                    </div>
                </div>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;