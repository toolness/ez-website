import fs from "fs";
import path from "path";
import {
  DATA_DIR,
  readProjectPages,
  readTransformedImagesMap,
  TRANSFORMED_DIR,
  writeTransformedImages,
} from "./lib/data-dir";
import { getPageImages } from "./lib/cache-project-page";
import { TransformedImage, transformImage } from "./lib/transform-image";

function isFileUpToDate(file: string, dependency: string): boolean {
  if (!fs.existsSync(file)) return false;
  return fs.statSync(file).mtimeMs >= fs.statSync(dependency).mtimeMs;
}

async function main() {
  const pages = readProjectPages();
  const latestTransformedImages = readTransformedImagesMap();
  const transformedImages: TransformedImage[] = [];
  let upToDateCount = 0;
  for (let page of pages) {
    for (let image of getPageImages(page)) {
      const latestImage = latestTransformedImages.get(image.path);
      if (
        latestImage &&
        isFileUpToDate(
          path.join(DATA_DIR, latestImage.transformedPath),
          path.join(DATA_DIR, latestImage.originalPath)
        )
      ) {
        upToDateCount++;
        transformedImages.push(latestImage);
      } else {
        // TODO: Consider using a worker pool or something, we're
        // only leveraging one core here and this operation
        // can be expensive.
        transformedImages.push(
          await transformImage({
            file: image,
            dataDir: DATA_DIR,
            transformedDir: TRANSFORMED_DIR,
          })
        );
      }
    }
  }
  writeTransformedImages(transformedImages);

  const total = transformedImages.length;
  const transformedCount = total - upToDateCount;
  console.log(
    `Transformed ${transformedCount} image(s) (${upToDateCount} were already up to date).`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
