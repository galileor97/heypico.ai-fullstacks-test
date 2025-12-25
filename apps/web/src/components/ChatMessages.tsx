"use client";

import { Message } from "ai";
import ReactMarkdown from "react-markdown";
import { PlaceData, extractPlacesFromMessage } from "../types";
import { PlaceCarousel } from "./PlaceCarousel";
import { Sparkles, Copy } from "lucide-react";

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
  onShowPlaceDetails: (place: PlaceData) => void;
  error?: Error | null;
}

export function ChatMessages({
  messages,
  isLoading,
  onShowPlaceDetails,
  error,
}: ChatMessagesProps) {
  // Determine error message
  const errorMessage = error
    ? error.message?.includes("429") || error.message?.includes("rate limit")
      ? "You're sending messages too fast. Please wait a moment and try again."
      : "Something went wrong. Please try again."
    : null;
  // Check if the last message is from assistant (streaming or has tool results)
  const lastMessage = messages[messages.length - 1];
  const hasAssistantMessage = lastMessage?.role === "assistant";

  return (
    <div className="chat-messages">
      {messages.length === 0 ? (
        <div className="chat-empty flex items-end justify-end h-full">
          <h1 className="text-2xl font-bold">What do you want to know?</h1>
        </div>
      ) : (
        messages.map((message, index) => {
          const places =
            message.role === "assistant"
              ? extractPlacesFromMessage(message)
              : null;

          // Extract text content, filtering out tool call JSON and markdown images
          const getTextContent = () => {
            let content = message.content;

            // For assistant messages, remove unwanted patterns
            if (message.role === 'assistant' && content) {
              // Remove JSON objects that look like tool call arguments
              content = content.replace(/\{[^{}]*"query"[^{}]*\}/g, '');

              // Remove markdown image syntax ![alt](url)
              content = content.replace(/!\[[^\]]*\]\([^)]*\)/g, '');

              content = content.trim();
            }

            return content;
          };

          const textContent = getTextContent();
          const hasContent = textContent && textContent.trim().length > 0;
          const hasPlaces = places && places.length > 0;
          const isLastMessage = index === messages.length - 1;
          const isCurrentlyStreaming = isLastMessage && isLoading;

          // Skip empty assistant messages only if not currently streaming
          if (
            message.role === "assistant" &&
            !hasContent &&
            !hasPlaces &&
            !isCurrentlyStreaming
          ) {
            return null;
          }

          return (
            <div
              key={message.id}
              className={`chat-message ${message.role === "user"
                ? "chat-message-user"
                : "chat-message-ai"
                }`}
            >
              {message.role === "assistant" && (
                <div className="chat-message-header">
                  <Sparkles size={23} />
                  <h2 className="text-lg">Answer</h2>
                </div>
              )}

              {/* Show typing indicator inside the message when streaming with no content */}
              {message.role === "assistant" &&
                isCurrentlyStreaming &&
                !hasContent && (
                  <div className="chat-message-content">
                    <span className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </span>
                  </div>
                )}

              {/* Text content - shows during streaming */}
              {hasContent && (
                <div className="chat-message-content markdown-content">
                  <ReactMarkdown
                    components={{
                      img: () => null,
                    }}
                  >
                    {textContent}
                  </ReactMarkdown>
                </div>
              )}

              {/* Places Carousel - only show when not actively streaming this message */}
              {hasPlaces && !isCurrentlyStreaming && (
                <PlaceCarousel
                  places={places}
                  onShowDetails={onShowPlaceDetails}
                />
              )}

              {/* Action Buttons for AI messages - only show when done and has text content */}
              {message.role === "assistant" && !isCurrentlyStreaming && hasContent && (
                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    marginTop: "8px",
                    opacity: 0.5,
                  }}
                >
                  <Copy
                    size={14}
                    className="cursor-pointer hover:opacity-100"
                    onClick={() => {
                      navigator.clipboard.writeText(textContent);
                    }}
                    aria-label="Copy message"
                  />
                </div>
              )}
            </div>
          );
        })
      )}
      {/* Show standalone typing indicator only when loading and NO assistant message exists yet */}
      {isLoading && !hasAssistantMessage && (
        <div className="chat-message chat-message-ai">
          <div className="chat-message-header">
            <Sparkles size={23} />
            <span>Answer</span>
          </div>
          <div className="chat-message-content">
            <span className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </span>
          </div>
        </div>
      )}

      {/* Error message displayed as assistant message */}
      {errorMessage && (
        <div className="chat-message chat-message-ai chat-message-error">
          <div className="chat-message-header chat-message-error-header">
            <Sparkles size={23} />
            <h2 className="text-lg">Error</h2>
          </div>
          <div className="chat-message-content chat-message-error-content">
            {errorMessage}
          </div>
        </div>
      )}
    </div>
  );
}
