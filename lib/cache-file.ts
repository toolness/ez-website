import path from "path";
import fs from "fs";
import http, { Agent } from "http";
import https from "https";
import mime from "mime-types";
import fetch, { Response, RequestInit } from "node-fetch";
import Jimp from "jimp";

export type Dimensions = {
  width: number;
  height: number;
};

export type Metadata = {
  baseUrl: string;
  contentType: string;
  etag: string | null;
  lastModified: string | null;
  imageSize?: Dimensions;
  // TODO: Consider also storing age and cache-control headers, as
  // some edge servers use these instead of etag/last-modified.
};

export type CachedFile = {
  path: string;
  metadata: Metadata;
};

async function getImageSize(bytes: Buffer): Promise<Dimensions> {
  const image = await Jimp.read(bytes);
  return {
    width: image.getWidth(),
    height: image.getHeight(),
  };
}

function getBaseUrl(url: string): string {
  const parsed = new URL(url);
  const paramsToRemove: string[] = [];
  parsed.searchParams.forEach((value, param) => {
    if (param.startsWith("X-Amz-") || param === "x-id") {
      paramsToRemove.push(param);
    }
  });
  for (let param of paramsToRemove) {
    parsed.searchParams.delete(param);
  }
  return parsed.toString();
}

export class AgentContext {
  agent: (parsedUrl: URL) => Agent;
  private httpAgent = new http.Agent({ keepAlive: true });
  private httpsAgent = new https.Agent({ keepAlive: true });

  constructor() {
    this.agent = (parsedURL) => {
      if (parsedURL.protocol === "http:") {
        return this.httpAgent;
      }
      return this.httpsAgent;
    };
  }

  destroy() {
    this.httpAgent.destroy();
    this.httpsAgent.destroy();
  }
}

export type CacheFileOptions = {
  agentContext: AgentContext;
  dataDir: string;
};

export async function cacheFile(
  url: string,
  baseName: string,
  options: CacheFileOptions
): Promise<CachedFile> {
  const { dataDir } = options;
  const baseUrl = getBaseUrl(url);
  const metadataPath = path.join(dataDir, `${baseName}.meta.json`);
  const getContentType = (response: Response): string => {
    const contentType = response.headers.get("content-type");
    if (!contentType) {
      throw new Error(`URL has no content type: ${url}`);
    }
    return contentType;
  };
  const getFilePath = (metadata: Metadata): string => {
    const ext = mime.extension(metadata.contentType);
    if (!ext) {
      throw new Error(
        `URL has unknown content type "${metadata.contentType}": ${baseUrl}`
      );
    }
    return path.join(dataDir, `${baseName}.${ext}`);
  };
  const download = async (metadata?: Metadata): Promise<CachedFile> => {
    const headers: RequestInit["headers"] = {};
    if (metadata) {
      const filePath = getFilePath(metadata);
      if (fs.existsSync(filePath)) {
        if (metadata.etag) {
          headers["If-None-Match"] = metadata.etag;
        }
        if (metadata.lastModified) {
          headers["If-Modified-Since"] = metadata.lastModified;
        }
      }
    }
    const response = await fetch(url, {
      agent: options.agentContext?.agent,
      headers,
    });
    if (metadata && response.status === 304) {
      console.log(`Not changed: ${baseUrl}`);
      return {
        path: path.relative(dataDir, getFilePath(metadata)),
        metadata,
      };
    }
    if (!response.ok) {
      throw new Error(`Got HTTP ${response.status} retrieving ${baseUrl}`);
    }
    const newMetadata: Metadata = {
      contentType: getContentType(response),
      lastModified: response.headers.get("last-modified"),
      etag: response.headers.get("etag"),
      baseUrl,
    };
    console.log(`Caching ${baseUrl}...`);
    const filePath = getFilePath(newMetadata);
    const chunks: Buffer[] = [];
    for await (const chunk of response.body) {
      if (!(chunk instanceof Buffer)) {
        throw new Error("Assertion failed, expected chunk to be a Buffer");
      }
      chunks.push(chunk);
    }
    const contents = Buffer.concat(chunks);
    if (newMetadata.contentType.startsWith("image/")) {
      newMetadata.imageSize = await getImageSize(contents);
    }
    fs.writeFileSync(filePath, contents);
    fs.writeFileSync(metadataPath, JSON.stringify(newMetadata, null, 2));

    return {
      path: path.relative(dataDir, getFilePath(newMetadata)),
      metadata: newMetadata,
    };
  };

  if (fs.existsSync(metadataPath)) {
    const cachedMetadata: Metadata = JSON.parse(
      fs.readFileSync(metadataPath, { encoding: "utf-8" })
    );
    if (cachedMetadata.baseUrl === baseUrl) {
      return download(cachedMetadata);
    }
  }

  return download();
}
