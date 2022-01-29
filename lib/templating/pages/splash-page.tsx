import React from "react";
import { NotionPageAsset } from "../../assets.js";
import { Link } from "../link.js";
import { NotionPageAssetContent } from "../notion-page-asset-content.js";
import { Page } from "../page.js";

export const SplashPage: React.FC<{ content: NotionPageAsset }> = ({
  content,
}) => {
  return (
    <Page>
      <nav>
        <ul>
          <li>
            <Link to="/projects/">Projects</Link>
          </li>
          <li>
            <Link to="/collaborations/">Collaborations</Link>
          </li>
          <li>
            <Link to="/bio/">Bio / Contact</Link>
          </li>
        </ul>
      </nav>
      <main>
        <NotionPageAssetContent data={content} />
      </main>
    </Page>
  );
};
