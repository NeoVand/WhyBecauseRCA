export interface User {
  id: string;            // e.g. a UUID or 'local-user'
  username: string;
  passwordHash?: string; // Optional for now
}

// Define the graph data types
export interface GraphNode {
  id: string;
  type?: string;
  data: any;
  position: {
    x: number;
    y: number;
  };
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
  animated?: boolean;
  data?: any;
}

export interface Viewport {
  x: number;
  y: number;
  zoom: number;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  viewport: Viewport;
}

export interface Project {
  id: string;            // a UUID
  name: string;
  description?: string;
  ownerId: string;       // user.id
  createdAt: number;     // Date.now()
  updatedAt: number;     // Date.now() on update
  graphData?: GraphData; // The causal graph data
  // diagram, chatHistory, attachments, etc. can be added later
} 