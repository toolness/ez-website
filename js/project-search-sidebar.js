import { debounce, getAllHTMLElements, getHTMLElement } from "./util.js";
export class ProjectSearchSidebar extends HTMLElement {
    constructor() {
        super(...arguments);
        this.handleSubmit = (e) => {
            e.preventDefault();
            this.performSearch();
        };
        this.handleInputFocus = () => {
            this.elements.input.select();
        };
        this.handleKeypress = debounce(() => {
            this.performSearch();
        });
        this.handleAutosearchButtonClick = (event) => {
            const button = event.currentTarget;
            if (button instanceof HTMLElement && button.textContent) {
                const label = button.textContent;
                const { input } = this.elements;
                if (input.value === label) {
                    input.value = "";
                }
                else {
                    input.value = label;
                }
                this.performSearch();
            }
        };
    }
    performSearch() {
        const query = this.elements.input.value.toLowerCase();
        if (!this.searchIndex) {
            this.searchIndex = Array.from(document.querySelectorAll("details")).map((details) => {
                var _a;
                const summary = getHTMLElement("summary", "", details);
                const searchText = ((_a = summary.textContent) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || "";
                return [details, searchText];
            });
        }
        for (let [details, searchText] of this.searchIndex) {
            details.hidden = !searchText.includes(query);
        }
    }
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
//# sourceMappingURL=project-search-sidebar.js.map