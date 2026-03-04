'use client';
import React, { useState } from 'react';
import { useSchemaStore, Table, Column } from '../../store/useSchemaStore';
import { Trash2, Plus, ChevronDown, ChevronRight, Table as TableIcon } from 'lucide-react';

const COLUMN_TYPES = [
  'string',
  'integer',
  'bigInteger',
  'text',
  'boolean',
  'date',
  'dateTime',
  'decimal',
  'float',
  'json',
  'uuid',
];

export default function TableEditor() {
  const { tables, addTable, updateTable, removeTable } = useSchemaStore();
  const [expandedTableId, setExpandedTableId] = useState<string | null>(null);

  const handleAddTable = () => {
    const newTable: Table = {
      id: Date.now().toString(),
      name: `table_${tables.length + 1}`,
      columns: [],
      position: { x: 100, y: 100 + tables.length * 50 },
    };
    addTable(newTable);
    setExpandedTableId(newTable.id);
  };

  const handleAddColumn = (tableId: string) => {
    const table = tables.find((t) => t.id === tableId);
    if (!table) return;

    const newColumn: Column = {
      id: Date.now().toString(),
      name: 'new_column',
      type: 'string',
      nullable: false,
    };

    updateTable({
      ...table,
      columns: [...table.columns, newColumn],
    });
  };

  const handleUpdateColumn = (tableId: string, columnId: string, updates: Partial<Column>) => {
    const table = tables.find((t) => t.id === tableId);
    if (!table) return;

    const updatedColumns = table.columns.map((col) =>
      col.id === columnId ? { ...col, ...updates } : col
    );

    updateTable({ ...table, columns: updatedColumns });
  };

  const handleRemoveColumn = (tableId: string, columnId: string) => {
    const table = tables.find((t) => t.id === tableId);
    if (!table) return;

    const updatedColumns = table.columns.filter((col) => col.id !== columnId);
    updateTable({ ...table, columns: updatedColumns });
  };

  return (
    <div className="flex flex-col h-full bg-zinc-900 text-white border-r border-zinc-800">
      <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
        <h2 className="font-bold flex items-center gap-2">
          <TableIcon size={18} className="text-emerald-500" />
          Tables
        </h2>
        <button
          onClick={handleAddTable}
          className="bg-emerald-600 hover:bg-emerald-500 text-white p-1.5 rounded transition-colors"
          title="Add Table"
        >
          <Plus size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {tables.map((table) => (
          <div key={table.id} className="bg-zinc-800 rounded-lg overflow-hidden border border-zinc-700">
            {/* Table Header */}
            <div
              className="p-3 flex items-center justify-between cursor-pointer hover:bg-zinc-750"
              onClick={() => setExpandedTableId(expandedTableId === table.id ? null : table.id)}
            >
              <div className="flex items-center gap-2">
                {expandedTableId === table.id ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                <span className="font-medium text-sm">{table.name}</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeTable(table.id);
                }}
                className="text-zinc-500 hover:text-red-400 p-1"
              >
                <Trash2 size={14} />
              </button>
            </div>

            {/* Table Details (Expanded) */}
            {expandedTableId === table.id && (
              <div className="p-3 bg-zinc-900/50 border-t border-zinc-700 space-y-3">
                {/* Table Name Input */}
                <div>
                  <label className="text-xs text-zinc-500 block mb-1">Table Name</label>
                  <input
                    type="text"
                    value={table.name}
                    onChange={(e) => updateTable({ ...table, name: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-sm focus:border-emerald-500 outline-none"
                  />
                </div>

                {/* Columns List */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs text-zinc-500">Columns</label>
                    <button
                      onClick={() => handleAddColumn(table.id)}
                      className="text-xs text-emerald-500 hover:text-emerald-400 flex items-center gap-1"
                    >
                      <Plus size={12} /> Add
                    </button>
                  </div>

                  <div className="space-y-2">
                    {table.columns.map((col) => (
                      <div key={col.id} className="flex flex-col gap-2 bg-zinc-950 p-2 rounded border border-zinc-800">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={col.name}
                            onChange={(e) => handleUpdateColumn(table.id, col.id, { name: e.target.value })}
                            className="flex-1 bg-transparent border-b border-zinc-700 text-sm focus:border-emerald-500 outline-none px-1"
                            placeholder="name"
                          />
                          <button
                            onClick={() => handleRemoveColumn(table.id, col.id)}
                            className="text-zinc-600 hover:text-red-400"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                        <div className="flex gap-2">
                          <select
                            value={col.type}
                            onChange={(e) => handleUpdateColumn(table.id, col.id, { type: e.target.value })}
                            className="flex-1 bg-zinc-900 border border-zinc-700 rounded text-xs px-1 py-0.5 outline-none"
                          >
                            {COLUMN_TYPES.map((t) => (
                              <option key={t} value={t}>
                                {t}
                              </option>
                            ))}
                          </select>
                          <label className="flex items-center gap-1 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={col.nullable}
                              onChange={(e) => handleUpdateColumn(table.id, col.id, { nullable: e.target.checked })}
                              className="rounded bg-zinc-900 border-zinc-700 text-emerald-500 focus:ring-0"
                            />
                            <span className="text-[10px] text-zinc-500">Null</span>
                          </label>
                          <label className="flex items-center gap-1 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={col.unique}
                              onChange={(e) => handleUpdateColumn(table.id, col.id, { unique: e.target.checked })}
                              className="rounded bg-zinc-900 border-zinc-700 text-blue-500 focus:ring-0"
                            />
                            <span className="text-[10px] text-zinc-500">Unq</span>
                          </label>
                          <label className="flex items-center gap-1 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={col.index}
                              onChange={(e) => handleUpdateColumn(table.id, col.id, { index: e.target.checked })}
                              className="rounded bg-zinc-900 border-zinc-700 text-purple-500 focus:ring-0"
                            />
                            <span className="text-[10px] text-zinc-500">Idx</span>
                          </label>
                        </div>
                        <input
                            type="text"
                            value={col.default || ''}
                            onChange={(e) => handleUpdateColumn(table.id, col.id, { default: e.target.value })}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-0.5 text-[10px] text-zinc-400 focus:border-emerald-500 outline-none placeholder-zinc-700"
                            placeholder="default value"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
