import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { clerkWebhook, getUser } from "./api";
import { db } from "../db/db";
import { users } from "../db/schema";
import { Webhook } from "svix";
import { getAuthData } from "~encore/auth";
import { EventEmitter } from "node:events";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

// Mock Svix's Webhook verify method
vi.mock("svix", () => {
  const verifyMock = vi.fn();
  return {
    Webhook: vi.fn(() => ({
      verify: verifyMock,
    })),
  };
});

// Mock encore config to provide a test secret
vi.mock("encore.dev/config", () => ({
  secret: vi.fn(() => () => "test_secret"),
}));

// Mock the authenticated user
vi.mock("~encore/auth", () => ({
  getAuthData: vi.fn(),
}));

function createMockReq(body: any, headers: Record<string, string>) {
  const req: any = new EventEmitter();
  req.headers = headers;
  // Emit data asynchronously to allow the handler to attach its listeners
  setTimeout(() => {
    req.emit("data", Buffer.from(JSON.stringify(body)));
    req.emit("end");
  }, 0);
  return req;
}

function createMockRes() {
  const res: any = {
    writeHead: vi.fn(),
    end: vi.fn(),
  };
  return res;
}

describe("clerkWebhook endpoint", () => {
  const userId = randomUUID();

  beforeEach(async () => {
    await db.delete(users);
    vi.clearAllMocks();
  });

  it("happy path", async () => {
    const payload = {
      type: "user.created",
      data: {
        id: userId,
        first_name: "John",
        last_name: "Doe",
        email_addresses: [{ email_address: "john@example.com" }],
        username: "johndoe",
      },
    };

    const req = createMockReq(payload, {
      "svix-id": "msg_123",
      "svix-timestamp": "1234567890",
      "svix-signature": "v1,signature",
    });
    const res = createMockRes();

    const mockVerify = new Webhook("").verify as Mock;
    mockVerify.mockReturnValue(payload);

    await clerkWebhook(req, res);

    expect(res.writeHead).toHaveBeenCalledWith(200, { "Content-Type": "application/json" });
    expect(res.end).toHaveBeenCalledWith(JSON.stringify({ received: true }));

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    expect(user).toBeDefined();
    expect(user?.email).toBe("john@example.com");
    expect(user?.username).toBe("johndoe");
    expect(user?.firstName).toBe("John");
    expect(user?.lastName).toBe("Doe");
  });

  it("invalid webhook", async () => {
    const payload = {};

    const req = createMockReq(payload, {
      "svix-id": "msg_123",
      "svix-timestamp": "1234567890",
      "svix-signature": "v1,signature",
    });
    const res = createMockRes();

    const mockVerify = new Webhook("").verify as Mock;
    mockVerify.mockImplementation(() => {
      throw new Error("Invalid signature");
    });

    await expect(clerkWebhook(req, res)).rejects.toThrow("invalid webhook signature");
  });

  it("no email address", async () => {
    const payload = {
      type: "user.created",
      data: {
        id: userId,
        username: "johndoe",
      },
    };

    const req = createMockReq(payload, {
      "svix-id": "msg_123",
      "svix-timestamp": "1234567890",
      "svix-signature": "v1,signature",
    });
    const res = createMockRes();

    const mockVerify = new Webhook("").verify as Mock;
    mockVerify.mockReturnValue(payload);

    await expect(clerkWebhook(req, res)).rejects.toThrow("no email address in payload");
  });

  it("no username", async () => {
    const payload = {
      type: "user.created",
      data: {
        id: userId,
        email_addresses: [{ email_address: "john@example.com" }],
      },
    };

    const req = createMockReq(payload, {
      "svix-id": "msg_123",
      "svix-timestamp": "1234567890",
      "svix-signature": "v1,signature",
    });
    const res = createMockRes();

    const mockVerify = new Webhook("").verify as Mock;
    mockVerify.mockReturnValue(payload);

    await expect(clerkWebhook(req, res)).rejects.toThrow("username is required");
  });
});

describe("getUser endpoint", () => {
  const userId = randomUUID();
  const otherUserId = randomUUID();

  beforeEach(async () => {
    await db.delete(users);
    vi.clearAllMocks();
  });

  it("trying to access another user's record", async () => {
    (getAuthData as Mock).mockReturnValue({ userID: userId });

    await expect(getUser({ id: otherUserId }))
      .rejects
      .toThrow("cannot access another user's record");
  });

  it("user not found", async () => {
    (getAuthData as Mock).mockReturnValue({ userID: userId });

    await expect(getUser({ id: userId }))
      .rejects
      .toThrow("user not found");
  });

  it("happy path", async () => {
    (getAuthData as Mock).mockReturnValue({ userID: userId });

    await db.insert(users).values({
      id: userId,
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      username: "johndoe",
      subscriptionTier: "free",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const user = await getUser({ id: userId });

    expect(user.id).toBe(userId);
    expect(user.firstName).toBe("John");
    expect(user.email).toBe("john@example.com");
    expect(user.username).toBe("johndoe");
    expect(user.subscriptionTier).toBe("free");
  });
});