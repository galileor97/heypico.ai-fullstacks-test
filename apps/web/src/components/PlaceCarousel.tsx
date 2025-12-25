"use client";

import { PlaceData } from "../types";

interface PlaceCarouselProps {
  places: PlaceData[];
  onShowDetails: (place: PlaceData) => void;
}

export function PlaceCarousel({ places, onShowDetails }: PlaceCarouselProps) {
  const openInGoogleMaps = (place: PlaceData) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lng}&query_place_id=${place.placeId}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  // Remove duplicates based on placeId
  const uniquePlaces = places.filter(
    (place, index, self) =>
      index === self.findIndex((p) => p.placeId === place.placeId)
  );

  const formatReviews = (count?: number) => {
    if (count == null) return null;
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k reviews`;
    }
    return `${count} ${count === 1 ? "review" : "reviews"}`;
  };

  return (
    <div className="place-carousel">
      <div className="place-carousel-track">
        {uniquePlaces.map((place, index) => (
          <div key={`${place.placeId}-${index}`} className="place-card">
            <div className="place-card-thumbnail">
              {place.photoUrl ? (
                <img
                  src={place.photoUrl}
                  alt={place.name}
                  className="place-card-image"
                />
              ) : (
                <div className="place-card-no-image">
                  <span>📍</span>
                </div>
              )}
              {place.isOpen !== undefined && (
                <span
                  className={`place-card-status ${place.isOpen
                      ? "place-card-status-open"
                      : "place-card-status-closed"
                    }`}
                >
                  {place.isOpen ? "Open" : "Closed"}
                </span>
              )}
            </div>
            <div className="place-card-content">
              <h4 className="place-card-name">{place.name}</h4>
              {place.address && (
                <p className="place-card-address">{place.address}</p>
              )}
              {place.totalReviews !== undefined && (
                <p className="place-card-reviews">
                  ⭐ {formatReviews(place.totalReviews)}
                </p>
              )}
            </div>
            <div className="place-card-actions">
              <button
                className="place-card-btn place-card-btn-details"
                onClick={() => onShowDetails(place)}
              >
                Details
              </button>
              <button
                className="place-card-btn place-card-btn-maps"
                onClick={() => openInGoogleMaps(place)}
              >
                Open in Maps
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
