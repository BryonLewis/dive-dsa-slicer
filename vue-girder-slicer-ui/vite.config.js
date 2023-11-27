import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import dts from 'vite-plugin-dts'

// https://vitejs.dev/config/
export default defineConfig(() =>{
  return {
    build: {
      lib: {
        // Could also be a dictionary or array of multiple entry points
        entry: resolve(__dirname, './src/index.ts'),
        name: 'VueGirderSlicerCLIUI',
        // the proper extensions will be added
        fileName: 'VueGirderSlicerCLIUI',
      },
      rollupOptions: {
        // make sure to externalize deps that shouldn't be bundled
        // into your library
        external: ['vue'],
        output: {
          // Provide global variables to use in the UMD build
          // for externalized deps
          globals: {
            vue: 'Vue',
          },
        },
      },
    },
    plugins: [vue(), dts({ rollupTypes: true })],
    server: {
      host: "0.0.0.0",
      port: 8080,
      proxy: {
        "/api": {
          target: "http://localhost:8010",
          xfwd: true,
        },
      },
      strictPort: true,
    },
  };
})
