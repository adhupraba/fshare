import path from "path";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  base: "/",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    minify: "terser",
    terserOptions: {
      compress: {
        drop_debugger: true, // Remove debugger statements
      },
      format: {
        comments: false, // Remove comments
      },
    },
    rollupOptions: {
      output: {
        minifyInternalExports: true,
        chunkFileNames: "assets/js/[name]-[hash].js",
        entryFileNames: "assets/js/[name]-[hash].js",
        assetFileNames: ({ names }) => {
          const [name] = names;

          if (/\.(gif|jpe?g|png|svg)$/.test(name ?? "")) {
            return "assets/images/[name]-[hash][extname]";
          }

          if (/\.css$/.test(name ?? "")) {
            return "assets/css/[name]-[hash][extname]";
          }

          // default value
          // ref: https://rollupjs.org/guide/en/#outputassetfilenames
          return "assets/[name]-[hash][extname]";
        },
        manualChunks: (id) => {
          if (id.includes("node_modules")) {
            if (id.includes("pdfjs-dist")) {
              return "pdfjs";
            }

            if (["react-redux", "@reduxjs/toolkit"].some((p) => id.includes(p))) {
              return "redux";
            }

            if (id.includes("zod")) {
              return "zod";
            }

            if (["react-hook-form", "@hookform/resolvers"].some((p) => id.includes(p))) {
              return "hookform";
            }

            return "vendor"; // Other node_modules go here
          }
        },
      },
    },
    chunkSizeWarningLimit: 400,
  },
});
