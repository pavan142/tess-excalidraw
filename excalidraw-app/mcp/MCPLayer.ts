import { z } from "zod";

// Conversation history array to store past interactions
let conversationHistory: Array<{
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  toolUsed?:
    | {
        name: string;
        payload: any;
      }
    | undefined;
}> = [];

// Function to add message to conversation history
function addToHistory(
  role: "user" | "assistant",
  content: string,
  toolUsed?: { name: string; payload: any },
) {
  conversationHistory.push({
    role,
    content,
    timestamp: new Date(),
    toolUsed,
  });
}

// Function to get conversation context
function getConversationContext(): string {
  if (conversationHistory.length === 0) {
    return "";
  }

  const recentMessages = conversationHistory.slice(-10); // Last 10 messages
  return recentMessages
    .map(
      (msg) =>
        `${msg.role}: ${msg.content}${
          msg.toolUsed ? ` (Used tool: ${msg.toolUsed.name})` : ""
        }`,
    )
    .join("\n");
}

// Main function to process user requests
export async function processUserRequest(userMessage: string) {
  // Add user message to history
  addToHistory("user", userMessage);

  try {
    const response = await fetch("http://localhost:3001/api/process-request", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userMessage,
        conversationHistory,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.success) {
      // Add assistant response to history
      addToHistory("assistant", result.message, {
        name:
          result.tools?.length > 0
            ? result.tools.map((t: any) => t.tool).join(", ")
            : "",
        payload: result.tools || [],
      });

      // Execute all tools
      if (result.tools && Array.isArray(result.tools)) {
        for (const tool of result.tools) {
          await executeTool(tool.tool, tool.payload);
        }
      }

      return {
        success: true,
        message: result.message,
        tools: result.tools,
      };
    } else {
      return {
        success: false,
        message: result.message,
        error: result.error,
      };
    }
  } catch (error) {
    console.error("Error processing request:", error);
    return {
      success: false,
      message: "Sorry, I encountered an error processing your request.",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Function to execute tools
async function executeTool(toolName: string, payload: any) {
  try {
    switch (toolName) {
      case "drawSquare":
        // @ts-ignore
        if (window["drawSquare"]) {
          // @ts-ignore
          window["drawSquare"](payload.x, payload.y, payload.size, {
            strokeColor: payload.strokeColor,
            backgroundColor: payload.backgroundColor,
            fillStyle: payload.fillStyle,
            strokeWidth: payload.strokeWidth,
            strokeStyle: payload.strokeStyle,
            roughness: payload.roughness,
            opacity: payload.opacity,
            roundness: payload.roundness,
          });
        }
        break;

      case "drawCircle":
        // @ts-ignore
        if (window["drawCircle"]) {
          // @ts-ignore
          window["drawCircle"](payload.x, payload.y, payload.size, {
            strokeColor: payload.strokeColor,
            backgroundColor: payload.backgroundColor,
            fillStyle: payload.fillStyle,
            strokeWidth: payload.strokeWidth,
            strokeStyle: payload.strokeStyle,
            roughness: payload.roughness,
            opacity: payload.opacity,
          });
        }
        break;

      case "drawLine":
        // @ts-ignore
        if (window["drawLine"]) {
          // @ts-ignore
          window["drawLine"](payload.x, payload.y, payload.width, payload.height, {
            strokeColor: payload.strokeColor,
            strokeWidth: payload.strokeWidth,
            strokeStyle: payload.strokeStyle,
            roughness: payload.roughness,
            opacity: payload.opacity,
          });
        }
        break;

      case "addText":
        // @ts-ignore
        if (window["addText"]) {
          // @ts-ignore
          window["addText"](payload.x, payload.y, payload.text, {
            fontSize: payload.fontSize,
            fontFamily: payload.fontFamily,
            textAlign: payload.textAlign,
            verticalAlign: payload.verticalAlign,
            strokeColor: payload.strokeColor,
            backgroundColor: payload.backgroundColor,
            fillStyle: payload.fillStyle,
            strokeWidth: payload.strokeWidth,
            strokeStyle: payload.strokeStyle,
            roughness: payload.roughness,
            opacity: payload.opacity,
            angle: payload.angle,
          });
        }
        break;

      case "addImage":
        // @ts-ignore
        if (window["addImage"]) {
          // @ts-ignore
          window["addImage"](payload.x, payload.y, payload.imageUrl, {
            width: payload.width,
            height: payload.height,
            scale: payload.scale,
            opacity: payload.opacity,
            angle: payload.angle,
          });
        }
        break;

      case "addFrame":
        // @ts-ignore
        if (window["addFrame"]) {
          // @ts-ignore
          window["addFrame"](payload.x, payload.y, payload.width, payload.height, payload.name, {
            strokeColor: payload.strokeColor,
            backgroundColor: payload.backgroundColor,
            fillStyle: payload.fillStyle,
            strokeWidth: payload.strokeWidth,
            strokeStyle: payload.strokeStyle,
            roughness: payload.roughness,
            opacity: payload.opacity,
            angle: payload.angle,
          });
        }
        break;

      case "move":
        // @ts-ignore
        if (window["move"]) {
          // @ts-ignore
          window["move"](payload.elementId, payload.x, payload.y);
        }
        break;

      case "moveTo":
        // @ts-ignore
        if (window["moveTo"]) {
          // @ts-ignore
          window["moveTo"](payload.elementId, payload.x, payload.y);
        }
        break;

      case "deleteElement":
        // @ts-ignore
        if (window["deleteElement"]) {
          // @ts-ignore
          window["deleteElement"](payload.elementId);
        }
        break;

      case "editStroke":
        // @ts-ignore
        if (window["editStroke"]) {
          // @ts-ignore
          window["editStroke"](payload.elementId, payload.strokeColor, payload.strokeWidth, payload.strokeStyle);
        }
        break;

      case "addArrow":
        // @ts-ignore
        if (window["addArrow"]) {
          // @ts-ignore
          window["addArrow"](payload.fromElementId, payload.toElementId, {
            strokeColor: payload.strokeColor,
            strokeWidth: payload.strokeWidth,
            strokeStyle: payload.strokeStyle,
            startArrowhead: payload.startArrowhead,
            endArrowhead: payload.endArrowhead,
            roughness: payload.roughness,
            opacity: payload.opacity,
          });
        }
        break;

      default:
        console.warn(`Unknown tool: ${toolName}`);
    }
  } catch (error) {
    console.error(`Error executing tool ${toolName}:`, error);
  }
}

// Export conversation history for debugging
export function getConversationHistory() {
  return conversationHistory;
}

// Export function to clear conversation history
export function clearConversationHistory() {
  conversationHistory = [];
}
