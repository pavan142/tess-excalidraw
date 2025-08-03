import { Flow, FlowStep, ParameterMetadata, FlowParameterSchema } from './FlowTypes';

// Tool parameter definitions - this can be extended for any domain
const TOOL_PARAMETER_SCHEMAS: Record<string, ParameterMetadata[]> = {
  // Drawing tools (visual domain)
  drawSquare: [
    { name: 'x', type: 'number', description: 'X position', domain: 'visual', required: true },
    { name: 'y', type: 'number', description: 'Y position', domain: 'visual', required: true },
    { name: 'size', type: 'number', description: 'Size of square', domain: 'visual', required: true },
    { name: 'strokeColor', type: 'string', description: 'Border color', domain: 'visual' },
    { name: 'backgroundColor', type: 'string', description: 'Fill color', domain: 'visual' },
    { name: 'strokeWidth', type: 'number', description: 'Border thickness', domain: 'visual' },
    { name: 'opacity', type: 'number', description: 'Transparency', domain: 'visual' },
  ],
  drawCircle: [
    { name: 'x', type: 'number', description: 'X position', domain: 'visual', required: true },
    { name: 'y', type: 'number', description: 'Y position', domain: 'visual', required: true },
    { name: 'size', type: 'number', description: 'Radius', domain: 'visual', required: true },
    { name: 'strokeColor', type: 'string', description: 'Border color', domain: 'visual' },
    { name: 'backgroundColor', type: 'string', description: 'Fill color', domain: 'visual' },
    { name: 'strokeWidth', type: 'number', description: 'Border thickness', domain: 'visual' },
    { name: 'opacity', type: 'number', description: 'Transparency', domain: 'visual' },
  ],
  addText: [
    { name: 'x', type: 'number', description: 'X position', domain: 'visual', required: true },
    { name: 'y', type: 'number', description: 'Y position', domain: 'visual', required: true },
    { name: 'text', type: 'string', description: 'Text content', domain: 'business', required: true },
    { name: 'fontSize', type: 'number', description: 'Font size', domain: 'visual' },
    { name: 'strokeColor', type: 'string', description: 'Text color', domain: 'visual' },
  ],
  addImage: [
    { name: 'x', type: 'number', description: 'X position', domain: 'visual', required: true },
    { name: 'y', type: 'number', description: 'Y position', domain: 'visual', required: true },
    { name: 'imageUrl', type: 'string', description: 'Image URL', domain: 'business', required: true },
    { name: 'width', type: 'number', description: 'Image width', domain: 'visual' },
    { name: 'height', type: 'number', description: 'Image height', domain: 'visual' },
  ],
  
  // Business tools (example for different domains)
  createUser: [
    { name: 'username', type: 'string', description: 'Username', domain: 'business', required: true },
    { name: 'email', type: 'string', description: 'Email address', domain: 'business', required: true },
    { name: 'role', type: 'enum', description: 'User role', domain: 'business', enumValues: ['admin', 'user', 'moderator'] },
    { name: 'active', type: 'boolean', description: 'Account active', domain: 'business' },
  ],
  createJob: [
    { name: 'title', type: 'string', description: 'Job title', domain: 'business', required: true },
    { name: 'description', type: 'string', description: 'Job description', domain: 'business' },
    { name: 'salary', type: 'number', description: 'Salary amount', domain: 'business' },
    { name: 'location', type: 'string', description: 'Job location', domain: 'business' },
    { name: 'type', type: 'enum', description: 'Job type', domain: 'business', enumValues: ['full-time', 'part-time', 'contract'] },
  ],
  sendEmail: [
    { name: 'to', type: 'string', description: 'Recipient email', domain: 'business', required: true },
    { name: 'subject', type: 'string', description: 'Email subject', domain: 'business', required: true },
    { name: 'body', type: 'string', description: 'Email body', domain: 'business', required: true },
    { name: 'priority', type: 'enum', description: 'Email priority', domain: 'business', enumValues: ['high', 'normal', 'low'] },
  ],
  
  // Generic tools (work across domains)
  move: [
    { name: 'elementId', type: 'string', description: 'Element to move', domain: 'generic', required: true },
    { name: 'x', type: 'number', description: 'New X position', domain: 'visual' },
    { name: 'y', type: 'number', description: 'New Y position', domain: 'visual' },
  ],
  deleteElement: [
    { name: 'elementId', type: 'string', description: 'Element to delete', domain: 'generic', required: true },
  ],
};

// Generic parameters that work across all domains
const GENERIC_PARAMETERS: ParameterMetadata[] = [
  { name: 'count', type: 'number', description: 'Number of times to execute', domain: 'generic' },
  { name: 'spacing', type: 'number', description: 'Spacing between instances', domain: 'generic' },
  { name: 'delay', type: 'number', description: 'Delay between executions (seconds)', domain: 'generic' },
  { name: 'condition', type: 'string', description: 'Condition to check before execution', domain: 'generic' },
  { name: 'priority', type: 'enum', description: 'Execution priority', domain: 'generic', enumValues: ['high', 'medium', 'low'] },
];

// Domain-specific transformation rules
const DOMAIN_TRANSFORMATIONS: Record<string, (payload: any, parameters: any) => any> = {
  // Visual domain transformations
  visual: (payload: any, parameters: any) => {
    const transformed = { ...payload };
    
    // Position transformations
    if (parameters.xOffset !== undefined && transformed.x !== undefined) {
      transformed.x = transformed.x + parameters.xOffset;
    }
    if (parameters.yOffset !== undefined && transformed.y !== undefined) {
      transformed.y = transformed.y + parameters.yOffset;
    }
    
    // Scale transformations
    if (parameters.scale !== undefined) {
      if (transformed.size !== undefined) transformed.size *= parameters.scale;
      if (transformed.width !== undefined) transformed.width *= parameters.scale;
      if (transformed.height !== undefined) transformed.height *= parameters.scale;
      if (transformed.fontSize !== undefined) transformed.fontSize *= parameters.scale;
    }
    
    // Color transformations
    if (parameters.color !== undefined) {
      if (transformed.strokeColor !== undefined) transformed.strokeColor = parameters.color;
      if (transformed.backgroundColor !== undefined) transformed.backgroundColor = parameters.color;
    }
    
    // Rotation transformations
    if (parameters.rotation !== undefined && transformed.angle !== undefined) {
      transformed.angle = (transformed.angle || 0) + parameters.rotation;
    }
    
    return transformed;
  },
  
  // Business domain transformations
  business: (payload: any, parameters: any) => {
    const transformed = { ...payload };
    
    // Text substitutions
    if (parameters.textTemplate !== undefined && transformed.text !== undefined) {
      transformed.text = parameters.textTemplate.replace('{index}', parameters.instanceIndex || 0);
    }
    
    // Value modifications
    if (parameters.valueOffset !== undefined && transformed.salary !== undefined) {
      transformed.salary = transformed.salary + parameters.valueOffset;
    }
    
    // Enum substitutions
    if (parameters.roleOverride !== undefined && transformed.role !== undefined) {
      transformed.role = parameters.roleOverride;
    }
    
    return transformed;
  },
  
  // Generic transformations
  generic: (payload: any, parameters: any) => {
    const transformed = { ...payload };
    
    // Add instance metadata
    if (parameters.instanceIndex !== undefined) {
      transformed.instanceIndex = parameters.instanceIndex;
    }
    
    return transformed;
  }
};

export class ParameterDiscovery {
  
  /**
   * Analyzes a flow and discovers what parameters can be applied to it
   */
  static discoverFlowParameters(flow: Flow): FlowParameterSchema {
    const parameters: ParameterMetadata[] = [...GENERIC_PARAMETERS];
    const usedTools = new Set<string>();
    
    // Analyze each step in the flow
    flow.steps.forEach(step => {
      step.toolsUsed.forEach(tool => {
        usedTools.add(tool.tool);
        
        // Get parameter schema for this tool
        const toolSchema = TOOL_PARAMETER_SCHEMAS[tool.tool];
        if (toolSchema) {
          // Add tool-specific parameters that aren't already included
          toolSchema.forEach(param => {
            if (!parameters.find(p => p.name === param.name)) {
              parameters.push(param);
            }
          });
        }
      });
    });
    
    // Generate examples based on discovered parameters
    const examples = this.generateExamples(flow.name, parameters, usedTools);
    
    return {
      flowId: flow.id,
      flowName: flow.name,
      parameters,
      examples
    };
  }
  
  /**
   * Generates natural language examples for the discovered parameters
   */
  private static generateExamples(flowName: string, parameters: ParameterMetadata[], usedTools: Set<string>): string[] {
    const examples: string[] = [];
    
    // Generic examples
    examples.push(`"${flowName} 5 times"`);
    examples.push(`"${flowName} with high priority"`);
    
    // Domain-specific examples
    const hasVisualParams = parameters.some(p => p.domain === 'visual');
    const hasBusinessParams = parameters.some(p => p.domain === 'business');
    
    if (hasVisualParams) {
      examples.push(`"${flowName} in red"`);
      examples.push(`"${flowName} at position 100, 200"`);
      examples.push(`"${flowName} twice as large"`);
    }
    
    if (hasBusinessParams) {
      examples.push(`"${flowName} for admin users"`);
      examples.push(`"${flowName} with custom text"`);
    }
    
    // Tool-specific examples
    if (usedTools.has('addText')) {
      examples.push(`"${flowName} with different text"`);
    }
    
    if (usedTools.has('createUser')) {
      examples.push(`"${flowName} for different roles"`);
    }
    
    if (usedTools.has('sendEmail')) {
      examples.push(`"${flowName} with high priority"`);
    }
    
    return examples;
  }
  
  /**
   * Applies parameters to a tool payload based on its domain
   */
  static applyParameters(payload: any, parameters: any, toolName: string): any {
    const toolSchema = TOOL_PARAMETER_SCHEMAS[toolName];
    if (!toolSchema) return payload;
    
    // Determine the primary domain for this tool
    const domains = toolSchema.map(p => p.domain);
    const primaryDomain = domains.includes('business') ? 'business' : 
                         domains.includes('visual') ? 'visual' : 'generic';
    
    // Apply domain-specific transformations
    const transformer = DOMAIN_TRANSFORMATIONS[primaryDomain];
    if (transformer) {
      return transformer(payload, parameters);
    }
    
    return payload;
  }
  
  /**
   * Validates parameters against the flow's parameter schema
   */
  static validateParameters(parameters: any, schema: FlowParameterSchema): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    Object.entries(parameters).forEach(([key, value]) => {
      const paramDef = schema.parameters.find(p => p.name === key);
      
      if (!paramDef) {
        errors.push(`Unknown parameter: ${key}`);
        return;
      }
      
      // Type validation
      if (paramDef.type === 'number' && typeof value !== 'number') {
        errors.push(`Parameter ${key} must be a number`);
      }
      
      if (paramDef.type === 'string' && typeof value !== 'string') {
        errors.push(`Parameter ${key} must be a string`);
      }
      
      if (paramDef.type === 'boolean' && typeof value !== 'boolean') {
        errors.push(`Parameter ${key} must be a boolean`);
      }
      
      if (paramDef.type === 'enum' && paramDef.enumValues && !paramDef.enumValues.includes(value)) {
        errors.push(`Parameter ${key} must be one of: ${paramDef.enumValues.join(', ')}`);
      }
      
      // Required validation
      if (paramDef.required && value === undefined) {
        errors.push(`Required parameter ${key} is missing`);
      }
    });
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
  
  /**
   * Gets all available tool schemas (for documentation)
   */
  static getAllToolSchemas(): Record<string, ParameterMetadata[]> {
    return TOOL_PARAMETER_SCHEMAS;
  }
  
  /**
   * Registers a new tool schema (for extensibility)
   */
  static registerToolSchema(toolName: string, parameters: ParameterMetadata[]): void {
    TOOL_PARAMETER_SCHEMAS[toolName] = parameters;
  }
} 