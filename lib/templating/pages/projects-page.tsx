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
      <h1>Projects</h1>
      <p>
        <Link to="/">Home</Link>
      </p>
      {projects.map((project) => {
        return <ProjectContent key={project.name} data={project} />;
      })}
    </Page>
  );
};

const ProjectContent: React.FC<{ data: ProjectAsset }> = ({ data }) => {
  return (
    <>
      <h3>{data.name}</h3>
      <p>context: {data.context}</p>
      <p>tags: {data.tags.join(", ")}</p>
      {data.pictures.map((picture, i) => {
        return <Picture key={i} source={picture} />;
      })}
      <NotionPageAssetContent data={data} />
    </>
  );
};
