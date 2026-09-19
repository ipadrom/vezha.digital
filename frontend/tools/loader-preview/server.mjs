import { createServer } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'node:url'
const root = fileURLToPath(new URL('.', import.meta.url))
const frontend = fileURLToPath(new URL('../..', import.meta.url))
const server = await createServer({ configFile: false, root, plugins: [vue()], css: { postcss: { plugins: [] } }, server: { host: '127.0.0.1', port: 3002, strictPort: true, fs: { allow: [frontend] } } })
await server.listen()
server.printUrls()
