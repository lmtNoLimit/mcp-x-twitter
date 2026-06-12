interface XquikSearchOptions {
  readonly cursor?: string;
  readonly limit?: number;
  readonly query: string;
}

interface XquikTweetSearchToolResponse {
  readonly data: unknown;
  readonly meta: {
    readonly next_token?: string;
    readonly result_count: number;
  };
}

interface XquikTweetToolResponse {
  readonly data: unknown;
}

export interface XquikClient {
  readonly getTweet: (tweetId: string) => Promise<unknown>;
  readonly searchTweets: (options: XquikSearchOptions) => Promise<unknown>;
}

const DEFAULT_XQUIK_BASE_URL = "https://xquik.com/api/v1";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function trimTrailingSlash(value: string): string {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

function optionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function extractErrorMessage(body: unknown): string | undefined {
  if (!isRecord(body)) return undefined;
  const message = body.message ?? body.error;
  return typeof message === "string" && message.length > 0 ? message : undefined;
}

async function parseJsonResponse(response: Response): Promise<unknown> {
  const text = await response.text();
  if (text.length === 0) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

class HttpXquikClient implements XquikClient {
  readonly #apiKey: string;
  readonly #baseUrl: string;

  constructor(baseUrl: string, apiKey: string) {
    this.#apiKey = apiKey;
    this.#baseUrl = trimTrailingSlash(baseUrl);
  }

  async getTweet(tweetId: string): Promise<unknown> {
    return this.#request(`/x/tweets/${encodeURIComponent(tweetId)}`);
  }

  async searchTweets(options: XquikSearchOptions): Promise<unknown> {
    const params = new URLSearchParams({ q: options.query });
    if (typeof options.limit === "number") {
      params.set("limit", String(options.limit));
    }
    if (options.cursor) {
      params.set("cursor", options.cursor);
    }
    return this.#request(`/x/tweets/search?${params.toString()}`);
  }

  async #request(path: string): Promise<unknown> {
    const response = await fetch(`${this.#baseUrl}${path}`, {
      headers: {
        accept: "application/json",
        "x-api-key": this.#apiKey,
      },
    });
    const body = await parseJsonResponse(response);
    if (!response.ok) {
      const message = extractErrorMessage(body) ?? response.statusText;
      throw new Error(`Xquik request failed (${response.status}): ${message}`);
    }
    return body;
  }
}

function createXquikClientFromEnv(): XquikClient | null {
  const apiKey = process.env.XQUIK_API_KEY?.trim();
  if (!apiKey) return null;
  const baseUrl = process.env.XQUIK_BASE_URL?.trim() || DEFAULT_XQUIK_BASE_URL;
  return new HttpXquikClient(baseUrl, apiKey);
}

function normalizeXquikSearchResponse(body: unknown): XquikTweetSearchToolResponse {
  const response = isRecord(body) ? body : {};
  const tweets = Array.isArray(response.tweets) ? response.tweets : [];
  const nextToken = optionalString(response.next_cursor);
  return {
    data: tweets,
    meta: {
      ...(nextToken ? { next_token: nextToken } : {}),
      result_count: tweets.length,
    },
  };
}

function normalizeXquikTweetResponse(body: unknown): XquikTweetToolResponse {
  return { data: body };
}

export {
  createXquikClientFromEnv,
  normalizeXquikSearchResponse,
  normalizeXquikTweetResponse,
};
