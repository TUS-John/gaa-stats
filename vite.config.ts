import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// Change base to '/<your-repo>/' for GitHub Pages
export default defineConfig({
  plugins: [react()],
  base: '/gaa-stats/',
})
