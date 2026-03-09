import { z } from "zod";
import * as fs from "fs";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { TwitterApi } from "twitter-api-v2";
import { wrapToolHandler } from "../utils/error-handler.js";

const register = (server: McpServer, client: TwitterApi) => {
  server.tool(
    "upload_media",
    "Upload an image or video file to X/Twitter using the v1.1 media upload API. Returns a media_id to use with post_tweet.",
    {
      file_path: z
        .string()
        .describe("Absolute path to the media file to upload (image: jpg/png/gif/webp, video: mp4)"),
      media_type: z
        .enum(["image/jpeg", "image/png", "image/gif", "image/webp", "video/mp4"])
        .describe("MIME type of the media file"),
      alt_text: z
        .string()
        .max(1000)
        .optional()
        .describe("Accessibility alt text for images"),
    },
    async (args) =>
      wrapToolHandler(async () => {
        if (!fs.existsSync(args.file_path)) {
          throw new Error(`File not found: ${args.file_path}`);
        }
        const mediaId = await client.v1.uploadMedia(args.file_path, {
          mimeType: args.media_type,
        });
        // Add alt text for images if provided
        if (args.alt_text && args.media_type.startsWith("image/")) {
          await client.v1.createMediaMetadata(mediaId, {
            alt_text: { text: args.alt_text },
          });
        }
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ media_id: mediaId, file_path: args.file_path }, null, 2),
            },
          ],
        };
      }),
  );
};

export { register };
