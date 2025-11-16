import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger()
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    include: ['three', '@react-three/fiber', '@react-three/drei'],
    exclude: ['@react-three/postprocessing'],
  },
  build: {
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: true,
        pure_funcs: ['console.log'],
        passes: 2,
      },
      mangle: {
        safari10: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Critical Three.js core - load first
          if (id.includes('three/src/core') || id.includes('three/src/math')) {
            return 'three-critical';
          }
          // Three.js main bundle
          if (id.includes('node_modules/three')) {
            return 'three-core';
          }
          // React Three Fiber
          if (id.includes('@react-three/fiber')) {
            return 'three-fiber';
          }
          // Three.js helpers - lazy load
          if (id.includes('@react-three/drei')) {
            return 'three-helpers';
          }
          // Post-processing effects - lazy load
          if (id.includes('@react-three/postprocessing') || id.includes('postprocessing')) {
            return 'three-effects';
          }
          // Leva UI controls - lazy load
          if (id.includes('leva')) {
            return 'ui-vendor';
          }
          // React core
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'react-vendor';
          }
          // Router
          if (id.includes('react-router')) {
            return 'router';
          }
          // State management
          if (id.includes('zustand')) {
            return 'state-vendor';
          }
          // UI components
          if (id.includes('src/components/ui')) {
            return 'ui-components';
          }
          // Radix UI primitives
          if (id.includes('@radix-ui')) {
            return 'radix-ui';
          }
        },
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop() : 'chunk';
          return `assets/${facadeModuleId}-[hash].js`;
        },
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
    chunkSizeWarningLimit: 1000,
    reportCompressedSize: false,
    cssCodeSplit: true,
    assetsInlineLimit: 4096,
  },
  esbuild: {
    legalComments: 'none',
    treeShaking: true,
  },
}));
