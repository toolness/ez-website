import React from "react";

export type PageProps = {};

export const Page: React.FC<PageProps> = (props) => {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Eric Zimmerman's extremely work-in-progress website</title>
      </head>
      <body>
        <p style={{ background: "crimson", color: "white", padding: "1em" }}>
          <strong>This is an extreme work-in-progress!</strong> If you want to
          see Eric's real website, visit{" "}
          <a style={{ color: "inherit" }} href="https://ericzimmerman.com">
            ericzimmerman.com
          </a>
          .
        </p>
        {props.children}
      </body>
    </html>
  );
};
