import React from "react";
import { NotionPageAsset } from "../assets.js";
import { NotionBlock } from "./block.js";

export const NotionPageAssetContent: React.FC<{ data: NotionPageAsset }> = ({
  data,
}) => {
  return (
    <>
      {data.content.map((block) => {
        return <NotionBlock key={block.id} data={block} />;
      })}
    </>
  );
};
