import type { Block, RichText } from "@notionhq/client/build/src/api-types";
import React from "react";
import { assertUnreachable } from "../util.js";
import { StaticRenderer } from "./static-renderer.js";
import { Warning } from "./warning.js";

export type NotionBlocksProps = {
  blocks: Block[];
};

type InProgressList = {
  type: "bulleted_list_item" | "numbered_list_item";
  key: string;
  items: JSX.Element[];
};

export const NotionBlocks: React.FC<NotionBlocksProps> = ({ blocks }) => {
  const result: JSX.Element[] = [];
  let currentList: InProgressList | undefined;
  const tryToCloseCurrentList = () => {
    if (!currentList) return;
    if (currentList.type === "bulleted_list_item") {
      result.push(<ul key={currentList.key}>{currentList.items}</ul>);
    } else if (currentList.type === "numbered_list_item") {
      result.push(<ol key={currentList.key}>{currentList.items}</ol>);
    } else {
      assertUnreachable(currentList.type, `unexpected list type`);
    }
    currentList = undefined;
  };

  for (const block of blocks) {
    if (
      block.type === "bulleted_list_item" ||
      block.type === "numbered_list_item"
    ) {
      if (!(currentList && currentList.type === block.type)) {
        tryToCloseCurrentList();
        currentList = { type: block.type, items: [], key: block.id };
      }
      currentList.items.push(<NotionBlock key={block.id} data={block} />);
    } else {
      tryToCloseCurrentList();
      result.push(<NotionBlock key={block.id} data={block} />);
    }
  }

  tryToCloseCurrentList();

  return <>{result}</>;
};

export type NotionBlockProps = {
  data: Block;
};

const NotionBlock: React.FC<NotionBlockProps> = ({ data }) => {
  if (data.type === "paragraph") {
    return <p>{renderRichText(data.paragraph.text)}</p>;
  } else if (data.type === "bulleted_list_item") {
    return (
      <li>
        {renderRichText(data.bulleted_list_item.text)}
        <NotionBlocks blocks={data.bulleted_list_item.children || []} />
      </li>
    );
  } else if (data.type === "numbered_list_item") {
    return (
      <li>
        {renderRichText(data.numbered_list_item.text)}
        <NotionBlocks blocks={data.numbered_list_item.children || []} />
      </li>
    );
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
