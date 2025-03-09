import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/LocalDB';
import { Connection } from '../models/types';

/**
 * Service for managing connections between nodes in the causal diagram
 */
export const ConnectionService = {
  /**
   * Get all connections for a project
   */
  getConnectionsByProject: async (projectId: string): Promise<Connection[]> => {
    return await db.connections.where('projectId').equals(projectId).toArray();
  },

  /**
   * Create a new connection
   */
  createConnection: async (connection: Omit<Connection, 'id'>): Promise<Connection> => {
    const newConnection: Connection = {
      ...connection,
      id: uuidv4()
    };
    await db.connections.add(newConnection);
    return newConnection;
  },

  /**
   * Update a connection
   */
  updateConnection: async (id: string, updates: Partial<Connection>): Promise<void> => {
    await db.connections.update(id, updates);
  },

  /**
   * Delete a connection
   */
  deleteConnection: async (id: string): Promise<void> => {
    await db.connections.delete(id);
  },

  /**
   * Get connections by source node
   */
  getConnectionsBySource: async (nodeId: string): Promise<Connection[]> => {
    return await db.connections.where('sourceNodeId').equals(nodeId).toArray();
  },

  /**
   * Get connections by target node
   */
  getConnectionsByTarget: async (nodeId: string): Promise<Connection[]> => {
    return await db.connections.where('targetNodeId').equals(nodeId).toArray();
  },

  /**
   * Delete all connections for a node (when node is deleted)
   */
  deleteConnectionsForNode: async (nodeId: string): Promise<void> => {
    await db.connections
      .where('sourceNodeId')
      .equals(nodeId)
      .or('targetNodeId')
      .equals(nodeId)
      .delete();
  },

  /**
   * Check if adding a connection would create a cycle
   */
  wouldFormCycle: async (sourceId: string, targetId: string): Promise<boolean> => {
    // If source and target are the same, it's a self-loop (cycle)
    if (sourceId === targetId) return true;

    const visited = new Set<string>();
    const queue: string[] = [targetId];

    while (queue.length > 0) {
      const nodeId = queue.shift()!;
      if (nodeId === sourceId) return true;
      
      visited.add(nodeId);
      
      // Find all connections where current node is the source
      const outgoingConnections = await db.connections
        .where('sourceNodeId')
        .equals(nodeId)
        .toArray();
      
      // Add target nodes to the queue if not visited
      for (const conn of outgoingConnections) {
        if (!visited.has(conn.targetNodeId)) {
          queue.push(conn.targetNodeId);
        }
      }
    }
    
    return false;
  }
};

export default ConnectionService; 