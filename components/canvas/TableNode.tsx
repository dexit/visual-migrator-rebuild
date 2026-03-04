'use client';
import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Table, useSchemaStore } from '../../store/useSchemaStore';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface TableNodeProps {
  data: Table;
  selected: boolean;
}

const TableNode = ({ data, selected }: TableNodeProps) => {
  const { toggleTableCollapse } = useSchemaStore();
  const isCollapsed = data.isCollapsed;

  return (
    <div
      className={`min-w-[250px] bg-zinc-900 rounded-lg border-2 shadow-xl overflow-hidden transition-all duration-200 ${
        selected ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-zinc-700'
      }`}
    >
      {/* Header */}
      <div 
        className="bg-zinc-800 p-3 border-b border-zinc-700 flex justify-between items-center cursor-pointer hover:bg-zinc-750"
        onClick={() => toggleTableCollapse(data.id)}
      >
        <div className="font-bold text-white flex items-center gap-2">
          {isCollapsed ? <ChevronRight size={16} className="text-zinc-400" /> : <ChevronDown size={16} className="text-zinc-400" />}
          <span className="text-emerald-500">≡</span>
          {data.name}
        </div>
        <div className="text-xs text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded-full border border-zinc-700">
          {data.columns.length} fields
        </div>
      </div>

      {/* Columns */}
      {!isCollapsed && (
        <div className="max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-zinc-900">
          <div className="p-2 space-y-1">
            {/* PK is implicit */}
            <div className="relative flex justify-between items-center text-sm p-1 px-2 hover:bg-zinc-800 rounded group">
              <div className="flex items-center gap-2">
                <span className="text-yellow-500 text-xs font-mono">PK</span>
                <span className="text-zinc-300 font-medium">id</span>
              </div>
              <span className="text-zinc-500 text-[10px] uppercase tracking-wider">bigint</span>
              
              {/* PK Handle - Source only */}
              <Handle
                type="source"
                position={Position.Right}
                id={`${data.id}-pk`}
                className="w-2 h-2 !bg-yellow-500 !border-zinc-900 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ right: -6 }}
              />
            </div>

            {data.columns.map((col) => (
              <div
                key={col.id}
                className="relative flex justify-between items-center text-sm p-1 px-2 hover:bg-zinc-800 rounded group"
              >
                {/* Target Handle (Left) */}
                <Handle
                  type="target"
                  position={Position.Left}
                  id={`${data.id}-${col.id}-target`}
                  className="w-2 h-2 !bg-emerald-500 !border-zinc-900 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ left: -6 }}
                />

                <div className="flex items-center gap-2">
                  <span className="text-zinc-600 text-xs w-4"></span>
                  <span className="text-zinc-300">{col.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-zinc-500 text-[10px] uppercase tracking-wider">{col.type}</span>
                  {col.nullable && (
                    <span className="text-zinc-500 text-[9px] border border-zinc-700 px-1 rounded bg-zinc-800/50">NULL</span>
                  )}
                </div>

                {/* Source Handle (Right) */}
                <Handle
                  type="source"
                  position={Position.Right}
                  id={`${data.id}-${col.id}-source`}
                  className="w-2 h-2 !bg-blue-500 !border-zinc-900 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ right: -6 }}
                />
              </div>
            ))}

            {/* Timestamps */}
            <div className="flex justify-between items-center text-sm p-1 px-2 hover:bg-zinc-800 rounded opacity-50">
              <div className="flex items-center gap-2">
                <span className="text-zinc-600 text-xs w-4"></span>
                <span className="text-zinc-300">created_at</span>
              </div>
              <span className="text-zinc-500 text-[10px] uppercase">timestamp</span>
            </div>
            <div className="flex justify-between items-center text-sm p-1 px-2 hover:bg-zinc-800 rounded opacity-50">
              <div className="flex items-center gap-2">
                <span className="text-zinc-600 text-xs w-4"></span>
                <span className="text-zinc-300">updated_at</span>
              </div>
              <span className="text-zinc-500 text-[10px] uppercase">timestamp</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(TableNode);
