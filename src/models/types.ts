export interface User {
  id: string;            // e.g. a UUID or 'local-user'
  username: string;
  passwordHash?: string; // Optional for now
}

export interface Project {
  id: string;            // a UUID
  name: string;
  description?: string;
  ownerId: string;       // user.id
  createdAt: number;     // Date.now()
  updatedAt: number;     // Date.now() on update
  // diagram, chatHistory, attachments, etc. can be added later
}

export type NodeType = 'generic' | 'problem' | 'incident' | 'event' | 'condition';

export interface NodeTypeInfo {
  type: NodeType;
  name: string;
  icon: string;
  color: string;
}

export interface CausalNode {
  id: string;          // UUID
  projectId: string;   // Reference to project
  type: NodeType;
  title: string;
  description: string;
  x: number;           // Position on diagram
  y: number;
  // For future: attachments, metadata, etc.
}

// Node type definitions with their properties
export const NODE_TYPES: Record<NodeType, NodeTypeInfo> = {
  generic: {
    type: 'generic',
    name: 'Generic',
    icon: 'help_outline',
    color: '#9E9E9E'
  },
  problem: {
    type: 'problem',
    name: 'Problem',
    icon: 'error_outline',
    color: '#F44336'
  },
  incident: {
    type: 'incident',
    name: 'Incident',
    icon: 'warning_amber',
    color: '#FFC107'
  },
  event: {
    type: 'event',
    name: 'Event',
    icon: 'event',
    color: '#2196F3'
  },
  condition: {
    type: 'condition',
    name: 'Condition',
    icon: 'thermostat',
    color: '#4CAF50'
  }
}; 