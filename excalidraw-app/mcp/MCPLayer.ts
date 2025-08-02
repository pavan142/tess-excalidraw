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

// Updated tool schema to support multiple tools
const toolSchema = z.object({
  tools: z.array(
    z.object({
      tool: z.enum([
        "drawSquare",
        "drawCircle",
        "editSquare",
        "drawRectangle",
        "drawText",
      ]),
      payload: z.object({
        x: z.number().optional(),
        y: z.number().optional(),
        size: z.number().optional(),
        width: z.number().optional(),
        height: z.number().optional(),
        text: z.string().optional(),
        strokeColor: z.string().optional(),
        backgroundColor: z.string().optional(),
        fillStyle: z
          .enum(["hachure", "solid", "cross-hatch", "zigzag"])
          .optional(),
        strokeWidth: z.number().optional(),
        strokeStyle: z.enum(["solid", "dashed", "dotted"]).optional(),
        roughness: z.number().optional(),
        opacity: z.number().optional().nullable(),
        roundness: z.number().optional().nullable(),
      }),
    }),
  ),
  message: z.string(),
});

// Updated instruction prompt
const instructionPrompt = `You are an AI assistant that can directly interact with an Excalidraw whiteboard application. You have access to drawing tools that allow you to create and modify elements on the canvas.

## Available Tools:

### 1. drawSquare
Creates a square on the canvas.
- **Parameters:**
  - x (number): X coordinate for top-left corner (default: 100)
  - y (number): Y coordinate for top-left corner (default: 100)
  - size (number): Width and height of the square (default: 100)
  - strokeColor (string): Border color (default: "#1e1e1e")
  - backgroundColor (string): Fill color (default: "skyblue")
  - fillStyle (string): Fill pattern - "hachure", "solid", "cross-hatch", "zigzag" (default: "hachure")
  - strokeWidth (number): Border thickness (default: 4)
  - strokeStyle (string): Border style - "solid", "dashed", "dotted" (default: "solid")
  - roughness (number): Hand-drawn effect (default: 1)
  - opacity (number): Transparency 0-100 (default: 90)
  - roundness (number): Corner radius (default: null)

### 2. drawCircle
Creates a circle on the canvas.
- **Parameters:** Same as drawSquare, but creates a circular shape

### 3. drawRectangle
Creates a rectangle on the canvas.
- **Parameters:**
  - x, y: Position coordinates
  - width, height: Dimensions (can be different for rectangles)
  - All styling parameters same as drawSquare

### 4. drawText
Adds text to the canvas.
- **Parameters:**
  - x, y: Position coordinates
  - text (string): The text content to display
  - fontSize (number): Text size (default: 20)
  - fontFamily (string): Font type (default: "Virgil")
  - textAlign (string): "left", "center", "right" (default: "left")
  - strokeColor: Text color

### 5. editSquare
Modifies an existing square element.
- **Parameters:** Same as drawSquare, plus elementId to identify which element to edit

## Usage Guidelines:

1. **Be Creative**: Use the tools to create interesting diagrams, flowcharts, or visual representations
2. **Coordinate System**: The canvas uses a coordinate system where (0,0) is at the top-left
3. **Color Options**: Use descriptive colors like "red", "blue", "green", "yellow", "purple", "orange", "pink", "brown", "gray", "black", "white"
4. **Positioning**: Think about where elements should be placed relative to each other
5. **Sizing**: Consider appropriate sizes for different elements (small for details, large for main elements)
6. **Styling**: Use different stroke widths, colors, and fill styles to create visual hierarchy
7. **Multiple Tools**: You can use multiple tools in a single response to create complex diagrams

## Response Format:
When a user asks you to draw something, respond with:
1. A brief description of what you're going to create
2. Use the appropriate tool(s) with specific parameters (you can use multiple tools)
3. Provide a friendly message explaining what was created

## Examples:
- "Draw a red square in the center" → Use drawSquare with x: 200, y: 200, size: 100, strokeColor: "red"
- "Create a flowchart with boxes and arrows" → Use multiple drawRectangle calls with connecting lines
- "Add some text labels" → Use drawText to add descriptive labels
- "Create a simple house" → Use drawRectangle for walls, drawSquare for windows, drawText for labels

Remember to be helpful, creative, and precise with your tool usage!`;

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

      case "drawRectangle":
        // @ts-ignore
        if (window["drawRectangle"]) {
          // @ts-ignore
          window["drawRectangle"](
            payload.x,
            payload.y,
            payload.width,
            payload.height,
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
        }
        break;

      case "drawText":
        // TODO: Implement drawText function
        console.log("drawText not yet implemented");
        break;

      case "editSquare":
        // TODO: Implement editSquare function
        console.log("editSquare not yet implemented");
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
