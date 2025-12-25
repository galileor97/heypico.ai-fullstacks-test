import { Elysia, t } from "elysia";
import { env } from "../env";

// Constants for validation
const MIN_WIDTH = 1;
const MAX_WIDTH = 4800;
const DEFAULT_WIDTH = 400;
const CACHE_MAX_AGE = 86400; // 24 hours in seconds

// Regex to validate Google Places photo name format
// Format: places/{placeId}/photos/{photoId}
const PHOTO_NAME_REGEX = /^places\/[a-zA-Z0-9_-]+\/photos\/[a-zA-Z0-9_-]+$/;

/**
 * Photo proxy route - fetches photos from Google Places API
 * without exposing the API key to the frontend
 */
export const photosRoute = new Elysia({ prefix: "/photos" }).get(
  "/:photoName",
  async ({ params, query, set }) => {
    const { photoName } = params;

    // Validate photoName format
    // The photoName comes URL-encoded, so we need to decode it
    const decodedPhotoName = decodeURIComponent(photoName);

    if (!decodedPhotoName || !PHOTO_NAME_REGEX.test(decodedPhotoName)) {
      set.status = 400;
      return { error: "Invalid photo name format" };
    }

    // Parse and validate maxWidth
    let maxWidth = DEFAULT_WIDTH;
    if (query.maxWidth !== undefined) {
      const parsedWidth = parseInt(query.maxWidth, 10);
      if (isNaN(parsedWidth) || parsedWidth < MIN_WIDTH || parsedWidth > MAX_WIDTH) {
        set.status = 400;
        return {
          error: `maxWidth must be a number between ${MIN_WIDTH} and ${MAX_WIDTH}`,
        };
      }
      maxWidth = parsedWidth;
    }

    // Build Google Places photo URL
    const googlePhotoUrl = `https://places.googleapis.com/v1/${decodedPhotoName}/media?maxWidthPx=${maxWidth}&key=${env.GOOGLE_PLACES_API_KEY}`;

    try {
      // Fetch photo from Google Places API
      const response = await fetch(googlePhotoUrl);

      if (!response.ok) {
        // Map Google API errors to appropriate HTTP status codes
        if (response.status === 404) {
          set.status = 404;
          return { error: "Photo not found" };
        }
        if (response.status === 400) {
          set.status = 400;
          return { error: "Invalid photo request" };
        }
        if (response.status === 403) {
          set.status = 403;
          return { error: "Access denied to photo" };
        }
        // Log unexpected errors for debugging
        console.error(
          `[PhotosRoute] Google API error: ${response.status} ${response.statusText}`
        );
        set.status = 502;
        return { error: "Failed to fetch photo from upstream" };
      }

      // Get content type from Google's response
      const contentType = response.headers.get("Content-Type") || "image/jpeg";

      // Return a new Response with proper headers
      // We must create a new Response object to control headers properly
      // Just setting set.headers and returning body will cause Elysia to append default headers
      return new Response(response.body, {
        status: 200,
        headers: {
          "Content-Type": contentType,
          "Cache-Control": `public, max-age=${CACHE_MAX_AGE}`,
        },
      });
    } catch (error) {
      console.error("[PhotosRoute] Fetch error:", error);
      set.status = 502;
      return { error: "Failed to fetch photo" };
    }
  },
  {
    params: t.Object({
      photoName: t.String(),
    }),
    query: t.Object({
      maxWidth: t.Optional(t.String()),
    }),
    detail: {
      tags: ["Photos"],
      summary: "Proxy photo from Google Places",
      description:
        "Fetches a photo from Google Places API without exposing the API key. The photoName should be URL-encoded.",
    },
  }
);
