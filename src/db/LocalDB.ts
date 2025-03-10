import Dexie, { Table } from 'dexie';
import { User, Project } from '../models/types';

export class LocalDB extends Dexie {
  users!: Table<User>;
  projects!: Table<Project>;

  constructor() {
    super('WhyBecauseRCA');
    this.version(2).stores({
      users: 'id, username',
      projects: 'id, ownerId, name',
    });

    // Database schema migrations
    this.on('ready', () => {
      console.log('Database is ready with schema version', this.verno);
    });
  }

  // Helper method to update project graph data
  async updateProjectGraph(projectId: string, graphData: Project['graphData']) {
    try {
      const project = await this.projects.get(projectId);
      
      if (!project) {
        throw new Error(`Project with ID ${projectId} not found`);
      }

      // Update the project with new graph data and updatedAt timestamp
      await this.projects.update(projectId, {
        graphData,
        updatedAt: Date.now()
      });

      return true;
    } catch (error) {
      console.error('Error updating project graph:', error);
      return false;
    }
  }
}

export const db = new LocalDB(); 