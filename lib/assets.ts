import fs from "fs";
import path from "path";
import { Block } from "@notionhq/client/build/src/api-types";
import { CachedFile } from "./cache-file.js";
import {
  ContentPageName,
  CONTENT_PAGE_NAMES,
  DATA_DIR,
  readChildBlocks,
  readContentPage,
  readNotionPage,
  readProjectPages,
  STATIC_DIR,
} from "./data-dir.js";
import {
  DateYears,
  getDateYears,
  getMultiSelect,
  getNonEmptyRichPlaintext,
  getNonEmptyTitlePlaintext,
  getProperty,
} from "./notion-util.js";

/**
 * A transformation applied to a binary asset, e.g. scaling.
 *
 * It is responsible for reading from the given source path,
 * and writing the transformed asset to the given destination
 * path.
 */
export type BinaryAssetTransformer = (
  absoluteSourcePath: string,
  absoluteDestinationPath: string
) => Promise<void>;

export type BinaryAsset = {
  /** The source of the binary asset, relative to our data dir. */
  source: string;
  /** The destination of the binary asset, relative to the site root. */
  destination: string;
  /** Any transformation done to the asset, e.g. scaling. */
  transformer?: BinaryAssetTransformer;
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

function isFileUpToDate(file: string, dependency: string): boolean {
  if (!fs.existsSync(file)) return false;
  return fs.statSync(file).mtimeMs >= fs.statSync(dependency).mtimeMs;
}

/**
 * Try to copy the binary asset from our data dir to the static dir,
 * applying any transformation if needed.
 *
 * If the static dir already contains the asset and it has the
 * same file-modified time as the source, don't do anything.
 *
 * Returns whether anything was written to the filesystem.
 */
export async function copyAndTransformBinaryAsset(
  binaryAsset: BinaryAsset
): Promise<boolean> {
  const source = path.join(DATA_DIR, binaryAsset.source);
  const destination = path.join(STATIC_DIR, binaryAsset.destination);
  if (isFileUpToDate(destination, source)) {
    return false;
  }
  const destinationDir = path.dirname(destination);
  if (!fs.existsSync(destinationDir)) {
    fs.mkdirSync(destinationDir, { recursive: true });
  }
  if (binaryAsset.transformer) {
    await binaryAsset.transformer(source, destination);
  } else {
    fs.copyFileSync(source, destination);
  }
  return true;
}
