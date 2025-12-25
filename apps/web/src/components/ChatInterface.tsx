"use client";

import { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { ChatInput } from "./ChatInput";
import { ChatMessages } from "./ChatMessages";
import { MapCanvas } from "./MapCanvas";
import { PlaceData } from "../types";
import { env } from "../env";

export function ChatInterface() {
  const [selectedPlace, setSelectedPlace] = useState<PlaceData | null>(null);
  const [isMapOpen, setIsMapOpen] = useState(false);

  const { messages, input, handleInputChange, handleSubmit, status, error } =
    useChat({
      api: `${env.NEXT_PUBLIC_API_URL}/chat`,
      onError: (error) => {
        console.error("Chat error:", error);
      },
    });

  const isLoading = status === "streaming" || status === "submitted";

  const handleShowPlaceDetails = (place: PlaceData) => {
    setSelectedPlace(place);
    setIsMapOpen(true);
  };

  const handleCloseMap = () => {
    setIsMapOpen(false);
  };

  return (
    <div className={`chat-interface ${isMapOpen ? "canvas-open" : ""}`}>
      <div className="chat-container">
        <ChatMessages
          messages={messages}
          isLoading={isLoading}
          onShowPlaceDetails={handleShowPlaceDetails}
          error={error}
        />
        <ChatInput
          input={input}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
          isLoading={isLoading}
          isEmpty={messages.length === 0}
        />
      </div>
      <MapCanvas
        placeData={selectedPlace}
        isOpen={isMapOpen}
        onClose={handleCloseMap}
      />
    </div>
  );
}
