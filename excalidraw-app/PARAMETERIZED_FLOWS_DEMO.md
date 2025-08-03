# Parameterized Flow Execution Demo

## 🚀 Overview

The Flow Recorder now supports **smart parameterized execution**! You can use natural language to execute saved flows with different parameters, making them truly reusable and flexible.

## 🎯 Key Features

### 1. **Natural Language Flow Execution**
- Execute flows using natural language commands
- AI automatically detects and applies parameters
- No need to remember exact flow names

### 2. **@ Symbol for Explicit Flow Calls**
- Use `@flowName` to explicitly call a specific flow
- Perfect for when you know the exact flow name
- Supports parameters after the flow name

### 3. **Smart Parameter Detection**
- **Count**: Number of instances to create
- **Position**: X/Y offsets for placement
- **Rotation**: Angle adjustments (left/right/up/down)
- **Scale**: Size modifications
- **Color**: Color overrides
- **Spacing**: Distance between multiple instances

## 📋 Prerequisites

1. **Save a Flow First**: You need at least one saved flow to test parameterized execution
2. **Example Flow**: Create a flow called "draw a duck" with multiple drawing operations

## 🧪 Demo Scenarios

### Scenario 1: Basic Flow Execution

**Step 1: Execute a Simple Flow**
```
User: "draw a duck"
AI: Executes the "draw a duck" flow once at default position
```

**Step 2: Execute Multiple Instances**
```
User: "draw 5 ducks"
AI: Executes the "draw a duck" flow 5 times, spaced horizontally
```

### Scenario 2: Position and Direction

**Step 3: Positioned Execution**
```
User: "draw 3 ducks at the top of the screen"
AI: Executes "draw a duck" 3 times with yOffset: -200
```

**Step 4: Directional Execution**
```
User: "draw 4 ducks facing left"
AI: Executes "draw a duck" 4 times with rotation: -90 degrees
```

### Scenario 3: Color and Scale Modifications

**Step 5: Color Variations**
```
User: "draw 2 red ducks"
AI: Executes "draw a duck" 2 times with color: "red"
```

**Step 6: Size Variations**
```
User: "draw 3 small ducks"
AI: Executes "draw a duck" 3 times with scale: 0.7
```

### Scenario 4: Complex Combinations

**Step 7: Multiple Parameters**
```
User: "draw 5 blue ducks facing right that are half size"
AI: Executes "draw a duck" 5 times with:
- color: "blue"
- rotation: 90 degrees
- scale: 0.5
```

### Scenario 5: Explicit @ Syntax

**Step 8: Explicit Flow Calls**
```
User: "@draw a duck 3 times in green"
AI: Explicitly executes "draw a duck" 3 times with color: "green"
```

**Step 9: Complex @ Commands**
```
User: "@draw a duck 4 times facing up with spacing 100"
AI: Executes "draw a duck" 4 times with:
- rotation: -90 degrees
- spacing: 100 pixels
```

## 🎨 Parameter Reference

### **Count Parameters**
- `"5 ducks"` → count: 5
- `"three houses"` → count: 3
- `"a dozen circles"` → count: 12

### **Position Parameters**
- `"at the top"` → yOffset: -200
- `"on the left"` → xOffset: -200
- `"in the center"` → xOffset: 0, yOffset: 0
- `"at position 300, 400"` → xOffset: 300, yOffset: 400

### **Direction Parameters**
- `"facing left"` → rotation: -90
- `"facing right"` → rotation: 90
- `"facing up"` → rotation: -90
- `"facing down"` → rotation: 90

### **Color Parameters**
- `"in red"` → color: "red"
- `"blue version"` → color: "blue"
- `"green colored"` → color: "green"
- `"with yellow fill"` → color: "yellow"

### **Size Parameters**
- `"small"` → scale: 0.7
- `"large"` → scale: 1.5
- `"tiny"` → scale: 0.5
- `"huge"` → scale: 2.0

### **Spacing Parameters**
- `"close together"` → spacing: 100
- `"far apart"` → spacing: 300
- `"with spacing 150"` → spacing: 150

## 🔧 Technical Implementation

### **Flow Parameterization**
The system automatically transforms flow parameters:

1. **Position Transformation**: Adds xOffset/yOffset to all x/y coordinates
2. **Rotation Transformation**: Adds rotation angle to all angle properties
3. **Scale Transformation**: Multiplies size/width/height by scale factor
4. **Color Transformation**: Replaces backgroundColor/strokeColor with new color
5. **Multiple Instances**: Creates multiple copies with calculated spacing

### **Natural Language Processing**
The AI assistant:
1. **Detects Flow References**: Identifies when user wants to execute a saved flow
2. **Extracts Parameters**: Parses natural language for count, position, color, etc.
3. **Maps to Flow Names**: Matches user intent to saved flow names
4. **Applies Transformations**: Converts parameters to technical transformations

### **@ Symbol Processing**
- **Explicit Matching**: Uses exact flow name matching
- **Parameter Parsing**: Extracts parameters after the flow name
- **Direct Execution**: Bypasses natural language interpretation

## 🎯 Expected Results

### **Single Instance**
- Flow executes once at default position
- All original styling preserved
- Elements appear as recorded

### **Multiple Instances**
- Flow executes multiple times
- Each instance positioned with calculated spacing
- All transformations applied consistently

### **Parameterized Instances**
- Original flow structure preserved
- Parameters applied to all elements
- Consistent transformation across all instances

## 🐛 Troubleshooting

### **Flow Not Found**
```
User: "draw a unicorn"
AI: "I couldn't find a flow named 'unicorn'. Available flows: draw a duck, house, car"
```

### **Parameter Conflicts**
- System uses most specific parameter
- Later parameters override earlier ones
- Default values used for missing parameters

### **Execution Errors**
- Check browser console for detailed errors
- Verify flow contains valid drawing operations
- Ensure all required parameters are provided

## 🎉 Advanced Examples

### **Complex Scenarios**

**Row of Houses**
```
User: "create a row of 6 houses with red roofs"
AI: Executes "house" flow 6 times with:
- spacing: 200 (horizontal row)
- color: "red" (for roof elements)
```

**Duck Formation**
```
User: "draw 9 ducks in a 3x3 grid facing different directions"
AI: Executes "draw a duck" 9 times with:
- count: 9
- spacing: 150
- rotation: varies by position
```

**Scaled Objects**
```
User: "draw 4 progressively larger ducks"
AI: Executes "draw a duck" 4 times with:
- scale: 0.8, 1.0, 1.2, 1.4 (progressive scaling)
```

## 🚀 Future Enhancements

### **Planned Features**
- **Pattern Recognition**: "draw ducks in a circle"
- **Conditional Logic**: "draw ducks only if space available"
- **Animation Support**: "draw ducks with fade-in effect"
- **Group Operations**: "select all ducks and move them"

### **Advanced Parameters**
- **Opacity**: "draw transparent ducks"
- **Stroke Width**: "draw ducks with thick outlines"
- **Fill Style**: "draw ducks with cross-hatch pattern"
- **Animation**: "draw ducks with bounce effect"

## 🎯 Success Criteria

✅ **Natural Language Understanding**: AI correctly interprets flow execution requests
✅ **Parameter Extraction**: All relevant parameters are detected and applied
✅ **Multiple Instances**: Flows execute multiple times with proper spacing
✅ **Transformations**: Position, rotation, scale, and color changes work correctly
✅ **@ Symbol Support**: Explicit flow calls work as expected
✅ **Error Handling**: Graceful handling of missing flows or invalid parameters

This parameterized flow execution system transforms simple recorded flows into powerful, reusable building blocks that can be combined and modified through natural language commands! 