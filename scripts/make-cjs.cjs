/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");

const dist = path.resolve(__dirname, "..", "dist");

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function writeFile(rel, content) {
  const p = path.join(dist, rel);
  ensureDir(path.dirname(p));
  fs.writeFileSync(p, content, "utf8");
}

writeFile(
  "index.cjs",
  `"use strict";
module.exports = require("./index.js");
`
);

writeFile(
  "adapters/react.cjs",
  `"use strict";
module.exports = require("../adapters/react.js");
`
);

console.log("Wrote CJS wrappers.");
