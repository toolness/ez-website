import { Block } from "@notionhq/client/build/src/api-types";
import { CachedFile } from "./cache-file";
import {
  ContentPageName,
  CONTENT_PAGE_NAMES,
  readChildBlocks,
  readContentPage,
  readNotionPage,
  readProjectPages,
} from "./data-dir";
import {
  getMultiSelect,
  getNonEmptyRichPlaintext,
  getNonEmptyTitlePlaintext,
  getProperty,
} from "./notion-util";

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
      pictures: project.pictures,
      imageBlocks: project.imageBlocks,
      content,
    });
  }
  return result;
}
