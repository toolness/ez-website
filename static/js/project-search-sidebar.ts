import { getHTMLElement } from "./util.js";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      // https://coryrylan.com/blog/how-to-use-web-components-with-typescript-and-react
      ["project-search-sidebar"]: { children: any };
    }
  }
}

export class ProjectSearchSidebar extends HTMLElement {
  input: HTMLInputElement;

  constructor() {
    super();
    this.input = getHTMLElement("input", '[type="text"]', this);
  }

  connectedCallback() {
    console.log("TODO: Implement project search sidebar.");
    // this.setAttribute("active", "true");
  }
}

window.customElements.define("project-search-sidebar", ProjectSearchSidebar);
