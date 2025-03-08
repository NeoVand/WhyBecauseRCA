import Dexie, { Table } from 'dexie';
import { User, Project } from '../models/types';

export class LocalDB extends Dexie {
  users!: Table<User>;
  projects!: Table<Project>;

  constructor() {
    super('WhyBecauseRCA');
    this.version(1).stores({
      users: 'id, username',
      projects: 'id, ownerId, name',
    });
  }
}

export const db = new LocalDB(); 