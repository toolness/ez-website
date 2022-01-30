import React from "react";
import { NotionPageAsset } from "../assets.js";
import { NotionBlocks } from "./block.js";

export const NotionPageAssetContent: React.FC<{ data: NotionPageAsset }> = ({
  data,
}) => {
  return <NotionBlocks blocks={data.content} />;
};
