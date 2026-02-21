const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..", "dist", "cjs");

function walk(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p);
    else if (ent.isFile() && p.endsWith(".js")) {
      fs.renameSync(p, p.slice(0, -3) + ".cjs");
    }
  }
}

walk(root);
console.log("Renamed dist/cjs .js -> .cjs");
