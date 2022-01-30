import React from "react";
import { ProjectAsset } from "../../assets.js";
import { NotionPageAssetContent } from "../notion-page-asset-content.js";
import { Page } from "../page.js";
import { Picture } from "../picture.js";

function getTagList(projects: ProjectAsset[]) {
  const tagSet = new Set<string>();

  for (let project of projects) {
    for (let tag of project.tags) {
      tagSet.add(tag);
    }
  }

  const tags = Array.from(tagSet);
  tags.sort();

  return tags;
}

export const ProjectsPage: React.FC<{ projects: ProjectAsset[] }> = ({
  projects,
}) => {
  return (
    <Page title="Projects" moduleScripts={["/js/project-search-sidebar.js"]}>
      <nav>
        <project-search-sidebar>
          <label htmlFor="search" className="sr-only">
            Search projects
          </label>
          <input type="text" placeholder="Search" id="search" />
          <ul>
            {getTagList(projects).map((tag) => (
              <li key={tag}>
                <button className="link">{tag}</button>
              </li>
            ))}
          </ul>
        </project-search-sidebar>
      </nav>
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
          <span>
            <ul className="comma-separated">
              {data.tags.map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
          </span>
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
