import { debounce, getAllHTMLElements, getHTMLElement } from "./util.js";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      // https://coryrylan.com/blog/how-to-use-web-components-with-typescript-and-react
      ["project-search-sidebar"]: { children: any };
    }
  }
}

type SidebarElements = {
  form: HTMLFormElement;
  input: HTMLInputElement;
  autoSearchButtons: HTMLButtonElement[];
};

export class ProjectSearchSidebar extends HTMLElement {
  declare elements: SidebarElements;
  searchIndex: Array<[HTMLElement, string]> | undefined;

  performSearch() {
    const query = this.elements.input.value.toLowerCase();
    if (!this.searchIndex) {
      this.searchIndex = Array.from(document.querySelectorAll("details")).map(
        (details) => {
          const summary = getHTMLElement("summary", "", details);
          const searchText = summary.textContent?.toLowerCase() || "";
          return [details, searchText];
        }
      );
    }
    for (let [details, searchText] of this.searchIndex) {
      details.hidden = !searchText.includes(query);
    }
  }

  handleSubmit = (e: Event) => {
    e.preventDefault();
    this.performSearch();
  };

  handleInputFocus = () => {
    this.elements.input.select();
  };

  handleKeypress = debounce(() => {
    this.performSearch();
  });

  handleAutosearchButtonClick = (event: MouseEvent) => {
    const button = event.currentTarget;
    if (button instanceof HTMLElement && button.textContent) {
      const label = button.textContent;
      const { input } = this.elements;
      if (input.value === label) {
        input.value = "";
      } else {
        input.value = label;
      }
      this.performSearch();
    }
  };

  connectedCallback() {
    this.elements = {
      form: getHTMLElement("form", "", this),
      input: getHTMLElement("input", '[type="text"]', this),
      autoSearchButtons: getAllHTMLElements("button", "", this),
    };
    this.elements.input.addEventListener("keyup", this.handleKeypress);
    this.elements.input.addEventListener("focus", this.handleInputFocus);
    this.elements.form.addEventListener("submit", this.handleSubmit);
    this.elements.autoSearchButtons.forEach((button) => {
      button.addEventListener("click", this.handleAutosearchButtonClick);
    });
    this.setAttribute("active", "true");
  }
}

window.customElements.define("project-search-sidebar", ProjectSearchSidebar);
