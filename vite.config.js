import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  server: {
    open: true, // 启动时自动打开浏览器
    proxy: {
      "/api": {
        target: "https://localhost:7216", // 后端接口地址
        changeOrigin: true,
        secure: false
      }
    }
  }
});
