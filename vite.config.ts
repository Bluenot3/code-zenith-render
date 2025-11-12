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
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Split Three.js core and React Three Fiber separately for better tree-shaking
          'three-core': ['three'],
          'three-fiber': ['@react-three/fiber'],
          'three-helpers': ['@react-three/drei'],
          'three-effects': ['@react-three/postprocessing'],
          // Split UI components into separate chunks
          'ui-vendor': ['leva'],
          // Split React and core libraries
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // Split Zustand state management
          'state-vendor': ['zustand'],
        },
      },
    },
    // Increase chunk size warning limit for large 3D libraries
    chunkSizeWarningLimit: 1000,
    // Optimize minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info'],
      },
    },
  },
}));
