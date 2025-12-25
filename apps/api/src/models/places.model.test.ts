import { describe, expect, test } from "bun:test";
import { PlaceDataSchema, PlacesResponseSchema, PlacesErrorSchema } from "./places.model";

describe("PlaceDataSchema", () => {
  test("should accept valid place data with all fields", () => {
    const result = PlaceDataSchema.safeParse({
      placeId: "ChIJN1t_tDeuEmsRUsoyG83frY4",
      lat: -6.2088,
      lng: 106.8456,
      name: "Test Restaurant",
      photoUrl: "https://example.com/photo.jpg",
      address: "123 Test Street, Jakarta",
      totalReviews: 150,
      isOpen: true,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.placeId).toBe("ChIJN1t_tDeuEmsRUsoyG83frY4");
      expect(result.data.name).toBe("Test Restaurant");
      expect(result.data.isOpen).toBe(true);
    }
  });

  test("should accept valid place data with only required fields", () => {
    const result = PlaceDataSchema.safeParse({
      placeId: "test-id",
      lat: 0,
      lng: 0,
      name: "Minimal Place",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.photoUrl).toBeUndefined();
      expect(result.data.address).toBeUndefined();
      expect(result.data.totalReviews).toBeUndefined();
      expect(result.data.isOpen).toBeUndefined();
    }
  });

  test("should reject empty placeId", () => {
    const result = PlaceDataSchema.safeParse({
      placeId: "",
      lat: 0,
      lng: 0,
      name: "Test",
    });
    expect(result.success).toBe(false);
  });

  test("should reject empty name", () => {
    const result = PlaceDataSchema.safeParse({
      placeId: "test-id",
      lat: 0,
      lng: 0,
      name: "",
    });
    expect(result.success).toBe(false);
  });

  test("should reject latitude below -90", () => {
    const result = PlaceDataSchema.safeParse({
      placeId: "test-id",
      lat: -91,
      lng: 0,
      name: "Test",
    });
    expect(result.success).toBe(false);
  });

  test("should reject latitude above 90", () => {
    const result = PlaceDataSchema.safeParse({
      placeId: "test-id",
      lat: 91,
      lng: 0,
      name: "Test",
    });
    expect(result.success).toBe(false);
  });

  test("should reject longitude below -180", () => {
    const result = PlaceDataSchema.safeParse({
      placeId: "test-id",
      lat: 0,
      lng: -181,
      name: "Test",
    });
    expect(result.success).toBe(false);
  });

  test("should reject longitude above 180", () => {
    const result = PlaceDataSchema.safeParse({
      placeId: "test-id",
      lat: 0,
      lng: 181,
      name: "Test",
    });
    expect(result.success).toBe(false);
  });

  test("should accept edge case latitude values", () => {
    const resultMax = PlaceDataSchema.safeParse({
      placeId: "test",
      lat: 90,
      lng: 0,
      name: "North Pole",
    });
    expect(resultMax.success).toBe(true);

    const resultMin = PlaceDataSchema.safeParse({
      placeId: "test",
      lat: -90,
      lng: 0,
      name: "South Pole",
    });
    expect(resultMin.success).toBe(true);
  });

  test("should accept edge case longitude values", () => {
    const resultMax = PlaceDataSchema.safeParse({
      placeId: "test",
      lat: 0,
      lng: 180,
      name: "Date Line East",
    });
    expect(resultMax.success).toBe(true);

    const resultMin = PlaceDataSchema.safeParse({
      placeId: "test",
      lat: 0,
      lng: -180,
      name: "Date Line West",
    });
    expect(resultMin.success).toBe(true);
  });
});

describe("PlacesResponseSchema", () => {
  test("should accept valid response with places", () => {
    const result = PlacesResponseSchema.safeParse({
      places: [
        { placeId: "id1", lat: 0, lng: 0, name: "Place 1" },
        { placeId: "id2", lat: 1, lng: 1, name: "Place 2" },
      ],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.places).toHaveLength(2);
    }
  });

  test("should accept valid response with empty places array", () => {
    const result = PlacesResponseSchema.safeParse({
      places: [],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.places).toHaveLength(0);
    }
  });

  test("should reject missing places field", () => {
    const result = PlacesResponseSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  test("should reject invalid place in array", () => {
    const result = PlacesResponseSchema.safeParse({
      places: [
        { placeId: "id1", lat: 0, lng: 0, name: "Valid" },
        { placeId: "", lat: 0, lng: 0, name: "Invalid placeId" },
      ],
    });
    expect(result.success).toBe(false);
  });
});

describe("PlacesErrorSchema", () => {
  test("should accept valid error with query", () => {
    const result = PlacesErrorSchema.safeParse({
      error: "Something went wrong",
      query: "test query",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.error).toBe("Something went wrong");
      expect(result.data.query).toBe("test query");
    }
  });

  test("should accept valid error without query", () => {
    const result = PlacesErrorSchema.safeParse({
      error: "Rate limit exceeded",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.query).toBeUndefined();
    }
  });

  test("should reject empty error message", () => {
    const result = PlacesErrorSchema.safeParse({
      error: "",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Error message cannot be empty");
    }
  });

  test("should reject missing error field", () => {
    const result = PlacesErrorSchema.safeParse({
      query: "test",
    });
    expect(result.success).toBe(false);
  });
});
