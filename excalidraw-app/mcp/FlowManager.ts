import { Flow, FlowStep, FlowParameters, FlowParameterSchema } from './FlowTypes';
import { ParameterDiscovery } from './ParameterDiscovery';

class FlowManager {
  private flows: Flow[] = [];
  private storageKey = 'tess-excalidraw-flows';

  constructor() {
    this.loadFlows();
  }

  private loadFlows() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        this.flows = JSON.parse(stored).map((flow: any) => ({
          ...flow,
          createdAt: new Date(flow.createdAt),
          updatedAt: new Date(flow.updatedAt),
          steps: flow.steps.map((step: any) => ({
            ...step,
            timestamp: new Date(step.timestamp),
          })),
        }));
      }
    } catch (error) {
      console.error('Error loading flows:', error);
      this.flows = [];
    }
  }

  private saveFlows() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.flows));
    } catch (error) {
      console.error('Error saving flows:', error);
    }
  }

  getAllFlows(): Flow[] {
    return [...this.flows];
  }

  getFlow(flowId: string): Flow | undefined {
    return this.flows.find(flow => flow.id === flowId);
  }

  findFlowByName(name: string): Flow | undefined {
    const searchName = name.toLowerCase().trim();
    
    // First try exact match
    let flow = this.flows.find(f => f.name.toLowerCase() === searchName);
    if (flow) return flow;
    
    // Then try starts with
    flow = this.flows.find(f => f.name.toLowerCase().startsWith(searchName));
    if (flow) return flow;
    
    // Then try contains (but only if the search term is at least 3 characters)
    if (searchName.length >= 3) {
      flow = this.flows.find(f => f.name.toLowerCase().includes(searchName));
      if (flow) return flow;
    }
    
    // Finally try reverse contains (search term contains flow name)
    return this.flows.find(f => searchName.includes(f.name.toLowerCase()));
  }

  findFlowsByName(name: string): Flow[] {
    return this.flows.filter(f => 
      f.name.toLowerCase().includes(name.toLowerCase()) ||
      name.toLowerCase().includes(f.name.toLowerCase())
    );
  }

  saveFlow(flow: Flow): void {
    const existingIndex = this.flows.findIndex(f => f.id === flow.id);
    
    if (existingIndex >= 0) {
      // Update existing flow
      this.flows[existingIndex] = {
        ...flow,
        updatedAt: new Date(),
      };
    } else {
      // Add new flow
      this.flows.push({
        ...flow,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    
    this.saveFlows();
  }

  deleteFlow(flowId: string): boolean {
    const initialLength = this.flows.length;
    this.flows = this.flows.filter(flow => flow.id !== flowId);
    
    if (this.flows.length !== initialLength) {
      this.saveFlows();
      return true;
    }
    return false;
  }

  publishFlow(flowId: string, workspaceId: string): boolean {
    const flow = this.flows.find(f => f.id === flowId);
    if (flow) {
      flow.isPublished = true;
      flow.workspaceId = workspaceId;
      flow.updatedAt = new Date();
      this.saveFlows();
      return true;
    }
    return false;
  }

  async executeFlow(flow: Flow, parameters?: FlowParameters): Promise<void> {
    console.log(`Executing flow: ${flow.name}`, parameters);
    
    // If count is specified, execute the flow multiple times with different positions
    const count = parameters?.count || 1;
    const spacing = parameters?.spacing || 200;
    
    for (let i = 0; i < count; i++) {
      // Calculate position offset for multiple instances
      const instanceParameters = { ...parameters };
      if (count > 1) {
        instanceParameters.xOffset = (parameters?.xOffset || 0) + (i * spacing);
        instanceParameters.yOffset = parameters?.yOffset || 0;
      }
      
      for (const step of flow.steps) {
        try {
          // Execute each tool in the step
          for (const tool of step.toolsUsed) {
            const transformedPayload = this.applyParameters(tool.payload, instanceParameters, tool.tool);
            await this.executeTool(tool.tool, transformedPayload);
          }
          
          // Add a small delay between steps for better UX
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          console.error(`Error executing step in flow ${flow.name}:`, error);
          throw error;
        }
      }
    }
  }

  private applyParameters(payload: any, parameters?: FlowParameters, toolName?: string): any {
    if (!parameters || !toolName) return payload;
    
    // Use the parameter discovery system to apply domain-specific transformations
    return ParameterDiscovery.applyParameters(payload, parameters, toolName);
  }

  private async executeTool(toolName: string, payload: any): Promise<string | null> {
    try {
      let elementId: string | null = null;

      switch (toolName) {
        case "drawSquare":
          // @ts-ignore
          if (window["drawSquare"]) {
            // @ts-ignore
            const element = window["drawSquare"](
              payload.x,
              payload.y,
              payload.size,
              {
                strokeColor: payload.strokeColor,
                backgroundColor: payload.backgroundColor,
                fillStyle: payload.fillStyle,
                strokeWidth: payload.strokeWidth,
                strokeStyle: payload.strokeStyle,
                roughness: payload.roughness,
                opacity: payload.opacity,
                roundness: payload.roundness,
              },
            );
            elementId = element?.id || null;
          }
          break;

        case "drawCircle":
          // @ts-ignore
          if (window["drawCircle"]) {
            // @ts-ignore
            const element = window["drawCircle"](
              payload.x,
              payload.y,
              payload.size,
              {
                strokeColor: payload.strokeColor,
                backgroundColor: payload.backgroundColor,
                fillStyle: payload.fillStyle,
                strokeWidth: payload.strokeWidth,
                strokeStyle: payload.strokeStyle,
                roughness: payload.roughness,
                opacity: payload.opacity,
              },
            );
            elementId = element?.id || null;
          }
          break;

        case "drawLine":
          // @ts-ignore
          if (window["drawLine"]) {
            // @ts-ignore
            const element = window["drawLine"](
              payload.x,
              payload.y,
              payload.width,
              payload.height,
              {
                strokeColor: payload.strokeColor,
                strokeWidth: payload.strokeWidth,
                strokeStyle: payload.strokeStyle,
                roughness: payload.roughness,
                opacity: payload.opacity,
              },
            );
            elementId = element?.id || null;
          }
          break;

        case "addText":
          // @ts-ignore
          if (window["addText"]) {
            // @ts-ignore
            const element = window["addText"](
              payload.x,
              payload.y,
              payload.text,
              {
                fontSize: payload.fontSize,
                fontFamily: payload.fontFamily,
                textAlign: payload.textAlign,
                verticalAlign: payload.verticalAlign,
                strokeColor: payload.strokeColor,
                backgroundColor: payload.backgroundColor,
                fillStyle: payload.fillStyle,
                strokeWidth: payload.strokeWidth,
                strokeStyle: payload.strokeStyle,
                roughness: payload.roughness,
                opacity: payload.opacity,
                angle: payload.angle,
              },
            );
            elementId = element?.id || null;
          }
          break;

        case "addImage":
          // @ts-ignore
          if (window["addImage"]) {
            // @ts-ignore
            const element = window["addImage"](
              payload.x,
              payload.y,
              payload.imageUrl,
              {
                width: payload.width,
                height: payload.height,
                scale: payload.scale,
                opacity: payload.opacity,
                angle: payload.angle,
              },
            );
            elementId = element?.id || null;
          }
          break;

        case "addFrame":
          // @ts-ignore
          if (window["addFrame"]) {
            // @ts-ignore
            const element = window["addFrame"](
              payload.x,
              payload.y,
              payload.width,
              payload.height,
              payload.name,
              {
                strokeColor: payload.strokeColor,
                backgroundColor: payload.backgroundColor,
                fillStyle: payload.fillStyle,
                strokeWidth: payload.strokeWidth,
                strokeStyle: payload.strokeStyle,
                roughness: payload.roughness,
                opacity: payload.opacity,
                angle: payload.angle,
              },
            );
            elementId = element?.id || null;
          }
          break;

        case "move":
          // @ts-ignore
          if (window["move"]) {
            // @ts-ignore
            const element = window["move"](
              payload.elementId,
              payload.x,
              payload.y,
            );
            elementId = element?.id || payload.elementId;
          }
          break;

        case "moveTo":
          // @ts-ignore
          if (window["moveTo"]) {
            // @ts-ignore
            const element = window["moveTo"](
              payload.elementId,
              payload.x,
              payload.y,
            );
            elementId = element?.id || payload.elementId;
          }
          break;

        case "deleteElement":
          // @ts-ignore
          if (window["deleteElement"]) {
            // @ts-ignore
            const element = window["deleteElement"](payload.elementId);
            elementId = payload.elementId;
          }
          break;

        case "editStroke":
          // @ts-ignore
          if (window["editStroke"]) {
            // @ts-ignore
            const element = window["editStroke"](
              payload.elementId,
              payload.strokeColor,
              payload.strokeWidth,
              payload.strokeStyle,
            );
            elementId = element?.id || payload.elementId;
          }
          break;

        case "addArrow":
          // @ts-ignore
          if (window["addArrow"]) {
            // @ts-ignore
            const element = window["addArrow"](
              payload.fromElementId,
              payload.toElementId,
              {
                strokeColor: payload.strokeColor,
                strokeWidth: payload.strokeWidth,
                strokeStyle: payload.strokeStyle,
                startArrowhead: payload.startArrowhead,
                endArrowhead: payload.endArrowhead,
                roughness: payload.roughness,
                opacity: payload.opacity,
              },
            );
            elementId = element?.id || null;
          }
          break;

        default:
          console.warn(`Unknown tool: ${toolName}`);
      }

      return elementId;
    } catch (error) {
      console.error(`Error executing tool ${toolName}:`, error);
      return null;
    }
  }

  createFlow(name: string, description?: string): Flow {
    const flow: Flow = {
      id: `flow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      steps: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isPublished: false,
    };
    
    this.saveFlow(flow);
    return flow;
  }

  addStepToFlow(flowId: string, step: FlowStep): boolean {
    const flow = this.flows.find(f => f.id === flowId);
    if (flow) {
      flow.steps.push(step);
      flow.updatedAt = new Date();
      this.saveFlows();
      return true;
    }
    return false;
  }

  /**
   * Gets the parameter schema for a specific flow
   */
  getFlowParameterSchema(flowId: string): FlowParameterSchema | null {
    const flow = this.getFlow(flowId);
    if (!flow) return null;
    
    return ParameterDiscovery.discoverFlowParameters(flow);
  }

  /**
   * Gets parameter schemas for all flows
   */
  getAllFlowParameterSchemas(): FlowParameterSchema[] {
    return this.flows.map(flow => ParameterDiscovery.discoverFlowParameters(flow));
  }

  /**
   * Validates parameters against a flow's schema
   */
  validateFlowParameters(flowId: string, parameters: any): { valid: boolean; errors: string[] } {
    const schema = this.getFlowParameterSchema(flowId);
    if (!schema) {
      return { valid: false, errors: ['Flow not found'] };
    }
    
    return ParameterDiscovery.validateParameters(parameters, schema);
  }
}

// Export singleton instance
export const flowManager = new FlowManager(); 