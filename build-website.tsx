import React from "react";
import { loadContentPageAssets, loadProjectAssets } from "./lib/assets";
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
  console.log(html);
  // TODO: Log any warnings.
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
