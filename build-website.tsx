import React from "react";
import {
  copyBinaryAsset,
  loadContentPageAssets,
  loadProjectAssets,
} from "./lib/assets";
import { writeStaticTextFile } from "./lib/data-dir";
import { Page } from "./lib/templating/page";
import { StaticRenderer } from "./lib/templating/static-renderer";

async function main() {
  const renderer = new StaticRenderer();
  renderer.renderPage(
    "/",
    <Page
      contentPages={loadContentPageAssets()}
      projects={loadProjectAssets()}
    />
  );
  for (const binaryAsset of renderer.getBinaryAssets()) {
    copyBinaryAsset(binaryAsset);
    console.log(`Wrote ${binaryAsset.destination}.`);
  }
  for (const page of renderer.getRenderedPages()) {
    writeStaticTextFile(page.path.filesystemPath, page.html);
    console.log(`Wrote ${page.path.filesystemPath}.`);
  }
  for (const warning of renderer.warnings) {
    console.log(`WARNING: ${warning}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
