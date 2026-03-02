import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    plugins: [
        tailwindcss(),
        laravel({
            input: ['resources/js/app.jsx'],
            refresh: true, // Ini yang bikin log 'full reload' tadi muncul
        }),
        react(),
    ],
    server: {
        // Tambahkan ini agar Vite lebih agresif di lingkungan MAMP/Local
        host: 'localhost',
        port: 5173,
        strictPort: true,
    },
});