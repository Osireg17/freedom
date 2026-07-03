import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import log from "encore.dev/log";
import { UserResponseResponse } from "./types";
import { createUserResponse } from "./Manager/ResponseManager";
import { IncomingMessage, ServerResponse } from "http";

export const getResponseApi = api.raw(
    { expose: true, method: "POST", path: "/interviews/:interviewId/questions/:questionId/response", auth: true },
    async (req: IncomingMessage, resp: ServerResponse) => {
        const authData = getAuthData();
        if (!authData || !authData.userID) {
            resp.writeHead(401, { "Content-Type": "application/json" });
            resp.end(JSON.stringify({ error: { message: "User is not authenticated" } }));
            return;
        }
        const { userID } = authData;

        // Parse path parameters from req.url
        const url = req.url || "";
        const parsedUrl = new URL(url, "http://localhost");
        const match = parsedUrl.pathname.match(/\/interviews\/([^/]+)\/questions\/([^/]+)\/response/);
        if (!match) {
            resp.writeHead(400, { "Content-Type": "application/json" });
            resp.end(JSON.stringify({ error: { message: "Invalid URL path" } }));
            return;
        }
        const interviewId = match[1];
        const questionId = match[2];

        // Parse query parameters
        const responseTimeMs = parseInt(parsedUrl.searchParams.get("responseTimeMs") || "0", 10);
        const redoAttemptNumber = parseInt(parsedUrl.searchParams.get("redoAttemptNumber") || "0", 10);

        // Read raw request body into a Buffer
        const chunks: Buffer[] = [];
        for await (const chunk of req) {
            chunks.push(chunk as Buffer);
        }
        const bodyBuffer = Buffer.concat(chunks as any);

        try {
            const result = await createUserResponse({
                interviewId,
                questionId,
                videoResponseBuffer: bodyBuffer,
                responseTimeMs,
                redoAttemptNumber,
            }, userID);

            resp.writeHead(200, { "Content-Type": "application/json" });
            resp.end(JSON.stringify(result));
        } catch (err: any) {
            log.error("Failed to upload response", err);
            const statusCode = err.status || 500;
            resp.writeHead(statusCode, { "Content-Type": "application/json" });
            resp.end(JSON.stringify({ error: { message: err.message || "Internal server error" } }));
        }
    }
);