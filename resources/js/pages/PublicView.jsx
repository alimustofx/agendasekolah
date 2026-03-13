import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  MapPin, User, CalendarDays, 
  Instagram, Globe, QrCode, Trophy, Award, MessageCircle
} from 'lucide-react';

const TikTokIcon = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);

const PublicView = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [agendas, setAgendas] = useState([]);
  const [context, setContext] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [wakaData, setWakaData] = useState([]);
  const [guruPiket, setGuruPiket] = useState([]);
  const [prestasiData, setPrestasiData] = useState([]); 

  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 3;
  const slideInterval = 10000;

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/api/public/today');
        const data = response.data;
        setAgendas(Array.isArray(data.agendas) ? data.agendas : []);
        const ctx = data.context;
        if (ctx) {
          setContext(ctx);
          try {
            setWakaData(Array.isArray(ctx.waka_status) ? ctx.waka_status : JSON.parse(ctx.waka_status || '[]'));
            setGuruPiket(Array.isArray(ctx.guru_piket) ? ctx.guru_piket : JSON.parse(ctx.guru_piket || '[]'));
            const rawPrestasi = Array.isArray(ctx.prestasi) ? ctx.prestasi : JSON.parse(ctx.prestasi || '[]');
            setPrestasiData(rawPrestasi);
          } catch (e) { console.error("Parsing error:", e); }
        }
        setLoading(false);
      } catch (error) { 
        console.error("Fetch error:", error);
        setLoading(false); 
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);

  const totalPages = Math.ceil(agendas.length / itemsPerPage);
  useEffect(() => {
    const sliderTimer = setInterval(() => {
      setCurrentPage((prev) => (totalPages > 1 ? (prev + 1) : 0) % (totalPages || 1));
    }, slideInterval);
    return () => clearInterval(sliderTimer);
  }, [totalPages]);

  const getAgendaStatus = (start, end) => {
    const now = currentTime.getHours() * 60 + currentTime.getMinutes();
    const [sH, sM] = start.split(':').map(Number);
    const startTime = sH * 60 + sM;
    let endTime = end ? (end.split(':').map(Number)[0] * 60 + end.split(':').map(Number)[1]) : startTime + 60;

    if (now < startTime) return { label: 'Akan Datang', color: 'bg-blue-600 text-white', border: 'border-blue-600' };
    if (end && now > endTime) return { label: 'Selesai', color: 'bg-green-600 text-white', border: 'border-green-600' };
    if (now >= startTime && (now <= endTime || !end)) return { label: 'Sedang Berlangsung', color: 'bg-red-600 text-white animate-pulse', border: 'border-red-600' };
    return { label: 'Selesai', color: 'bg-green-600 text-white', border: 'border-green-600' };
  };

  const timeString = currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  const secondsString = currentTime.toLocaleTimeString('id-ID', { second: '2-digit' });
  const dateString = currentTime.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const currentAgendas = agendas.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

  if (loading) return <div className="h-screen bg-slate-900 flex items-center justify-center text-white font-black uppercase italic tracking-[1em]">Menghubungkan Database...</div>;

  return (
    <div className="h-screen w-screen bg-slate-100 font-sans text-slate-800 flex flex-col overflow-hidden relative">
      <style>{`
        .bg-dot-pattern { background-image: radial-gradient(#cbd5e1 1.5px, transparent 1.5px); background-size: 30px 30px; }
        @keyframes marquee { 0% { transform: translateX(100vw); } 100% { transform: translateX(-100%); } }
        .animate-marquee { display: inline-block; white-space: nowrap; animation: marquee 40s linear infinite; }
        
        @keyframes scroll-v {
          0%, 15% { transform: translateY(0); }
          85%, 100% { transform: translateY(calc(-100% + 70px)); }
        }
        .animate-scroll-v { animation: scroll-v 8s ease-in-out infinite alternate; }

        @keyframes seamless-up {
          from { transform: translateY(0); }
          to { transform: translateY(-50%); }
        }
        .animate-prestasi-fixed { 
          animation: seamless-up 25s linear infinite; 
          will-change: transform;
        }
      `}</style>

      <div className="absolute inset-0 bg-dot-pattern opacity-30 pointer-events-none"></div>

      <header className="relative z-10 h-[14vh] px-10 flex justify-between items-center bg-white shadow-md border-b-4 border-blue-600 shrink-0">
        <div className="flex items-center gap-6">
          <img src="/logo.png" alt="Logo" className="h-16 w-auto" />
          <div>
            <h1 className="text-5xl font-black text-slate-900 uppercase leading-none tracking-tighter">SMA Negeri 1 Turen</h1>
            <p className="text-blue-600 font-bold tracking-[0.4em] text-[10px] mt-1 uppercase italic">Informasi Digital Terpadu</p>
          </div>
        </div>
        
        <div className="flex flex-col items-end bg-slate-900 text-white px-8 py-3 pt-5 rounded-2xl shadow-lg border-b-4 border-blue-600">
          <div className="flex items-baseline gap-1">
            <span className="text-5xl font-black tracking-tighter leading-none">{timeString}</span>
            <span className="text-xl font-bold text-blue-400">.{secondsString}</span>
          </div>
          <div className="text-[9px] font-black tracking-widest uppercase opacity-50 mt-1">{dateString}</div>
        </div>
      </header>

      <main className="relative z-10 h-[78vh] p-6 grid grid-cols-12 gap-6 overflow-hidden">
        <div className="col-span-7 flex flex-col gap-4 min-h-0">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-2xl font-black text-slate-900 uppercase flex items-center gap-2">
              <CalendarDays className="text-blue-600" size={28} /> Agenda Hari Ini
            </h2>
            {totalPages > 1 && (
              <div className="flex gap-2 bg-slate-200/50 p-1.5 rounded-full px-3">
                {[...Array(totalPages)].map((_, i) => (
                  <div key={i} className={`h-2 rounded-full transition-all duration-500 ${currentPage === i ? 'w-8 bg-blue-600' : 'w-2 bg-slate-300'}`} />
                ))}
              </div>
            )}
          </div>

          <div className="flex-1 grid grid-rows-3 gap-4 min-h-0">
            {currentAgendas.map((agenda) => {
              const status = getAgendaStatus(agenda.start_time, agenda.end_time);
              const isFinished = status.label === 'Selesai';
              return (
                <div key={agenda.id} className={`flex bg-white rounded-3xl overflow-hidden border-l-[16px] ${status.border} shadow-xl transition-all duration-500 ${isFinished ? 'opacity-70' : 'scale-[1.01]'}`}>
                  <div className={`w-36 flex flex-col items-center justify-center border-r shrink-0 ${isFinished ? 'bg-slate-100' : 'bg-slate-900 text-white'}`}>
                    <span className="text-4xl font-black">{(agenda.start_time || "00:00").substring(0, 5)}</span>
                    <div className={`w-8 h-[2px] my-1 ${isFinished ? 'bg-slate-300' : 'bg-blue-500'}`}></div>
                    <span className="text-xs font-bold uppercase">{agenda.end_time ? agenda.end_time.substring(0, 5) : "Selesai"}</span>
                  </div>
                  <div className="flex-1 p-6 flex flex-col justify-center overflow-hidden">
                      <div className="flex justify-between items-start mb-1">
                        {/* BAGIAN YANG DIRUBAH: Audience lebih besar dan berwarna merah */}
                        <span className={`px-4 py-1.5 rounded-full text-[12px] font-black uppercase tracking-widest shadow-sm ${isFinished ? 'bg-slate-200 text-slate-500' : 'bg-red-600 text-white'}`}>
                          {agenda.audience || 'Umum'}
                        </span>
                        <span className={`px-4 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter shadow-sm ${status.color}`}>{status.label}</span>
                      </div>
                      <h3 className="text-2xl font-black uppercase leading-[1.1] tracking-tight whitespace-normal break-words text-slate-800">
                        {agenda.items?.[0]?.description}
                      </h3>
                      <div className="flex gap-8 mt-2 text-xs font-bold text-slate-500 uppercase italic">
                        <span className="flex items-center gap-2"><MapPin size={18} className="text-amber-500" /> {agenda.location}</span>
                        <span className="flex items-center gap-2"><User size={18} className="text-indigo-500" /> {agenda.officer || '-'}</span>
                      </div>
                  </div>
                </div>
              );
            })}
            {[...Array(Math.max(0, itemsPerPage - currentAgendas.length))].map((_, i) => (
              <div key={`empty-${i}`} className="opacity-0 h-full"></div>
            ))}
          </div>
        </div>

        <div className="col-span-5 flex flex-col gap-6 min-h-0">
          <div className="flex-1 bg-gradient-to-br from-indigo-800 via-blue-900 to-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden flex flex-col">
            <Trophy className="absolute -right-10 -bottom-10 w-64 h-64 opacity-10 rotate-12 text-amber-400" />
            <div className="relative z-10 flex flex-col h-full">
                <h3 className="font-black text-2xl uppercase tracking-tighter flex items-center gap-3 text-amber-400 mb-6"><Award size={40} /> Prestasi Smanere</h3>
                <div className="flex-1 overflow-hidden relative">
                    <div className={`flex flex-col gap-4 ${prestasiData.length > 2 ? 'animate-prestasi-fixed' : ''}`}>
                      {(prestasiData.length > 2 ? [...prestasiData, ...prestasiData] : prestasiData).map((item, i) => (
                        <div key={`${item.id || i}-${i}`} className={`bg-white/10 backdrop-blur-md border-l-4 ${i % prestasiData.length % 2 === 0 ? 'border-amber-400' : 'border-blue-400'} p-5 rounded-2xl shadow-lg shrink-0`}>
                            <p className="text-amber-400 text-[10px] font-black uppercase tracking-[0.3em] mb-1">{item.kategori}</p>
                            <h4 className="font-black text-lg leading-tight uppercase italic">🏆 {item.judul}</h4>
                        </div>
                      ))}
                    </div>
                </div>
            </div>
          </div>

          <div className="h-[260px] grid grid-cols-2 gap-4 shrink-0">
            <div className="bg-white rounded-[2rem] p-5 shadow-lg border border-slate-100 flex flex-col min-h-0 overflow-hidden">
                <div className="h-[48%] flex flex-col min-h-0 overflow-hidden border-b-2 border-slate-50 pb-2">
                    <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2 flex items-center gap-1">
                      <div className="w-1 h-3 bg-blue-600 rounded-full"></div> Pimpinan
                    </h4>
                    <div className="flex-1 overflow-hidden relative">
                        <div className={`space-y-1 ${wakaData.length > 2 ? 'animate-scroll-v' : ''}`}>
                            {wakaData.map((waka, i) => (
                            <div key={i} className="flex justify-between items-center bg-slate-50 px-2 py-1.5 rounded-lg border border-slate-100">
                                <span className="text-[9px] font-black text-slate-700 uppercase truncate pr-1">{waka.jabatan}</span>
                                <span className={`text-[7px] font-black uppercase px-1.5 py-0.5 rounded shrink-0 ${waka.status.toLowerCase() === 'hadir' ? 'bg-green-500 text-white' : 'bg-orange-500 text-white'}`}>{waka.status}</span>
                            </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="h-[48%] flex flex-col min-h-0 overflow-hidden pt-2">
                    <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-2 flex items-center gap-1">
                      <div className="w-1 h-3 bg-indigo-600 rounded-full"></div> Piket
                    </h4>
                    <div className="flex-1 overflow-hidden relative">
                        <div className={`space-y-1 ${guruPiket.length > 2 ? 'animate-scroll-v' : ''}`}>
                            {guruPiket.map((piket, i) => (
                                <div key={i} className="flex items-center gap-2 bg-indigo-50/50 px-2 py-1.5 rounded-lg border border-indigo-100">
                                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full shrink-0"></div>
                                    <span className="text-[9px] font-bold text-slate-600 uppercase leading-tight">{piket}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-slate-900 rounded-[2rem] p-4 pt-6 shadow-xl flex flex-col items-center justify-center border-b-8 border-blue-600">
               <div className="bg-white p-2 rounded-2xl shadow-lg mb-4">
                  <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://wa.me/6282131067682`} alt="QR" className="w-24 h-24 object-contain" />
               </div>
               <div className="text-center px-2">
                  <h4 className="text-[10px] text-white font-black leading-tight uppercase tracking-tighter">wa admin staff humas</h4>
                  <div className="flex items-center justify-center gap-1.5 mt-1.5">
                    <MessageCircle size={14} className="text-green-500 fill-green-500" />
                    <span className="text-[8px] font-black text-blue-400 uppercase tracking-[0.2em]">official info</span>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="h-[10vh] bg-slate-950 flex items-center overflow-hidden shrink-0 border-t-2 border-slate-800">
        <div className="bg-blue-600 h-full flex items-center px-10 z-20 shadow-2xl shrink-0">
          <div className="flex flex-col justify-center space-y-2">
            
            <div className="flex items-center">
              <div className="w-12 flex justify-start">
                <Globe size={18} className="text-white" />
              </div>
              <span className="text-white font-bold text-sm lowercase italic leading-none">
                smanegeri1turen.sch.id
              </span>
            </div>

            <div className="flex items-center">
              <div className="w-12 flex items-center gap-1.5 justify-start">
                <Instagram size={16} className="text-white" />
                <TikTokIcon size={14} className="text-white" />
              </div>
              <span className="text-white/90 font-black text-xs tracking-wider leading-none">
                @sman1turen
              </span>
            </div>

          </div>
        </div>
        
        <div className="flex-1 overflow-hidden h-full flex items-center bg-slate-900/50">
          <span className="animate-marquee text-xl font-black text-white uppercase tracking-[0.3em]">
            Terwujudnya Generasi yang Religius, Kompeten, Berprestasi, Berdaya Saing, dan Berwawasan Lingkungan sesuai dengan Perkembangan Global Menuju Sekolah Pariwisata Berbasis Adiwiyata.
          </span>
        </div>
      </footer>
    </div>
  );
};

export default PublicView;