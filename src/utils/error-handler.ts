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
  fn().catch((err: unknown) => {
    const message = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? err.stack : undefined;
    return createErrorResponse(message, stack);
  });

export { createErrorResponse, wrapToolHandler };
