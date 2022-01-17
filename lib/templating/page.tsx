import React from "react";
import { ContentPageAssets, NotionPageAsset, ProjectAsset } from "../assets";
import { NotionBlock } from "./block";

export type PageProps = {
  contentPages: ContentPageAssets;
  projects: ProjectAsset[];
};

export const Page: React.FC<PageProps> = (props) => {
  return (
    <html>
      <head>
        <title>Eric Zimmerman's website</title>
      </head>
      <body>
        <h1>Eric Zimmerman's website</h1>
        <h2>Splash page content</h2>
        <NotionPageContent data={props.contentPages.splash_page} />
        <h2>Projects</h2>
        {props.projects.map((project) => {
          return <ProjectContent key={project.name} data={project} />;
        })}
      </body>
    </html>
  );
};

const NotionPageContent: React.FC<{ data: NotionPageAsset }> = ({ data }) => {
  return (
    <>
      {data.content.map((block) => {
        return <NotionBlock key={block.id} data={block} />;
      })}
    </>
  );
};

const ProjectContent: React.FC<{ data: ProjectAsset }> = ({ data }) => {
  return (
    <>
      <h3>{data.name}</h3>
      <p>context: {data.context}</p>
      <p>tags: {data.tags.join(", ")}</p>
      <NotionPageContent data={data} />
    </>
  );
};