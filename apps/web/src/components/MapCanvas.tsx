"use client";

import { APIProvider, Map, AdvancedMarker } from "@vis.gl/react-google-maps";
import { useState, useEffect } from "react";
import { X, Navigation } from "lucide-react";
import { PlaceData } from "../types";
import { env } from "../env";

interface MapCanvasProps {
  placeData: PlaceData | null;
  isOpen: boolean;
  onClose: () => void;
}

// Dynamically import PlaceOverview to avoid SSR issues with web components
function PlaceOverviewWrapper({
  placeId,
  placeName,
}: {
  placeId: string;
  placeName: string;
}) {
  const [PlaceOverview, setPlaceOverview] = useState<React.ComponentType<{
    place: string;
    onRequestError?: (e: Event) => void;
  }> | null>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    import("@googlemaps/extended-component-library/react").then((module) => {
      setPlaceOverview(() => module.PlaceOverview);
    });
  }, []);

  useEffect(() => {
    // Reset error state when placeId changes
    setHasError(false);
  }, [placeId]);

  if (!PlaceOverview) {
    return (
      <div className="place-overview-loading">Loading place details...</div>
    );
  }

  if (hasError) {
    return (
      <div className="place-overview-fallback">
        <h3>{placeName}</h3>
        <p className="place-overview-fallback-note">
          Place details unavailable
        </p>
      </div>
    );
  }

  return (
    <PlaceOverview place={placeId} onRequestError={() => setHasError(true)} />
  );
}

export function MapCanvas({ placeData, isOpen, onClose }: MapCanvasProps) {
  const [mapError, setMapError] = useState<Error | null>(null);

  const apiKey = env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const openDirections = () => {
    if (!placeData) return;
    // Opens Google Maps directions with the place as destination
    const url = `https://www.google.com/maps/dir/?api=1&destination=${placeData.lat},${placeData.lng}&destination_place_id=${placeData.placeId}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  if (!apiKey) {
    return (
      <div className={`map-canvas ${isOpen ? "map-canvas-open" : ""}`}>
        <div className="map-error">
          <p>Google Maps API key is not configured</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`map-canvas ${isOpen ? "map-canvas-open" : ""}`}>
      <div className="map-header-buttons">
        {placeData && (
          <button
            onClick={openDirections}
            className="map-directions-button"
            aria-label="Get directions"
          >
            <Navigation size={18} />
            <span>Directions</span>
          </button>
        )}
        <button
          onClick={onClose}
          className="map-close-button"
          aria-label="Close map"
        >
          <X size={20} />
        </button>
      </div>

      {mapError ? (
        <div className="map-error">
          <p>Failed to load map</p>
          <p className="map-error-detail">{mapError.message}</p>
        </div>
      ) : (
        <APIProvider
          apiKey={apiKey}
          libraries={["places", "marker"]}
          onLoad={() => setMapError(null)}
        >
          {placeData && (
            <div className="map-content">
              <Map
                defaultCenter={{ lat: placeData.lat, lng: placeData.lng }}
                defaultZoom={15}
                mapId="ai-place-finder-map"
                className="google-map"
              >
                <AdvancedMarker
                  position={{ lat: placeData.lat, lng: placeData.lng }}
                  title={placeData.name}
                />
              </Map>
              <div className="place-overview-container">
                <PlaceOverviewWrapper
                  placeId={placeData.placeId}
                  placeName={placeData.name}
                />
              </div>
            </div>
          )}
        </APIProvider>
      )}
    </div>
  );
}
