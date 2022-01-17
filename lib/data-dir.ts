import path from "path";
import fs from "fs";

import type { CachedProjectPage } from "./cache-project-page";
import type { TransformedImage } from "./transform-image";
import type { Page, Block } from "@notionhq/client/build/src/api-types";
import { CachedPageChildren } from "./cache-page-children";

export const CONTENT_PAGE_NAMES = ["splash_page"] as const;

export type ContentPageName = typeof CONTENT_PAGE_NAMES[number];

function readJsonFile<T>(filename: string): T {
  return JSON.parse(fs.readFileSync(filename, { encoding: "utf-8" }));
}

function writeJsonFile<T>(filename: string, value: T) {
  fs.writeFileSync(filename, JSON.stringify(value, null, 2), {
    encoding: "utf-8",
  });
}

function filenameForContentPage(name: string): string {
  return path.join(DATA_DIR, `_content__${name}.json`);
}

export function writeContentPage(
  name: ContentPageName,
  page: CachedPageChildren
) {
  writeJsonFile(filenameForContentPage(name), page);
}

export function readContentPage(name: ContentPageName): CachedPageChildren {
  return readJsonFile(filenameForContentPage(name));
}

export const ROOT_DIR = path.normalize(path.join(__dirname, ".."));

export const DATA_DIR = path.join(ROOT_DIR, "data");

export const PROJECT_PAGES_JSON_PATH = path.join(
  DATA_DIR,
  `_project-pages.json`
);

export const TRANSFORMED_DIR = path.join(DATA_DIR, "transformed");

export const TRANSFORMED_IMAGES_JSON_PATH = path.join(
  DATA_DIR,
  "_transformed-images.json"
);

export const STATIC_DIR = path.join(ROOT_DIR, "static");

export function writeProjectPages(pages: CachedProjectPage[]) {
  writeJsonFile(PROJECT_PAGES_JSON_PATH, pages);
}

export function readProjectPages(): CachedProjectPage[] {
  return readJsonFile(PROJECT_PAGES_JSON_PATH);
}

export function readChildBlocks(page: CachedPageChildren): Block[] {
  return readJsonFile(path.join(DATA_DIR, page.childrenPath));
}

export function readNotionPage(page: CachedProjectPage): Page {
  return readJsonFile(path.join(DATA_DIR, page.path));
}

function readTransformedImages(): TransformedImage[] {
  if (!fs.existsSync(TRANSFORMED_IMAGES_JSON_PATH)) return [];
  return readJsonFile(TRANSFORMED_IMAGES_JSON_PATH);
}

export function readTransformedImagesMap(): Map<string, TransformedImage> {
  return new Map(readTransformedImages().map((ti) => [ti.originalPath, ti]));
}

export function writeTransformedImages(value: TransformedImage[]) {
  writeJsonFile(TRANSFORMED_IMAGES_JSON_PATH, value);
}

export function writeStaticTextFile(filename: string, content: string): string {
  const fullPath = path.join(STATIC_DIR, filename);
  ensureDirExists(path.dirname(fullPath));
  fs.writeFileSync(fullPath, content, {
    encoding: "utf-8",
  });
  return fullPath;
}

export function rootRelativePath(pathname: string): string {
  return path.relative(ROOT_DIR, pathname);
}

function ensureDirExists(dirName: string) {
  if (!fs.existsSync(dirName)) {
    fs.mkdirSync(dirName, { recursive: true });
  }
}

export function ensureDirsExist(dirs: string[]) {
  for (let dirName of dirs) {
    ensureDirExists(dirName);
  }
}

ensureDirsExist([DATA_DIR, TRANSFORMED_DIR]);
