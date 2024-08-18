import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  esbuild: {
    // If you need to apply Babel transforms in specific files, you can use the esbuild option.
    jsxInject: `import React from 'react'`
  }
});
