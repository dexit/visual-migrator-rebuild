'use client';
import React from 'react';
import { Trash2, Copy, FileJson } from 'lucide-react';

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  onJsonImport?: () => void;
  type: 'node' | 'canvas';
}

export default function ContextMenu({ x, y, onClose, onDelete, onDuplicate, onJsonImport, type }: ContextMenuProps) {
  return (
    <div
      style={{ top: y, left: x }}
      className="absolute z-50 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl overflow-hidden min-w-[160px]"
      onClick={(e) => e.stopPropagation()}
    >
      {type === 'canvas' && (
        <button
          onClick={() => {
            onJsonImport?.();
            onClose();
          }}
          className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-700 hover:text-white flex items-center gap-2"
        >
          <FileJson size={14} />
          Import JSON
        </button>
      )}

      {type === 'node' && (
        <>
          <button
            onClick={() => {
              onDuplicate?.();
              onClose();
            }}
            className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-700 hover:text-white flex items-center gap-2"
          >
            <Copy size={14} />
            Duplicate
          </button>
          <div className="border-t border-zinc-700 my-1"></div>
          <button
            onClick={() => {
              onDelete?.();
              onClose();
            }}
            className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-900/20 hover:text-red-300 flex items-center gap-2"
          >
            <Trash2 size={14} />
            Delete
          </button>
        </>
      )}
    </div>
  );
}
