import React from "react";
import { NotionPageAsset } from "../assets";
import { NotionBlock } from "./block";

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
