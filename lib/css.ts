import fs from "fs";
import path from "path";
import postcss from "postcss";
import autoprefixer from "autoprefixer";
import tailwindcss from "tailwindcss";

import { STATIC_DIR, ROOT_DIR } from "./data-dir.js";

const SOURCE_CSS = path.join(ROOT_DIR, "css", "style.css");
const DEST_CSS = path.join(STATIC_DIR, "style.css");
const DEST_CSS_MAP = `${DEST_CSS}.map`;

export async function buildCss() {
  const css = fs.readFileSync(SOURCE_CSS, { encoding: "utf-8" });
  const result = await postcss([autoprefixer, tailwindcss]).process(css, {
    from: SOURCE_CSS,
    to: DEST_CSS,
  });
  fs.writeFileSync(DEST_CSS, result.css);
  console.log(`Wrote ${DEST_CSS}.`);
  if (result.map) {
    fs.writeFileSync(DEST_CSS_MAP, result.map.toString());
    console.log(`Wrote ${DEST_CSS_MAP}.`);
  }
}
