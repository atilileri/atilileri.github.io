// Minimal ambient declarations for reveal.js + its ESM plugins, which ship
// without bundled types. Keeps the editor/tsc quiet; Vite bundles them fine.
declare module "reveal.js" {
  const Reveal: any;
  export default Reveal;
}
declare module "reveal.js/plugin/highlight/highlight.esm.js" {
  const plugin: any;
  export default plugin;
}
declare module "reveal.js/plugin/notes/notes.esm.js" {
  const plugin: any;
  export default plugin;
}
declare module "reveal.js/plugin/zoom/zoom.esm.js" {
  const plugin: any;
  export default plugin;
}
