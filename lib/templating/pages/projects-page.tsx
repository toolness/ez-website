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

const ProjectSearchSidebar: React.FC<{ projects: ProjectAsset[] }> = ({
  projects,
}) => {
  const tags = getTagList(projects);

  return (
    <project-search-sidebar>
      <form>
        <label htmlFor="search" className="sr-only">
          Search projects
        </label>
        <input type="text" placeholder="Search" id="search" />
      </form>
      <ul className="hidden-on-mobile">
        {tags.map((tag) => (
          <li key={tag}>
            <button className="link">{tag}</button>
          </li>
        ))}
      </ul>
    </project-search-sidebar>
  );
};

export const ProjectsPage: React.FC<{ projects: ProjectAsset[] }> = ({
  projects,
}) => {
  return (
    <Page title="Projects" moduleScripts={["/js/project-search-sidebar.js"]}>
      <nav>
        <ProjectSearchSidebar projects={projects} />
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
          <span className="hidden-on-mobile">{data.context}</span>
          <span>
            <ul className="comma-separated">
              {data.tags.map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
          </span>
          <span className="hidden-on-mobile">{data.years.start}</span>
        </summary>
        <div className="project-full-details">
          <div className="project-description">
            <NotionPageAssetContent data={data} />
          </div>
          <div className="project-pictures">
            {data.pictures.map((picture, i) => {
              return <Picture key={i} source={picture} />;
            })}
          </div>
        </div>
      </details>
    </>
  );
};
