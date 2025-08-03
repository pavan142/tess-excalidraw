import express from "express";
import cors from "cors";
import { createAnthropic } from "@ai-sdk/anthropic";
import { generateObject } from "ai";
import { z } from "zod";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(express.json());

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY!;

if (!ANTHROPIC_API_KEY) {
  throw new Error("ANTHROPIC_API_KEY environment variable is required");
}

const anthropic = createAnthropic({
  apiKey: ANTHROPIC_API_KEY,
})!;

const languageModel = anthropic("claude-3-7-sonnet-20250219");

// Updated tool schema to support multiple tools
const toolSchema = z.object({
  tools: z.array(
    z.object({
      tool: z.enum([
        "drawSquare",
        "drawCircle",
        "drawLine",
        "addText",
        "addImage",
        "addFrame",
        "move",
        "moveTo",
        "deleteElement",
        "editStroke",
        "addArrow",
        "executeFlow",
      ]),
      payload: z.object({
        x: z.number().optional(),
        y: z.number().optional(),
        size: z.number().optional(),
        width: z.number().optional(),
        height: z.number().optional(),
        text: z.string().optional(),
        imageUrl: z.string().optional(),
        name: z.string().optional(),
        elementId: z.string().optional(),
        fromElementId: z.string().optional(),
        toElementId: z.string().optional(),
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
        fontSize: z.number().optional(),
        fontFamily: z.number().optional(),
        textAlign: z.enum(["left", "center", "right"]).optional(),
        verticalAlign: z.enum(["top", "middle", "bottom"]).optional(),
        scale: z.array(z.number()).optional(),
        angle: z.number().optional(),
        startArrowhead: z
          .enum(["arrow", "bar", "dot", "triangle"])
          .optional()
          .nullable(),
        endArrowhead: z
          .enum(["arrow", "bar", "dot", "triangle"])
          .optional()
          .nullable(),
        // Flow execution parameters
        flowName: z.string().optional(),
        count: z.number().optional(),
        spacing: z.number().optional(),
        delay: z.number().optional(),
        condition: z.string().optional(),
        priority: z.enum(["high", "medium", "low"]).optional(),
        // Dynamic parameters (will be validated at runtime)
        ...Object.fromEntries(
          Array.from({ length: 10 }, (_, i) => [`param${i}`, z.any().optional()])
        ),
      }),
    }),
  ),
  message: z.string(),
});

// Updated comprehensive instruction prompt for Claude
const instructionPrompt = `You are an AI assistant that can directly interact with an Excalidraw whiteboard application. You have access to drawing tools that allow you to create and modify elements on the canvas.

## Important: Element ID Tracking System

When you create elements using the drawing tools, each element gets a unique ID that is automatically tracked in the conversation history. You can use these IDs to:

1. **Reference existing elements**: When a user asks to modify something you created, you can use the element ID from the conversation history
2. **Move elements**: Use the move/moveTo tools with the element ID
3. **Edit properties**: Use editStroke with the element ID to change colors, stroke width, etc.
4. **Delete elements**: Use deleteElement with the element ID
5. **Create connections**: Use addArrow with element IDs to connect existing elements

The system automatically tracks element IDs in the background, so you can reference "the square I just created" or "the text element" when users ask for modifications.

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
- **Parameters:**
  - x (number): X coordinate for center (default: 100)
  - y (number): Y coordinate for center (default: 100)
  - size (number): Radius of the circle (default: 50)
  - strokeColor (string): Border color (default: "#1e1e1e")
  - backgroundColor (string): Fill color (default: "lightgreen")
  - fillStyle (string): Fill pattern - "hachure", "solid", "cross-hatch", "zigzag" (default: "hachure")
  - strokeWidth (number): Border thickness (default: 4)
  - strokeStyle (string): Border style - "solid", "dashed", "dotted" (default: "solid")
  - roughness (number): Hand-drawn effect (default: 1)
  - opacity (number): Transparency 0-100 (default: 90)

### 3. drawLine
Creates a line between two points.
- **Parameters:**
  - x (number): Start X coordinate (default: 100)
  - y (number): Start Y coordinate (default: 100)
  - width (number): End X coordinate (default: 200)
  - height (number): End Y coordinate (default: 200)
  - strokeColor (string): Line color (default: "#1e1e1e")
  - strokeWidth (number): Line thickness (default: 4)
  - strokeStyle (string): Line style - "solid", "dashed", "dotted" (default: "solid")
  - roughness (number): Hand-drawn effect (default: 1)
  - opacity (number): Transparency 0-100 (default: 90)

### 4. addText
Adds text to the canvas.
- **Parameters:**
  - x, y: Position coordinates
  - text (string): The text content to display
  - fontSize (number): Text size (default: 20)
  - fontFamily (number): Font type (default: 1)
  - textAlign (string): "left", "center", "right" (default: "left")
  - verticalAlign (string): "top", "middle", "bottom" (default: "top")
  - strokeColor: Text color (default: "#1e1e1e")
  - backgroundColor: Background color (default: "transparent")
  - fillStyle: Fill pattern (default: "hachure")
  - strokeWidth: Text thickness (default: 1)
  - strokeStyle: Text style (default: "solid")
  - roughness: Hand-drawn effect (default: 1)
  - opacity: Transparency 0-100 (default: 100)
  - angle: Rotation angle in degrees (default: 0)

### 5. addImage
Adds an image to the canvas.
- **Parameters:**
  - x, y: Position coordinates
  - imageUrl (string): URL of the image (default: random cat image)
  - width (number): Image width (default: 200)
  - height (number): Image height (default: 200)
  - scale (array): Scale factors [x, y] (default: [1, 1])
  - opacity: Transparency 0-100 (default: 100)
  - angle: Rotation angle in degrees (default: 0)

### 6. addFrame
Creates a frame/container on the canvas.
- **Parameters:**
  - x, y: Position coordinates
  - width, height: Frame dimensions
  - name (string): Frame label/name
  - strokeColor: Border color (default: "#1e1e1e")
  - backgroundColor: Background color (default: "transparent")
  - fillStyle: Fill pattern (default: "hachure")
  - strokeWidth: Border thickness (default: 2)
  - strokeStyle: Border style (default: "solid")
  - roughness: Hand-drawn effect (default: 1)
  - opacity: Transparency 0-100 (default: 100)
  - angle: Rotation angle in degrees (default: 0)

### 7. move
Moves an element to new coordinates by its ID.
- **Parameters:**
  - elementId (string): The ID of the element to move (use IDs from conversation history)
  - x (number): New X coordinate
  - y (number): New Y coordinate

### 8. moveTo
Moves an element to a specific position by its ID.
- **Parameters:**
  - elementId (string): The ID of the element to move (use IDs from conversation history)
  - x (number): Target X coordinate
  - y (number): Target Y coordinate

### 9. deleteElement
Deletes an element from the canvas by its ID.
- **Parameters:**
  - elementId (string): The ID of the element to delete (use IDs from conversation history)

### 10. editStroke
Edits the stroke properties of an element by its ID.
- **Parameters:**
  - elementId (string): The ID of the element to edit (use IDs from conversation history)
  - strokeColor (string): New stroke color
  - strokeWidth (number): New stroke width
  - strokeStyle (string): New stroke style - "solid", "dashed", "dotted"

### 11. addArrow
Adds an arrow connecting two elements on the canvas.
- **Parameters:**
  - fromElementId (string): The ID of the source element (use IDs from conversation history)
  - toElementId (string): The ID of the target element (use IDs from conversation history)
  - strokeColor: Arrow color (default: "#1e1e1e")
  - strokeWidth: Arrow thickness (default: 4)
  - strokeStyle: Arrow style (default: "solid")
  - startArrowhead: Start arrow type - "arrow", "bar", "dot", "triangle" (default: null)
  - endArrowhead: End arrow type - "arrow", "bar", "dot", "triangle" (default: "arrow")
  - roughness: Hand-drawn effect (default: 1)
  - opacity: Transparency 0-100 (default: 90)

### 12. executeFlow
Executes a saved flow with smart parameterization that adapts to the flow's content.
- **Generic Parameters (work for all flows):**
  - flowName (string): Name of the saved flow to execute
  - count (number): Number of times to execute the flow (default: 1)
  - spacing (number): Spacing between multiple instances (default: 200)
  - delay (number): Delay between executions in seconds
  - condition (string): Condition to check before execution
  - priority (string): Execution priority - "high", "medium", "low"

- **Dynamic Parameters (discovered from flow content):**
  - The system automatically discovers what parameters each flow can accept
  - For visual flows: position, color, scale, rotation parameters
  - For business flows: text, values, enums, conditions
  - Parameters are validated against the flow's actual capabilities

## Usage Guidelines:

1. **Flow Execution Priority**: When a user mentions a flow name (especially with @ symbol), ALWAYS use executeFlow instead of creating new drawings
2. **@ Symbol Detection**: If the user message contains "@" followed by a flow name, use executeFlow with that flowName
3. **Flow Name Matching**: Match the flow name exactly as it appears in the user's message
4. **Parameter Extraction**: Extract any parameters mentioned (count, color, position, etc.) and pass them to executeFlow
5. **Be Creative**: Use the tools to create interesting diagrams, flowcharts, or visual representations
6. **Coordinate System**: The canvas uses a coordinate system where (0,0) is at the top-left
7. **Color Options**: Use descriptive colors like "red", "blue", "green", "yellow", "purple", "orange", "pink", "brown", "gray", "black", "white"
8. **Positioning**: Think about where elements should be placed relative to each other
9. **Sizing**: Consider appropriate sizes for different elements (small for details, large for main elements)
10. **Styling**: Use different stroke widths, colors, and fill styles to create visual hierarchy
11. **Multiple Tools**: You can use multiple tools in a single response to create complex diagrams
12. **Element Management**: Use move, delete, and edit tools to modify existing elements
13. **Connections**: Use addArrow to create relationships between elements
14. **Element ID Tracking**: The system automatically tracks element IDs. When users ask to modify something you created, you can reference the element by its ID from the conversation history.

## Response Format:
When a user asks you to draw something, respond with:
1. A brief description of what you're going to create
2. Use the appropriate tool(s) with specific parameters (you can use multiple tools)
3. Provide a friendly message explaining what was created

## Flow Execution Rules:
1. **ALWAYS check for @ symbol first** - if present, extract the flow name and use executeFlow
2. **Flow name extraction**: Take the text after @ symbol as the flowName (e.g., "@star" → flowName: "star")
3. **Parameter parsing**: Look for numbers (count), colors, directions, etc. in the user message
4. **Exact matching**: Use the flow name exactly as provided by the user
5. **Fallback**: Only use regular drawing tools if no @ symbol is present

## Examples:

### Flow Execution (PRIORITY - Use these when @ symbol is present):
- "@star" → Use executeFlow with flowName: "star"
- "@draw a duck" → Use executeFlow with flowName: "draw a duck"
- "@star 5 times" → Use executeFlow with flowName: "star", count: 5
- "@star in blue" → Use executeFlow with flowName: "star", color: "blue"
- "@star 3 times facing left" → Use executeFlow with flowName: "star", count: 3, rotation: -90
- "draw a @star" → Use executeFlow with flowName: "star"
- "create @star" → Use executeFlow with flowName: "star"

### Regular Drawing Commands:
- "Draw a red square in the center" → Use drawSquare with x: 200, y: 200, size: 100, strokeColor: "red"
- "Create a flowchart with boxes and arrows" → Use multiple addFrame calls with addArrow connections
- "Add some text labels" → Use addText to add descriptive labels
- "Create a simple house" → Use drawSquare for walls, drawCircle for windows, addText for labels
- "Move the square to the right" → Use move with elementId from the square you created earlier
- "Delete the circle" → Use deleteElement with the circle's elementId from conversation history
- "Make the text bigger and red" → Use editStroke with the text element's ID to change fontSize and strokeColor
- "Connect the square to the circle with an arrow" → Use addArrow with the element IDs from the square and circle you created

Remember to be helpful, creative, and precise with your tool usage! The system automatically tracks element IDs, so you can always reference and modify elements you've created.`;

// API endpoint to process user requests
app.post("/api/process-request", async (req, res) => {
  try {
    const { userMessage, conversationHistory } = req.body;

    // Build the full prompt with conversation context
    const conversationContext =
      conversationHistory
        ?.map(
          (msg: any) =>
            `${msg.role}: ${msg.content}${
              msg.toolUsed ? ` (Used tool: ${msg.toolUsed.name})` : ""
            }`,
        )
        .join("\n") || "";

    const fullPrompt = `${instructionPrompt}

## Conversation History:
${conversationContext}

## Current Request:
User: ${userMessage}

Please respond by using the appropriate tool(s) and providing a helpful message.`;

    // @ts-ignore
    const result = await generateObject({
      model: languageModel,
      schema: toolSchema,
      prompt: fullPrompt,
    });

    res.json({
      success: true,
      message: result.object.message,
      tools: result.object.tools,
    });
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({
      success: false,
      message: "Sorry, I encountered an error processing your request.",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

app.listen(port, () => {
  console.log(`MCP Proxy server running on port ${port}`);
});
