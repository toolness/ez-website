import type { Block, RichText } from "@notionhq/client/build/src/api-types";
import React from "react";
import { StaticRenderer } from "./static-renderer.js";
import { Warning } from "./warning.js";

export type NotionBlockProps = {
  data: Block;
};

export const NotionBlock: React.FC<NotionBlockProps> = ({ data }) => {
  if (data.type === "paragraph") {
    return <p>{renderRichText(data.paragraph.text)}</p>;
  }
  return <Warning text={`Unknown block type "${data.type}"`} />;
};

function keyedFragment(
  key: number,
  children: JSX.Element | string
): JSX.Element {
  return <React.Fragment key={key}>{children}</React.Fragment>;
}

function renderRichText(richTexts: RichText[]): JSX.Element[] {
  return richTexts.map((richText, i) => {
    if (richText.type !== "text") {
      StaticRenderer.current.logWarning(
        `Don't know how to render "${richText.type}"`
      );
      return keyedFragment(i, richText.plain_text);
    }

    const { text } = richText;
    let current: JSX.Element | string = text.content;

    if (text.link) {
      current = (
        <a key={i} href={text.link.url} target="_blank">
          {current}
        </a>
      );
    }

    if (richText.annotations) {
      const a = richText.annotations;
      if (a.bold) {
        current = <strong>{current}</strong>;
      }
      if (a.code) {
        current = <code>{current}</code>;
      }
      if (a.italic) {
        current = <em>{current}</em>;
      }
      if (a.strikethrough) {
        current = <s>{current}</s>;
      }
      if (a.underline) {
        current = (
          <span style={{ textDecoration: "underline" }}>{current}</span>
        );
      }
      if (a.color !== "default") {
        StaticRenderer.current.logWarning(
          `Don't know how to render color "${a.color}".`
        );
      }
    }

    return keyedFragment(i, current);
  });
}
