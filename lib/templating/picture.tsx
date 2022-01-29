import path from "path";
import React from "react";
import { CachedFile } from "../cache-file.js";
import { linkToGrayscaleThumbnail } from "../image-transformers.js";
import { StaticRenderer } from "./static-renderer.js";

const IMAGES_DIR = "/images";
const THUMBNAILS_DIR = `${IMAGES_DIR}/thumbnails`;

export const Picture: React.FC<{ source: CachedFile }> = ({ source }) => {
  const filename = path.basename(source.path);
  const thumbnail = linkToGrayscaleThumbnail({
    renderer: StaticRenderer.current,
    source,
    friendlyRootDir: THUMBNAILS_DIR,
  });
  const src = StaticRenderer.current.linkToBinaryAsset({
    source: source.path,
    friendlyPath: `${IMAGES_DIR}/${filename}`,
  });
  return (
    <a href={src} target="_blank">
      <img
        src={thumbnail.src}
        width={thumbnail.width}
        height={thumbnail.height}
        // TODO: Add alt text somehow... Blerg.
        alt=""
      />
    </a>
  );
};
