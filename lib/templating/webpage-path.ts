import path from "path";

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
    parts.push("index.html");
  }
  return path.join(...parts);
}
