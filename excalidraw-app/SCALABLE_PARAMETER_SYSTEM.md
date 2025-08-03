# Scalable Parameter System for Flow Execution

## 🎯 Overview

The Flow Recorder now features a **scalable parameter system** that automatically discovers what parameters each flow can accept based on its content, making it adaptable to any business domain.

## 🔄 From Fixed to Dynamic Parameters

### **Old Approach (Fixed)**
```typescript
// Hard-coded parameters specific to drawing tools
interface FlowParameters {
  xOffset?: number;      // ❌ Only for visual positioning
  yOffset?: number;      // ❌ Only for visual positioning
  rotation?: number;     // ❌ Only for visual elements
  scale?: number;        // ❌ Only for visual sizing
  color?: string;        // ❌ Only for visual styling
  count?: number;        // ✅ Generic (good!)
  spacing?: number;      // ✅ Generic (good!)
}
```

### **New Approach (Scalable)**
```typescript
// Generic parameters that work across all domains
interface GenericFlowParameters {
  count?: number;           // ✅ "run 5 times"
  spacing?: number;         // ✅ "with spacing 100"
  delay?: number;           // ✅ "with 2 second delay"
  condition?: string;       // ✅ "only if user is logged in"
  priority?: 'high' | 'medium' | 'low'; // ✅ "with high priority"
}

// Dynamic parameters discovered from flow content
interface DomainSpecificParameters {
  [key: string]: any;       // Discovered based on actual tools used
}
```

## 🧠 How Parameter Discovery Works

### **1. Flow Analysis**
The system analyzes each step in a flow to understand what tools are used:

```typescript
// Example flow: "draw a duck"
Flow Steps:
1. drawCircle (x: 100, y: 100, size: 50, backgroundColor: "yellow")
2. addText (x: 120, y: 80, text: "Duck", fontSize: 16)
3. drawSquare (x: 80, y: 120, size: 20, backgroundColor: "orange")

Discovered Parameters:
- x, y (position parameters)
- size (scale parameter)
- backgroundColor (color parameter)
- text (content parameter)
- fontSize (size parameter)
```

### **2. Domain Classification**
Parameters are classified by domain:

```typescript
// Visual Domain (drawing tools)
visual: ['x', 'y', 'size', 'strokeColor', 'backgroundColor', 'rotation']

// Business Domain (business tools)
business: ['text', 'email', 'username', 'role', 'salary', 'priority']

// Generic Domain (cross-domain)
generic: ['count', 'spacing', 'delay', 'condition', 'priority']
```

### **3. Dynamic Schema Generation**
Each flow gets its own parameter schema:

```typescript
// "draw a duck" flow schema
{
  flowName: "draw a duck",
  parameters: [
    // Generic parameters (always available)
    { name: 'count', type: 'number', domain: 'generic' },
    { name: 'spacing', type: 'number', domain: 'generic' },
    
    // Visual parameters (discovered from drawing tools)
    { name: 'x', type: 'number', domain: 'visual' },
    { name: 'y', type: 'number', domain: 'visual' },
    { name: 'backgroundColor', type: 'string', domain: 'visual' },
    { name: 'size', type: 'number', domain: 'visual' },
    
    // Business parameters (discovered from text tools)
    { name: 'text', type: 'string', domain: 'business' }
  ],
  examples: [
    '"draw a duck 5 times"',
    '"draw a duck in red"',
    '"draw a duck with different text"',
    '"draw a duck at position 200, 300"'
  ]
}
```

## 🏗️ Technical Architecture

### **ParameterDiscovery Class**
```typescript
class ParameterDiscovery {
  // Analyzes flow content to discover parameters
  static discoverFlowParameters(flow: Flow): FlowParameterSchema
  
  // Applies domain-specific transformations
  static applyParameters(payload: any, parameters: any, toolName: string): any
  
  // Validates parameters against schema
  static validateParameters(parameters: any, schema: FlowParameterSchema): ValidationResult
  
  // Registers new tool schemas (for extensibility)
  static registerToolSchema(toolName: string, parameters: ParameterMetadata[]): void
}
```

### **Tool Schema Registry**
```typescript
const TOOL_PARAMETER_SCHEMAS = {
  // Drawing tools (visual domain)
  drawSquare: [
    { name: 'x', type: 'number', domain: 'visual', required: true },
    { name: 'y', type: 'number', domain: 'visual', required: true },
    { name: 'size', type: 'number', domain: 'visual', required: true },
    { name: 'backgroundColor', type: 'string', domain: 'visual' }
  ],
  
  // Business tools (business domain)
  createUser: [
    { name: 'username', type: 'string', domain: 'business', required: true },
    { name: 'email', type: 'string', domain: 'business', required: true },
    { name: 'role', type: 'enum', domain: 'business', enumValues: ['admin', 'user'] }
  ],
  
  // Generic tools (cross-domain)
  move: [
    { name: 'elementId', type: 'string', domain: 'generic', required: true }
  ]
};
```

### **Domain-Specific Transformations**
```typescript
const DOMAIN_TRANSFORMATIONS = {
  // Visual transformations
  visual: (payload, parameters) => {
    // Apply position, scale, color, rotation transformations
    if (parameters.xOffset) payload.x += parameters.xOffset;
    if (parameters.scale) payload.size *= parameters.scale;
    if (parameters.color) payload.backgroundColor = parameters.color;
    return payload;
  },
  
  // Business transformations
  business: (payload, parameters) => {
    // Apply text substitutions, value modifications, enum changes
    if (parameters.textTemplate) payload.text = parameters.textTemplate;
    if (parameters.roleOverride) payload.role = parameters.roleOverride;
    return payload;
  },
  
  // Generic transformations
  generic: (payload, parameters) => {
    // Add metadata, instance tracking
    if (parameters.instanceIndex) payload.instanceIndex = parameters.instanceIndex;
    return payload;
  }
};
```

## 🎯 Scalability Benefits

### **1. Domain Agnostic**
The system works for any business domain:

```typescript
// Drawing/Design Tools
"draw 5 ducks facing left" → count: 5, rotation: -90

// HR/Recruitment Tools
"create 3 jobs with high priority" → count: 3, priority: "high"

// Marketing Tools
"send 10 emails with 5 second delay" → count: 10, delay: 5

// E-commerce Tools
"create 5 products with different prices" → count: 5, priceOffset: 100

// Healthcare Tools
"schedule 3 appointments for different doctors" → count: 3, doctorRotation: true
```

### **2. Extensible Tool Registry**
New tools can be registered without code changes:

```typescript
// Register a new business tool
ParameterDiscovery.registerToolSchema('createInvoice', [
  { name: 'amount', type: 'number', domain: 'business', required: true },
  { name: 'client', type: 'string', domain: 'business', required: true },
  { name: 'dueDate', type: 'string', domain: 'business' },
  { name: 'priority', type: 'enum', domain: 'business', enumValues: ['urgent', 'normal', 'low'] }
]);

// Now flows using createInvoice automatically get these parameters
"create 5 invoices for urgent clients" → count: 5, priority: "urgent"
```

### **3. Automatic Parameter Discovery**
No manual configuration needed:

```typescript
// Flow: "onboard new employee"
Steps:
1. createUser (username, email, role)
2. sendEmail (to, subject, body)
3. createProfile (userId, department, manager)

// Automatically discovered parameters:
- username, email, role (from createUser)
- to, subject, body (from sendEmail)
- department, manager (from createProfile)
- count, spacing, delay, priority (generic)

// Natural language works automatically:
"onboard 3 employees for engineering department" → 
  count: 3, department: "engineering"
```

### **4. Validation and Error Handling**
Parameters are validated against actual flow capabilities:

```typescript
// User tries: "draw a duck with invalid parameter"
const validation = flowManager.validateFlowParameters(flowId, {
  count: 5,
  invalidParam: "value"  // ❌ Not in schema
});

// Result: { valid: false, errors: ["Unknown parameter: invalidParam"] }
```

## 🚀 Implementation Examples

### **Visual Domain (Drawing Tools)**
```typescript
// Flow: "draw a house"
"draw 4 houses in a row" → 
  count: 4, spacing: 200, xOffset: 0

"draw 2 red houses facing left" → 
  count: 2, backgroundColor: "red", rotation: -90

"draw a large house at the top" → 
  scale: 1.5, yOffset: -200
```

### **Business Domain (HR Tools)**
```typescript
// Flow: "create job posting"
"create 5 job postings for engineering" → 
  count: 5, department: "engineering"

"create 3 high-priority jobs with custom salary" → 
  count: 3, priority: "high", salary: 120000

"create jobs for different roles" → 
  count: 3, roleRotation: true
```

### **Generic Domain (Cross-Domain)**
```typescript
// Any flow can use these parameters:
"run onboarding flow 10 times" → count: 10

"send emails with 30 second delay" → delay: 30

"create users only if space available" → condition: "space_available"

"process orders with high priority" → priority: "high"
```

## 🔧 Adding New Domains

### **1. Define Tool Schemas**
```typescript
// E-commerce domain
ParameterDiscovery.registerToolSchema('createProduct', [
  { name: 'name', type: 'string', domain: 'ecommerce', required: true },
  { name: 'price', type: 'number', domain: 'ecommerce', required: true },
  { name: 'category', type: 'enum', domain: 'ecommerce', enumValues: ['electronics', 'clothing', 'books'] },
  { name: 'inStock', type: 'boolean', domain: 'ecommerce' }
]);
```

### **2. Add Domain Transformations**
```typescript
const DOMAIN_TRANSFORMATIONS = {
  // ... existing transformations ...
  
  ecommerce: (payload, parameters) => {
    const transformed = { ...payload };
    
    // Price modifications
    if (parameters.priceOffset) {
      transformed.price = transformed.price + parameters.priceOffset;
    }
    
    // Category rotations
    if (parameters.categoryRotation) {
      const categories = ['electronics', 'clothing', 'books'];
      transformed.category = categories[parameters.instanceIndex % categories.length];
    }
    
    return transformed;
  }
};
```

### **3. Natural Language Works Automatically**
```typescript
// No additional code needed!
"create 5 products with $50 price increase" → 
  count: 5, priceOffset: 50

"create products in different categories" → 
  count: 3, categoryRotation: true
```

## 🎯 Success Criteria

✅ **Domain Agnostic**: Works for any business domain without code changes
✅ **Automatic Discovery**: Parameters discovered from flow content
✅ **Extensible**: New tools and domains can be added easily
✅ **Validated**: Parameters validated against actual flow capabilities
✅ **Generic Parameters**: Common parameters work across all domains
✅ **Natural Language**: AI understands domain-specific parameters automatically

This scalable approach transforms the Flow Recorder from a drawing-specific tool into a universal automation platform that can adapt to any business domain! 