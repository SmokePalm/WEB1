import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { apiTorneo } from './api/apiTorneo.ts'

// https://vite.dev/config/
export default defineConfig({
  // apiTorneo() monta el API del torneo en /api dentro del propio servidor de Vite.
  plugins: [react(), apiTorneo()],
})
