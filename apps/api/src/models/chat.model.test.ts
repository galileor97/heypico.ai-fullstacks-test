import { describe, expect, test } from "bun:test";
import { MessageSchema, ChatRequestSchema, ShowPlacesParamsSchema } from "./chat.model";

describe("MessageSchema", () => {
  test("should accept valid user message", () => {
    const result = MessageSchema.safeParse({
      role: "user",
      content: "Hello, world!",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.role).toBe("user");
      expect(result.data.content).toBe("Hello, world!");
    }
  });

  test("should accept valid assistant message", () => {
    const result = MessageSchema.safeParse({
      role: "assistant",
      content: "Hi there!",
    });
    expect(result.success).toBe(true);
  });

  test("should accept valid system message", () => {
    const result = MessageSchema.safeParse({
      role: "system",
      content: "You are a helpful assistant.",
    });
    expect(result.success).toBe(true);
  });

  test("should reject empty content", () => {
    const result = MessageSchema.safeParse({
      role: "user",
      content: "",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Message content cannot be empty");
    }
  });

  test("should reject invalid role", () => {
    const result = MessageSchema.safeParse({
      role: "invalid",
      content: "Hello",
    });
    expect(result.success).toBe(false);
  });

  test("should reject missing role", () => {
    const result = MessageSchema.safeParse({
      content: "Hello",
    });
    expect(result.success).toBe(false);
  });

  test("should reject missing content", () => {
    const result = MessageSchema.safeParse({
      role: "user",
    });
    expect(result.success).toBe(false);
  });
});

describe("ChatRequestSchema", () => {
  test("should accept valid chat request with one message", () => {
    const result = ChatRequestSchema.safeParse({
      messages: [{ role: "user", content: "Hello" }],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.messages).toHaveLength(1);
    }
  });

  test("should accept valid chat request with multiple messages", () => {
    const result = ChatRequestSchema.safeParse({
      messages: [
        { role: "system", content: "You are helpful." },
        { role: "user", content: "Hello" },
        { role: "assistant", content: "Hi!" },
        { role: "user", content: "How are you?" },
      ],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.messages).toHaveLength(4);
    }
  });

  test("should reject empty messages array", () => {
    const result = ChatRequestSchema.safeParse({
      messages: [],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("At least one message is required");
    }
  });

  test("should reject missing messages field", () => {
    const result = ChatRequestSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  test("should reject non-array messages", () => {
    const result = ChatRequestSchema.safeParse({
      messages: "not an array",
    });
    expect(result.success).toBe(false);
  });

  test("should reject messages with invalid items", () => {
    const result = ChatRequestSchema.safeParse({
      messages: [
        { role: "user", content: "Valid" },
        { role: "invalid", content: "Invalid role" },
      ],
    });
    expect(result.success).toBe(false);
  });
});

describe("ShowPlacesParamsSchema", () => {
  test("should accept valid query with default count", () => {
    const result = ShowPlacesParamsSchema.safeParse({
      query: "nasi goreng in Jakarta",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.query).toBe("nasi goreng in Jakarta");
      expect(result.data.count).toBeDefined();
    }
  });

  test("should accept valid query with explicit count", () => {
    const result = ShowPlacesParamsSchema.safeParse({
      query: "coffee shop",
      count: 3,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.query).toBe("coffee shop");
      expect(result.data.count).toBe(3);
    }
  });

  test("should reject empty query", () => {
    const result = ShowPlacesParamsSchema.safeParse({
      query: "",
    });
    expect(result.success).toBe(false);
  });

  test("should reject missing query", () => {
    const result = ShowPlacesParamsSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  test("should reject count less than 1", () => {
    const result = ShowPlacesParamsSchema.safeParse({
      query: "test",
      count: 0,
    });
    expect(result.success).toBe(false);
  });

  test("should reject negative count", () => {
    const result = ShowPlacesParamsSchema.safeParse({
      query: "test",
      count: -5,
    });
    expect(result.success).toBe(false);
  });
});
