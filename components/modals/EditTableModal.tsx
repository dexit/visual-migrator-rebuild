'use client';
import React, { useState } from 'react';
import { useSchemaStore, Table, Column } from '../../store/useSchemaStore';
import { Trash2, Plus } from 'lucide-react';

interface EditTableModalProps {
  tableId: string;
  onClose: () => void;
}

export default function EditTableModal({ tableId, onClose }: EditTableModalProps) {
  const { tables, updateTable } = useSchemaStore();
  const table = tables.find((t) => t.id === tableId);
  const [tableName, setTableName] = useState(table?.name || '');
  const [columns, setColumns] = useState<Column[]>(table?.columns || []);

  if (!table) return null;

  const handleUpdate = () => {
    updateTable({ ...table, name: tableName, columns });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl w-full max-w-lg flex flex-col">
        <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
          <h3 className="font-bold text-lg text-white">Edit Table: {table.name}</h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">✕</button>
        </div>
        
        <div className="p-4 space-y-4">
          <input
            type="text"
            value={tableName}
            onChange={(e) => setTableName(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-white outline-none"
          />
          
          <div className="space-y-2">
            {columns.map((col, index) => (
              <div key={col.id} className="flex gap-2 items-center">
                <input
                  value={col.name}
                  onChange={(e) => {
                    const newCols = [...columns];
                    newCols[index].name = e.target.value;
                    setColumns(newCols);
                  }}
                  className="flex-1 bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-sm"
                />
                <button onClick={() => setColumns(columns.filter((_, i) => i !== index))} className="text-red-400"><Trash2 size={14}/></button>
              </div>
            ))}
          </div>
          <button onClick={() => setColumns([...columns, { id: Date.now().toString(), name: 'new', type: 'string', nullable: true }])} className="text-emerald-500 flex items-center gap-1 text-sm"><Plus size={14}/> Add Col</button>
        </div>

        <div className="p-4 border-t border-zinc-800 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-zinc-300">Cancel</button>
          <button onClick={handleUpdate} className="px-4 py-2 bg-emerald-600 rounded-lg text-white">Save</button>
        </div>
      </div>
    </div>
  );
}
