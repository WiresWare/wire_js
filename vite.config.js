import { resolve } from 'path';
import { defineConfig } from 'vite';
import eslint from 'vite-plugin-eslint';
import removeConsole from 'vite-plugin-remove-console';

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  test: {
    globals: true,
  },
  plugins: [eslint(), removeConsole()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    copyPublicDir: false,
    target: 'esnext',
    minify: true,
    lib: {
      entry: resolve(__dirname, 'src/index.js'),
      name: 'wire',
      formats: ['es'],
      // fileName: (format) => `wire.${format}.js`,
    },
    write: true,
  },
});
