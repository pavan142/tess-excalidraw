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
