import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from "path"
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';


// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "src")
    }
  },

  server: {
    port: 3000, // 设置为 3002
    host: '0.0.0.0',
    proxy: {
      '/lime/api': {
        target: 'http://0.0.0.0:6679',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/lime\/api/, '/api')
      },
      '/static': {
        target: 'http://0.0.0.0:6679',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/static/, '/static')
      },
      '/lime/api/v1/ws': {
        target: 'ws://0.0.0.0:6679',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/lime\/api\/v1\/ws/, '/api/v1/ws')
      },
    }
  },

  define: {
    '__VUE_OPTIONS_API__': true,
    '__VUE_PROD_DEVTOOLS__': false,
    '__VUE_PROD_HYDRATION_MISMATCH_DETAILS__': false,
  },

  plugins: [
    vue(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [
        ElementPlusResolver({ importStyle: 'sass' })
      ],
    }),
  ],

  css: {
    preprocessorOptions: {
      scss: {
        // api: 'modern-compiler',
        silenceDeprecations: ['legacy-js-api'],
        additionalData: `@use "~/assets/css/element/index.scss" as *;`,
      }
    }
  }
})
