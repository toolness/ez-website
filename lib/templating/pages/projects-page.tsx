import React from "react";
import { ProjectAsset } from "../../assets.js";
import { NotionPageAssetContent } from "../notion-page-asset-content.js";
import { Page } from "../page.js";
import { Picture } from "../picture.js";

export const ProjectsPage: React.FC<{ projects: ProjectAsset[] }> = ({
  projects,
}) => {
  return (
    <Page title="Projects">
      <nav>TODO: Implement sidebar.</nav>
      <main>
        {projects.map((project) => {
          return <ProjectContent key={project.name} data={project} />;
        })}
      </main>
    </Page>
  );
};

const ProjectContent: React.FC<{ data: ProjectAsset }> = ({ data }) => {
  return (
    <>
      <details>
        <summary className="project">
          <span>{data.name}</span>
          <span>{data.context}</span>
          <span>{data.tags.join(", ")}</span>
          <span>{data.years.start}</span>
        </summary>
        <div>
          {data.pictures.map((picture, i) => {
            return <Picture key={i} source={picture} />;
          })}
          <NotionPageAssetContent data={data} />
        </div>
      </details>
    </>
  );
};
