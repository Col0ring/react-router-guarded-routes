import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  minify: true,
  dts: true,
  sourcemap: true,
  format: ['cjs', 'esm'],
  outExtension({ format }) {
    return {
      js: `.${format}.js`,
    }
  },
})
