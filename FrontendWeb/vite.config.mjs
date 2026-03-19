// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// Plugin Vite pour servir les fichiers APK avec le bon Content-Type
function apkMimePlugin() {
  return {
    name: 'apk-mime-fix',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url && req.url.endsWith('.apk')) {
          const filePath = path.join(process.cwd(), 'public', req.url)
          if (fs.existsSync(filePath)) {
            const stat = fs.statSync(filePath)
            const fileName = path.basename(req.url)
            res.setHeader('Content-Type', 'application/vnd.android.package-archive')
            res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`)
            res.setHeader('Content-Length', stat.size)
            const stream = fs.createReadStream(filePath)
            stream.pipe(res)
            return
          }
        }
        next()
      })
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [apkMimePlugin(), react()],
  server: {
    port: 3000,
    open: false
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          charts: ['chart.js', 'react-chartjs-2'],
          animations: ['framer-motion'],
          ui: ['lucide-react', 'date-fns', 'clsx', 'tailwind-merge']
        }
      }
    }
  }
})