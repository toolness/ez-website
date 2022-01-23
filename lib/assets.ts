import fs from "fs";
import path from "path";
import { Block } from "@notionhq/client/build/src/api-types";
import { CachedFile } from "./cache-file";
import {
  ContentPageName,
  CONTENT_PAGE_NAMES,
  DATA_DIR,
  readChildBlocks,
  readContentPage,
  readNotionPage,
  readProjectPages,
  STATIC_DIR,
} from "./data-dir";
import {
  DateYears,
  getDateYears,
  getMultiSelect,
  getNonEmptyRichPlaintext,
  getNonEmptyTitlePlaintext,
  getProperty,
} from "./notion-util";

export type BinaryAsset = {
  /** The source of the binary asset, relative to our data dir. */
  source: string;
  /** The destination of the binary asset, relative to the site root. */
  destination: string;
};

export type ContentPageAssets = {
  [k in ContentPageName]: NotionPageAsset;
};

export interface NotionPageAsset {
  name: string;
  content: Block[];
  imageBlocks: CachedFile[];
}

export interface ProjectAsset extends NotionPageAsset {
  name: string;
  context: string;
  tags: string[];
  years: DateYears;
  pictures: CachedFile[];
}

function loadContentPageAsset(name: ContentPageName): NotionPageAsset {
  const contentPage = readContentPage(name);

  return {
    name,
    content: readChildBlocks(contentPage),
    imageBlocks: contentPage.imageBlocks,
  };
}

export function loadContentPageAssets(): ContentPageAssets {
  let result = {} as ContentPageAssets;

  for (let name of CONTENT_PAGE_NAMES) {
    result[name] = loadContentPageAsset(name);
  }

  return result;
}

export function loadProjectAssets(): ProjectAsset[] {
  const result: ProjectAsset[] = [];
  for (const project of readProjectPages()) {
    const page = readNotionPage(project);
    const content = readChildBlocks(project);
    result.push({
      name: getNonEmptyTitlePlaintext(getProperty(page, "Name")),
      context: getNonEmptyRichPlaintext(getProperty(page, "Context")),
      tags: getMultiSelect(getProperty(page, "Tags")),
      years: getDateYears(getProperty(page, "When")),
      pictures: project.pictures,
      imageBlocks: project.imageBlocks,
      content,
    });
  }
  return result;
}

export function copyBinaryAsset(binaryAsset: BinaryAsset) {
  const destination = path.join(STATIC_DIR, binaryAsset.destination);
  const destinationDir = path.dirname(destination);
  if (!fs.existsSync(destinationDir)) {
    fs.mkdirSync(destinationDir, { recursive: true });
  }
  fs.copyFileSync(path.join(DATA_DIR, binaryAsset.source), destination);
}
