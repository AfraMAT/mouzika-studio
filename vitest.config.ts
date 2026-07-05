import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

// The unit suite is pure TypeScript (no TSX / component rendering), so no React
// JSX transform plugin is needed. Omitting @vitejs/plugin-react also keeps the
// dev-tooling tree on vitest's own vite 8 (no vulnerable nested vite 5). If TSX
// component tests are added later, add @vitejs/plugin-react@^6 (vite 8 peer).
export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
  },
});
