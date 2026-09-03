import { cpSync, rmSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";

const require = createRequire(import.meta.url);
const threeRoot = resolve(dirname(require.resolve("three")), "..");
const publicRoot = resolve(import.meta.dirname, "..", "public");

const targets = [
  {
    from: join(threeRoot, "examples/jsm/libs/draco/gltf"),
    to: join(publicRoot, "decoders", "draco"),
  },
  {
    from: join(threeRoot, "examples/jsm/libs/basis"),
    to: join(publicRoot, "decoders", "basis"),
  },
];

for (const { from, to } of targets) {
  rmSync(to, { recursive: true, force: true });
  cpSync(from, to, { recursive: true });
  console.log(`vendored ${to}`);
}
