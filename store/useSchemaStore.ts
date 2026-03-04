import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Column {
  id: string;
  name: string;
  type: string;
  nullable: boolean;
}

export interface Table {
  id: string;
  name: string;
  columns: Column[];
  position: { x: number; y: number };
  isCollapsed?: boolean;
}

export interface Relationship {
  id: string;
  sourceTableId: string;
  sourceColumnId: string;
  targetTableId: string;
  targetColumnId: string;
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
      removeRelationship: (id) =>
        set((state) => ({ relationships: state.relationships.filter((r) => r.id !== id) })),
    }),
    {
      name: 'schema-storage',
    }
  )
);
