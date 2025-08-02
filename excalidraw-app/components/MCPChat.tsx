import React, { useState, useRef, useEffect } from "react";
import {
  processUserRequest,
  getConversationHistory,
  clearConversationHistory,
} from "../mcp/MCPLayer";
import "./MCPChat.scss";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  toolUsed?: {
    name: string;
    payload: any;
  };
  isLoading?: boolean;
}

interface MCPChatProps {
  isOpen: boolean;
  onClose: () => void;
}

const MCPChat: React.FC<MCPChatProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages are added
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue("");

    // Add user message to chat
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: userMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);

    // Add loading message
    const loadingMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: "Thinking...",
      timestamp: new Date(),
      isLoading: true,
    };

    setMessages((prev) => [...prev, loadingMsg]);
    setIsLoading(true);

    try {
      const result = await processUserRequest(userMessage);

      // Remove loading message and add assistant response
      setMessages((prev) => {
        const filtered = prev.filter((msg) => !msg.isLoading);
        const assistantMsg: Message = {
          id: Date.now().toString(),
          role: "assistant",
          content: result.message,
          timestamp: new Date(),
          toolUsed: result.success
            ? {
                name: result.tools?.length > 0 ? result.tools.map((t: any) => t.tool).join(", ") : "",
                payload: result.tools || [],
              }
            : undefined,
        };
        return [...filtered, assistantMsg];
      });
    } catch (error) {
      console.error("Error processing message:", error);

      // Remove loading message and add error message
      setMessages((prev) => {
        const filtered = prev.filter((msg) => !msg.isLoading);
        const errorMsg: Message = {
          id: Date.now().toString(),
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
          timestamp: new Date(),
        };
        return [...filtered, errorMsg];
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearHistory = () => {
    clearConversationHistory();
    setMessages([]);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const getToolDisplayName = (toolName: string) => {
    const toolNames: Record<string, string> = {
      drawSquare: "Square",
      drawCircle: "Circle",
      drawRectangle: "Rectangle",
      drawText: "Text",
      editSquare: "Edit Square",
    };
    return toolNames[toolName] || toolName;
  };

  if (!isOpen) return null;

  return (
    <div className="mcp-chat-overlay">
      <div className="mcp-chat-container">
        {/* Header */}
        <div className="mcp-chat-header">
          <h3>AI Drawing Assistant</h3>
          <div className="mcp-chat-actions">
            <button
              className="mcp-chat-clear-btn"
              onClick={handleClearHistory}
              title="Clear conversation history"
            >
              🗑️
            </button>
            <button
              className="mcp-chat-close-btn"
              onClick={onClose}
              title="Close chat"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="mcp-chat-messages">
          {messages.length === 0 ? (
            <div className="mcp-chat-welcome">
              <p>👋 Hi! I'm your AI drawing assistant.</p>
              <p>Try asking me to:</p>
              <ul>
                <li>"Draw a red square"</li>
                <li>"Create a blue circle"</li>
                <li>"Make a green rectangle"</li>
                <li>"Draw a flowchart with boxes"</li>
              </ul>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`mcp-chat-message ${message.role} ${
                  message.isLoading ? "loading" : ""
                }`}
              >
                <div className="mcp-chat-message-content">
                  <div className="mcp-chat-message-text">{message.content}</div>
                  {message.toolUsed && (
                    <div className="mcp-chat-tool-used">
                      🎨 Used: {Array.isArray(message.toolUsed.payload) 
                        ? message.toolUsed.payload.map((tool: any) => getToolDisplayName(tool.tool)).join(", ")
                        : getToolDisplayName(message.toolUsed.name)
                      }
                    </div>
                  )}
                  <div className="mcp-chat-message-time">
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="mcp-chat-input-container">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me to draw something..."
            disabled={isLoading}
            className="mcp-chat-input"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="mcp-chat-send-btn"
          >
            {isLoading ? "⏳" : "➤"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MCPChat;
