import NotionHQ from "@notionhq/client";

import { AgentContext } from "./lib/cache-file.js";
import {
  ContentPageName,
  CONTENT_PAGE_NAMES,
  DATA_DIR,
  signalDataHasBeenCached,
  writeContentPage,
  writeProjectPages,
} from "./lib/data-dir.js";
import { iterDatabase } from "./lib/notion-util.js";
import {
  CachedProjectPage,
  cacheProjectPage,
} from "./lib/cache-project-page.js";

import "dotenv/config";
import { cachePageChildren } from "./lib/cache-page-children.js";

const { Client } = NotionHQ;

const { NOTION_TOKEN } = process.env;

if (!NOTION_TOKEN) {
  throw new Error(`Please define the NOTION_TOKEN environment variable!`);
}

const CONTENT_PAGE_ID_MAP: { [k in ContentPageName]: string } = {
  splash_page: "8304120760ad42b9baf54f975db11684",
};

const PROJECT_DATABASE_ID = "a808f187689c4af9b9260fc316aee03a";

const CLIENT_BASE_URL = "https://api.notion.com";

async function main() {
  const pages: CachedProjectPage[] = [];
  const agentContext = new AgentContext();
  const client = new Client({
    baseUrl: CLIENT_BASE_URL,
    auth: NOTION_TOKEN,
    agent: agentContext.agent(new URL(CLIENT_BASE_URL)),
  });

  for await (const name of CONTENT_PAGE_NAMES) {
    console.log(`Processing content page ${name}...`);
    const page = await cachePageChildren({
      pageId: CONTENT_PAGE_ID_MAP[name],
      dataDir: DATA_DIR,
      agentContext,
      client,
      forceRefresh: true,
    });
    writeContentPage(name, page);
  }

  console.log(`Processing project database...`);
  for await (const page of iterDatabase(client, PROJECT_DATABASE_ID)) {
    console.log(`Processing project ${page.id}...`);
    pages.push(
      await cacheProjectPage({
        page,
        dataDir: DATA_DIR,
        agentContext,
        client,
      })
    );
  }
  agentContext.destroy();
  writeProjectPages(pages);
  signalDataHasBeenCached();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
