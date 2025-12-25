import type { Message, ToolInvocation } from "ai";

// Place data returned by the showPlaces tool
export interface PlaceData {
  placeId: string;
  lat: number;
  lng: number;
  name: string;
  photoUrl?: string;
  address?: string;
  totalReviews?: number;
  isOpen?: boolean;
}

// Response from showPlaces tool with multiple places
export interface PlacesResult {
  places: PlaceData[];
}

// Error response from showPlaces tool when places are not found
export interface PlaceError {
  error: string;
  queries: string[];
}

// Type guard to check if a tool result is PlaceData
export function isPlaceData(data: unknown): data is PlaceData {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const obj = data as Record<string, unknown>;

  return (
    typeof obj.placeId === "string" &&
    typeof obj.lat === "number" &&
    typeof obj.lng === "number" &&
    typeof obj.name === "string"
  );
}

// Type guard to check if a tool result is PlacesResult (multiple places)
export function isPlacesResult(data: unknown): data is PlacesResult {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const obj = data as Record<string, unknown>;

  if (!Array.isArray(obj.places)) {
    return false;
  }

  return obj.places.every(isPlaceData);
}

// Type guard to check if a tool result is a PlaceError
export function isPlaceError(data: unknown): data is PlaceError {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const obj = data as Record<string, unknown>;

  return (
    typeof obj.error === "string" &&
    Array.isArray(obj.queries) &&
    obj.queries.every((q) => typeof q === "string")
  );
}

// Extract PlaceData array from tool invocations
// Parses toolInvocations from AI response and extracts places when showPlaces tool is called
export function extractPlacesData(
  toolInvocations?: ToolInvocation[]
): PlaceData[] | null {
  if (!toolInvocations || toolInvocations.length === 0) {
    return null;
  }

  // Find the showPlaces tool invocation with a result
  const showPlacesInvocation = toolInvocations.find(
    (invocation) =>
      invocation.toolName === "showPlaces" &&
      invocation.state === "result" &&
      "result" in invocation
  );

  if (
    showPlacesInvocation &&
    showPlacesInvocation.state === "result" &&
    isPlacesResult(showPlacesInvocation.result)
  ) {
    return showPlacesInvocation.result.places;
  }

  return null;
}

// Extract PlaceData array from a message's tool invocations
// This is a convenience function that handles the message structure
export function extractPlacesFromMessage(
  message: Message
): PlaceData[] | null {
  if (message.role !== "assistant") {
    return null;
  }

  // Use toolInvocations property from the message
  const toolInvocations = message.toolInvocations;
  return extractPlacesData(toolInvocations);
}
