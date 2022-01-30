import React from "react";
import { Link } from "./link.js";
import { StaticRenderer } from "./static-renderer.js";

const SITE_TITLE = "Eric Zimmerman's work-in-progress website";

export type PageProps = {
  title?: string;
  moduleScripts?: string[];
};

export const Page: React.FC<PageProps> = (props) => {
  const title = props.title ? `${props.title} | ${SITE_TITLE}` : SITE_TITLE;

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          rel="icon"
          type="image/png"
          href={StaticRenderer.current.linkToInternal("/favicon.png")}
        ></link>
        <link
          rel="stylesheet"
          href={StaticRenderer.current.linkToInternal("/style.css")}
        />
        {props.moduleScripts?.map((script) => (
          <script
            key={script}
            type="module"
            async
            src={StaticRenderer.current.linkToInternal(script)}
          ></script>
        ))}
        <title>{title}</title>
      </head>
      <body>
        <div className="page-wrapper">
          <header>
            <Link to="/">Eric Zimmerman</Link>
          </header>
          {props.children}
        </div>
      </body>
    </html>
  );
};
