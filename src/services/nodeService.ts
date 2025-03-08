import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/LocalDB';
import { CausalNode } from '../models/types';

/**
 * Service for managing nodes in the causal diagram
 */
export const NodeService = {
  /**
   * Get all nodes for a project
   */
  getNodesByProject: async (projectId: string): Promise<CausalNode[]> => {
    return await db.nodes.where('projectId').equals(projectId).toArray();
  },

  /**
   * Create a new node
   */
  createNode: async (node: Omit<CausalNode, 'id'>): Promise<CausalNode> => {
    const newNode: CausalNode = {
      ...node,
      id: uuidv4()
    };
    await db.nodes.add(newNode);
    return newNode;
  },

  /**
   * Update a node
   */
  updateNode: async (id: string, updates: Partial<CausalNode>): Promise<void> => {
    await db.nodes.update(id, updates);
  },

  /**
   * Update node position
   */
  updateNodePosition: async (id: string, x: number, y: number): Promise<void> => {
    await db.nodes.update(id, { x, y });
  },

  /**
   * Delete a node
   */
  deleteNode: async (id: string): Promise<void> => {
    await db.nodes.delete(id);
  },

  /**
   * Get a single node by ID
   */
  getNodeById: async (id: string): Promise<CausalNode | undefined> => {
    return await db.nodes.get(id);
  }
};

export default NodeService; 