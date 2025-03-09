import Dexie, { Table } from 'dexie';
import { User, Project, CausalNode, Connection } from '../models/types';

export class LocalDB extends Dexie {
  users!: Table<User>;
  projects!: Table<Project>;
  nodes!: Table<CausalNode>;
  connections!: Table<Connection>;

  constructor() {
    super('WhyBecauseRCA');
    
    // Define schemas for each version
    this.version(1).stores({
      users: 'id, username',
      projects: 'id, ownerId, name',
    });
    
    // New version with nodes table
    this.version(2).stores({
      users: 'id, username',
      projects: 'id, ownerId, name',
      nodes: 'id, projectId, type, title',
    });

    // Add connections table
    this.version(3).stores({
      users: 'id, username',
      projects: 'id, ownerId, name',
      nodes: 'id, projectId, type, title',
      connections: 'id, projectId, sourceNodeId, targetNodeId',
    });
  }
}

export const db = new LocalDB(); 