import path from "path";
import fs from "fs";
import type { Client } from "@notionhq/client";
import type { Block, ImageBlock } from "@notionhq/client/build/src/api-types";
import {
  AgentContext,
  CachedFile,
  cacheFile,
  CacheFileOptions,
} from "./cache-file.js";
import { iterBlockChildren } from "./notion-util.js";
import { assertUnreachable } from "./util.js";

export type CachedPageChildren = {
  childrenPath: string;
  imageBlocks: CachedFile[];
};

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

  if (imageBlocks.length > 1) {
    throw new Error(
      "TODO: Need to implement downloading more than the first image!"
    );
  }

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

export async function cachePageChildren(options: {
  pageId: string;
  dataDir: string;
  agentContext: AgentContext;
  client: Client;
  forceRefresh: boolean;
}): Promise<CachedPageChildren> {
  const { pageId, dataDir, agentContext, client, forceRefresh } = options;
  const cacheFileOptions: CacheFileOptions = {
    dataDir,
    agentContext,
  };
  const childrenPath = path.join(dataDir, `${pageId}-children.json`);
  const fetchChildren = !fs.existsSync(childrenPath) || forceRefresh;
  if (fetchChildren) {
    const children: Block[] = [];
    for await (const child of iterBlockChildren(client, pageId)) {
      children.push(child);
    }
    fs.writeFileSync(childrenPath, JSON.stringify(children, null, 2));
  }
  const children: Block[] = JSON.parse(
    fs.readFileSync(childrenPath, { encoding: "utf-8" })
  );
  const imageBlocks = await cacheImageBlocks(
    pageId,
    children,
    client,
    cacheFileOptions
  );

  return { childrenPath: path.relative(dataDir, childrenPath), imageBlocks };
}
