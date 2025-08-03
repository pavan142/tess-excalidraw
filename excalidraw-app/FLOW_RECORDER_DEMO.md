# Flow Recorder Demo Guide

## 🎯 How to Test the Flow Recorder Feature

### Prerequisites
1. Make sure the Excalidraw app is running (`npm run dev`)
2. Make sure the MCP server is running (`cd server && npm start`)
3. Open the Excalidraw app in your browser

### Step 1: Open the Chat Interface
1. Look for the 🤖 button in the bottom-right corner of the Excalidraw interface
2. Click it to open the AI Drawing Assistant chat

### Step 2: Start Recording a Flow
1. In the chat interface header, you'll see a "🔴 Record" button next to the clear and close buttons
2. Click "🔴 Record" to start recording
3. You should see a yellow recording status bar with a red pulsing dot and "Recording... (0 steps)" indicator

### Step 3: Record Some Actions
Try these natural language commands in sequence:

1. **"Draw a red square"**
   - Should create a red square on the canvas
   - Step 1 will appear in the recording panel

2. **"Add text 'Hello World' below the square"**
   - Should add text below the square
   - Step 2 will appear in the recording panel

3. **"Create a blue circle next to the square"**
   - Should create a blue circle
   - Step 3 will appear in the recording panel

4. **"Connect the square and circle with an arrow"**
   - Should create an arrow between the elements
   - Step 4 will appear in the recording panel

### Step 4: Stop Recording and Save
1. Click "⏹️ Stop" when you're done
2. A "Save Flow" dialog will appear
3. Enter a name like "Simple Flow Demo"
4. Add an optional description like "Creates a square, text, circle, and connects them"
5. Click "Save Flow"

### Step 5: View and Execute Saved Flows
1. Click "📋 Flows (1)" in the chat header to see your saved flows
2. You should see your flow listed with:
   - Name and description
   - Number of steps and creation date
   - **Preview of first 3 steps** showing the tools used (e.g., "Square, Text, Circle")
   - **"👁️ View Details"** button to see all steps
   - Run and Delete buttons

### Step 6: Explore Flow Details
1. Click "👁️ View Details" to expand the flow
2. You'll see:
   - **All steps** with the original user messages
   - **Detailed tool information** including parameters (e.g., "Square (x: 100, y: 100, size: 100)")
   - **Tool names** in green with parameters in monospace font
3. Click "👁️ Hide Details" to collapse the view

3. **Test the Flow Execution:**
   - Clear the canvas (or open a new tab)
   - Click "▶️ Run" on your saved flow
   - Watch as all the steps execute automatically!

### Step 6: Create More Complex Flows
Try creating these more complex flows:

#### Flowchart Flow
1. Start recording
2. "Create a flowchart frame"
3. "Add three boxes inside the frame"
4. "Label the boxes 'Start', 'Process', 'End'"
5. "Connect the boxes with arrows"
6. "Add a title 'My Flowchart'"
7. Stop and save as "Flowchart Template"

#### House Drawing Flow
1. Start recording
2. "Draw a large rectangle for the house"
3. "Add a triangle on top for the roof"
4. "Draw two small squares for windows"
5. "Add a rectangle for the door"
6. "Add text 'My House' above the door"
7. Stop and save as "House Drawing"

### Step 7: Test Flow Management
1. **Delete a Flow:**
   - Click the 🗑️ button next to any flow
   - Confirm deletion

2. **Execute Multiple Flows:**
   - Create several different flows
   - Test running them in different orders
   - Notice how each flow executes independently

## 🎨 Expected Behavior

### Recording Mode
- ✅ Red pulsing dot indicator
- ✅ Real-time step counter
- ✅ Live preview of recorded steps
- ✅ Each step shows user message and tools used

### Flow Execution
- ✅ Steps execute sequentially
- ✅ 500ms delay between steps for smooth UX
- ✅ All MCP tools work correctly
- ✅ Element IDs are preserved for connections

### Flow Management
- ✅ Flows persist across browser sessions
- ✅ Clear visual feedback for all actions
- ✅ Responsive design works on mobile
- ✅ Error handling for failed executions

## 🐛 Troubleshooting

### If Recording Doesn't Start
- Check that the MCP server is running
- Look for any console errors
- Try refreshing the page

### If Tools Don't Execute
- Verify the Excalidraw app is properly initialized
- Check that `window.h` is available
- Look for MCP tool registration errors

### If Flows Don't Save
- Check browser localStorage permissions
- Look for storage quota exceeded errors
- Try clearing browser data and retrying

### If Flow Execution Fails
- Check that all required elements exist
- Verify element IDs are correct
- Look for timing issues with element creation

## 🚀 Advanced Testing

### Test Element References
1. Create a flow that creates elements
2. Add steps that reference those elements (move, edit, connect)
3. Verify that element IDs are properly tracked

### Test Complex Interactions
1. Create flows with multiple element types
2. Test flows that modify existing elements
3. Verify that bindings and connections work

### Test Error Handling
1. Try to execute a flow with missing elements
2. Test with invalid element IDs
3. Verify graceful error messages

## 📊 Success Criteria

The Flow Recorder is working correctly if:

✅ **Recording Works:**
- Can start/stop recording
- Captures all user commands and tool executions
- Shows real-time step preview

✅ **Saving Works:**
- Can save flows with names and descriptions
- Flows persist across sessions
- Can view saved flows list

✅ **Execution Works:**
- Can execute saved flows
- All tools work correctly during execution
- Proper timing and sequencing

✅ **UI Works:**
- All buttons and dialogs function
- Responsive design works
- Clear visual feedback

✅ **Integration Works:**
- Seamlessly integrates with existing chat
- Doesn't break existing functionality
- Maintains conversation history

## 🎉 Congratulations!

If you've successfully completed all the tests above, you have a fully functional Flow Recorder feature! This brings us one step closer to a true natural language automation interface for Tess. 