import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  assetsInclude: ["**/*.bkp"],
  server: {
    port: 3000,
    proxy: {
      // Proxy requests starting with /api to http://localhost:8080
      '/api': {
        target: 'http://localhost:8080', // Your backend server address
        changeOrigin: true, // Recommended for virtual hosted sites
      },
    },
  },
});