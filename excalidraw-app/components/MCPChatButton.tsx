import React, { useState } from "react";
import MCPChat from "./MCPChat";
import "./MCPChatButton.scss";

const MCPChatButton: React.FC = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <>
      <button
        className="mcp-chat-trigger-btn"
        onClick={() => setIsChatOpen(true)}
        title="Open AI Drawing Assistant"
      >
        🤖
      </button>

      <MCPChat 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
      />
    </>
  );
};

export default MCPChatButton; 