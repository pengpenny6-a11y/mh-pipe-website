// Vite applies its deployment base to HTML, CSS and imported files. Our JSX
// and scene definitions also supply public URLs directly to React and Three.
export function publicAssetPaths() {
  let sourceRoot;
  let base;
  return {
    name: "mh-public-asset-paths",
    enforce: "pre",
    configResolved(config) {
      sourceRoot = config.root + "/src/";
      base = config.base;
    },
    transform(code, id) {
      if (base === "/" || !id.startsWith(sourceRoot) || !/\.[jt]sx?$/.test(id)) return;
      const rebased = code.replace(/(["'`]|url\(\s*)\/(?=(?:assets|downloads)\/)/g, (_, start) => start + base);
      if (rebased !== code) return {code: rebased, map: null};
    },
  };
}
