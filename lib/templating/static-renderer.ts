import { posix as posixPath } from "path";
import { renderToStaticMarkup } from "react-dom/server";
import type { BinaryAsset } from "../assets";
import { friendlyPathToFilesystemPath, WebpagePath } from "./webpage-path";

export type RenderedPage = {
  path: WebpagePath;
  html: string;
};

export class StaticRenderer {
  warnings: string[] = [];
  private binaryAssets: Map<string, string> = new Map();
  private _currentPage: string | undefined;
  private renderedPages: Map<string, string> = new Map();

  static get current(): StaticRenderer {
    if (!currentStaticRenderer) {
      throw new Error(
        `No current static renderer is defined. This property should only be retrieved at render time, and rendering should be done via StaticRenderer.render().`
      );
    }
    return currentStaticRenderer;
  }

  private get currentPage(): string {
    if (!this._currentPage) {
      throw new Error(`No current page is defined!`);
    }
    return this._currentPage;
  }

  /**
   * Link to another page on the site from the current page.
   */
  linkTo(friendlyPath: string): string {
    // TODO: Remember this link, at a later stage we can make sure that
    // none of these links are 404's.
    return posixPath.relative(this.currentPage, friendlyPath);
  }

  linkToBinaryAsset(asset: { source: string; friendlyPath: string }): string {
    const destination = friendlyPathToFilesystemPath(asset.friendlyPath);
    const source = this.binaryAssets.get(destination);
    if (source) {
      if (source !== asset.source) {
        throw new Error(`Conflicting sources for binary asset ${destination}!`);
      }
    } else {
      this.binaryAssets.set(destination, asset.source);
    }
    return this.linkTo(asset.friendlyPath);
  }

  getBinaryAssets(): BinaryAsset[] {
    return Array.from(this.binaryAssets.entries()).map(
      ([destination, source]) => ({ source, destination })
    );
  }

  renderPage(friendlyPath: string, root: JSX.Element) {
    if (this.renderedPages.has(friendlyPath)) {
      throw new Error(`${friendlyPath} has already been rendered!`);
    }
    this._currentPage = friendlyPath;
    currentStaticRenderer = this;
    this.renderedPages.set(friendlyPath, renderToStaticMarkup(root));
    currentStaticRenderer = undefined;
    this._currentPage = undefined;
  }

  getRenderedPages(): RenderedPage[] {
    return Array.from(this.renderedPages.entries()).map(
      ([friendlyPath, html]) => ({
        path: {
          friendlyPath,
          filesystemPath: friendlyPathToFilesystemPath(friendlyPath),
        },
        html,
      })
    );
  }
}

let currentStaticRenderer: StaticRenderer | undefined = new StaticRenderer();
