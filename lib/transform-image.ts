import fs from "fs";
import path from "path";
import Jimp from "jimp";
import { CachedFile } from "./cache-file";

export type TransformedImage = {
  originalPath: string;
  transformedPath: string;
};

export async function transformImage(args: {
  file: CachedFile;
  dataDir: string;
  transformedDir: string;
}): Promise<TransformedImage> {
  const { file, dataDir, transformedDir } = args;
  let sourceImage: Buffer = fs.readFileSync(path.join(dataDir, file.path));
  let { contentType } = file.metadata;
  if (contentType === "image/heic") {
    throw new Error("HEIC images are not supported!");
  }
  const image = await Jimp.read(sourceImage);
  const parsed = path.parse(file.path);
  const newExt = "jpg";
  const newName = `${parsed.name}.${newExt}`;
  const newPath = path.join(transformedDir, parsed.dir, newName);
  const newRelativePath = path.relative(dataDir, newPath);

  // https://github.com/oliver-moran/jimp/issues/920
  (image.bitmap as any).exifBuffer = undefined;

  // TODO: Change this!
  image.scaleToFit(640, 480).quality(90).write(newPath);

  console.log(`Wrote ${newRelativePath}.`);

  return {
    originalPath: file.path,
    transformedPath: newRelativePath,
  };
}
