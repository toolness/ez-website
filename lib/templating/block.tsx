import { Block } from "@notionhq/client/build/src/api-types";
import React from "react";
import { joinRichTextPlaintext } from "../notion-util.js";
import { Warning } from "./warning.js";

export type NotionBlockProps = {
  data: Block;
};

export const NotionBlock: React.FC<NotionBlockProps> = ({ data }) => {
  if (data.type === "paragraph") {
    // TODO: Render actual rich text, not plaintext.
    return <p>{joinRichTextPlaintext(data.paragraph.text)}</p>;
  }
  return <Warning text={`Unknown block type "${data.type}"`} />;
};
