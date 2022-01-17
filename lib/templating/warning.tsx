import React from "react";
import { StaticRenderer } from "./static-renderer";

export const Warning: React.FC<{ text: string }> = ({ text }) => {
  StaticRenderer.current.warnings.push(text);

  return <p>WARNING: {text}</p>;
};
