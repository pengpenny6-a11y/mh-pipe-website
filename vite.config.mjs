import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { Readable } from "node:stream";
import { handleInquiry } from "./worker/inquiries.js";

function inquiryPreview(server) {
  server.middlewares.use("/api/inquiries", async (req, res, next) => {
    try {
      const request = new Request("http://" + req.headers.host + "/api/inquiries", {
        method: req.method,
        headers: req.headers,
        ...(req.method === "POST" ? {body: Readable.toWeb(req), duplex: "half"} : {}),
      });
      const response = await handleInquiry(request, process.env);
      res.writeHead(response.status, Object.fromEntries(response.headers));
      res.end(await response.text());
    } catch (error) { next(error); }
  });
}

export default defineConfig({
  build: {
    outDir: "dist/client",
    rolldownOptions: {input:["index.html","typography.html"]},
  },
  optimizeDeps: {
    include: ["react", "react-dom/client"],
  },
  server: {
    host: "0.0.0.0",
    allowedHosts: ["terminal.local"],
    warmup: {
      clientFiles: ["./src/main.jsx"],
    },
  },
  plugins: [react(), {name:"inquiry-preview", configureServer:inquiryPreview, configurePreviewServer:inquiryPreview}],
});
