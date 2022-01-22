import path from "path";
import React from "react";
import { CachedFile } from "../cache-file";
import { StaticRenderer } from "./static-renderer";

const IMAGES_DIR = "images";

export const Picture: React.FC<{ source: CachedFile }> = ({ source }) => {
  const filename = path.basename(source.path);
  const destinationParts = [IMAGES_DIR, filename];
  StaticRenderer.current.addBinaryAsset({
    source: source.path,
    destination: path.join(...destinationParts),
  });
  const { imageSize } = source.metadata;
  return (
    <img
      src={path.posix.join(...destinationParts)}
      width={imageSize?.width}
      height={imageSize?.height}
      // TODO: Add alt text somehow... Blerg.
      alt=""
    />
  );
};
