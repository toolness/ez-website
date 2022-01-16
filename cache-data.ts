import { Client } from "@notionhq/client";

import { AgentContext } from "./lib/cache-file";
import { DATA_DIR, writeProjectPages } from "./lib/data-dir";
import { iterDatabase } from "./lib/notion-util";
import { CachedProjectPage, cacheProjectPage } from "./lib/cache-project-page";

import "dotenv/config";

const { NOTION_TOKEN } = process.env;

if (!NOTION_TOKEN) {
  throw new Error(`Please define the NOTION_TOKEN environment variable!`);
}

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
  for await (const page of iterDatabase(client, PROJECT_DATABASE_ID)) {
    console.log(`Processing ${page.id}...`);
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
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
