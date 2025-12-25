import { describe, expect, test, beforeEach, afterEach, mock } from "bun:test";
import { PlacesService, getPhotoUrl, searchPlaces } from "./places.service";

// Mock the rate limiter
const mockRateLimiter = {
  canMakeRequest: () => true,
  recordRequest: () => {},
  getRemainingRequests: () => 10,
};

// We need to mock the module
mock.module("../utils/rate-limiter", () => ({
  placesRateLimiter: mockRateLimiter,
}));

// Store original console methods
const originalConsole = {
  log: console.log,
  warn: console.warn,
  error: console.error,
};

// Helper to create a mock fetch that returns a Response
const createMockFetch = (response: Partial<Response>) => {
  return mock(() => Promise.resolve(response as Response)) as unknown as typeof fetch;
};

// Helper to create a mock fetch that rejects
const createRejectingFetch = (error: Error) => {
  return mock(() => Promise.reject(error)) as unknown as typeof fetch;
};

describe("PlacesService.getPhotoUrl", () => {
  test("should generate correct photo URL with default maxWidth", () => {
    const photoName = "places/xxx/photos/yyy";
    const url = PlacesService.getPhotoUrl(photoName);
    
    expect(url).toContain("/photos/");
    expect(url).toContain(encodeURIComponent(photoName));
    expect(url).toContain("maxWidth=400");
  });

  test("should generate correct photo URL with custom maxWidth", () => {
    const photoName = "places/xxx/photos/yyy";
    const url = PlacesService.getPhotoUrl(photoName, 800);
    
    expect(url).toContain("maxWidth=800");
  });

  test("should URL-encode the photo name", () => {
    const photoName = "places/test-place/photos/photo-id";
    const url = PlacesService.getPhotoUrl(photoName);
    
    // The slashes should be encoded
    expect(url).toContain(encodeURIComponent(photoName));
    expect(url).not.toContain("places/test-place/photos/photo-id");
  });

  test("standalone getPhotoUrl function should work the same", () => {
    const photoName = "places/xxx/photos/yyy";
    const url1 = PlacesService.getPhotoUrl(photoName, 600);
    const url2 = getPhotoUrl(photoName, 600);
    
    expect(url1).toBe(url2);
  });
});

describe("PlacesService.searchPlaces", () => {
  const originalFetch = globalThis.fetch;
  
  beforeEach(() => {
    // Reset fetch mock before each test
    globalThis.fetch = originalFetch;
    // Reset rate limiter mock
    mockRateLimiter.canMakeRequest = () => true;
    // Suppress console output during tests
    console.log = () => {};
    console.warn = () => {};
    console.error = () => {};
  });

  afterEach(() => {
    // Restore console methods after each test
    console.log = originalConsole.log;
    console.warn = originalConsole.warn;
    console.error = originalConsole.error;
  });

  test("should return empty array when rate limited", async () => {
    mockRateLimiter.canMakeRequest = () => false;
    
    const result = await PlacesService.searchPlaces("test query");
    
    expect(result).toEqual([]);
  });

  test("should return empty array when API returns error", async () => {
    globalThis.fetch = createMockFetch({
      ok: false,
      status: 500,
      text: () => Promise.resolve("Internal Server Error"),
    });
    
    const result = await PlacesService.searchPlaces("test query");
    
    expect(result).toEqual([]);
  });

  test("should return empty array when no places found", async () => {
    globalThis.fetch = createMockFetch({
      ok: true,
      json: () => Promise.resolve({ places: [] }),
    });
    
    const result = await PlacesService.searchPlaces("nonexistent place");
    
    expect(result).toEqual([]);
  });

  test("should return empty array when places field is missing", async () => {
    globalThis.fetch = createMockFetch({
      ok: true,
      json: () => Promise.resolve({}),
    });
    
    const result = await PlacesService.searchPlaces("test");
    
    expect(result).toEqual([]);
  });

  test("should transform Google Places response correctly", async () => {
    const mockGoogleResponse = {
      places: [
        {
          id: "place-123",
          displayName: { text: "Test Restaurant" },
          location: { latitude: -6.2088, longitude: 106.8456 },
          photos: [{ name: "places/place-123/photos/photo-1" }],
          formattedAddress: "123 Test St, Jakarta",
          userRatingCount: 100,
          currentOpeningHours: { openNow: true },
        },
      ],
    };

    globalThis.fetch = createMockFetch({
      ok: true,
      json: () => Promise.resolve(mockGoogleResponse),
    });

    const result = await PlacesService.searchPlaces("test restaurant", 5);

    expect(result).toHaveLength(1);
    expect(result[0].placeId).toBe("place-123");
    expect(result[0].name).toBe("Test Restaurant");
    expect(result[0].lat).toBe(-6.2088);
    expect(result[0].lng).toBe(106.8456);
    expect(result[0].address).toBe("123 Test St, Jakarta");
    expect(result[0].totalReviews).toBe(100);
    expect(result[0].isOpen).toBe(true);
    expect(result[0].photoUrl).toBeDefined();
  });

  test("should filter out places without required fields", async () => {
    const mockGoogleResponse = {
      places: [
        // Valid place
        {
          id: "place-1",
          displayName: { text: "Valid Place" },
          location: { latitude: 0, longitude: 0 },
        },
        // Missing id
        {
          displayName: { text: "No ID" },
          location: { latitude: 0, longitude: 0 },
        },
        // Missing location
        {
          id: "place-2",
          displayName: { text: "No Location" },
        },
        // Missing displayName
        {
          id: "place-3",
          location: { latitude: 0, longitude: 0 },
        },
      ],
    };

    globalThis.fetch = createMockFetch({
      ok: true,
      json: () => Promise.resolve(mockGoogleResponse),
    });

    const result = await PlacesService.searchPlaces("test");

    expect(result).toHaveLength(1);
    expect(result[0].placeId).toBe("place-1");
  });

  test("should handle fetch error gracefully", async () => {
    globalThis.fetch = createRejectingFetch(new Error("Network error"));

    const result = await PlacesService.searchPlaces("test");

    expect(result).toEqual([]);
  });

  test("should use regularOpeningHours when currentOpeningHours is not available", async () => {
    const mockGoogleResponse = {
      places: [
        {
          id: "place-1",
          displayName: { text: "Test" },
          location: { latitude: 0, longitude: 0 },
          regularOpeningHours: { openNow: false },
        },
      ],
    };

    globalThis.fetch = createMockFetch({
      ok: true,
      json: () => Promise.resolve(mockGoogleResponse),
    });

    const result = await PlacesService.searchPlaces("test");

    expect(result[0].isOpen).toBe(false);
  });

  test("should handle place without photos", async () => {
    const mockGoogleResponse = {
      places: [
        {
          id: "place-1",
          displayName: { text: "No Photo Place" },
          location: { latitude: 0, longitude: 0 },
        },
      ],
    };

    globalThis.fetch = createMockFetch({
      ok: true,
      json: () => Promise.resolve(mockGoogleResponse),
    });

    const result = await PlacesService.searchPlaces("test");

    expect(result[0].photoUrl).toBeUndefined();
  });

  test("standalone searchPlaces function should work the same", async () => {
    const mockGoogleResponse = {
      places: [
        {
          id: "place-1",
          displayName: { text: "Test" },
          location: { latitude: 1, longitude: 2 },
        },
      ],
    };

    globalThis.fetch = createMockFetch({
      ok: true,
      json: () => Promise.resolve(mockGoogleResponse),
    });

    const result = await searchPlaces("test", 5);

    expect(result).toHaveLength(1);
  });

  test("should call fetch with correct parameters", async () => {
    // Track fetch calls manually
    let capturedUrl: string | undefined;
    let capturedOptions: RequestInit | undefined;
    
    globalThis.fetch = (async (url: string | URL | Request, options?: RequestInit) => {
      capturedUrl = url.toString();
      capturedOptions = options;
      return {
        ok: true,
        json: () => Promise.resolve({ places: [] }),
      } as Response;
    }) as typeof fetch;

    await PlacesService.searchPlaces("pizza in NYC", 3);

    expect(capturedUrl).toBe("https://places.googleapis.com/v1/places:searchText");
    expect(capturedOptions?.method).toBe("POST");
    expect((capturedOptions?.headers as Record<string, string>)?.["Content-Type"]).toBe("application/json");
    expect((capturedOptions?.headers as Record<string, string>)?.["X-Goog-FieldMask"]).toContain("places.id");
    
    const body = JSON.parse(capturedOptions?.body as string);
    expect(body.textQuery).toBe("pizza in NYC");
    expect(body.maxResultCount).toBe(3);
  });
});
