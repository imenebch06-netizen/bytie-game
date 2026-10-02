import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite"; // <-- cet import manque probablement

export default defineConfig({
  plugins: [react(), tailwindcss()],
});