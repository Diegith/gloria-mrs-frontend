import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [
    // 👇 Plugin chiquito para loguear lo que pase por /api
    {
      name: 'proxy-logger',
      apply: 'serve', // solo en dev
      configureServer(server) {
        server.middlewares.use((req, _res, next) => {
          if (req.url?.startsWith('/api')) {
            console.log('[proxy]', req.method, req.url)
          }
          next()
        })
      },
    },
    react(),
  ],

  server: {
    port: 5173,
    proxy: {
      '/api': {
        //target: 'https://mursionassistantunab-api.onrender.com',
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
        rewrite: p => p.replace(/^\/api/, ''), // "/api/login" -> "/login"
      },
    },
  },

  build: {
    outDir: 'dist',
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
})
