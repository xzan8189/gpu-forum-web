import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import path from "path"

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
  // 👇 Sostituisci "NOME-DEL-REPO" con il tuo nome repo preciso
  base: "/gpu-forum-web/",
})
