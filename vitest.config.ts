import { defineConfig } from 'vitest/config';
import { WxtVitest } from 'wxt/testing/vitest-plugin';

export default defineConfig({
  test: {
    environment: 'jsdom',
  },
  plugins: [WxtVitest()],
});