import React from "react";
import { StaticRenderer } from "./static-renderer.js";

type LinkProps = {
  to: string;
};

export const Link: React.FC<LinkProps> = (props) => {
  const href = StaticRenderer.current.linkToInternal(props.to);
  return <a href={href}>{props.children}</a>;
};
