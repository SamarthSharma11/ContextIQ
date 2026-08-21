import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/widget.ts'),
      name: 'ContextIQWidget',
      fileName: () => 'widget.js',
      formats: ['iife'],
    },
    outDir: '../client/public',
    emptyOutDir: false,
  },
});
