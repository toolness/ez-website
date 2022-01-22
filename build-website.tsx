import React from "react";
import {
  copyBinaryAsset,
  loadContentPageAssets,
  loadProjectAssets,
} from "./lib/assets";
import { STATIC_DIR, writeStaticTextFile } from "./lib/data-dir";
import { ProjectsPage } from "./lib/templating/pages/projects-page";
import { SplashPage } from "./lib/templating/pages/splash-page";
import { StaticRenderer } from "./lib/templating/static-renderer";

import "dotenv/config";

function exportSite(renderer: StaticRenderer) {
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
  console.log(`The generated website is in ${STATIC_DIR}.`);
}

async function main() {
  const renderer = new StaticRenderer();
  const contentPages = loadContentPageAssets();
  const projects = loadProjectAssets();
  renderer.renderPage("/", <SplashPage content={contentPages.splash_page} />);
  renderer.renderPage("/projects/", <ProjectsPage projects={projects} />);
  exportSite(renderer);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
