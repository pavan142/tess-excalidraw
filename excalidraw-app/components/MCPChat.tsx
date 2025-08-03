import React, { useState, useRef, useEffect } from "react";
import {
  processUserRequest,
  getConversationHistory,
  clearConversationHistory,
} from "../mcp/MCPLayer";
import { Flow, FlowStep } from "../mcp/FlowTypes";
import { flowManager } from "../mcp/FlowManager";
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
  const [isRecording, setIsRecording] = useState(false);
  const [currentFlow, setCurrentFlow] = useState<Flow | null>(null);
  const [recordedSteps, setRecordedSteps] = useState<FlowStep[]>([]);
  const [showFlowsList, setShowFlowsList] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [flowName, setFlowName] = useState('');
  const [flowDescription, setFlowDescription] = useState('');
  const [expandedFlowId, setExpandedFlowId] = useState<string | null>(null);
  const [showFlowMentions, setShowFlowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);
  const [mentionStartPosition, setMentionStartPosition] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mentionDropdownRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

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

      // If recording, capture this step
      if (isRecording && result.success && result.tools && result.tools.length > 0) {
        const step: FlowStep = {
          id: `step_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userMessage,
          assistantResponse: result.message,
          toolsUsed: result.tools.map((tool: any) => ({
            tool: tool.tool,
            payload: tool.payload,
            elementId: tool.elementId,
          })),
          timestamp: new Date(),
        };
        setRecordedSteps((prev) => [...prev, step]);
      }
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

  const handleStartRecording = () => {
    setIsRecording(true);
    setCurrentFlow(flowManager.createFlow("", ""));
    setRecordedSteps([]);
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    if (recordedSteps.length > 0) {
      setShowSaveDialog(true);
    }
  };

  const handleSaveFlow = () => {
    if (!flowName.trim()) return;

    const flow: Flow = {
      id: currentFlow?.id || `flow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: flowName.trim(),
      description: flowDescription.trim() || undefined,
      steps: recordedSteps,
      createdAt: currentFlow?.createdAt || new Date(),
      updatedAt: new Date(),
      isPublished: false,
    };

    flowManager.saveFlow(flow);
    setCurrentFlow(null);
    setRecordedSteps([]);
    setShowSaveDialog(false);
    setFlowName('');
    setFlowDescription('');
    
    // Add a success message to the chat
    const successMsg: Message = {
      id: Date.now().toString(),
      role: "assistant",
      content: `✅ Flow "${flow.name}" saved successfully! You can now run it anytime from the Flows menu.`,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, successMsg]);
  };

  const handleExecuteFlow = async (flow: Flow, parameters?: any) => {
    try {
      await flowManager.executeFlow(flow, parameters);
      const successMsg: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: `✅ Flow "${flow.name}" executed successfully!`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, successMsg]);
    } catch (error) {
      console.error('Error executing flow:', error);
      const errorMsg: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: "❌ Error executing flow. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    }
  };

  const handleDeleteFlow = (flowId: string) => {
    if (confirm('Are you sure you want to delete this flow?')) {
      flowManager.deleteFlow(flowId);
      setShowFlowsList(false);
      const successMsg: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: "🗑️ Flow deleted successfully.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, successMsg]);
    }
  };

  const getToolDisplayName = (toolName: string) => {
    const toolNames: Record<string, string> = {
      drawSquare: "Square",
      drawCircle: "Circle",
      drawLine: "Line",
      addText: "Text",
      addImage: "Image",
      addFrame: "Frame",
      move: "Move",
      moveTo: "Move To",
      deleteElement: "Delete",
      editStroke: "Edit Stroke",
      addArrow: "Arrow",
      executeFlow: "Execute Flow",
    };
    return toolNames[toolName] || toolName;
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatUserMessage = (message: string) => {
    if (message.length > 50) {
      return message.substring(0, 50) + '...';
    }
    return message;
  };

  // @ mention system helpers
  const getFilteredFlows = () => {
    const allFlows = flowManager.getAllFlows();
    if (!mentionQuery) return allFlows;
    
    return allFlows.filter(flow => 
      flow.name.toLowerCase().includes(mentionQuery.toLowerCase())
    );
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    
    // Check for @ mention
    const atIndex = value.lastIndexOf('@');
    if (atIndex !== -1) {
      const query = value.substring(atIndex + 1);
      
      // Check if there's a space after the @ symbol (meaning user has completed the mention)
      const hasSpaceAfterAt = /\s/.test(query);
      
      if (!hasSpaceAfterAt && query.length > 0) {
        setMentionQuery(query);
        setMentionStartPosition(atIndex);
        setShowFlowMentions(true);
        setSelectedMentionIndex(0);
      } else {
        setShowFlowMentions(false);
        setMentionQuery('');
      }
    } else {
      setShowFlowMentions(false);
      setMentionQuery('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (showFlowMentions) {
      const filteredFlows = getFilteredFlows();
      
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedMentionIndex(prev => 
          prev < filteredFlows.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedMentionIndex(prev => 
          prev > 0 ? prev - 1 : filteredFlows.length - 1
        );
      } else if (e.key === 'Tab' || e.key === 'Enter') {
        e.preventDefault();
        if (filteredFlows.length > 0) {
          const selectedFlow = filteredFlows[selectedMentionIndex];
          const beforeMention = inputValue.substring(0, mentionStartPosition);
          const afterMention = inputValue.substring(mentionStartPosition + mentionQuery.length + 1);
          const newValue = `${beforeMention}@${selectedFlow.name}${afterMention}`;
          setInputValue(newValue);
          setShowFlowMentions(false);
          setMentionQuery('');
          setSelectedMentionIndex(0);
        }
      } else if (e.key === 'Escape') {
        setShowFlowMentions(false);
        setMentionQuery('');
      }
    }
  };

  const selectFlowMention = (flowName: string) => {
    const beforeMention = inputValue.substring(0, mentionStartPosition);
    const afterMention = inputValue.substring(mentionStartPosition + mentionQuery.length + 1);
    const newValue = `${beforeMention}@${flowName}${afterMention}`;
    setInputValue(newValue);
    setShowFlowMentions(false);
    setMentionQuery('');
    setSelectedMentionIndex(0);
    inputRef.current?.focus();
  };

  // Drag functionality
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only allow dragging from the header area
    const target = e.target as HTMLElement;
    if (!target.closest('.mcp-chat-header') && !target.closest('.mcp-chat-drag-handle')) {
      return;
    }
    
    e.preventDefault();
    setIsDragging(true);
    
    const rect = chatContainerRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    
    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;
    
    // Keep the chat within viewport bounds
    const maxX = window.innerWidth - 400; // Assuming chat width is ~400px
    const maxY = window.innerHeight - 600; // Assuming chat height is ~600px
    
    setPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY)),
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Add/remove global mouse event listeners
  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  // Format text to highlight @ mentions
  const formatTextWithMentions = (text: string) => {
    const mentionRegex = /@([^\s]+)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = mentionRegex.exec(text)) !== null) {
      // Add text before the mention
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      
      // Add the mention with styling
      parts.push(
        <span key={match.index} className="mcp-chat-mention-text">
          {match[0]}
        </span>
      );
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }
    
    return parts.length > 0 ? parts : text;
  };

  if (!isOpen) return null;

  return (
    <div className="mcp-chat-overlay">
      {/* Floating Chat Button (when chat is closed) */}
      {!isOpen && (
        <button
          className="mcp-chat-floating-btn"
          onClick={() => onClose()} // This will toggle the chat open
          title="Open AI Drawing Assistant"
        >
          🤖
        </button>
      )}
      
      {/* Main Chat Container */}
      {isOpen && (
        <div 
          ref={chatContainerRef}
          className={`mcp-chat-container ${isDragging ? 'dragging' : ''} ${isMinimized ? 'minimized' : ''}`}
          style={{
            position: 'fixed',
            left: `${position.x}px`,
            top: `${position.y}px`,
            zIndex: 1000,
          }}
          onMouseDown={handleMouseDown}
        >
        {/* Header */}
        <div className="mcp-chat-header">
          <div className="mcp-chat-drag-handle">
            <span className="mcp-chat-drag-icon">⋮⋮</span>
          </div>
          <h3>AI Drawing Assistant</h3>
          <div className="mcp-chat-actions">
            {/* Flow Recording Controls */}
            <div className="mcp-chat-flow-controls">
              {!isRecording ? (
                <button
                  className="mcp-chat-flow-btn mcp-chat-flow-record"
                  onClick={handleStartRecording}
                  title="Start recording a new flow"
                >
                  🔴 Record
                </button>
              ) : (
                <button
                  className="mcp-chat-flow-btn mcp-chat-flow-stop"
                  onClick={handleStopRecording}
                  title="Stop recording and save flow"
                >
                  ⏹️ Stop
                </button>
              )}
              <button
                className="mcp-chat-flow-btn mcp-chat-flow-saved"
                onClick={() => setShowFlowsList(!showFlowsList)}
                title="View saved flows"
              >
                📋 Flows ({flowManager.getAllFlows().length})
              </button>
            </div>
            <button
              className="mcp-chat-clear-btn"
              onClick={handleClearHistory}
              title="Clear conversation history"
            >
              🗑️
            </button>
            <button
              className="mcp-chat-minimize-btn"
              onClick={() => setIsMinimized(!isMinimized)}
              title={isMinimized ? "Maximize chat" : "Minimize chat"}
            >
              {isMinimized ? "□" : "−"}
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
              </ul>
              <div className="mcp-chat-flow-info">
                <p><strong>🆕 Flow Recorder:</strong> Click "Record" to capture multi-step actions</p>
                <p><strong>🚀 Smart Flows:</strong> Try "@draw a duck 3 times in blue"</p>
              </div>
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
          <div className="mcp-chat-input-wrapper">
            <div className="mcp-chat-input-display">
              {formatTextWithMentions(inputValue)}
            </div>
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onKeyPress={handleKeyPress}
              placeholder="Ask me to draw something..."
              disabled={isLoading}
              className="mcp-chat-input"
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="mcp-chat-send-btn"
          >
            {isLoading ? "⏳" : "➤"}
          </button>
          
          {/* @ Mention Dropdown */}
          {showFlowMentions && (
            <div className="mcp-chat-mention-dropdown" ref={mentionDropdownRef}>
              <div className="mcp-chat-mention-header">
                <span className="mcp-chat-mention-label">Flows</span>
              </div>
              <div className="mcp-chat-mention-list">
                {getFilteredFlows().map((flow, index) => (
                  <div
                    key={flow.id}
                    className={`mcp-chat-mention-item ${
                      index === selectedMentionIndex ? 'selected' : ''
                    }`}
                    onClick={() => selectFlowMention(flow.name)}
                  >
                    <div className="mcp-chat-mention-item-content">
                      <span className="mcp-chat-mention-item-name">{flow.name}</span>
                      <span className="mcp-chat-mention-item-steps">
                        {flow.steps.length} steps
                      </span>
                    </div>
                  </div>
                ))}
                {getFilteredFlows().length === 0 && (
                  <div className="mcp-chat-mention-empty">
                    No flows found
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Recording Status */}
        {isRecording && (
          <div className="mcp-chat-recording-status">
            <div className="mcp-chat-recording-indicator">
              <span className="mcp-chat-recording-dot"></span>
              Recording... ({recordedSteps.length} steps)
            </div>
          </div>
        )}

        {/* Save Flow Dialog */}
        {showSaveDialog && (
          <div className="mcp-chat-dialog-overlay">
            <div className="mcp-chat-dialog">
              <h3>Save Flow</h3>
              <div className="mcp-chat-dialog-form">
                <div className="mcp-chat-dialog-group">
                  <label htmlFor="flowName">Flow Name *</label>
                  <input
                    id="flowName"
                    type="text"
                    value={flowName}
                    onChange={(e) => setFlowName(e.target.value)}
                    placeholder="e.g., Checkout Flow"
                    autoFocus
                  />
                </div>
                <div className="mcp-chat-dialog-group">
                  <label htmlFor="flowDescription">Description (optional)</label>
                  <textarea
                    id="flowDescription"
                    value={flowDescription}
                    onChange={(e) => setFlowDescription(e.target.value)}
                    placeholder="Describe what this flow does..."
                    rows={3}
                  />
                </div>
                <div className="mcp-chat-dialog-actions">
                  <button
                    className="mcp-chat-dialog-btn mcp-chat-dialog-cancel"
                    onClick={() => setShowSaveDialog(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="mcp-chat-dialog-btn mcp-chat-dialog-save"
                    onClick={handleSaveFlow}
                    disabled={!flowName.trim()}
                  >
                    Save Flow
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Flows List Dialog */}
        {showFlowsList && (
          <div className="mcp-chat-dialog-overlay">
            <div className="mcp-chat-dialog mcp-chat-flows-dialog">
              <div className="mcp-chat-dialog-header">
                <h3>Saved Flows</h3>
                <button
                  className="mcp-chat-dialog-close"
                  onClick={() => setShowFlowsList(false)}
                >
                  ✕
                </button>
              </div>
              <div className="mcp-chat-flows-list">
                {flowManager.getAllFlows().length === 0 ? (
                  <div className="mcp-chat-flows-empty">
                    <p>No saved flows yet.</p>
                    <p>Start recording to create your first flow!</p>
                  </div>
                ) : (
                  flowManager.getAllFlows().map((flow) => (
                    <div key={flow.id} className="mcp-chat-flow-item">
                      <div className="mcp-chat-flow-info">
                        <h4>{flow.name}</h4>
                        {flow.description && (
                          <p className="mcp-chat-flow-description">
                            {flow.description}
                          </p>
                        )}
                        <div className="mcp-chat-flow-meta">
                          <span>{flow.steps.length} steps</span>
                          <span>•</span>
                          <span>
                            {flow.updatedAt.toLocaleDateString()} at{' '}
                            {flow.updatedAt.toLocaleTimeString()}
                          </span>
                          {flow.isPublished && (
                            <>
                              <span>•</span>
                              <span className="mcp-chat-flow-published">Published</span>
                            </>
                          )}
                        </div>
                        <div className="mcp-chat-flow-steps-preview">
                          <div className="mcp-chat-flow-steps-header">
                            {flow.steps.length} steps:
                          </div>
                          {flow.steps.slice(0, 3).map((step, index) => (
                            <div key={step.id} className="mcp-chat-flow-step-preview">
                              <span className="mcp-chat-flow-step-number">{index + 1}.</span>
                              <span className="mcp-chat-flow-step-message">
                                {formatUserMessage(step.userMessage)}
                              </span>
                            </div>
                          ))}
                          {flow.steps.length > 3 && (
                            <div className="mcp-chat-flow-steps-more">
                              +{flow.steps.length - 3} more steps
                            </div>
                          )}
                        </div>
                        
                        {/* Expanded Details */}
                        {expandedFlowId === flow.id && (
                          <div className="mcp-chat-flow-details">
                            {flow.steps.map((step, index) => (
                              <div key={step.id} className="mcp-chat-flow-detail-step">
                                <div className="mcp-chat-flow-detail-step-header">
                                  <span className="mcp-chat-flow-detail-step-number">{index + 1}.</span>
                                  <span className="mcp-chat-flow-detail-step-message">
                                    {step.userMessage}
                                  </span>
                                </div>
                                <div className="mcp-chat-flow-detail-step-tools">
                                  {step.toolsUsed.map((tool, toolIndex) => (
                                    <div key={toolIndex} className="mcp-chat-flow-detail-tool">
                                      <span className="mcp-chat-flow-detail-tool-label">function:</span>
                                      <span className="mcp-chat-flow-detail-tool-name">
                                        {tool.tool}
                                      </span>
                                      {tool.payload && Object.keys(tool.payload).length > 0 && (
                                        <span className="mcp-chat-flow-detail-tool-params">
                                          ({Object.entries(tool.payload)
                                            .filter(([key, value]) => value !== undefined && value !== null)
                                            .map(([key, value]) => `${key}: ${value}`)
                                            .join(', ')})
                                        </span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        <div className="mcp-chat-flow-preview-actions">
                          <button
                            className="mcp-chat-flow-btn mcp-chat-flow-details-btn"
                            onClick={() => setExpandedFlowId(expandedFlowId === flow.id ? null : flow.id)}
                            title={expandedFlowId === flow.id ? "Hide details" : "View all steps"}
                          >
                            {expandedFlowId === flow.id ? "👁️ Hide Details" : "👁️ View Details"}
                          </button>
                        </div>
                      </div>
                      <div className="mcp-chat-flow-actions">
                        <button
                          className="mcp-chat-flow-btn mcp-chat-flow-execute"
                          onClick={() => handleExecuteFlow(flow)}
                          title="Execute this flow"
                        >
                          ▶️ Run
                        </button>
                        <button
                          className="mcp-chat-flow-btn mcp-chat-flow-delete"
                          onClick={() => handleDeleteFlow(flow.id)}
                          title="Delete this flow"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
        </div>
      )}
    </div>
  );
};

export default MCPChat;
