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