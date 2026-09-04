import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    base: './',
    plugins: [
      react(), 
      tailwindcss(),
      VitePWA({ 
        registerType: 'autoUpdate', 
        workbox: { 
          globPatterns: ['**/*.{js,css,html,ico,png,svg,ttf}'],
          maximumFileSizeToCacheInBytes: 10 * 1024 * 1024
        },
        manifest: {
          name: 'نظام تسيير المخابر',
          short_name: 'المخابر',
          description: 'تطبيق تسيير مخابر المؤسسات التعليمية',
          theme_color: '#fcf9f3',
          background_color: '#fcf9f3',
          display: 'standalone',
          lang: 'ar',
          dir: 'rtl',
          icons: [
            {
              src: 'ministry-logo.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: 'ministry-logo.png',
              sizes: '512x512',
              type: 'image/png'
            }
          ]
        }
      })
    ],
    define: {
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
