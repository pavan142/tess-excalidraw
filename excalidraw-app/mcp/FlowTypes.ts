export interface FlowStep {
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

export interface Flow {
  id: string;
  name: string;
  description?: string;
  steps: FlowStep[];
  createdAt: Date;
  updatedAt: Date;
  isPublished?: boolean;
  workspaceId?: string;
}

export interface FlowRecorderState {
  isRecording: boolean;
  currentFlow: Flow | null;
  recordedSteps: FlowStep[];
}

// Generic parameters that work across all domains
export interface GenericFlowParameters {
  count?: number;           // "run 5 times"
  spacing?: number;         // "with spacing 100"
  delay?: number;           // "with 2 second delay between"
  condition?: string;       // "only if user is logged in"
  priority?: 'high' | 'medium' | 'low'; // "with high priority"
}

// Domain-specific parameters (discovered dynamically)
export interface DomainSpecificParameters {
  [key: string]: any;       // Dynamic parameters based on flow content
}

export interface FlowParameters extends GenericFlowParameters, DomainSpecificParameters {}

// Parameter metadata for discovery
export interface ParameterMetadata {
  name: string;
  type: 'number' | 'string' | 'boolean' | 'enum';
  description: string;
  domain: 'generic' | 'visual' | 'business' | 'custom';
  enumValues?: string[];
  defaultValue?: any;
  required?: boolean;
}

export interface FlowParameterSchema {
  flowId: string;
  flowName: string;
  parameters: ParameterMetadata[];
  examples: string[];
}

export interface FlowManager {
  flows: Flow[];
  saveFlow: (flow: Flow) => void;
  deleteFlow: (flowId: string) => void;
  publishFlow: (flowId: string, workspaceId: string) => void;
  executeFlow: (flow: Flow, parameters?: FlowParameters) => Promise<void>;
} 