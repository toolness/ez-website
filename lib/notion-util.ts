import type { Client } from "@notionhq/client";
import type {
  Page,
  FilesPropertyValue,
  PropertyValue,
  RichText,
} from "@notionhq/client/build/src/api-types";

export type FileWithName = FilesPropertyValue["files"][0];

export type DateYears = { start: number; end?: number };

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

export function getMultiSelect(value: PropertyValue): string[] {
  if (value.type !== "multi_select") {
    throw new Error(`Expected property to be multi-select, not ${value.type}!`);
  }
  return value.multi_select
    .map((ms) => ms.name || "")
    .filter((name) => Boolean(name));
}

export function getProperty(page: Page, name: string): PropertyValue {
  if (!page.properties[name]) {
    throw new Error(`Expected to find property "${name}" in page!`);
  }
  return page.properties[name];
}

export function joinRichTextPlaintext(richText: RichText[]): string | null {
  return (
    richText
      .map((rt) => rt.plain_text)
      .join("")
      .trim() || null
  );
}

export function getNonEmptyTitlePlaintext(value: PropertyValue): string {
  if (value.type !== "title") {
    throw new Error(`Expected property to be title, not ${value.type}!`);
  }
  const result = joinRichTextPlaintext(value.title);
  if (!result) {
    throw new Error(`Expected title to be non-empty!`);
  }
  return result;
}

export function getOptionalRichPlaintext(value: PropertyValue): string | null {
  if (value.type !== "rich_text") {
    throw new Error(`Expected property to be rich text, not ${value.type}!`);
  }
  return joinRichTextPlaintext(value.rich_text);
}

export function getNonEmptyRichPlaintext(value: PropertyValue): string {
  const result = getOptionalRichPlaintext(value);
  if (!result) {
    throw new Error(`Expected rich text property to be non-empty!`);
  }
  return result;
}

function parseYearFromISODate(date: string): number {
  const number = parseInt(date.slice(0, 4));
  if (isNaN(number)) {
    throw new Error(`Unable to parse year from ISO date: ${date}`);
  }
  return number;
}

export function getDateYears(value: PropertyValue): DateYears {
  if (value.type !== "date") {
    throw new Error(`Expected property to be date, not ${value.type}!`);
  }
  const { date } = value;
  if (!date) {
    throw new Error(`Expected date property to be non-empty!`);
  }
  return {
    start: parseYearFromISODate(date.start),
    end: date.end ? parseYearFromISODate(date.end) : undefined,
  };
}
