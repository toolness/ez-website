import React from "react";
import {
  copyBinaryAsset,
  loadContentPageAssets,
  loadProjectAssets,
} from "./lib/assets";
import { rootRelativePath, writeStaticTextFile } from "./lib/data-dir";
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
    copyBinaryAsset(binaryAsset);
    console.log(`Wrote ${binaryAsset.destination}.`);
  }
  const indexPath = writeStaticTextFile("index.html", html);
  console.log(`Wrote ${rootRelativePath(indexPath)}.`);
  for (const warning of renderer.warnings) {
    console.log(`WARNING: ${warning}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
