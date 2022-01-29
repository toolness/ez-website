import React from "react";
import { StaticRenderer } from "./static-renderer.js";

export const Warning: React.FC<{ text: string }> = ({ text }) => {
  StaticRenderer.current.logWarning(text);

  return <p>WARNING: {text}</p>;
};
