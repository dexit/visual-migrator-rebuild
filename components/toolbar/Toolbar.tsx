'use client';
import React, { useState } from 'react';
import { Download, Save, FileCode, Database, Inbox } from 'lucide-react';
import { useSchemaStore } from '../../store/useSchemaStore';
import { generateMigration } from '../../lib/schema-generator';
import { generateModel } from '../../lib/model-generator';
import { generateIngestor, generateJob } from '../../lib/ingestor-generator';

export default function Toolbar() {
  const { tables, relationships } = useSchemaStore();
  const [showExport, setShowExport] = useState(false);
  const [exportContent, setExportContent] = useState('');
  const [exportType, setExportType] = useState<'migrations' | 'models' | 'ingestor'>('migrations');

  const handleExport = (type: 'migrations' | 'models' | 'ingestor') => {
    setExportType(type);
    let content = '';
    
    if (type === 'migrations') {
      content = tables.map((table) => generateMigration(table, relationships, tables)).join('\n\n// ---------------------------------------------------------\n\n');
    } else if (type === 'models') {
      content = tables.map((table) => generateModel(table, relationships, tables)).join('\n\n// ---------------------------------------------------------\n\n');
    } else {
      content = tables.map((table) => `// --- ${table.name} Ingestor ---\n` + generateIngestor(table) + '\n\n' + generateJob(table)).join('\n\n');
    }
    
    setExportContent(content);
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
          <div className="flex bg-zinc-800 rounded-lg p-1">
            <button 
                onClick={() => handleExport('migrations')}
                className="flex items-center gap-2 px-3 py-1.5 hover:bg-zinc-700 rounded-md text-sm font-medium transition-colors text-zinc-300"
                title="Export Migrations"
            >
                <Database size={16} />
                Migrations
            </button>
            <button 
                onClick={() => handleExport('models')}
                className="flex items-center gap-2 px-3 py-1.5 hover:bg-zinc-700 rounded-md text-sm font-medium transition-colors text-zinc-300"
                title="Export Models"
            >
                <FileCode size={16} />
                Models
            </button>
            <button 
                onClick={() => handleExport('ingestor')}
                className="flex items-center gap-2 px-3 py-1.5 hover:bg-zinc-700 rounded-md text-sm font-medium transition-colors text-zinc-300"
                title="Export Ingestor/Dispatcher"
            >
                <Inbox size={16} />
                Ingestor
            </button>
          </div>
        </div>
      </div>

      {/* Export Modal */}
      {showExport && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col">
            <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <h3 className="font-bold text-lg text-white">Generated {exportType === 'migrations' ? 'Migrations' : exportType === 'models' ? 'Models' : 'Ingestor/Dispatcher'}</h3>
                <div className="flex bg-zinc-950 rounded-lg p-1 border border-zinc-800">
                    <button
                        onClick={() => handleExport('migrations')}
                        className={`px-3 py-1 text-xs rounded ${exportType === 'migrations' ? 'bg-emerald-600 text-white' : 'text-zinc-400 hover:text-white'}`}
                    >
                        Migrations
                    </button>
                    <button
                        onClick={() => handleExport('models')}
                        className={`px-3 py-1 text-xs rounded ${exportType === 'models' ? 'bg-emerald-600 text-white' : 'text-zinc-400 hover:text-white'}`}
                    >
                        Models
                    </button>
                    <button
                        onClick={() => handleExport('ingestor')}
                        className={`px-3 py-1 text-xs rounded ${exportType === 'ingestor' ? 'bg-emerald-600 text-white' : 'text-zinc-400 hover:text-white'}`}
                    >
                        Ingestor
                    </button>
                </div>
              </div>
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
