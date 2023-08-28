import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig(() =>{
  return {
    plugins: [vue()],
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
