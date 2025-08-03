import { z } from "zod";

// Conversation history array to store past interactions
let conversationHistory: Array<{
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  toolUsed?:
    | {
        name: string;
        payload: any;
      }
    | undefined;
  elementId?: string; // Track the ID of created elements
}> = [];

// Function to add message to conversation history
function addToHistory(
  role: "user" | "assistant" | "system",
  content: string,
  toolUsed?: { name: string; payload: any },
  elementId?: string,
) {
  conversationHistory.push({
    role,
    content,
    timestamp: new Date(),
    toolUsed,
    elementId,
  });
}

// Function to get conversation context (excluding system messages for Claude)
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
        conversationHistory: conversationHistory, // Only send non-system messages to Claude
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.success) {
      // Execute all tools and track their element IDs
      const executedTools = [];
      if (result.tools && Array.isArray(result.tools)) {
        for (const tool of result.tools) {
          const elementId = await executeTool(tool.tool, tool.payload);

          // Add the element ID to the tool data
          const executedTool = {
            ...tool,
            elementId: elementId,
          };
          executedTools.push(executedTool);

          // Add system message to track successful tool execution
          if (elementId) {
            addToHistory(
              "system",
              `Successfully executed ${tool.tool} with element ID: ${elementId}`,
              { name: tool.tool, payload: tool.payload, elementId: elementId },
              elementId,
            );
          }
        }
      }

      // Add assistant response to history with updated tool data including element IDs
      addToHistory("assistant", result.message, {
        name:
          executedTools.length > 0
            ? executedTools.map((t: any) => t.tool).join(", ")
            : "",
        payload: executedTools,
      });

      return {
        success: true,
        message: result.message,
        tools: executedTools,
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

// Function to execute tools and return element ID
async function executeTool(
  toolName: string,
  payload: any,
): Promise<string | null> {
  try {
    let elementId: string | null = null;

    switch (toolName) {
      case "drawSquare":
        // @ts-ignore
        if (window["drawSquare"]) {
          // @ts-ignore
          const element = window["drawSquare"](
            payload.x,
            payload.y,
            payload.size,
            {
              strokeColor: payload.strokeColor,
              backgroundColor: payload.backgroundColor,
              fillStyle: payload.fillStyle,
              strokeWidth: payload.strokeWidth,
              strokeStyle: payload.strokeStyle,
              roughness: payload.roughness,
              opacity: payload.opacity,
              roundness: payload.roundness,
            },
          );
          elementId = element?.id || null;
        }
        break;

      case "drawCircle":
        // @ts-ignore
        if (window["drawCircle"]) {
          // @ts-ignore
          const element = window["drawCircle"](
            payload.x,
            payload.y,
            payload.size,
            {
              strokeColor: payload.strokeColor,
              backgroundColor: payload.backgroundColor,
              fillStyle: payload.fillStyle,
              strokeWidth: payload.strokeWidth,
              strokeStyle: payload.strokeStyle,
              roughness: payload.roughness,
              opacity: payload.opacity,
            },
          );
          elementId = element?.id || null;
        }
        break;

      case "drawLine":
        // @ts-ignore
        if (window["drawLine"]) {
          // @ts-ignore
          const element = window["drawLine"](
            payload.x,
            payload.y,
            payload.width,
            payload.height,
            {
              strokeColor: payload.strokeColor,
              strokeWidth: payload.strokeWidth,
              strokeStyle: payload.strokeStyle,
              roughness: payload.roughness,
              opacity: payload.opacity,
            },
          );
          elementId = element?.id || null;
        }
        break;

      case "addText":
        // @ts-ignore
        if (window["addText"]) {
          // @ts-ignore
          const element = window["addText"](
            payload.x,
            payload.y,
            payload.text,
            {
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
            },
          );
          elementId = element?.id || null;
        }
        break;

      case "addImage":
        // @ts-ignore
        if (window["addImage"]) {
          // @ts-ignore
          const element = window["addImage"](
            payload.x,
            payload.y,
            payload.imageUrl,
            {
              width: payload.width,
              height: payload.height,
              scale: payload.scale,
              opacity: payload.opacity,
              angle: payload.angle,
            },
          );
          elementId = element?.id || null;
        }
        break;

      case "addFrame":
        // @ts-ignore
        if (window["addFrame"]) {
          // @ts-ignore
          const element = window["addFrame"](
            payload.x,
            payload.y,
            payload.width,
            payload.height,
            payload.name,
            {
              strokeColor: payload.strokeColor,
              backgroundColor: payload.backgroundColor,
              fillStyle: payload.fillStyle,
              strokeWidth: payload.strokeWidth,
              strokeStyle: payload.strokeStyle,
              roughness: payload.roughness,
              opacity: payload.opacity,
              angle: payload.angle,
            },
          );
          elementId = element?.id || null;
        }
        break;

      case "move":
        // @ts-ignore
        if (window["move"]) {
          // @ts-ignore
          const element = window["move"](
            payload.elementId,
            payload.x,
            payload.y,
          );
          elementId = element?.id || payload.elementId; // Return the moved element's ID
        }
        break;

      case "moveTo":
        // @ts-ignore
        if (window["moveTo"]) {
          // @ts-ignore
          const element = window["moveTo"](
            payload.elementId,
            payload.x,
            payload.y,
          );
          elementId = element?.id || payload.elementId; // Return the moved element's ID
        }
        break;

      case "deleteElement":
        // @ts-ignore
        if (window["deleteElement"]) {
          // @ts-ignore
          const element = window["deleteElement"](payload.elementId);
          elementId = payload.elementId; // Return the deleted element's ID
        }
        break;

      case "editStroke":
        // @ts-ignore
        if (window["editStroke"]) {
          // @ts-ignore
          const element = window["editStroke"](
            payload.elementId,
            payload.strokeColor,
            payload.strokeWidth,
            payload.strokeStyle,
          );
          elementId = element?.id || payload.elementId; // Return the edited element's ID
        }
        break;

              case "addArrow":
          // @ts-ignore
          if (window["addArrow"]) {
            // @ts-ignore
            const element = window["addArrow"](
              payload.fromElementId,
              payload.toElementId,
              {
                strokeColor: payload.strokeColor,
                strokeWidth: payload.strokeWidth,
                strokeStyle: payload.strokeStyle,
                startArrowhead: payload.startArrowhead,
                endArrowhead: payload.endArrowhead,
                roughness: payload.roughness,
                opacity: payload.opacity,
              },
            );
            elementId = element?.id || null;
          }
          break;

        case "executeFlow":
          // Import flowManager dynamically to avoid circular dependencies
          const { flowManager } = await import('./FlowManager');
          const flow = flowManager.findFlowByName(payload.flowName);
          
          if (flow) {
            const parameters = {
              xOffset: payload.xOffset,
              yOffset: payload.yOffset,
              rotation: payload.rotation,
              scale: payload.scale,
              color: payload.color,
              count: payload.count,
              direction: payload.direction,
              spacing: payload.spacing,
            };
            
            await flowManager.executeFlow(flow, parameters);
            console.log(`Executed flow: ${flow.name} with parameters:`, parameters);
          } else {
            console.error(`Flow not found: ${payload.flowName}`);
          }
          break;

      default:
        console.warn(`Unknown tool: ${toolName}`);
    }

    return elementId;
  } catch (error) {
    console.error(`Error executing tool ${toolName}:`, error);
    return null;
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

// Export function to get element IDs from history
export function getElementIdsFromHistory(): string[] {
  return conversationHistory
    .filter((msg) => msg.elementId)
    .map((msg) => msg.elementId!)
    .filter((id, index, arr) => arr.indexOf(id) === index); // Remove duplicates
}
