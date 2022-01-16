import path from "path";
import fs from "fs";
import type { Client } from "@notionhq/client";
import type {
  Page,
  Block,
  ImageBlock,
} from "@notionhq/client/build/src/api-types";

import {
  AgentContext,
  CachedFile,
  cacheFile,
  CacheFileOptions,
} from "./cache-file";
import { getFileURL, getPageIconURL, iterBlockChildren } from "./notion-util";
import { assertUnreachable } from "./util";

const PICTURE_PROPERTY_NAME = "Pictures";

export type CachedProjectPage = {
  path: string;
  childrenPath: string;
  icon?: CachedFile;
  pictures: CachedFile[];
  imageBlocks: CachedFile[];
};

export function getPageImages(page: CachedProjectPage): CachedFile[] {
  const result: CachedFile[] = [];
  if (page.icon) {
    result.push(page.icon);
  }
  result.push(...page.pictures);
  result.push(...page.imageBlocks);
  return result;
}

async function cacheImageBlocks(
  pageId: string,
  blocks: Block[],
  client: Client,
  options: CacheFileOptions
): Promise<CachedFile[]> {
  const imageBlocks: ImageBlock[] = [];
  for (const block of blocks) {
    if (block.type === "image") {
      imageBlocks.push(block);
    }
  }

  if (imageBlocks.length === 0) {
    return [];
  }

  // TODO: Download more than just the first image.
  let imageBlock = imageBlocks[0];
  let url: string;

  if (imageBlock.image.type === "file") {
    const expiry = new Date(imageBlock.image.file.expiry_time);
    if (expiry <= new Date()) {
      const block: any = await client.blocks.retrieve({
        block_id: imageBlock.id,
      });
      const unexpiredUrl: unknown = block?.image?.file?.url;
      if (typeof unexpiredUrl !== "string") {
        throw new Error(
          `Retrieving unexpired URL for image block ${imageBlock.id} failed!`
        );
      }
      url = unexpiredUrl;
    } else {
      url = imageBlock.image.file.url;
    }
  } else if (imageBlock.image.type === "external") {
    url = imageBlock.image.external.url;
  } else {
    assertUnreachable(imageBlock.image, `Image block ${imageBlock.id}`);
  }

  return [
    await cacheFile(url, `${pageId}-image-block-${imageBlock.id}`, options),
  ];
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
  const childrenPath = path.join(dataDir, `${page.id}-children.json`);
  let fetchChildren = !fs.existsSync(childrenPath);
  if (fs.existsSync(pagePath)) {
    const cachedPage: Page = JSON.parse(
      fs.readFileSync(pagePath, { encoding: "utf-8" })
    );
    if (cachedPage.last_edited_time !== page.last_edited_time) {
      fetchChildren = true;
    }
  }
  if (fetchChildren) {
    const children: Block[] = [];
    for await (const child of iterBlockChildren(client, page.id)) {
      children.push(child);
    }
    fs.writeFileSync(childrenPath, JSON.stringify(children, null, 2));
  }
  const children: Block[] = JSON.parse(
    fs.readFileSync(childrenPath, { encoding: "utf-8" })
  );
  const pictures = await cachePictures(page, cacheFileOptions);
  const icon = await cacheIcon(page, cacheFileOptions);
  const imageBlocks = await cacheImageBlocks(
    page.id,
    children,
    client,
    cacheFileOptions
  );

  fs.writeFileSync(pagePath, JSON.stringify(page, null, 2));
  return {
    path: path.relative(dataDir, pagePath),
    childrenPath: path.relative(dataDir, childrenPath),
    icon,
    pictures,
    imageBlocks,
  };
}
