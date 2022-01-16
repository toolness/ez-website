import type { Client } from "@notionhq/client";
import type {
  Page,
  FilesPropertyValue,
} from "@notionhq/client/build/src/api-types";

export type FileWithName = FilesPropertyValue["files"][0];

export function getFileURL(file: FileWithName) {
  if (file.type === "external") {
    return file.external.url;
  }
  return file.file.url;
}

export function getPageIconURL(item: Page): string | undefined {
  if (item.icon?.type === "external") {
    return item.icon.external.url;
  } else if (item.icon?.type === "file") {
    return item.icon.file.url;
  }
}

export async function* iterDatabase(client: Client, databaseId: string) {
  // TODO: Consider fetching the next page before we've exhausted the
  // current cached content. Or use streams to leverage node's backpressure
  // handling.
  let res = await client.databases.query({
    database_id: databaseId,
  });
  for (let item of res.results) {
    yield item;
  }
  while (res.next_cursor) {
    res = await client.databases.query({
      database_id: databaseId,
      start_cursor: res.next_cursor,
    });
    for (let item of res.results) {
      yield item;
    }
  }
}

export async function* iterBlockChildren(client: Client, blockId: string) {
  // TODO: Consider fetching the next page before we've exhausted the
  // current cached content. Or use streams to leverage node's backpressure
  // handling.
  let res = await client.blocks.children.list({
    block_id: blockId,
  });
  for (let item of res.results) {
    yield item;
  }
  while (res.next_cursor) {
    res = await client.blocks.children.list({
      block_id: blockId,
      start_cursor: res.next_cursor,
    });
    for (let item of res.results) {
      yield item;
    }
  }
}
