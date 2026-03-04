'use client';
import React, { useState } from 'react';
import { useSchemaStore, Table, Column } from '../../store/useSchemaStore';

interface JsonImportModalProps {
  onClose: () => void;
}

export default function JsonImportModal({ onClose }: JsonImportModalProps) {
  const { addTable, tables } = useSchemaStore();
  const [jsonInput, setJsonInput] = useState('');
  const [tableName, setTableName] = useState('imported_table');
  const [error, setError] = useState<string | null>(null);

  const inferType = (value: any): string => {
    if (value === null) return 'string'; // Default to string for nulls
    if (typeof value === 'number') {
      return Number.isInteger(value) ? 'integer' : 'float';
    }
    if (typeof value === 'boolean') return 'boolean';
    if (typeof value === 'object') return 'json';
    // Check for date strings
    if (typeof value === 'string') {
        const date = new Date(value);
        if (!isNaN(date.getTime()) && value.includes('-')) return 'dateTime';
        if (value.length > 255) return 'text';
    }
    return 'string';
  };

  const handleImport = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      const data = Array.isArray(parsed) ? parsed[0] : parsed; // Handle array or single object

      if (!data || typeof data !== 'object') {
        setError('Invalid JSON: Must be an object or array of objects.');
        return;
      }

      const columns: Column[] = Object.keys(data).map((key) => ({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: key,
        type: inferType(data[key]),
        nullable: true,
      }));

      const newTable: Table = {
        id: Date.now().toString(),
        name: tableName,
        columns: columns,
        position: { x: 250, y: 100 + tables.length * 50 },
      };

      addTable(newTable);
      onClose();
    } catch (e) {
      setError('Invalid JSON format.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl w-full max-w-2xl flex flex-col">
        <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
          <h3 className="font-bold text-lg text-white">Import from JSON</h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">✕</button>
        </div>
        
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Table Name</label>
            <input
              type="text"
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-white focus:border-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-1">JSON Payload</label>
            <textarea
              value={jsonInput}
              onChange={(e) => {
                  setJsonInput(e.target.value);
                  setError(null);
              }}
              placeholder='{"id": 1, "name": "Example", "created_at": "2023-01-01"}'
              className="w-full h-64 bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-sm font-mono text-zinc-300 focus:border-emerald-500 outline-none resize-none"
            />
            {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
          </div>
        </div>

        <div className="p-4 border-t border-zinc-800 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-zinc-300 hover:text-white">Cancel</button>
          <button
            onClick={handleImport}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white font-medium"
          >
            Generate Table
          </button>
        </div>
      </div>
    </div>
  );
}
