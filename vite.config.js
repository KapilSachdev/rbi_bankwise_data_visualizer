import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { visualizer } from 'rollup-plugin-visualizer';

// Set base for GitHub Pages deployment
// Allow base path to be set via BASE_PATH env variable for local/prod flexibility
// For local build use, "BASE_PATH=/ npm run build"
const base = process.env.BASE_PATH || '/rbi_bankwise_data_visualizer/';

export default defineConfig({
  base,
  plugins: [
    react(),
    tailwindcss(),
    ...(process.env.BUNDLE_REPORT === 'true'
      ? [visualizer({
          filename: 'dist/bundle-report.html',
          open: true,
          gzipSize: true,
          brotliSize: true,
        })]
      : []),
  ],
  server: {
    hmr: false,
  },
});
