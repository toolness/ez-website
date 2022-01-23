import path from "path";
import Jimp from "jimp";
import { BinaryAssetTransformer } from "./assets";
import { CachedFile, Dimensions } from "./cache-file";
import type { StaticRenderer } from "./templating/static-renderer";

const MAX_THUMBNAIL_SIZE: Dimensions = { width: 640, height: 480 };

const THUMBNAIL_QUALITY = 60;

const grayscaleThumbnail: BinaryAssetTransformer = async (
  source,
  destination
) => {
  const image = await Jimp.read(source);

  // https://github.com/oliver-moran/jimp/issues/920
  (image.bitmap as any).exifBuffer = undefined;

  const width = image.getWidth();
  const height = image.getHeight();

  const resized = getScaleToFitSize({
    fitSize: MAX_THUMBNAIL_SIZE,
    imageSize: {
      width,
      height,
    },
  });

  if (resized.width !== width && resized.height !== height) {
    image.resize(resized.width, resized.height);
  }

  await image.greyscale().quality(THUMBNAIL_QUALITY).writeAsync(destination);
};

function getFilenameStem(filename: string): string {
  return path.basename(filename, path.extname(filename));
}

function getScaleToFitSize(args: {
  fitSize: Dimensions;
  imageSize: Dimensions;
}): Dimensions {
  const { imageSize } = args;
  const { width: w, height: h } = args.fitSize;

  // This is taken from Jimp's scaleToFit() implementation:
  // https://github.com/oliver-moran/jimp/blob/master/packages/plugin-scale/src/index.js
  let scaleFactor =
    w / h > imageSize.width / imageSize.height
      ? h / imageSize.height
      : w / imageSize.width;

  // Unlike Jimp, we only want to downscale.
  if (scaleFactor > 1.0) {
    scaleFactor = 1.0;
  }

  // Looks like Jimp rounds dimensions:
  // https://github.com/oliver-moran/jimp/blob/master/packages/plugin-resize/src/index.js
  return {
    width: Math.round(imageSize.width * scaleFactor),
    height: Math.round(imageSize.height * scaleFactor),
  };
}

export function linkToGrayscaleThumbnail(args: {
  renderer: StaticRenderer;
  source: CachedFile;
  /**
   * Root path where the thumbnail should be accessed from by,
   * browsers without a trailing slash, e.g. `/images/thumbnails`.
   */
  friendlyRootDir: string;
}): { src: string; width?: number; height?: number } {
  const { renderer, source, friendlyRootDir } = args;
  const stem = getFilenameStem(source.path);
  const thumbnailFilename = `${stem}.jpg`;
  const src = renderer.linkToBinaryAsset({
    source: source.path,
    transformer: grayscaleThumbnail,
    friendlyPath: `${friendlyRootDir}/${thumbnailFilename}`,
  });
  const { imageSize } = source.metadata;

  return {
    src,
    ...(imageSize &&
      getScaleToFitSize({
        fitSize: MAX_THUMBNAIL_SIZE,
        imageSize,
      })),
  };
}
