# Flow Recorder Feature

## Overview

The Flow Recorder is a new feature that allows users to record multi-step actions from natural language commands and create reusable flows. This brings us one step closer to a true natural language automation interface.

## Features

### 🎯 Core Functionality

- **Record Multi-Step Actions**: Capture a sequence of natural language commands and their corresponding MCP tool executions
- **Reusable Flows**: Save and replay recorded flows for repeatable testing or setup
- **Clear Traceability**: Each action and its order is displayed in the saved flow
- **Team Sharing**: Publish flows across your team for collaboration

### 🔧 How It Works

1. **Start Recording**: Click the "🔴 Record Flow" button in the chat interface
2. **Execute Commands**: Use natural language to trigger MCP tools (e.g., "draw 2 red circles", "connect circles with arrow")
3. **Automatic Capture**: Each command and its executed tools are automatically captured in order
4. **Stop Recording**: Click "⏹️ Stop Recording" to finalize the flow
5. **Save & Name**: Provide a name and optional description for your flow
6. **Execute Later**: Run saved flows anytime from the "📋 Saved Flows" menu

### 📋 Example Flow: Checkout Process

```
Hit record →
"Login as test user" →
"Go to produce tab" →
"Add banana to cart" →
"Add credit card" →
"Click checkout" →
Hit stop → Save as "Checkout Flow"
```

## Technical Implementation

### Architecture

- **FlowTypes.ts**: Defines TypeScript interfaces for Flow and FlowStep
- **FlowManager.ts**: Handles flow storage, retrieval, and execution
- **FlowRecorder.tsx**: React component for the recording UI
- **MCPChat.tsx**: Updated to integrate flow recording functionality

### Data Structure

```typescript
interface FlowStep {
  id: string;
  userMessage: string;
  assistantResponse: string;
  toolsUsed: Array<{
    tool: string;
    payload: any;
    elementId?: string;
  }>;
  timestamp: Date;
}

interface Flow {
  id: string;
  name: string;
  description?: string;
  steps: FlowStep[];
  createdAt: Date;
  updatedAt: Date;
  isPublished?: boolean;
  workspaceId?: string;
}
```

### Storage

- Flows are stored in localStorage using the key `tess-excalidraw-flows`
- Automatic serialization/deserialization of Date objects
- Persistent across browser sessions

### Supported MCP Tools

The Flow Recorder works with all existing MCP tools:

- `drawSquare` - Create squares
- `drawCircle` - Create circles  
- `drawLine` - Create lines
- `addText` - Add text elements
- `addImage` - Add images
- `addFrame` - Create frames
- `move` - Move elements
- `moveTo` - Move elements to specific position
- `deleteElement` - Delete elements
- `editStroke` - Edit stroke properties
- `addArrow` - Create arrows between elements

## UI Components

### Flow Recorder Panel

- **Position**: Fixed top-right corner of the screen
- **Recording Controls**: Start/Stop recording buttons
- **Status Indicator**: Visual feedback during recording
- **Steps Preview**: Real-time display of captured steps
- **Saved Flows**: Access to all saved flows

### Dialogs

- **Save Flow Dialog**: Name and describe your flow
- **Flows List Dialog**: View, execute, and manage saved flows

## Usage Examples

### Creating a Simple Flow

1. Click "🔴 Record Flow"
2. Type: "Draw a red square"
3. Type: "Add text 'Hello World' below the square"
4. Type: "Connect the square and text with an arrow"
5. Click "⏹️ Stop Recording"
6. Name it "Simple Flow" and save

### Creating a Complex Flow

1. Click "🔴 Record Flow"
2. Type: "Create a flowchart frame"
3. Type: "Add three boxes inside the frame"
4. Type: "Label the boxes 'Start', 'Process', 'End'"
5. Type: "Connect the boxes with arrows"
6. Type: "Add a title 'My Flowchart'"
7. Click "⏹️ Stop Recording"
8. Name it "Flowchart Template" and save

## Benefits

### 🧠 Natural Language Only
Flows are built using natural language commands, making them accessible to non-technical users.

### 🔁 Reusable and Shareable
- Save flows for personal use
- Share flows with team members
- Publish flows to workspace for team-wide access

### 🔍 Clear Traceability
- Each step shows the user command and executed tools
- Timestamps for each action
- Visual representation of the flow sequence

### 🚀 Automation Ready
- Execute flows with a single click
- Perfect for repetitive tasks
- Ideal for testing scenarios

## Future Enhancements

- **Flow Templates**: Pre-built flows for common scenarios
- **Flow Versioning**: Track changes to flows over time
- **Flow Analytics**: Usage statistics and performance metrics
- **Flow Import/Export**: Share flows across different instances
- **Conditional Logic**: Add branching and conditional execution
- **Flow Scheduling**: Automatically execute flows at specific times

## Technical Notes

- The Flow Recorder integrates seamlessly with the existing MCP chat system
- Element IDs are automatically tracked and preserved for future reference
- Flows are executed sequentially with a 500ms delay between steps for better UX
- Error handling ensures graceful failure if a step cannot be executed
- The UI is responsive and works on mobile devices

## Troubleshooting

### Common Issues

1. **Flow not recording**: Ensure you're in recording mode (red dot indicator visible)
2. **Tools not executing**: Check that the MCP server is running
3. **Flows not saving**: Check browser localStorage permissions
4. **Elements not found**: Ensure elements exist before trying to modify them

### Debug Information

- Check browser console for detailed error messages
- Verify that all MCP tools are properly registered in `window`
- Ensure the Excalidraw app instance is available via `window.h` 