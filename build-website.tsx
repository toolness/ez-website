import fs from "fs";
import path from "path";
import React from "react";
import { loadContentPageAssets, loadProjectAssets } from "./lib/assets";
import {
  DATA_DIR,
  rootRelativePath,
  STATIC_DIR,
  writeStaticTextFile,
} from "./lib/data-dir";
import { Page } from "./lib/templating/page";
import { StaticRenderer } from "./lib/templating/static-renderer";

async function main() {
  const renderer = new StaticRenderer();
  const html = renderer.render(
    <Page
      contentPages={loadContentPageAssets()}
      projects={loadProjectAssets()}
    />
  );
  for (const binaryAsset of renderer.getBinaryAssets()) {
    const destination = path.join(STATIC_DIR, binaryAsset.destination);
    const destinationDir = path.dirname(destination);
    if (!fs.existsSync(destinationDir)) {
      fs.mkdirSync(destinationDir, { recursive: true });
    }
    fs.copyFileSync(path.join(DATA_DIR, binaryAsset.source), destination);
    console.log(`Wrote ${binaryAsset.destination}.`);
  }
  const indexPath = writeStaticTextFile("index.html", html);
  console.log(`Wrote ${rootRelativePath(indexPath)}.`);
  // TODO: Log any warnings.
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
