import { copyFile, mkdir, writeFile } from "node:fs/promises";

const output = new URL("../dist/pages/", import.meta.url);
const homepage = new URL("index.html", output);
const routes = ["applications", "products", "services", "company", "news", "contact", "manufacturing"];

// Each real directory lets GitHub Pages serve a bookmarked page on first load.
for (const route of routes) {
  const directory = new URL(route + "/", output);
  await mkdir(directory, { recursive: true });
  await copyFile(homepage, new URL("index.html", directory));
}
await writeFile(new URL(".nojekyll", output), "");
