/**
 * Agent System Types
 * Foundation for the multi-agent AI system
 */

export type AgentType = 'SPECIALIST' | 'UTILITY' | 'ORCHESTRATOR';

export interface AgentCapability {
  id: string;
  name: string;
  description: string;
  inputSchema?: any;
  outputSchema?: any;
}

export interface AgentConfig {
  model: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt: string;
  tools?: AgentCapability[];
  timeout?: number;
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  type: AgentType;
  category: string;
  version: string;
  config: AgentConfig;
  isActive: boolean;
  isPublic: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AgentExecution {
  id: string;
  agentId: string;
  input: any;
  output?: any;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  startedAt: Date;
  completedAt?: Date;
  duration?: number;
  tokens?: number;
  cost?: number;
  error?: string;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  agents: WorkflowAgent[];
  isActive: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkflowAgent {
  id: string;
  agentId: string;
  order: number;
  config?: any;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  startedAt: Date;
  completedAt?: Date;
  result?: any;
  error?: string;
  steps: ExecutionStep[];
}

export interface ExecutionStep {
  id: string;
  agentId: string;
  order: number;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'SKIPPED';
  input?: any;
  output?: any;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
}

export interface AgentMessage {
  from: string;
  to: string;
  type: 'request' | 'response' | 'notification';
  payload: any;
  timestamp: Date;
  correlationId: string;
}

export interface AgentRegistration {
  name: string;
  description: string;
  type: AgentType;
  category: string;
  config: AgentConfig;
  capabilities: AgentCapability[];
  isPublic?: boolean;
}
