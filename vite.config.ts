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
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Aggressively split Three.js modules for better caching and parallel loading
          if (id.includes('three/examples')) return 'three-examples';
          if (id.includes('three/src/core')) return 'three-core';
          if (id.includes('three')) return 'three-base';
          if (id.includes('@react-three/fiber')) return 'three-fiber';
          if (id.includes('@react-three/drei/core')) return 'drei-core';
          if (id.includes('@react-three/drei')) return 'three-helpers';
          if (id.includes('@react-three/postprocessing')) return 'three-effects';
          if (id.includes('leva')) return 'ui-vendor';
          if (id.includes('react-router')) return 'router';
          if (id.includes('zustand')) return 'state';
          // Split node_modules into vendor chunks for better caching
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
      treeshake: {
        moduleSideEffects: false, // Enable aggressive tree-shaking
        propertyReadSideEffects: false,
        tryCatchDeoptimization: false,
      },
    },
    // Increase chunk size warning limit for large 3D libraries
    chunkSizeWarningLimit: 1000,
    // Target modern browsers for smaller bundle sizes  
    target: 'esnext',
    // Optimize CSS code splitting
    cssCodeSplit: true,
    // Compression and minification
    minify: 'esbuild',
    reportCompressedSize: false, // Faster builds
    sourcemap: false, // Disable sourcemaps in production for smaller bundles
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom'],
    exclude: ['@react-three/postprocessing', 'leva'],
    esbuildOptions: {
      treeShaking: true,
      target: 'esnext',
    },
  },
}));
