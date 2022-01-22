import { renderToStaticMarkup } from "react-dom/server";

type BinaryAsset = {
  /** The source of the binary asset, relative to our data dir. */
  source: string;
  /** The destination of the binary asset, relative to the site root. */
  destination: string;
};

export class StaticRenderer {
  warnings: string[] = [];
  private binaryAssets: Map<string, string> = new Map();

  static get current(): StaticRenderer {
    if (!currentStaticRenderer) {
      throw new Error(
        `No current static renderer is defined. This property should only be retrieved at render time, and rendering should be done via StaticRenderer.render().`
      );
    }
    return currentStaticRenderer;
  }

  addBinaryAsset(asset: BinaryAsset) {
    const source = this.binaryAssets.get(asset.destination);
    if (source) {
      if (source !== asset.source) {
        throw new Error(
          `Conflicting sources for binary asset ${asset.destination}!`
        );
      }
    } else {
      this.binaryAssets.set(asset.destination, asset.source);
    }
  }

  getBinaryAssets(): BinaryAsset[] {
    return Array.from(this.binaryAssets.entries()).map(
      ([destination, source]) => ({ source, destination })
    );
  }

  render(root: JSX.Element): string {
    currentStaticRenderer = this;
    const result = renderToStaticMarkup(root);
    currentStaticRenderer = undefined;
    return result;
  }
}

let currentStaticRenderer: StaticRenderer | undefined = new StaticRenderer();
