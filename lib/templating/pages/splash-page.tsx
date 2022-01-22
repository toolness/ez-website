import React from "react";
import { NotionPageAsset } from "../../assets";
import { Link } from "../link";
import { NotionPageAssetContent } from "../notion-page-asset-content";
import { Page } from "../page";

export const SplashPage: React.FC<{ content: NotionPageAsset }> = ({
  content,
}) => {
  return (
    <Page>
      <h1>Splash page</h1>
      <p>
        <Link to="/projects/">Projects</Link>
      </p>
      <NotionPageAssetContent data={content} />
    </Page>
  );
};
