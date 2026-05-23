import React, { useCallback, useRef, useMemo } from 'react';
import ReactFlow, {
  Background, Controls, MiniMap, BackgroundVariant,
  useNodesState, useEdgesState, addEdge, Connection,
  Node, Edge, ReactFlowProvider, ReactFlowInstance,
  SelectionMode,
} from 'reactflow';
import 'reactflow/dist/style.css';
import CustomNode from './CustomNode';
import CustomEdge from './CustomEdge';
import { useEditorStore } from '@/store/editorStore';
import { useUIStore } from '@/store/uiStore';
import { generateId } from '@/lib/utils';
import { SNAP_GRID } from '@/lib/constants';
import { SmartNode } from '@/lib/types';
import ContextMenu from './ContextMenu';

const nodeTypes = {
  rectangle: CustomNode,
  roundedRect: CustomNode,
  ellipse: CustomNode,
  diamond: CustomNode,
  triangle: CustomNode,
  parallelogram: CustomNode,
  cylinder: CustomNode,
  hexagon: CustomNode,
  cloud: CustomNode,
  document: CustomNode,
  process: CustomNode,
  decision: CustomNode,
  startEnd: CustomNode,
  data: CustomNode,
  database: CustomNode,
  umlClass: CustomNode,
  umlInterface: CustomNode,
  umlActor: CustomNode,
  erEntity: CustomNode,
  erAttribute: CustomNode,
  erRelationship: CustomNode,
  networkRouter: CustomNode,
  networkSwitch: CustomNode,
  networkServer: CustomNode,
  text: CustomNode,
  image: CustomNode,
};

const edgeTypes = {
  bezier: CustomEdge,
  straight: CustomEdge,
  step: CustomEdge,
  smooth: CustomEdge,
  orthogonal: CustomEdge,
};

function snapToGrid(val: number): number {
  return Math.round(val / SNAP_GRID) * SNAP_GRID;
}

export default function EditorCanvas() {
  const reactFlowRef = useRef<ReactFlowInstance | null>(null);
  const {
    nodes, edges, viewport, selectedNodeIds, selectedEdgeIds,
    setNodes, setEdges, setViewport, addNode, clearSelection,
    pushHistory, selectNode, snapEnabled,
  } = useEditorStore();
  const { openContextMenu, closeContextMenu, addRecentShape } = useUIStore();

  // Sync ReactFlow state with Zustand
  const rfNodes = useMemo(() => nodes.map((n) => ({
    id: n.id,
    type: n.type,
    position: n.position,
    data: { ...n.data, edgeType: n.type },
    width: n.width,
    height: n.height,
    zIndex: n.zIndex,
    selected: selectedNodeIds.includes(n.id),
    hidden: n.hidden,
    draggable: n.draggable !== false,
    style: { zIndex: n.zIndex },
  })), [nodes, selectedNodeIds]);

  const rfEdges = useMemo(() => edges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    type: e.type,
    sourceHandle: e.sourceHandle,
    targetHandle: e.targetHandle,
    data: { ...e.data, edgeType: e.type },
    style: e.style,
    animated: e.animated,
    selected: selectedEdgeIds.includes(e.id),
  })), [edges, selectedEdgeIds]);

  const onConnect = useCallback((connection: Connection) => {
    const newEdge = {
      id: generateId(),
      source: connection.source!,
      target: connection.target!,
      type: 'orthogonal' as const,
      sourceHandle: connection.sourceHandle || undefined,
      targetHandle: connection.targetHandle || undefined,
      data: {},
      style: { stroke: '#888', strokeWidth: 1.5, animated: false },
    };
    useEditorStore.setState((s: any) => ({ edges: [...s.edges, newEdge], isDirty: true }));
    pushHistory({ type: 'edge_add', data: newEdge, inverse: { id: newEdge.id }, timestamp: Date.now() });
  }, [pushHistory]);

  const onNodesChange = useCallback((changes: any) => {
    const s = useEditorStore.getState();
    let updated = [...s.nodes];
    const removedNodeIds: string[] = [];

    changes.forEach((change: any) => {
      if (change.type === 'position' && change.position) {
        updated = updated.map((n) => {
          if (n.id === change.id) {
            const x = snapEnabled ? snapToGrid(change.position.x) : change.position.x;
            const y = snapEnabled ? snapToGrid(change.position.y) : change.position.y;
            const prev = s.nodes.find((on) => on.id === change.id);
            if (prev && (prev.position.x !== x || prev.position.y !== y)) {
              pushHistory({ type: 'node_update', data: { id: change.id, position: { x, y } }, inverse: { id: change.id, position: prev.position }, timestamp: Date.now() });
            }
            return { ...n, position: { x, y } };
          }
          return n;
        });
      }
      if (change.type === 'remove') {
        const nodeToRemove = s.nodes.find((n) => n.id === change.id);
        if (nodeToRemove) {
          removedNodeIds.push(change.id);
          pushHistory({ type: 'node_delete', data: { id: change.id }, inverse: nodeToRemove, timestamp: Date.now() });
        }
        updated = updated.filter((n) => n.id !== change.id);
      }
      if (change.type === 'select') {
        if (change.selected && change.id && !s.selectedNodeIds.includes(change.id)) {
          selectNode(change.id, true);
        }
      }
    });

    // Clean up connected edges for removed nodes (properly via setState)
    if (removedNodeIds.length > 0) {
      useEditorStore.setState((st) => ({
        edges: st.edges.filter((e) => !removedNodeIds.includes(e.source) && !removedNodeIds.includes(e.target)),
        isDirty: true,
      }));
    }

    setNodes(updated);
    if (removedNodeIds.length > 0) useEditorStore.getState().clearSelection();
  }, [setNodes, snapEnabled, selectNode, pushHistory]);

  const onEdgesChange = useCallback((changes: any) => {
    const s = useEditorStore.getState();
    changes.forEach((change: any) => {
      if (change.type === 'remove') {
        const edge = s.edges.find((e) => e.id === change.id);
        if (edge) {
          useEditorStore.setState((st) => ({
            edges: st.edges.filter((e) => e.id !== change.id),
            isDirty: true,
          }));
          pushHistory({ type: 'edge_delete', data: { id: change.id }, inverse: edge, timestamp: Date.now() });
        }
      }
    });
  }, [pushHistory]);

  const onMoveEnd = useCallback(() => {}, []);

  const onNodeDragStop = useCallback((_event: any, node: Node) => {
    const original = useEditorStore.getState().nodes.find((n) => n.id === node.id);
    if (original && (original.position.x !== node.position.x || original.position.y !== node.position.y)) {
      useEditorStore.setState((s) => ({
        nodes: s.nodes.map((n) => n.id === node.id ? { ...n, position: node.position } : n),
        isDirty: true,
      }));
    }
  }, []);

  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    if (!reactFlowRef.current) return;
    const shapeData = event.dataTransfer.getData('application/shape');
    if (!shapeData) return;
    const shape = JSON.parse(shapeData);
    const position = reactFlowRef.current.screenToFlowPosition({ x: event.clientX, y: event.clientY });
    const newNode: SmartNode = {
      id: generateId(),
      type: shape.nodeType,
      position: { x: snapEnabled ? snapToGrid(position.x) : position.x, y: snapEnabled ? snapToGrid(position.y) : position.y },
      data: {
        label: shape.defaultData.label,
        style: shape.defaultStyle,
      },
      width: shape.defaultStyle.width,
      height: shape.defaultStyle.height,
    };
    addNode(newNode);
    addRecentShape(shape.id);
    pushHistory({ type: 'node_add', data: newNode, inverse: { id: newNode.id }, timestamp: Date.now() });
  }, [addNode, addRecentShape, snapEnabled]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  }, []);

  const onPaneClick = useCallback(() => {
    clearSelection();
    closeContextMenu();
  }, [clearSelection, closeContextMenu]);

  const onNodeContextMenu = useCallback((event: React.MouseEvent, node: Node) => {
    event.preventDefault();
    openContextMenu({ x: event.clientX, y: event.clientY, type: 'node', targetId: node.id });
  }, [openContextMenu]);

  const onEdgeContextMenu = useCallback((event: React.MouseEvent, edge: Edge) => {
    event.preventDefault();
    openContextMenu({ x: event.clientX, y: event.clientY, type: 'edge', targetId: edge.id });
  }, [openContextMenu]);

  const onPaneContextMenu = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    openContextMenu({ x: event.clientX, y: event.clientY, type: 'canvas' });
  }, [openContextMenu]);

  const onInit = useCallback((instance: ReactFlowInstance) => {
    reactFlowRef.current = instance;
  }, []);

  const onMove = useCallback((_event: any, vp: any) => {
    setViewport(vp);
  }, [setViewport]);

  return (
    <div className="flex-1 relative" onContextMenu={(e) => e.preventDefault()}>
      <ReactFlowProvider>
        <ReactFlow
          nodes={rfNodes}
          edges={rfEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeDragStop={onNodeDragStop}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onPaneClick={onPaneClick}
          onNodeContextMenu={onNodeContextMenu}
          onEdgeContextMenu={onEdgeContextMenu}
          onPaneContextMenu={onPaneContextMenu}
          onInit={onInit}
          onMove={onMove}
          onMoveEnd={onMoveEnd}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          defaultViewport={viewport}
          minZoom={0.05}
          maxZoom={5}
          fitView={false}
          deleteKeyCode={['Delete', 'Backspace']}
          multiSelectionKeyCode="Shift"
          selectionMode={SelectionMode.Partial}
          selectionOnDrag
          panOnDrag={[1, 2]}
          panOnScroll={false}
          zoomOnScroll={true}
          zoomOnDoubleClick={false}
          snapToGrid={snapEnabled}
          snapGrid={[SNAP_GRID, SNAP_GRID]}
          className="bg-editor-bg"
          proOptions={{ hideAttribution: true }}
        >
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#444" />
          <Controls className="!bg-editor-surface !border-editor-border !rounded-md" />
          {useEditorStore((s) => s.showMiniMap) && (
            <MiniMap
              nodeColor="var(--editor-surface)"
              maskColor="rgba(0,0,0,0.6)"
              className="!bg-[var(--editor-bg)] !border-[var(--editor-border)]"
              style={{ borderRadius: 4 }}
            />
          )}
        </ReactFlow>
      </ReactFlowProvider>
      <ContextMenu />
    </div>
  );
}
