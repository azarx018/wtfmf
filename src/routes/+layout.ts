// This app runs entirely inside a Capacitor WebView with no server.
// SSR and prerendering must stay off for every route — data comes from
// SQLite/filesystem at runtime, not at build time.
export const ssr = false;
export const prerender = false;
export const trailingSlash = 'always'; // plays nicer with the static adapter's fallback routing
