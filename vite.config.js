import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // Ensures relative assets loading for subpath deploys like GitHub Pages
});
