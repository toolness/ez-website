import path from "path";

const INDEX_DOT_HTML = "index.html";

export type WebpagePath = {
  /**
   * The path to the page using posix-style path separators,
   * starting with a leading slash, based on the site root. Any
   * `index.html` is omitted, e.g. `/foo/` rather than `/foo/index.html`.
   */
  friendlyPath: string;
  /**
   * The path to the page using the host OS's path separator,
   * relative to the static root directory.
   */
  filesystemPath: string;
};

export function friendlyPathToFilesystemPath(friendlyPath: string): string {
  if (!friendlyPath.startsWith("/")) {
    throw new Error(
      `Expected "${friendlyPath}" to start with a leading slash!`
    );
  }
  const parts = friendlyPath.slice(1).split("/");
  if (friendlyPath.endsWith("/")) {
    parts.push(INDEX_DOT_HTML);
  }
  return path.join(...parts);
}

export function friendlyRelativePath(
  from: string,
  to: string,
  options: {
    explicitIndexHtml: boolean;
  }
): string {
  let result = path.posix.relative(from, to);
  if (to.endsWith("/") && !result.endsWith("/")) {
    result += "/";
  }
  if (options.explicitIndexHtml) {
    result = friendlyPathWithExplicitIndexHtml(result);
  }
  return result;
}

function friendlyPathWithExplicitIndexHtml(friendlyPath: string) {
  if (friendlyPath.endsWith("/")) {
    return friendlyPath + INDEX_DOT_HTML;
  }
  return friendlyPath;
}
