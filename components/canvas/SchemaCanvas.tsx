'use client';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  Connection,
  Edge,
  Node,
  useNodesState,
  useEdgesState,
  NodeChange,
  applyNodeChanges,
  BackgroundVariant,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useSchemaStore, Relationship } from '../../store/useSchemaStore';
import TableNode from './TableNode';
import ContextMenu from './ContextMenu';
import JsonImportModal from '../modals/JsonImportModal';

const initialEdges: Edge[] = [];

export default function SchemaCanvas() {
  const { tables, relationships, updateTablePosition, addRelationship, removeTable } = useSchemaStore();
  
  // We manage nodes in local state for performance, but sync from store
  const [nodes, setNodes] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; type: 'node' | 'canvas'; targetId?: string } | null>(null);
  const [showJsonModal, setShowJsonModal] = useState(false);

  // Define custom node types
  const nodeTypes = useMemo(() => ({ table: TableNode }), []);

  // Sync store tables to ReactFlow nodes
  useEffect(() => {
    const newNodes: Node[] = tables.map((table) => ({
      id: table.id,
      type: 'table',
      position: table.position || { x: 0, y: 0 }, // Default position if missing
      data: table, // Pass the whole table object as data
    }));
    setNodes(newNodes);
  }, [tables, setNodes]);

  // Sync relationships to ReactFlow edges
  useEffect(() => {
    const newEdges: Edge[] = relationships.map((rel) => ({
      id: rel.id,
      source: rel.sourceTableId,
      sourceHandle: `${rel.sourceTableId}-${rel.sourceColumnId}-source`,
      target: rel.targetTableId,
      targetHandle: `${rel.targetTableId}-${rel.targetColumnId}-target`,
      animated: true,
      style: { stroke: '#10b981', strokeWidth: 2 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#10b981',
      },
    }));
    setEdges(newEdges);
  }, [relationships, setEdges]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      // 1. Update local state immediately for smooth dragging
      setNodes((nds) => applyNodeChanges(changes, nds));

      // 2. Persist position changes to store
      changes.forEach((change) => {
        if (change.type === 'position' && change.position && change.dragging === false) {
           updateTablePosition(change.id, change.position);
        }
      });
    },
    [setNodes, updateTablePosition]
  );
  
  // Handle drag end specifically to ensure final position is saved
  const onNodeDragStop = useCallback((event: React.MouseEvent, node: Node) => {
      updateTablePosition(node.id, node.position);
  }, [updateTablePosition]);

  const onConnect = useCallback(
    (params: Connection) => {
      if (!params.source || !params.target || !params.sourceHandle || !params.targetHandle) return;

      // Parse IDs from handles: "tableId-columnId-source"
      const sourceParts = params.sourceHandle.split('-');
      const targetParts = params.targetHandle.split('-');

      // Basic validation
      if (sourceParts.length < 3 || targetParts.length < 3) return;

      const sourceTableId = sourceParts[0];
      const sourceColumnId = sourceParts[1];
      const targetTableId = targetParts[0];
      const targetColumnId = targetParts[1];

      // Create relationship in store
      const newRelationship: Relationship = {
        id: `rel-${Date.now()}`,
        sourceTableId,
        sourceColumnId,
        targetTableId,
        targetColumnId,
      };

      addRelationship(newRelationship);
    },
    [addRelationship]
  );

  const onContextMenu = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      setContextMenu({
        x: event.clientX,
        y: event.clientY,
        type: 'canvas',
      });
    },
    []
  );

  const onNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: Node) => {
      event.preventDefault();
      event.stopPropagation(); // Prevent canvas context menu
      setContextMenu({
        x: event.clientX,
        y: event.clientY,
        type: 'node',
        targetId: node.id,
      });
    },
    []
  );

  const onPaneClick = useCallback(() => setContextMenu(null), []);

  return (
    <div style={{ height: '100%', width: '100%' }} className="bg-zinc-950 relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDragStop={onNodeDragStop}
        onConnect={onConnect}
        onContextMenu={onContextMenu}
        onNodeContextMenu={onNodeContextMenu}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        className="bg-zinc-950"
      >
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} color="#3f3f46" />
        <Controls className="bg-zinc-800 border-zinc-700 fill-white text-white" />
      </ReactFlow>

      {contextMenu && (
        <div 
            style={{ position: 'fixed', top: contextMenu.y, left: contextMenu.x, zIndex: 1000 }}
            onClick={(e) => e.stopPropagation()}
        >
            <ContextMenu
                x={0} // Relative to the fixed container
                y={0}
                type={contextMenu.type}
                onClose={() => setContextMenu(null)}
                onDelete={() => {
                    if (contextMenu.targetId) removeTable(contextMenu.targetId);
                }}
                onJsonImport={() => setShowJsonModal(true)}
                // Duplicate logic could be added here
            />
        </div>
      )}

      {showJsonModal && (
        <JsonImportModal onClose={() => setShowJsonModal(false)} />
      )}
    </div>
  );
}
