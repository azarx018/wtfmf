/// <reference types="vite/client" />

// Vite's built-in `?raw` import suffix returns the file's contents as a
// plain string. TypeScript doesn't know about `.sql` files by default —
// this teaches it, so migrationRunner.ts can import migration SQL files
// directly instead of inlining them as string literals.
declare module '*.sql?raw' {
  const content: string;
  export default content;
}
