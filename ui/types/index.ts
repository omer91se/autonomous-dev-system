export type Phase = 'init' | 'requirements' | 'design' | 'development' | 'testing' | 'deployment' | 'complete';

export type CheckpointStatus = 'pending' | 'approved' | 'rejected';

export type AgentStatus = 'idle' | 'running' | 'completed' | 'error';

export interface Checkpoint {
  id: string;
  type: string;
  status: CheckpointStatus;
  timestamp: string;
  artifactPath?: string;
}

export interface ProjectState {
  projectId: string;
  phase: Phase;
  userInput: string;
  requirementsPath?: string;
  designPath?: string;
  implementationPath?: string;
  checkpoints: Checkpoint[];
  createdAt: string;
  updatedAt?: string;
}

export interface AgentActivity {
  id: string;
  name: string;
  type: 'requirements' | 'design' | 'coding' | 'testing' | 'deployment';
  status: AgentStatus;
  currentTask: string;
  progress: number;
  startedAt: string;
  completedAt?: string;
  error?: string;
}

export interface LogEntry {
  timestamp: string;
  level: 'info' | 'success' | 'warning' | 'error';
  message: string;
  agent?: string;
}

export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  status?: 'creating' | 'created' | 'modified';
  children?: FileNode[];
}

export interface WebSocketMessage {
  type: 'state_update' | 'agent_update' | 'log' | 'file_created' | 'checkpoint';
  data: any;
}

// App Management Types
export type AppStatus = 'active' | 'deleted';

export interface App {
  id: string;
  name: string;
  displayName: string;
  path: string;
  port: number;
  database: string;
  s3Bucket: string;
  s3Region: string;
  status: AppStatus;
  createdAt: string;
  archivedAt?: string;
  deletedAt?: string | null;
  lastStartedAt?: string | null;
  running?: boolean;
  runtimeInfo?: {
    pid: number;
    port: number;
    startedAt: string;
    uptime: number;
  } | null;
}
