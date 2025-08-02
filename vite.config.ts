import react from '@vitejs/plugin-react';
import path from 'node:path';
import { defineConfig } from 'vite';
import electron from 'vite-plugin-electron/simple';

// https://cn.vite.dev/config/
export default defineConfig({
  base: './',
  build: {
    rollupOptions: {
      output: {
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const extType = assetInfo.names?.[0]?.split('.').pop() || '';
          if (extType === 'css') {
            return 'css/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        }
      }
    }
  },
  plugins: [
    react({ jsxRuntime: 'automatic' }),
    electron({
      main: {
        // Shortcut of `build.lib.entry`.
        entry: 'electron/main.ts',
        vite: {
          resolve: {
            alias: {
              '@electron': path.resolve(__dirname, './electron')
            }
          }
        }
      },
      preload: {
        // Shortcut of `build.rollupOptions.input`.
        // Preload scripts may contain Web assets, so use the `build.rollupOptions.input` instead `build.lib.entry`.
        input: path.join(__dirname, 'electron/preload.ts')
      },
      // Ployfill the Electron and Node.js API for Renderer process.
      // If you want use Node.js in Renderer process, the `nodeIntegration` needs to be enabled in the Main process.
      // See 👉 https://github.com/electron-vite/vite-plugin-electron-renderer
      renderer:
        process.env.NODE_ENV === 'test'
          ? // https://github.com/electron-vite/vite-plugin-electron-renderer/issues/78#issuecomment-2053600808
            undefined
          : {}
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    },
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.json']
  }
});
