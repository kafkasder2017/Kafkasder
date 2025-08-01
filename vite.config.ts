import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Enable Fast Refresh for better development experience
      fastRefresh: true,
      // Enable JSX runtime for better performance
      jsxRuntime: 'automatic',
      // Enable babel optimization
      babel: {
        plugins: [
          // Add babel plugin for better tree shaking
          ['@babel/plugin-transform-react-jsx', { runtime: 'automatic' }]
        ]
      }
    })
  ],
  
  // Path resolution for better imports
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      '@/components': path.resolve(__dirname, './components'),
      '@/services': path.resolve(__dirname, './services'),
      '@/hooks': path.resolve(__dirname, './hooks'),
      '@/data': path.resolve(__dirname, './data'),
      '@/types': path.resolve(__dirname, './types.ts'),
      '@/constants': path.resolve(__dirname, './constants.tsx')
    }
  },

  // Development server configuration
  server: {
    port: 3000,
    host: true, // Enable network access
    open: true, // Auto-open browser
    cors: true, // Enable CORS
    // Enable HMR with better error handling
    hmr: {
      overlay: true
    }
  },

  // Build optimization
  build: {
    target: 'esnext', // Modern browsers
    minify: 'esbuild', // Fast minification
    sourcemap: true, // Enable source maps for debugging
    rollupOptions: {
      output: {
        // Better chunk splitting
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['react-hot-toast'],
          charts: ['recharts'],
          maps: ['leaflet', 'react-leaflet']
        }
      }
    },
    // Optimize dependencies
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        'react-hot-toast',
        'recharts',
        'leaflet',
        'react-leaflet',
        '@supabase/supabase-js'
      ]
    }
  },

  // CSS optimization
  css: {
    devSourcemap: true, // Enable CSS source maps in development
    postcss: './postcss.config.js'
  },

  // Environment variables
  define: {
    // Enable React DevTools in development
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development')
  },

  // Performance optimizations
  esbuild: {
    // Enable tree shaking
    treeShaking: true,
    // Optimize JSX
    jsx: 'automatic'
  },

  // Preview server configuration
  preview: {
    port: 4173,
    host: true,
    open: true
  }
})
