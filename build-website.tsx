import fs from "fs";
import path from "path";
import React from "react";
import {
  copyAndTransformBinaryAsset,
  loadContentPageAssets,
  loadProjectAssets,
} from "./lib/assets";
import { STATIC_DIR, writeStaticTextFile } from "./lib/data-dir";
import { ProjectsPage } from "./lib/templating/pages/projects-page";
import { SplashPage } from "./lib/templating/pages/splash-page";
import { PageLink, StaticRenderer } from "./lib/templating/static-renderer";

import "dotenv/config";
import { friendlyPathToFilesystemPath } from "./lib/templating/webpage-path";

function validateSiteLinks(renderer: StaticRenderer) {
  let brokenLinks: PageLink[] = [];
  for (let link of renderer.getInternalLinks()) {
    const target = path.join(STATIC_DIR, friendlyPathToFilesystemPath(link.to));
    if (!fs.existsSync(target)) {
      console.log(
        `ERROR: Link from "${link.from}" to "${link.to}" does not exist.`
      );
      brokenLinks.push(link);
    }
  }
  if (brokenLinks.length) {
    throw new Error("Broken links found! See above for more details.");
  }
}

async function exportSite(renderer: StaticRenderer) {
  for (const binaryAsset of renderer.getBinaryAssets()) {
    if (await copyAndTransformBinaryAsset(binaryAsset)) {
      console.log(`Wrote ${binaryAsset.destination}.`);
    }
  }
  for (const page of renderer.getRenderedPages()) {
    writeStaticTextFile(page.path.filesystemPath, page.html);
    console.log(`Wrote ${page.path.filesystemPath}.`);
  }
  for (const warning of renderer.warnings) {
    console.log(`WARNING: ${warning}`);
  }
  validateSiteLinks(renderer);
  console.log(`The generated website is in ${STATIC_DIR}.`);
}

async function main() {
  const renderer = new StaticRenderer();
  const contentPages = loadContentPageAssets();
  const projects = loadProjectAssets();
  renderer.renderPage("/", <SplashPage content={contentPages.splash_page} />);
  renderer.renderPage("/projects/", <ProjectsPage projects={projects} />);
  await exportSite(renderer);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
