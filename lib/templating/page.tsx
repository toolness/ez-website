import React from "react";
import { Link } from "./link";
import { StaticRenderer } from "./static-renderer";

const SITE_TITLE = "Eric Zimmerman's work-in-progress website";

export type PageProps = {
  title?: string;
};

export const Page: React.FC<PageProps> = (props) => {
  const title = props.title ? `${props.title} | ${SITE_TITLE}` : SITE_TITLE;

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          rel="stylesheet"
          href={StaticRenderer.current.linkToInternal("/style.css")}
        />
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
