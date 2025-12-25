import { z } from "zod";

// Schema for place data returned to the frontend
export const PlaceDataSchema = z.object({
  placeId: z.string().min(1).describe("Google Places ID"),
  lat: z.number().min(-90).max(90).describe("Latitude"),
  lng: z.number().min(-180).max(180).describe("Longitude"),
  name: z.string().min(1).describe("Place name"),
  photoUrl: z.string().optional().describe("Photo URL"),
  address: z.string().optional().describe("Formatted address"),
  totalReviews: z.number().optional().describe("Total number of reviews"),
  isOpen: z
    .boolean()
    .optional()
    .describe("Whether the place is currently open"),
});

// Schema for places response
export const PlacesResponseSchema = z.object({
  places: z.array(PlaceDataSchema),
});

// Schema for error response
export const PlacesErrorSchema = z.object({
  error: z.string(),
  query: z.string().optional(),
});

// Export inferred types from Zod schemas
export type PlaceData = z.infer<typeof PlaceDataSchema>;
export type PlacesResponse = z.infer<typeof PlacesResponseSchema>;
export type PlacesError = z.infer<typeof PlacesErrorSchema>;
