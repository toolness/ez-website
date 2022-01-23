import React from "react";
import { ProjectAsset } from "../../assets";
import { Link } from "../link";
import { NotionPageAssetContent } from "../notion-page-asset-content";
import { Page } from "../page";
import { Picture } from "../picture";

export const ProjectsPage: React.FC<{ projects: ProjectAsset[] }> = ({
  projects,
}) => {
  return (
    <Page>
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
