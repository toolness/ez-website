import { renderToStaticMarkup } from "react-dom/server";
import type { BinaryAsset, BinaryAssetTransformer } from "../assets";
import {
  friendlyPathToFilesystemPath,
  friendlyRelativePath,
  WebpagePath,
} from "./webpage-path";

export type PageLink = {
  /** Friendly path of the page where the link is mentioned. */
  from: string;

  /** Friendly path of the page where the link goes to. */
  to: string;
};

export type RenderedPage = {
  path: WebpagePath;
  html: string;
};

export class StaticRenderer {
  warnings: string[] = [];
  private binaryAssets: Map<string, BinaryAsset> = new Map();
  private _currentPage: string | undefined;
  private renderedPages: Map<string, string> = new Map();
  private internalLinks: Map<string, Set<string>> = new Map();

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

  private rememberInternalLink(friendlyPath: string) {
    let links = this.internalLinks.get(this.currentPage);
    if (!links) {
      links = new Set();
      this.internalLinks.set(this.currentPage, links);
    }
    links.add(friendlyPath);
  }

  /**
   * Link to another page or file on the site from the current page.
   */
  linkToInternal(friendlyPath: string): string {
    this.rememberInternalLink(friendlyPath);
    return friendlyRelativePath(this.currentPage, friendlyPath, {
      explicitIndexHtml: Boolean(process.env.LINK_TO_INDEX_HTML),
    });
  }

  linkToBinaryAsset(asset: {
    source: string;
    friendlyPath: string;
    transformer?: BinaryAssetTransformer;
  }): string {
    const destination = friendlyPathToFilesystemPath(asset.friendlyPath);
    const existingAsset = this.binaryAssets.get(destination);
    if (existingAsset) {
      if (existingAsset.source !== asset.source) {
        throw new Error(`Conflicting sources for binary asset ${destination}!`);
      }
      if (existingAsset.transformer !== asset.transformer) {
        throw new Error(
          `Conflicting transformers for binary asset ${destination}!`
        );
      }
    } else {
      this.binaryAssets.set(destination, {
        source: asset.source,
        destination,
        transformer: asset.transformer,
      });
    }
    return this.linkToInternal(asset.friendlyPath);
  }

  *getInternalLinks(): Iterable<PageLink> {
    for (let [from, links] of this.internalLinks.entries()) {
      for (let to of links) {
        yield { from, to };
      }
    }
  }

  getBinaryAssets(): BinaryAsset[] {
    return Array.from(this.binaryAssets.values());
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

  logWarning(message: string) {
    if (this.currentPage) {
      message = `${message} (on "${this.currentPage}")`;
    }
    this.warnings.push(message);
  }
}

let currentStaticRenderer: StaticRenderer | undefined = new StaticRenderer();
