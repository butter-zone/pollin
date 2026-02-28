import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    open: true,
    host: true,
  },
  build: {
    target: 'ES2020',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          // Heavy AI/ML runtime — loaded only when Whisper fallback activates
          'whisper': ['@huggingface/transformers'],
          // Canvas rendering engine + LLM integration
          'canvas-engine': [
            './src/services/ui-renderer.ts',
            './src/services/ui-templates.ts',
            './src/services/component-preview.ts',
            './src/services/component-renderer.ts',
            './src/services/llm-client.ts',
          ],
          // Animation library
          'gsap': ['gsap'],
        },
      },
    },
  },
});
