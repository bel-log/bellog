import Dexie, { Table } from 'dexie';

export interface DbFolder {
  id?: number;
  name: string;
  path: string;
}

export interface DbProfile {
    id?: number;
    name: string;
    path: string;
    setup: string;
  }
  
export class MySubClassedDexie extends Dexie {
  // 'friends' is added by dexie when declaring the stores()
  // We just tell the typing system this is the case
  folders!: Table<DbFolder>; 
  profiles!: Table<DbProfile>; 

  constructor() {
    super('Database');
    this.version(1).stores({
        folders: '++id, name, path',
        profiles: '++id, name, path, setup'
    });
  }
}

export const db = new MySubClassedDexie();