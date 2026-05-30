import { api, APIError } from "encore.dev/api";
import { secret } from "encore.dev/config";
import { Webhook } from "svix";
import log from "encore.dev/log";
import { db } from "../db/db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import { getAuthData } from "~encore/auth";
import type { GetUserParams, GetUserResponse } from "./types";

const clerkWebhookSecret = secret("ClerkWebhookSecret");
export const clerkWebhook = api.raw(
  { expose: true, path: "/webhooks/clerk", method: "POST", auth: false },
  async (req, res) => {
    const rawBody = await new Promise<string>((resolve, reject) => {
      let body = "";
      req.on("data", (chunk) => { body += chunk.toString(); });
      req.on("end", () => { resolve(body); });
      req.on("error", reject);
    });

    const svixId = req.headers["svix-id"];
    const svixTimestamp = req.headers["svix-timestamp"];
    const svixSignature = req.headers["svix-signature"];

    if (!svixId || !svixTimestamp || !svixSignature) {
      throw APIError.invalidArgument("missing svix headers");
    }

    const wh = new Webhook(clerkWebhookSecret());
    let payload: { type: string; data: Record<string, any> };
    try {
      payload = wh.verify(rawBody, {
        "svix-id": svixId as string,
        "svix-timestamp": svixTimestamp as string,
        "svix-signature": svixSignature as string,
      }) as { type: string; data: Record<string, any> };
    } catch {
      throw APIError.invalidArgument("invalid webhook signature");
    }

    const { type, data } = payload;

    log.info("webhook received", { type, userId: data.id });

    if (type === "user.created" || type === "user.updated") {
      const email = data.email_addresses?.[0]?.email_address;
      const emailVerified = data.email_addresses?.[0]?.verification?.status;
      log.info("user event", { userId: data.id, email, emailVerified, username: data.username });

      if (!email) {
        log.error(null, "no email address in payload", { data });
        throw APIError.invalidArgument("no email address in payload");
      }

      const { username } = data;
      if (!username) {
        log.error(null, "username missing in payload", { data });
        throw APIError.invalidArgument("username is required");
      }

      await db.insert(users).values({
        id: data.id,
        firstName: data.first_name,
        lastName: data.last_name,
        email,
        username,
        subscriptionTier: "free",
        createdAt: new Date(),
        updatedAt: new Date(),
      }).onConflictDoUpdate({
        target: users.id,
        set: {
          firstName: data.first_name,
          lastName: data.last_name,
          email,
          updatedAt: new Date(),
        },
      });
    }

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ received: true }));
  }
);


export const getUser = api(
  { expose: true, method: "GET", path: "/users/:id", auth: true },
  async ({ id }: GetUserParams): Promise<GetUserResponse> => {
    const auth = getAuthData()!;

    if (id !== auth.userID) {
      throw APIError.permissionDenied("cannot access another user's record");
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, id),
    });

    if (!user) {
      throw APIError.notFound("user not found");
    }

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      username: user.username,
      subscriptionTier: user.subscriptionTier,
      createdAt: user.createdAt,
    };
  }
);
