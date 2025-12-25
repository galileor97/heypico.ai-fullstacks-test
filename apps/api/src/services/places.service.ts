import { env } from "../env";
import { placesRateLimiter } from "../utils/rate-limiter";
import type { PlaceData } from "../models";

// Google Places API response structure (internal)
interface GooglePlacesResponse {
  places?: Array<{
    id: string;
    displayName?: { text: string };
    location?: { latitude: number; longitude: number };
    photos?: Array<{ name: string }>;
    formattedAddress?: string;
    userRatingCount?: number;
    currentOpeningHours?: { openNow?: boolean };
    regularOpeningHours?: { openNow?: boolean };
  }>;
}

// Places Service - handles Google Places API interactions
export abstract class PlacesService {
  // Get photo URL from Google Places photo reference
  static getPhotoUrl(photoName: string, maxWidth: number = 400): string {
    return `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=${maxWidth}&key=${env.GOOGLE_PLACES_API_KEY}`;
  }

  // Search for places using Google Places Text Search API
  static async searchPlaces(
    query: string,
    count: number = 5
  ): Promise<PlaceData[]> {
    const url = "https://places.googleapis.com/v1/places:searchText";

    // Check rate limit
    if (!placesRateLimiter.canMakeRequest()) {
      console.warn(
        "[PlacesService] Rate limit exceeded. Remaining:",
        placesRateLimiter.getRemainingRequests()
      );
      return [];
    }

    console.log("[PlacesService] Searching:", query, "count:", count);
    placesRateLimiter.recordRequest();

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": env.GOOGLE_PLACES_API_KEY!,
          "X-Goog-FieldMask": [
            "places.id",
            "places.displayName",
            "places.location",
            "places.photos",
            "places.formattedAddress",
            "places.userRatingCount",
            "places.currentOpeningHours",
            "places.regularOpeningHours",
          ].join(","),
        },
        body: JSON.stringify({
          textQuery: query,
          maxResultCount: count,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("[PlacesService] API error:", response.status, errorText);
        return [];
      }

      const data: GooglePlacesResponse = await response.json();
      console.log("[PlacesService] Found", data.places?.length || 0, "places");

      if (!data.places || data.places.length === 0) {
        console.log("[PlacesService] No places found for:", query);
        return [];
      }

      // Transform to PlaceData format
      const places: PlaceData[] = data.places
        .filter(
          (place) => place.id && place.location && place.displayName?.text
        )
        .map((place) => ({
          placeId: place.id,
          lat: place.location!.latitude,
          lng: place.location!.longitude,
          name: place.displayName!.text,
          photoUrl:
            place.photos && place.photos.length > 0
              ? PlacesService.getPhotoUrl(place.photos[0].name)
              : undefined,
          address: place.formattedAddress,
          totalReviews: place.userRatingCount,
          isOpen:
            place.currentOpeningHours?.openNow ??
            place.regularOpeningHours?.openNow,
        }));

      console.log("[PlacesService] Returning", places.length, "places");
      return places;
    } catch (error) {
      console.error("[PlacesService] Error:", error);
      return [];
    }
  }
}

// Export standalone functions for simpler imports
export const searchPlaces = PlacesService.searchPlaces;
export const getPhotoUrl = PlacesService.getPhotoUrl;
