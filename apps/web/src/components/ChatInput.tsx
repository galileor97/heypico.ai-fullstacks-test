"use client";

import { ChangeEvent, FormEvent, KeyboardEvent } from "react";
import { ArrowUp, Paperclip } from "lucide-react";

interface ChatInputProps {
  input: string;
  handleInputChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e: FormEvent) => void;
  isLoading: boolean;
  isEmpty: boolean;
}

export function ChatInput({
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
  isEmpty,
}: ChatInputProps) {
  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isLoading) {
        handleSubmit(e as unknown as FormEvent);
      }
    }
  };

  return (
    <div className={`chat-input-container ${isEmpty ? "chat-input-empty" : ""}`}>
      <form onSubmit={handleSubmit} className="chat-input-form">
        <button
          type="button"
          className="chat-input-attach"
          aria-label="Attach file"
        >
          <Paperclip size={20} />
        </button>
        <textarea
          value={input}
          onChange={handleInputChange}
          onKeyDown={onKeyDown}
          placeholder="Ask anything..."
          className="chat-input-textarea"
          disabled={isLoading}
          rows={1}
        />
        <div className="chat-input-actions">
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="chat-input-button"
            aria-label="Send message"
          >
            {isLoading ? (
              <span className="loading-spinner" />
            ) : (
              <ArrowUp size={18} strokeWidth={2.5} />
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
