import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    // Listen on all interfaces so a phone on the LAN or a tunnel can reach it.
    host: true,
    // Vite rejects requests whose Host header it does not recognise. A leading
    // dot allows the domain and all of its subdomains.
    allowedHosts: [
      ".ngrok-free.app",
      ".ngrok-free.dev",
      ".ngrok.app",
      ".ngrok.io",
    ],
    // Serve the Django API and uploaded media from the app's own origin. That
    // keeps VITE_API_URL/VITE_STORAGE_URL relative, so a tunnelled or LAN
    // client never needs to resolve "localhost", and no CORS is involved.
    proxy: {
      "/api": { target: "http://127.0.0.1:8000", changeOrigin: false },
      "/media": { target: "http://127.0.0.1:8000", changeOrigin: false },
    },
  },
})
