import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

const createErrorResponse = (
  message: string,
  details?: string,
): CallToolResult => ({
  content: [
    { type: "text", text: details ? `${message}\n${details}` : message },
  ],
  isError: true,
});

const wrapToolHandler = (
  fn: () => Promise<CallToolResult>,
): Promise<CallToolResult> =>
  fn().catch((err: Error) => createErrorResponse(err.message, err.stack));

export { createErrorResponse, wrapToolHandler };
