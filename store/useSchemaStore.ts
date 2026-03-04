import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Column {
  id: string;
  name: string;
  type: string;
  nullable: boolean;
  unique?: boolean;
  index?: boolean;
  default?: string;
}

export interface Table {
  id: string;
  name: string;
  columns: Column[];
  position: { x: number; y: number };
  isCollapsed?: boolean;
}

export type RelationshipType = '1:1' | '1:N' | 'N:M';

export interface Relationship {
  id: string;
  sourceTableId: string;
  sourceColumnId: string;
  targetTableId: string;
  targetColumnId: string;
  type: RelationshipType;
}

interface SchemaState {
  tables: Table[];
  relationships: Relationship[];
  addTable: (table: Table) => void;
  updateTable: (table: Table) => void;
  removeTable: (id: string) => void;
  updateTablePosition: (id: string, position: { x: number; y: number }) => void;
  toggleTableCollapse: (id: string) => void;
  addRelationship: (relationship: Relationship) => void;
  updateRelationship: (id: string, updates: Partial<Relationship>) => void;
  removeRelationship: (id: string) => void;
}

export const useSchemaStore = create<SchemaState>()(
  persist(
    (set) => ({
      tables: [],
      relationships: [],
      addTable: (table) => set((state) => ({ tables: [...state.tables, table] })),
      updateTable: (updatedTable) =>
        set((state) => ({
          tables: state.tables.map((t) => (t.id === updatedTable.id ? updatedTable : t)),
        })),
      removeTable: (id) =>
        set((state) => ({ 
          tables: state.tables.filter((t) => t.id !== id),
          relationships: state.relationships.filter(r => r.sourceTableId !== id && r.targetTableId !== id)
        })),
      updateTablePosition: (id, position) =>
        set((state) => ({
          tables: state.tables.map((t) => (t.id === id ? { ...t, position } : t)),
        })),
      toggleTableCollapse: (id) =>
        set((state) => ({
          tables: state.tables.map((t) => (t.id === id ? { ...t, isCollapsed: !t.isCollapsed } : t)),
        })),
      addRelationship: (relationship) => 
        set((state) => ({ relationships: [...state.relationships, relationship] })),
      updateRelationship: (id, updates) =>
        set((state) => ({
          relationships: state.relationships.map((r) => (r.id === id ? { ...r, ...updates } : r)),
        })),
      removeRelationship: (id) =>
        set((state) => ({ relationships: state.relationships.filter((r) => r.id !== id) })),
    }),
    {
      name: 'schema-storage',
    }
  )
);
