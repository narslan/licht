import { defineConfig } from "vite";

// https://vitejs.dev/config/

// Library build
// export default defineConfig({
//   build: {
//     lib: {
//       entry: 'src/my-element.ts',
//       formats: ['es']
//     },
//     minify: false,
//     rollupOptions: {
//       external: /^lit/
//     }
//   }
// });

export default defineConfig({
  build: {
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {

            return id.toString().split('node_modules/')[1].split('/')[0].toString();
          }
        }
      }
    }
  }
});
