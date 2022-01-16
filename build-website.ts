import {
  readChildBlocks,
  readContentPage,
  readNotionPage,
  readProjectPages,
} from "./lib/data-dir";

async function main() {
  const splashBlocks = readChildBlocks(readContentPage("splash_page"));
  console.log("TODO: Render splash content", splashBlocks);
  for (const project of readProjectPages()) {
    const page = readNotionPage(project);
    const content = readChildBlocks(project);
    console.log(`TODO: Render project`, page, content);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
