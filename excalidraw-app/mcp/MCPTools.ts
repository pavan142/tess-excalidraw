import {
  newElement,
  newLinearElement,
  newTextElement,
  newImageElement,
  newFrameElement,
  newArrowElement,
} from "@excalidraw/element";
import { pointFrom } from "@excalidraw/math";

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
  // Access the Excalidraw app instance through the global window.h object
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
    width: radius * 2, // Diameter
    height: radius * 2, // Diameter
    strokeColor: options.strokeColor || "#1e1e1e",
    backgroundColor: options.backgroundColor || "lightgreen",
    fillStyle: options.fillStyle || "hachure",
    strokeWidth: options.strokeWidth || 4,
    strokeStyle: options.strokeStyle || "solid",
    roughness: options.roughness || 1,
    opacity: 90,
  });

  // Add the circle to the scene
  h.scene.insertElement(circleElement);

  // Trigger a re-render by updating the scene
  if (h.app && h.app.updateScene) {
    h.app.updateScene({
      elements: h.scene.getElementsIncludingDeleted(),
      appState: h.state,
    });
  }

  return circleElement;
}

/**
 * Draws a line on the Excalidraw canvas
 * @param startX - X coordinate for the start point of the line
 * @param startY - Y coordinate for the start point of the line
 * @param endX - X coordinate for the end point of the line
 * @param endY - Y coordinate for the end point of the line
 * @param options - Optional styling options for the line
 */
export function drawLine(
  startX: number = 100,
  startY: number = 100,
  endX: number = 200,
  endY: number = 200,
  options: {
    strokeColor?: string;
    strokeWidth?: number;
    strokeStyle?: "solid" | "dashed" | "dotted";
    roughness?: number;
    opacity?: number;
  } = {},
) {
  console.log("drawLine", startX, startY, endX, endY, options);
  // Access the Excalidraw app instance through the global window.h object
  const { h } = window;

  if (!h || !h.scene) {
    console.error(
      "Excalidraw app not available. Make sure the app is initialized.",
    );
    return null;
  }

  // Create a line element using newLinearElement
  const lineElement = newLinearElement({
    type: "line",
    x: startX,
    y: startY,
    points: [
      pointFrom(0, 0), // Start point (relative to x, y)
      pointFrom(endX - startX, endY - startY), // End point (relative to x, y)
    ],
    strokeColor: options.strokeColor || "#1e1e1e",
    strokeWidth: options.strokeWidth || 4,
    strokeStyle: options.strokeStyle || "solid",
    roughness: options.roughness || 1,
    opacity: options.opacity || 90,
  });

  // Add the line to the scene
  h.scene.insertElement(lineElement);

  // Trigger a re-render by updating the scene
  if (h.app && h.app.updateScene) {
    h.app.updateScene({
      elements: h.scene.getElementsIncludingDeleted(),
      appState: h.state,
    });
  }

  return lineElement;
}

/**
 * Adds text to the Excalidraw canvas
 * @param x - X coordinate for the text position
 * @param y - Y coordinate for the text position
 * @param text - The text content to display
 * @param options - Optional styling options for the text
 */
export function addText(
  x: number = 100,
  y: number = 100,
  text: string = "Hello World",
  options: {
    fontSize?: number;
    fontFamily?: number;
    textAlign?: "left" | "center" | "right";
    verticalAlign?: "top" | "middle" | "bottom";
    strokeColor?: string;
    backgroundColor?: string;
    fillStyle?: "hachure" | "solid" | "cross-hatch" | "zigzag";
    strokeWidth?: number;
    strokeStyle?: "solid" | "dashed" | "dotted";
    roughness?: number;
    opacity?: number;
    angle?: number;
  } = {},
) {
  console.log("addText", x, y, text, options);
  // Access the Excalidraw app instance through the global window.h object
  const { h } = window;

  if (!h || !h.scene) {
    console.error(
      "Excalidraw app not available. Make sure the app is initialized.",
    );
    return null;
  }

  // Create a text element using newTextElement
  const textElement = newTextElement({
    x,
    y,
    text: text,
    fontSize: options.fontSize || 20,
    fontFamily: options.fontFamily || 1,
    textAlign: options.textAlign || "left",
    verticalAlign: options.verticalAlign || "top",
    strokeColor: options.strokeColor || "#1e1e1e",
    backgroundColor: options.backgroundColor || "transparent",
    fillStyle: options.fillStyle || "hachure",
    strokeWidth: options.strokeWidth || 1,
    strokeStyle: options.strokeStyle || "solid",
    roughness: options.roughness || 1,
    opacity: options.opacity || 100,
    angle: (options.angle || 0) as any, // Cast to avoid Radians type issue
  });

  // Add the text to the scene
  h.scene.insertElement(textElement);

  // Trigger a re-render by updating the scene
  if (h.app && h.app.updateScene) {
    h.app.updateScene({
      elements: h.scene.getElementsIncludingDeleted(),
      appState: h.state,
    });
  }

  return textElement;
}

/**
 * Adds an image to the Excalidraw canvas
 * @param x - X coordinate for the image position
 * @param y - Y coordinate for the image position
 * @param imageUrl - URL of the image to display (defaults to a cat image)
 * @param options - Optional styling options for the image
 */
export function addImage(
  x: number = 100,
  y: number = 100,
  imageUrl: string = "https://picsum.photos/seed/picsum/200/300",
  options: {
    width?: number;
    height?: number;
    scale?: [number, number];
    opacity?: number;
    angle?: number;
  } = {},
) {
  console.log("addImage", x, y, imageUrl, options);
  // Access the Excalidraw app instance through the global window.h object
  const { h } = window;

  if (!h || !h.scene) {
    console.error(
      "Excalidraw app not available. Make sure the app is initialized.",
    );
    return null;
  }

  // Create an image element using newImageElement
  const imageElement = newImageElement({
    type: "image",
    x,
    y,
    width: options.width || 200,
    height: options.height || 200,
    scale: options.scale || [1, 1],
    opacity: options.opacity || 100,
    angle: (options.angle || 0) as any, // Cast to avoid Radians type issue
    status: "pending", // Image loading status
    fileId: null, // Will be set when image is loaded
  });

  // Add the image to the scene
  h.scene.insertElement(imageElement);

  // Load the image and convert to blob for Excalidraw
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.onload = () => {
    // Create a canvas to convert the image to a blob
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    ctx?.drawImage(img, 0, 0);

    canvas.toBlob((blob) => {
      if (blob) {
        // Convert blob to base64 data URL
        const reader = new FileReader();
        reader.onload = () => {
          const dataURL = reader.result as string;

          // Create a file object for Excalidraw
          const file = new File([blob], "image.jpg", { type: "image/jpeg" });

          // Update the image element with the loaded data
          h.scene.mutateElement(imageElement, {
            status: "saved",
            fileId: imageElement.id as any, // Use element ID as file ID
          });

          // Store the image data in the app's file storage if available
          if (h.app && h.app.files) {
            h.app.files[imageElement.id] = {
              mimeType: "image/jpeg",
              id: imageElement.id as any,
              dataURL: dataURL as any,
              created: Date.now(),
              lastRetrieved: Date.now(),
            };
          }

          // Trigger a re-render
          if (h.app && h.app.updateScene) {
            h.app.updateScene({
              elements: h.scene.getElementsIncludingDeleted(),
              appState: h.state,
            });
          }
        };
        reader.readAsDataURL(blob);
      }
    }, "image/jpeg");
  };

  img.onerror = () => {
    console.error("Failed to load image:", imageUrl);
    // Update element status to error
    h.scene.mutateElement(imageElement, {
      status: "error",
    });
  };

  img.src = imageUrl;

  // Trigger a re-render by updating the scene
  if (h.app && h.app.updateScene) {
    h.app.updateScene({
      elements: h.scene.getElementsIncludingDeleted(),
      appState: h.state,
    });
  }

  return imageElement;
}

/**
 * Adds a frame to the Excalidraw canvas
 * @param x - X coordinate for the frame position
 * @param y - Y coordinate for the frame position
 * @param width - Width of the frame
 * @param height - Height of the frame
 * @param name - Name/label for the frame
 * @param options - Optional styling options for the frame
 */
export function addFrame(
  x: number = 100,
  y: number = 100,
  width: number = 400,
  height: number = 300,
  name: string = "Frame",
  options: {
    strokeColor?: string;
    backgroundColor?: string;
    fillStyle?: "hachure" | "solid" | "cross-hatch" | "zigzag";
    strokeWidth?: number;
    strokeStyle?: "solid" | "dashed" | "dotted";
    roughness?: number;
    opacity?: number;
    angle?: number;
  } = {},
) {
  console.log("addFrame", x, y, width, height, name, options);
  // Access the Excalidraw app instance through the global window.h object
  const { h } = window;

  if (!h || !h.scene) {
    console.error(
      "Excalidraw app not available. Make sure the app is initialized.",
    );
    return null;
  }

  // Create a frame element using newFrameElement
  const frameElement = newFrameElement({
    x,
    y,
    width,
    height,
    name: name,
    strokeColor: options.strokeColor || "#1e1e1e",
    backgroundColor: options.backgroundColor || "transparent",
    fillStyle: options.fillStyle || "hachure",
    strokeWidth: options.strokeWidth || 2,
    strokeStyle: options.strokeStyle || "solid",
    roughness: options.roughness || 1,
    opacity: options.opacity || 100,
    angle: (options.angle || 0) as any, // Cast to avoid Radians type issue
  });

  // Add the frame to the scene
  h.scene.insertElement(frameElement);

  // Trigger a re-render by updating the scene
  if (h.app && h.app.updateScene) {
    h.app.updateScene({
      elements: h.scene.getElementsIncludingDeleted(),
      appState: h.state,
    });
  }

  return frameElement;
}

/**
 * Moves an element to new coordinates by its ID
 * @param elementId - The ID of the element to move
 * @param newX - New X coordinate for the element
 * @param newY - New Y coordinate for the element
 * @returns The updated element or null if not found
 */
export function move(elementId: string, newX: number, newY: number) {
  console.log("move", elementId, newX, newY);
  // Access the Excalidraw app instance through the global window.h object
  const { h } = window;

  if (!h || !h.scene) {
    console.error(
      "Excalidraw app not available. Make sure the app is initialized.",
    );
    return null;
  }

  // Get all elements from the scene
  const elements = h.scene.getElementsIncludingDeleted();

  // Find the element by ID
  const element = elements.find((el) => el.id === elementId);

  if (!element) {
    console.error(`Element with ID "${elementId}" not found.`);
    return null;
  }

  // Use the proper mutateElement method to update the element's position
  h.scene.mutateElement(element, {
    x: newX,
    y: newY,
  });

  // Trigger a re-render by updating the scene
  if (h.app && h.app.updateScene) {
    h.app.updateScene({
      elements: h.scene.getElementsIncludingDeleted(),
      appState: h.state,
    });
  }

  console.log(`Moved element ${elementId} to (${newX}, ${newY})`);
  return element;
}

/**
 * Moves an element to a specific position by its ID
 * @param elementId - The ID of the element to move
 * @param targetX - Target X coordinate for the element
 * @param targetY - Target Y coordinate for the element
 * @returns The updated element or null if not found
 */
export function moveTo(elementId: string, targetX: number, targetY: number) {
  console.log("moveTo", elementId, targetX, targetY);
  // Access the Excalidraw app instance through the global window.h object
  const { h } = window;

  if (!h || !h.scene) {
    console.error(
      "Excalidraw app not available. Make sure the app is initialized.",
    );
    return null;
  }

  // Get all elements from the scene
  const elements = h.scene.getElementsIncludingDeleted();

  // Find the element by ID
  const element = elements.find((el) => el.id === elementId);

  if (!element) {
    console.error(`Element with ID "${elementId}" not found.`);
    return null;
  }

  // Use the proper mutateElement method to update the element's position
  h.scene.mutateElement(element, {
    x: targetX,
    y: targetY,
  });

  // Trigger a re-render by updating the scene
  if (h.app && h.app.updateScene) {
    h.app.updateScene({
      elements: h.scene.getElementsIncludingDeleted(),
      appState: h.state,
    });
  }

  console.log(
    `Moved element ${elementId} to position (${targetX}, ${targetY})`,
  );
  return {
    id: elementId,
  };
}

/**
 * Deletes an element from the Excalidraw canvas by its ID
 * @param elementId - The ID of the element to delete
 * @returns The deleted element or null if not found
 */
export function deleteElement(elementId: string) {
  console.log("deleteElement", elementId);
  // Access the Excalidraw app instance through the global window.h object
  const { h } = window;

  if (!h || !h.scene) {
    console.error(
      "Excalidraw app not available. Make sure the app is initialized.",
    );
    return null;
  }

  // Get all elements from the scene
  const elements = h.scene.getElementsIncludingDeleted();

  // Find the element by ID
  const element = elements.find((el) => el.id === elementId);

  if (!element) {
    console.error(`Element with ID "${elementId}" not found.`);
    return null;
  }

  // Mark the element as deleted
  h.scene.mutateElement(element, {
    isDeleted: true,
  });

  // Trigger a re-render by updating the scene
  if (h.app && h.app.updateScene) {
    h.app.updateScene({
      elements: h.scene.getElementsIncludingDeleted(),
      appState: h.state,
    });
  }

  console.log(`Deleted element ${elementId}`);
  return element;
}

/**
 * Edits the stroke properties of an element by its ID
 * @param elementId - The ID of the element to edit
 * @param strokeColor - New stroke color
 * @param strokeWidth - New stroke width
 * @param strokeStyle - New stroke style
 * @returns The updated element or null if not found
 */
export function editStroke(
  elementId: string,
  strokeColor?: string,
  strokeWidth?: number,
  strokeStyle?: "solid" | "dashed" | "dotted",
) {
  console.log("editStroke", elementId, {
    strokeColor,
    strokeWidth,
    strokeStyle,
  });
  // Access the Excalidraw app instance through the global window.h object
  const { h } = window;

  if (!h || !h.scene) {
    console.error(
      "Excalidraw app not available. Make sure the app is initialized.",
    );
    return null;
  }

  // Get all elements from the scene
  const elements = h.scene.getElementsIncludingDeleted();

  // Find the element by ID
  const element = elements.find((el) => el.id === elementId);

  if (!element) {
    console.error(`Element with ID "${elementId}" not found.`);
    return null;
  }

  // Prepare updates object with only provided values
  const updates: any = {};
  if (strokeColor !== undefined) updates.strokeColor = strokeColor;
  if (strokeWidth !== undefined) updates.strokeWidth = strokeWidth;
  if (strokeStyle !== undefined) updates.strokeStyle = strokeStyle;

  console.log("Updating element with:", updates);
  console.log("Element before update:", {
    strokeColor: element.strokeColor,
    strokeWidth: element.strokeWidth,
    strokeStyle: element.strokeStyle,
  });

  // Try updating the element's stroke properties
  h.scene.mutateElement(element, updates);

  // Force a scene update to ensure the changes are rendered
  h.scene.triggerUpdate();

  console.log("Element after update:", {
    strokeColor: element.strokeColor,
    strokeWidth: element.strokeWidth,
    strokeStyle: element.strokeStyle,
  });

  // If the above doesn't work, try replacing the element entirely
  setTimeout(() => {
    // Check if the stroke color is still not visible
    const updatedElement = h.scene.getElement(elementId);
    if (
      updatedElement &&
      updatedElement.strokeColor === strokeColor &&
      strokeColor !== undefined
    ) {
      console.log(
        "Stroke color updated but not visible, trying alternative approach...",
      );

      // Create a new element with the same properties but updated stroke
      const newElement = {
        ...updatedElement,
        strokeColor: strokeColor,
        strokeWidth: strokeWidth || updatedElement.strokeWidth,
        strokeStyle: strokeStyle || updatedElement.strokeStyle,
        version: updatedElement.version + 1,
        versionNonce: Math.floor(Math.random() * 1000000),
        updated: Date.now(),
      };

      // Replace the element in the scene
      const allElements = h.scene.getElementsIncludingDeleted();
      const filteredElements = allElements.filter((el) => el.id !== elementId);
      const newElements = [...filteredElements, newElement as any];

      h.scene.replaceAllElements(newElements);

      if (h.app && h.app.updateScene) {
        h.app.updateScene({
          elements: h.scene.getElementsIncludingDeleted(),
          appState: h.state,
        });
      }
    }
  }, 100);

  console.log(`Updated stroke properties for element ${elementId}`);
  return element;
}

/**
 * Adds an arrow connecting two elements on the canvas
 * @param fromElementId - The ID of the source element
 * @param toElementId - The ID of the target element
 * @param options - Optional styling options for the arrow
 * @returns The created arrow element or null if elements not found
 */
export function addArrow(
  fromElementId: string,
  toElementId: string,
  options: {
    strokeColor?: string;
    strokeWidth?: number;
    strokeStyle?: "solid" | "dashed" | "dotted";
    startArrowhead?: "arrow" | "bar" | "dot" | "triangle" | null;
    endArrowhead?: "arrow" | "bar" | "dot" | "triangle" | null;
    roughness?: number;
    opacity?: number;
  } = {},
) {
  console.log("addArrow", fromElementId, toElementId, options);
  // Access the Excalidraw app instance through the global window.h object
  const { h } = window;

  if (!h || !h.scene) {
    console.error(
      "Excalidraw app not available. Make sure the app is initialized.",
    );
    return null;
  }

  // Get all elements from the scene
  const elements = h.scene.getElementsIncludingDeleted();

  // Find the source and target elements
  const fromElement = elements.find((el) => el.id === fromElementId);
  const toElement = elements.find((el) => el.id === toElementId);

  if (!fromElement) {
    console.error(`Source element with ID "${fromElementId}" not found.`);
    return null;
  }

  if (!toElement) {
    console.error(`Target element with ID "${toElementId}" not found.`);
    return null;
  }

  // Calculate the center points of both elements
  const fromCenterX = fromElement.x + fromElement.width / 2;
  const fromCenterY = fromElement.y + fromElement.height / 2;
  const toCenterX = toElement.x + toElement.width / 2;
  const toCenterY = toElement.y + toElement.height / 2;

  // Calculate the direction vector from source to target
  const deltaX = toCenterX - fromCenterX;
  const deltaY = toCenterY - fromCenterY;
  const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

  // Calculate edge points (where arrow should start and end)
  const fromRadius = Math.min(fromElement.width, fromElement.height) / 2;
  const toRadius = Math.min(toElement.width, toElement.height) / 2;

  // Normalize the direction vector
  const normalizedDeltaX = deltaX / distance;
  const normalizedDeltaY = deltaY / distance;

  // Calculate edge points
  const fromEdgeX = fromCenterX + normalizedDeltaX * fromRadius;
  const fromEdgeY = fromCenterY + normalizedDeltaY * fromRadius;
  const toEdgeX = toCenterX - normalizedDeltaX * toRadius;
  const toEdgeY = toCenterY - normalizedDeltaY * toRadius;

  // Create an arrow element
  const arrowElement = newArrowElement({
    type: "arrow",
    x: fromEdgeX,
    y: fromEdgeY,
    points: [
      pointFrom(0, 0), // Start point (relative to x, y)
      pointFrom(toEdgeX - fromEdgeX, toEdgeY - fromEdgeY), // End point (relative to x, y)
    ],
    strokeColor: options.strokeColor || "#1e1e1e",
    strokeWidth: options.strokeWidth || 4,
    strokeStyle: options.strokeStyle || "solid",
    startArrowhead: options.startArrowhead || null,
    endArrowhead: options.endArrowhead || "arrow",
    roughness: options.roughness || 1,
    opacity: options.opacity || 90,
  });

  // Add the arrow to the scene
  h.scene.insertElement(arrowElement);

  // Calculate binding focus points based on the direction
  // Excalidraw uses a 0-1 range where 0 is right, 0.25 is down, 0.5 is left, 0.75 is up
  let fromFocus = 0;
  let toFocus = 0;

  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    // Horizontal connection
    if (deltaX > 0) {
      fromFocus = 0; // Right edge of source
      toFocus = 0.5; // Left edge of target
    } else {
      fromFocus = 0.5; // Left edge of source
      toFocus = 0; // Right edge of target
    }
  } else {
    // Vertical connection
    if (deltaY > 0) {
      fromFocus = 0.25; // Bottom edge of source
      toFocus = 0.75; // Top edge of target
    } else {
      fromFocus = 0.75; // Top edge of source
      toFocus = 0.25; // Bottom edge of target
    }
  }

  // Create bindings to connect the arrow to both elements
  const startBinding = {
    elementId: fromElementId,
    focus: fromFocus, // Edge point in the direction of the target
    gap: 0,
  };

  const endBinding = {
    elementId: toElementId,
    focus: toFocus, // Edge point in the direction of the source
    gap: 0,
  };

  // Update the arrow with bindings
  h.scene.mutateElement(arrowElement, {
    startBinding: startBinding,
    endBinding: endBinding,
  });

  // Update the source element to include the arrow in its bound elements
  const fromBoundElements = fromElement.boundElements
    ? [...fromElement.boundElements]
    : [];
  fromBoundElements.push({
    id: arrowElement.id,
    type: "arrow",
  });

  // Update the target element to include the arrow in its bound elements
  const toBoundElements = toElement.boundElements
    ? [...toElement.boundElements]
    : [];
  toBoundElements.push({
    id: arrowElement.id,
    type: "arrow",
  });

  // Update both elements to reflect the binding changes
  h.scene.mutateElement(fromElement, {
    boundElements: fromBoundElements,
  });

  h.scene.mutateElement(toElement, {
    boundElements: toBoundElements,
  });

  // Trigger a re-render by updating the scene
  if (h.app && h.app.updateScene) {
    h.app.updateScene({
      elements: h.scene.getElementsIncludingDeleted(),
      appState: h.state,
    });
  }

  return arrowElement;
}

// @ts-ignore
window["drawSquare"] = drawSquare;
// @ts-ignore
window["drawCircle"] = drawCircle;
// @ts-ignore
window["drawLine"] = drawLine;
// @ts-ignore
window["addText"] = addText;
// @ts-ignore
window["addImage"] = addImage;
// @ts-ignore
window["addFrame"] = addFrame;
// @ts-ignore
window["move"] = move;
// @ts-ignore
window["moveTo"] = moveTo;
// @ts-ignore
window["deleteElement"] = deleteElement;
// @ts-ignore
window["editStroke"] = editStroke;
// @ts-ignore
window["addArrow"] = addArrow;
