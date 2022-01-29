import path from "path";
import fs from "fs";
import type { Client } from "@notionhq/client";
import type { Page } from "@notionhq/client/build/src/api-types";

import {
  AgentContext,
  CachedFile,
  cacheFile,
  CacheFileOptions,
} from "./cache-file.js";
import { getFileURL, getPageIconURL } from "./notion-util.js";
import {
  CachedPageChildren,
  cachePageChildren,
} from "./cache-page-children.js";

const PICTURE_PROPERTY_NAME = "Pictures";

export type CachedProjectPage = {
  path: string;
  icon?: CachedFile;
  pictures: CachedFile[];
} & CachedPageChildren;

export function getPageImages(page: CachedProjectPage): CachedFile[] {
  const result: CachedFile[] = [];
  if (page.icon) {
    result.push(page.icon);
  }
  result.push(...page.pictures);
  result.push(...page.imageBlocks);
  return result;
}

async function cachePictures(
  page: Page,
  options: CacheFileOptions
): Promise<CachedFile[]> {
  for (let [name, value] of Object.entries(page.properties)) {
    if (name === PICTURE_PROPERTY_NAME) {
      if (value.type !== "files") {
        throw new Error(`Expected "${name}" type to be files!`);
      }
      const result: CachedFile[] = [];
      for (let i = 0; i < value.files.length; i++) {
        const file = value.files[i];
        result.push(
          await cacheFile(getFileURL(file), `${page.id}-picture-${i}`, options)
        );
      }
      return result;
    }
  }
  throw new Error(`Unable to find property "${PICTURE_PROPERTY_NAME}"!`);
}

async function cacheIcon(
  page: Page,
  options: CacheFileOptions
): Promise<CachedFile | undefined> {
  const iconURL = getPageIconURL(page);
  if (iconURL) {
    return await cacheFile(iconURL, `${page.id}-icon`, options);
  }
}

export async function cacheProjectPage(options: {
  page: Page;
  dataDir: string;
  agentContext: AgentContext;
  client: Client;
}): Promise<CachedProjectPage> {
  const { page, dataDir, agentContext, client } = options;
  const cacheFileOptions: CacheFileOptions = {
    dataDir,
    agentContext,
  };
  const pagePath = path.join(dataDir, `${page.id}.json`);
  let forceRefreshChildren = false;
  if (fs.existsSync(pagePath)) {
    const cachedPage: Page = JSON.parse(
      fs.readFileSync(pagePath, { encoding: "utf-8" })
    );
    if (cachedPage.last_edited_time !== page.last_edited_time) {
      forceRefreshChildren = true;
    }
  }
  const cachedChildren = await cachePageChildren({
    pageId: page.id,
    dataDir,
    client,
    agentContext,
    forceRefresh: forceRefreshChildren,
  });
  const pictures = await cachePictures(page, cacheFileOptions);
  const icon = await cacheIcon(page, cacheFileOptions);

  fs.writeFileSync(pagePath, JSON.stringify(page, null, 2));
  return {
    path: path.relative(dataDir, pagePath),
    icon,
    pictures,
    ...cachedChildren,
  };
}
