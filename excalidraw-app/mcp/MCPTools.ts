import { newElement } from "@excalidraw/element";

// @chad here is where you can define new MCP tools

/**
 * Draws a square on the Excalidraw canvas
 * @param x - X coordinate for the top-left corner of the square
 * @param y - Y coordinate for the top-left corner of the square
 * @param size - Size of the square (width and height)
 * @param options - Optional styling options for the square
 */
export function drawSquare(
  x: number = 100,
  y: number = 100,
  size: number = 100,
  options: {
    strokeColor?: string;
    backgroundColor?: string;
    fillStyle?: "hachure" | "solid" | "cross-hatch" | "zigzag";
    strokeWidth?: number;
    strokeStyle?: "solid" | "dashed" | "dotted";
    roughness?: number;
    opacity?: number;
    roundness?: number | null;
  } = {},
) {
  console.log("drawSquare", x, y, size, options);
  // Access the Excalidraw app instance through the global window.h object
  const { h } = window;

  if (!h || !h.scene) {
    console.error(
      "Excalidraw app not available. Make sure the app is initialized.",
    );
    return null;
  }

  // Create a rectangle element (which will be a square when width = height)
  const squareElement = newElement({
    type: "rectangle",
    x,
    y,
    width: size,
    height: size,
    strokeColor: options.strokeColor || "#1e1e1e",
    backgroundColor: options.backgroundColor || "skyblue",
    fillStyle: options.fillStyle || "hachure",
    strokeWidth: options.strokeWidth || 4,
    strokeStyle: options.strokeStyle || "solid",
    roughness: options.roughness || 1,
    opacity: 90,
    // roundness: "rectangle",
  });

  // Add the square to the scene
  h.scene.insertElement(squareElement);

  // Trigger a re-render by updating the scene
  if (h.app && h.app.updateScene) {
    h.app.updateScene({
      elements: h.scene.getElementsIncludingDeleted(),
      appState: h.state,
    });
  }

  return squareElement;
}

/**
 * Draws a circle on the Excalidraw canvas
 * @param x - X coordinate for the center of the circle
 * @param y - Y coordinate for the center of the circle
 * @param radius - Radius of the circle
 * @param options - Optional styling options for the circle
 */
export function drawCircle(
  x: number = 100,
  y: number = 100,
  radius: number = 50,
  options: {
    strokeColor?: string;
    backgroundColor?: string;
    fillStyle?: "hachure" | "solid" | "cross-hatch" | "zigzag";
    strokeWidth?: number;
    strokeStyle?: "solid" | "dashed" | "dotted";
    roughness?: number;
    opacity?: number;
  } = {},
) {
  console.log("drawCircle", x, y, radius, options);
  const { h } = window;

  if (!h || !h.scene) {
    console.error(
      "Excalidraw app not available. Make sure the app is initialized.",
    );
    return null;
  }

  // Create an ellipse element (which will be a circle when width = height)
  const circleElement = newElement({
    type: "ellipse",
    x: x - radius, // Adjust x to center the circle
    y: y - radius, // Adjust y to center the circle
    width: radius * 2,
    height: radius * 2,
    strokeColor: options.strokeColor || "#1e1e1e",
    backgroundColor: options.backgroundColor || "lightblue",
    fillStyle: options.fillStyle || "hachure",
    strokeWidth: options.strokeWidth || 4,
    strokeStyle: options.strokeStyle || "solid",
    roughness: options.roughness || 1,
    opacity: options.opacity || 90,
  });

  h.scene.insertElement(circleElement);

  if (h.app && h.app.updateScene) {
    h.app.updateScene({
      elements: h.scene.getElementsIncludingDeleted(),
      appState: h.state,
    });
  }

  return circleElement;
}

/**
 * Draws a rectangle on the Excalidraw canvas
 * @param x - X coordinate for the top-left corner
 * @param y - Y coordinate for the top-left corner
 * @param width - Width of the rectangle
 * @param height - Height of the rectangle
 * @param options - Optional styling options for the rectangle
 */
export function drawRectangle(
  x: number = 100,
  y: number = 100,
  width: number = 150,
  height: number = 100,
  options: {
    strokeColor?: string;
    backgroundColor?: string;
    fillStyle?: "hachure" | "solid" | "cross-hatch" | "zigzag";
    strokeWidth?: number;
    strokeStyle?: "solid" | "dashed" | "dotted";
    roughness?: number;
    opacity?: number;
    roundness?: number | null;
  } = {},
) {
  console.log("drawRectangle", x, y, width, height, options);
  const { h } = window;

  if (!h || !h.scene) {
    console.error(
      "Excalidraw app not available. Make sure the app is initialized.",
    );
    return null;
  }

  const rectangleElement = newElement({
    type: "rectangle",
    x,
    y,
    width,
    height,
    strokeColor: options.strokeColor || "#1e1e1e",
    backgroundColor: options.backgroundColor || "lightgreen",
    fillStyle: options.fillStyle || "hachure",
    strokeWidth: options.strokeWidth || 4,
    strokeStyle: options.strokeStyle || "solid",
    roughness: options.roughness || 1,
    opacity: options.opacity || 90,
  });

  h.scene.insertElement(rectangleElement);

  if (h.app && h.app.updateScene) {
    h.app.updateScene({
      elements: h.scene.getElementsIncludingDeleted(),
      appState: h.state,
    });
  }

  return rectangleElement;
}

// @ts-ignore
window["drawSquare"] = drawSquare;
// @ts-ignore
window["drawCircle"] = drawCircle;
// @ts-ignore
window["drawRectangle"] = drawRectangle;
