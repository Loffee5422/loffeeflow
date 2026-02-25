import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      build: {
        rollupOptions: {
          output: {
            manualChunks: (id) => {
              if (!id.includes('node_modules')) return;
              if (id.includes('/firebase/')) return 'vendor-firebase';
              if (id.includes('/react/') || id.includes('/react-dom/')) return 'vendor-react';
              if (id.includes('/date-fns/')) return 'vendor-date-fns';
              if (id.includes('/lucide-react/')) return 'vendor-lucide';
              return 'vendor-misc';
            }
          }
        }
      },
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
