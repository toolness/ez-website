import fs from "fs";
import path from "path";
import React from "react";
import {
  copyAndTransformBinaryAsset,
  loadContentPageAssets,
  loadProjectAssets,
} from "./lib/assets.js";
import {
  hasDataBeenCached,
  STATIC_DIR,
  writeStaticTextFile,
} from "./lib/data-dir.js";
import { ProjectsPage } from "./lib/templating/pages/projects-page.js";
import { SplashPage } from "./lib/templating/pages/splash-page.js";
import { PageLink, StaticRenderer } from "./lib/templating/static-renderer.js";

import "dotenv/config";
import { friendlyPathToFilesystemPath } from "./lib/templating/webpage-path.js";
import { CollaborationsPage } from "./lib/templating/pages/collaborations-page.js";
import { BioPage } from "./lib/templating/pages/bio-page.js";
import { buildCss } from "./lib/css.js";

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
  await buildCss();
  validateSiteLinks(renderer);
  console.log(`The generated website is in ${STATIC_DIR}.`);
}

async function main() {
  if (!hasDataBeenCached()) {
    console.log("Unable to find cached data! Please run 'npm run fetch'.");
    process.exit(1);
  }
  const renderer = new StaticRenderer();
  const contentPages = loadContentPageAssets();
  const projects = loadProjectAssets();
  renderer.renderPage("/", <SplashPage content={contentPages.splash_page} />);
  renderer.renderPage("/projects/", <ProjectsPage projects={projects} />);
  renderer.renderPage("/collaborations/", <CollaborationsPage />);
  renderer.renderPage("/bio/", <BioPage />);
  await exportSite(renderer);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
