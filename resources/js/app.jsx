import '../css/app.css'; // Pastikan CSS dipanggil
import React from 'react';
import { createRoot } from 'react-dom/client'; // Ini "kunci kontak"-nya
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import halaman
import PublicView from './pages/PublicView';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PublicView />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

// INI BAGIAN YANG HILANG: Menempelkan React ke HTML
const container = document.getElementById('app'); 
if (container) {
    const root = createRoot(container);
    root.render(<App />);
} else {
    console.error("Gawat! Elemen dengan id 'app' tidak ditemukan di Blade Anda.");
}