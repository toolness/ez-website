import path from "path";
import React from "react";
import { CachedFile } from "../cache-file";
import { StaticRenderer } from "./static-renderer";

const IMAGES_DIR = "images";

export const Picture: React.FC<{ source: CachedFile }> = ({ source }) => {
  const filename = path.basename(source.path);
  const src = StaticRenderer.current.linkToBinaryAsset({
    source: source.path,
    friendlyPath: `/${IMAGES_DIR}/${filename}`,
  });
  const { imageSize } = source.metadata;
  return (
    <img
      src={src}
      width={imageSize?.width}
      height={imageSize?.height}
      // TODO: Add alt text somehow... Blerg.
      alt=""
    />
  );
};
