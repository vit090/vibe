import { defineConfig } from 'vite'

// Repo is served at https://vit090.github.io/vibe/, so production builds need
// that subpath as their base — but keep dev/network testing at '/' unchanged.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/vibe/' : '/',
  server: {
    host: true,
  },
}))
