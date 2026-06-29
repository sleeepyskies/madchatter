import fs from "fs";
import path from "path";
import { globSync } from "glob";

const patterns = [
  "node_modules/onnxruntime-web/dist/*.wasm",
  "node_modules/@ricky0123/vad-web/dist/vad.worklet.bundle.min.js",
  "node_modules/@ricky0123/vad-web/dist/*.onnx",
  "node_modules/onnxruntime-web/dist/*.mjs",
];

const publicDir = path.resolve("public");
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir);
}

patterns.forEach((pattern) => {
  const files = globSync(pattern);
  files.forEach((file) => {
    const dest = path.join(publicDir, path.basename(file));
    fs.copyFileSync(file, dest);
    console.log(`Copied: ${path.basename(file)}`);
  });
});
