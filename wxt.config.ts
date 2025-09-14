import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  webExt: {
    startUrls: ["https://www.npr.org/2025/09/11/nx-s1-5532095"],
  },
});
