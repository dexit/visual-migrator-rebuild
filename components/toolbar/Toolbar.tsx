'use client';
import React, { useState } from 'react';
import { Download, Save } from 'lucide-react';
import { useSchemaStore } from '../../store/useSchemaStore';
import { generateMigration } from '../../lib/schema-generator';

export default function Toolbar() {
  const { tables, relationships } = useSchemaStore();
  const [showExport, setShowExport] = useState(false);
  const [exportContent, setExportContent] = useState('');

  const handleExport = () => {
    const migrations = tables.map((table) => generateMigration(table, relationships, tables)).join('\n\n// ---------------------------------------------------------\n\n');
    setExportContent(migrations);
    setShowExport(true);
  };

  return (
    <>
      <div className="flex items-center justify-between px-6 py-3 bg-zinc-900 text-white border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center font-bold text-lg">
            M
          </div>
          <h1 className="text-lg font-bold tracking-tight">Next.js Visual Migrator</h1>
        </div>
        
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm font-medium transition-colors text-zinc-300">
            <Save size={16} />
            Save Draft
          </button>
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-emerald-900/20"
          >
            <Download size={16} />
            Export Migrations
          </button>
        </div>
      </div>

      {/* Export Modal */}
      {showExport && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col">
            <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
              <h3 className="font-bold text-lg text-white">Generated Migrations</h3>
              <button 
                onClick={() => setShowExport(false)}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4 bg-zinc-950">
              <pre className="text-sm font-mono text-zinc-300 whitespace-pre-wrap">
                {exportContent}
              </pre>
            </div>
            <div className="p-4 border-t border-zinc-800 flex justify-end gap-3">
              <button 
                onClick={() => setShowExport(false)}
                className="px-4 py-2 text-zinc-300 hover:text-white"
              >
                Close
              </button>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(exportContent);
                  alert('Copied to clipboard!');
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white font-medium"
              >
                Copy to Clipboard
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
