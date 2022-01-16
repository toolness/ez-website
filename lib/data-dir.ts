import path from "path";
import fs from "fs";

import type { CachedProjectPage } from "./cache-project-page";
import type { TransformedImage } from "./transform-image";
import type { Page } from "@notionhq/client/build/src/api-types";

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
  fs.writeFileSync(PROJECT_PAGES_JSON_PATH, JSON.stringify(pages, null, 2));
}

export function readProjectPages(): CachedProjectPage[] {
  return JSON.parse(
    fs.readFileSync(PROJECT_PAGES_JSON_PATH, { encoding: "utf-8" })
  );
}

export function readProjectPage(page: CachedProjectPage): Page {
  return JSON.parse(
    fs.readFileSync(path.join(DATA_DIR, page.path), { encoding: "utf-8" })
  );
}

function readTransformedImages(): TransformedImage[] {
  if (!fs.existsSync(TRANSFORMED_IMAGES_JSON_PATH)) return [];
  return JSON.parse(
    fs.readFileSync(TRANSFORMED_IMAGES_JSON_PATH, { encoding: "utf-8" })
  );
}

export function readTransformedImagesMap(): Map<string, TransformedImage> {
  return new Map(readTransformedImages().map((ti) => [ti.originalPath, ti]));
}

export function writeTransformedImages(value: TransformedImage[]) {
  fs.writeFileSync(
    TRANSFORMED_IMAGES_JSON_PATH,
    JSON.stringify(value, null, 2)
  );
}

export function ensureDirsExist(dirs: string[]) {
  for (let dirName of dirs) {
    if (!fs.existsSync(dirName)) {
      fs.mkdirSync(dirName, { recursive: true });
    }
  }
}

ensureDirsExist([DATA_DIR, TRANSFORMED_DIR]);
