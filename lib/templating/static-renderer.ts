import { renderToStaticMarkup } from "react-dom/server";

export class StaticRenderer {
  warnings: string[] = [];

  static get current(): StaticRenderer {
    if (!currentStaticRenderer) {
      throw new Error(
        `No current static renderer is defined. This property should only be retrieved at render time, and rendering should be done via StaticRenderer.render().`
      );
    }
    return currentStaticRenderer;
  }

  render(root: JSX.Element): string {
    currentStaticRenderer = this;
    const result = renderToStaticMarkup(root);
    currentStaticRenderer = undefined;
    return result;
  }
}

let currentStaticRenderer: StaticRenderer | undefined = new StaticRenderer();
