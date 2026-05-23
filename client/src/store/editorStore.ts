import { create } from 'zustand';
import {
  SmartNode, SmartEdge, Viewport, NodeStyle, EdgeStyle,
  NodeData, DiagramPage, Operation,
} from '@/lib/types';
import { generateId } from '@/lib/utils';
import { DEFAULT_VIEWPORT } from '@/lib/constants';

interface EditorState {
  // Canvas state
  nodes: SmartNode[];
  edges: SmartEdge[];
  viewport: Viewport;

  // Selection
  selectedNodeIds: string[];
  selectedEdgeIds: string[];

  // Pages
  pages: DiagramPage[];
  activePageId: string | null;

  // Diagram context
  diagramId: string | null;
  projectId: string | null;
  diagramName: string;

  // Clipboard
  clipboard: { nodes: SmartNode[]; edges: SmartEdge[] } | null;

  // History
  history: Operation[];
  historyIndex: number;

  // UI flags
  isDirty: boolean;
  isSaving: boolean;
  lastSavedAt: number | null;
  gridEnabled: boolean;
  snapEnabled: boolean;
  showMiniMap: boolean;
  showRulers: boolean;

  // Actions
  setDiagram: (id: string, projectId: string, name: string) => void;
  setNodes: (nodes: SmartNode[]) => void;
  setEdges: (edges: SmartEdge[]) => void;
  addNode: (node: SmartNode) => void;
  updateNode: (id: string, data: Partial<SmartNode>) => void;
  deleteNodes: (ids: string[]) => void;
  addEdge: (edge: SmartEdge) => void;
  updateEdge: (id: string, data: Partial<SmartEdge>) => void;
  deleteEdges: (ids: string[]) => void;
  setViewport: (viewport: Viewport) => void;

  // Selection
  selectNode: (id: string, multi?: boolean) => void;
  selectEdge: (id: string, multi?: boolean) => void;
  clearSelection: () => void;
  selectAll: () => void;

  // Clipboard
  copy: () => void;
  cut: () => void;
  paste: () => void;
  duplicate: () => void;

  // Node style
  updateNodeStyle: (id: string, style: Partial<NodeStyle>) => void;
  updateEdgeStyle: (id: string, style: Partial<EdgeStyle>) => void;

  // Pages
  setPages: (pages: DiagramPage[]) => void;
  setActivePage: (pageId: string) => void;
  addPage: (page: DiagramPage) => void;
  removePage: (pageId: string) => void;

  // History
  pushHistory: (op: Operation) => void;
  undo: () => void;
  redo: () => void;

  // Layout
  autoLayout: (direction?: 'TB' | 'LR' | 'RL' | 'BT') => void;
  generateErFromSQL: (tables: {
    name: string;
    columns: { name: string; type: string; isPrimaryKey: boolean; isForeignKey: boolean; referencesTable?: string; referencesColumn?: string }[];
    foreignKeys: { column: string; referencesTable: string; referencesColumn: string }[];
  }[]) => void;

  // Bulk load
  loadFromServer: (nodes: SmartNode[], edges: SmartEdge[], viewport: Viewport) => void;
  reset: () => void;

  setDirty: (dirty: boolean) => void;
}

const initialViewport = DEFAULT_VIEWPORT;

export const useEditorStore = create<EditorState>((set, get) => ({
  nodes: [],
  edges: [],
  viewport: initialViewport,
  selectedNodeIds: [],
  selectedEdgeIds: [],
  pages: [],
  activePageId: null,
  diagramId: null,
  projectId: null,
  diagramName: 'Untitled',
  clipboard: null,
  history: [],
  historyIndex: -1,
  isDirty: false,
  isSaving: false,
  lastSavedAt: null,
  gridEnabled: true,
  snapEnabled: true,
  showMiniMap: true,
  showRulers: false,

  setDiagram: (id, projectId, name) => set({ diagramId: id, projectId, diagramName: name }),

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),

  addNode: (node) => set((s) => ({ nodes: [...s.nodes, node], isDirty: true })),

  updateNode: (id, data) => set((s) => ({
    nodes: s.nodes.map((n) => (n.id === id ? { ...n, ...data, data: data.data ? { ...n.data, ...data.data } : n.data } : n)),
    isDirty: true,
  })),

  deleteNodes: (ids) => set((s) => ({
    nodes: s.nodes.filter((n) => !ids.includes(n.id)),
    edges: s.edges.filter((e) => !ids.includes(e.source) && !ids.includes(e.target)),
    selectedNodeIds: s.selectedNodeIds.filter((id) => !ids.includes(id)),
    isDirty: true,
  })),

  addEdge: (edge) => set((s) => ({ edges: [...s.edges, edge], isDirty: true })),

  updateEdge: (id, data) => set((s) => ({
    edges: s.edges.map((e) => (e.id === id ? { ...e, ...data } : e)),
    isDirty: true,
  })),

  deleteEdges: (ids) => set((s) => ({
    edges: s.edges.filter((e) => !ids.includes(e.id)),
    selectedEdgeIds: s.selectedEdgeIds.filter((id) => !ids.includes(id)),
    isDirty: true,
  })),

  setViewport: (viewport) => set({ viewport }),

  selectNode: (id, multi) => set((s) => {
    if (multi) {
      const isSelected = s.selectedNodeIds.includes(id);
      return {
        selectedNodeIds: isSelected ? s.selectedNodeIds.filter((i) => i !== id) : [...s.selectedNodeIds, id],
        selectedEdgeIds: [],
      };
    }
    return { selectedNodeIds: [id], selectedEdgeIds: [] };
  }),

  selectEdge: (id, multi) => set((s) => {
    if (multi) {
      const isSelected = s.selectedEdgeIds.includes(id);
      return {
        selectedEdgeIds: isSelected ? s.selectedEdgeIds.filter((i) => i !== id) : [...s.selectedEdgeIds, id],
        selectedNodeIds: [],
      };
    }
    return { selectedEdgeIds: [id], selectedNodeIds: [] };
  }),

  clearSelection: () => set({ selectedNodeIds: [], selectedEdgeIds: [] }),

  selectAll: () => set((s) => ({ selectedNodeIds: s.nodes.map((n) => n.id), selectedEdgeIds: s.edges.map((e) => e.id) })),

  copy: () => {
    const { nodes, selectedNodeIds, selectedEdgeIds } = get();
    const selectedNodes = nodes.filter((n) => selectedNodeIds.includes(n.id));
    const edgesForNodes = get().edges.filter(
      (e) => selectedNodeIds.includes(e.source) || selectedNodeIds.includes(e.target)
    );
    set({ clipboard: { nodes: JSON.parse(JSON.stringify(selectedNodes)), edges: JSON.parse(JSON.stringify(edgesForNodes)) } });
  },

  cut: () => {
    get().copy();
    get().deleteNodes(get().selectedNodeIds);
  },

  paste: () => {
    const { clipboard } = get();
    if (!clipboard || (clipboard.nodes.length === 0 && clipboard.edges.length === 0)) return;
    const offset = 30;
    const idMap = new Map<string, string>();
    const newNodes = clipboard.nodes.map((n) => {
      const newId = generateId();
      idMap.set(n.id, newId);
      return { ...n, id: newId, position: { x: n.position.x + offset, y: n.position.y + offset }, selected: false };
    });
    const newEdges = clipboard.edges.map((e) => ({
      ...e,
      id: generateId(),
      source: idMap.get(e.source) || e.source,
      target: idMap.get(e.target) || e.target,
    }));
    set((s) => ({
      nodes: [...s.nodes, ...newNodes],
      edges: [...s.edges, ...newEdges],
      selectedNodeIds: newNodes.map((n) => n.id),
      isDirty: true,
    }));
  },

  duplicate: () => {
    get().copy();
    get().paste();
  },

  updateNodeStyle: (id, style) => {
    set((s) => ({
      nodes: s.nodes.map((n) =>
        n.id === id
          ? { ...n, data: { ...n.data, style: { ...n.data.style, ...style } } }
          : n
      ),
      isDirty: true,
    }));
  },

  updateEdgeStyle: (id, style) => {
    set((s) => ({
      edges: s.edges.map((e) =>
        e.id === id
          ? { ...e, style: { ...e.style, ...style } }
          : e
      ),
      isDirty: true,
    }));
  },

  setPages: (pages) => set({ pages }),
  setActivePage: (pageId) => set({ activePageId: pageId }),
  addPage: (page) => set((s) => ({ pages: [...s.pages, page] })),
  removePage: (pageId) => set((s) => ({ pages: s.pages.filter((p) => p.id !== pageId) })),

  pushHistory: (op) => set((s) => ({
    history: [...s.history.slice(0, s.historyIndex + 1), op],
    historyIndex: s.historyIndex + 1,
  })),

  undo: () => {
    const { historyIndex, history } = get();
    if (historyIndex < 0) return;
    const op = history[historyIndex];
    // Apply inverse
    if (op.inverse) {
      const state = get();
      switch (op.type) {
        case 'node_add':
          set({ nodes: state.nodes.filter((n) => n.id !== op.inverse.id) });
          break;
        case 'node_delete':
          set({ nodes: [...state.nodes, op.inverse] });
          break;
        case 'node_update':
          set({
            nodes: state.nodes.map((n) => (n.id === op.inverse.id ? { ...n, ...op.inverse } : n)),
          });
          break;
        case 'edge_add':
          set({ edges: state.edges.filter((e) => e.id !== op.inverse.id) });
          break;
        case 'edge_delete':
          set({ edges: [...state.edges, op.inverse] });
          break;
      }
    }
    set({ historyIndex: historyIndex - 1, isDirty: true });
  },

  redo: () => {
    const { historyIndex, history } = get();
    if (historyIndex >= history.length - 1) return;
    const op = history[historyIndex + 1];
    if (op.data) {
      const state = get();
      switch (op.type) {
        case 'node_add':
          set({ nodes: [...state.nodes, op.data] });
          break;
        case 'node_delete':
          set({ nodes: state.nodes.filter((n) => n.id !== op.data.id) });
          break;
        case 'node_update':
          set({
            nodes: state.nodes.map((n) => (n.id === op.data.id ? { ...n, ...op.data } : n)),
          });
          break;
        case 'edge_add':
          set({ edges: [...state.edges, op.data] });
          break;
        case 'edge_delete':
          set({ edges: state.edges.filter((e) => e.id !== op.data.id) });
          break;
      }
    }
    set({ historyIndex: historyIndex + 1, isDirty: true });
  },

  autoLayout: (direction: 'TB' | 'LR' | 'RL' | 'BT' = 'TB') => {
    const { nodes, edges } = get();
    if (nodes.length === 0) return;

    const nodeMap = new Map(nodes.map((n) => [n.id, n]));
    const inDegree = new Map<string, number>();
    const outEdges = new Map<string, string[]>();
    nodes.forEach((n) => { inDegree.set(n.id, 0); outEdges.set(n.id, []); });
    edges.forEach((e) => {
      inDegree.set(e.target, (inDegree.get(e.target) || 0) + 1);
      const out = outEdges.get(e.source) || [];
      out.push(e.target);
      outEdges.set(e.source, out);
    });

    // Topological sort with cycle handling
    const queue: string[] = [];
    inDegree.forEach((deg, id) => { if (deg === 0) queue.push(id); });

    // If no nodes with indegree 0 (all in cycles), pick any
    if (queue.length === 0 && nodes.length > 0) {
      queue.push(nodes[0].id);
      inDegree.set(nodes[0].id, 0);
    }

    const levels: string[][] = [];
    const placed = new Set<string>();
    let maxIter = nodes.length * 2;

    while (placed.size < nodes.length && maxIter-- > 0) {
      // Add any new zero-degree nodes
      inDegree.forEach((deg, id) => { if (deg === 0 && !placed.has(id) && !queue.includes(id)) queue.push(id); });
      if (queue.length === 0) {
        // Cycle detected: pick the unplaced node with lowest indegree
        let best: string | null = null;
        let bestDeg = Infinity;
        inDegree.forEach((deg, id) => {
          if (!placed.has(id) && deg < bestDeg) { bestDeg = deg; best = id; }
        });
        if (best) { inDegree.set(best, 0); queue.push(best); continue; }
        break;
      }

      const level: string[] = [];
      const size = queue.length;
      for (let i = 0; i < size; i++) {
        const id = queue.shift()!;
        if (placed.has(id)) continue;
        placed.add(id);
        level.push(id);
        (outEdges.get(id) || []).forEach((child) => {
          const cur = inDegree.get(child) || 0;
          if (cur > 0) inDegree.set(child, cur - 1);
        });
      }
      if (level.length > 0) levels.push(level);
    }

    // Handle disconnected nodes (not placed)
    const remaining = nodes.filter((n) => !placed.has(n.id));
    if (remaining.length > 0) {
      levels.push(remaining.map((n) => n.id));
    }

    const primarySpacing = 140;
    const crossSpacing = 180;
    const updatedNodes = nodes.map((n) => ({ ...n }));
    const isVertical = direction === 'TB' || direction === 'BT';

    levels.forEach((level, li) => {
      const count = level.length;
      level.forEach((nodeId, ni) => {
        const node = updatedNodes.find((n) => n.id === nodeId);
        if (!node) return;
        const crossOffset = ni - (count - 1) / 2;
        if (isVertical) {
          const y = direction === 'TB' ? 100 + li * primarySpacing : 100 + (levels.length - 1 - li) * primarySpacing;
          node.position = { x: 400 + crossOffset * crossSpacing, y };
        } else {
          const x = direction === 'LR' ? 100 + li * primarySpacing : 100 + (levels.length - 1 - li) * primarySpacing;
          node.position = { x, y: 300 + crossOffset * crossSpacing };
        }
      });
    });

    set({ nodes: updatedNodes, isDirty: true });
  },

  // SQL → ER Diagram generation
  generateErFromSQL: (tables: { name: string; columns: { name: string; type: string; isPrimaryKey: boolean; isForeignKey: boolean; referencesTable?: string; referencesColumn?: string }[]; foreignKeys: { column: string; referencesTable: string; referencesColumn: string }[] }[]) => {
    if (tables.length === 0) return;

    const cols = 3;
    const spacingX = 240;
    const spacingY = 180;
    const startX = 50;
    const startY = 50;

    const newNodes: SmartNode[] = [];
    const newEdges: SmartEdge[] = [];
    const tableIdMap = new Map<string, string>();

    tables.forEach((table, i) => {
      const nodeId = generateId();
      tableIdMap.set(table.name, nodeId);

      const row = Math.floor(i / cols);
      const col = i % cols;

      // Build label: table name + columns
      const colLines = table.columns.map((c) => {
        const pk = c.isPrimaryKey ? ' 🔑' : '';
        const fk = c.isForeignKey ? ' 🔗' : '';
        return `${c.name}: ${c.type}${pk}${fk}`;
      });
      const label = [`【${table.name}】`, ...colLines].join('\n');

      const colCount = table.columns.length;
      const nodeHeight = Math.max(80, 28 + colCount * 22);

      newNodes.push({
        id: nodeId,
        type: 'umlClass',
        position: { x: startX + col * spacingX, y: startY + row * spacingY },
        width: 200,
        height: nodeHeight,
        data: {
          label,
          style: {
            fill: 'var(--editor-surface)',
            stroke: '#4a90d9',
            strokeWidth: 2,
            width: 200,
            height: nodeHeight,
            fontSize: 12,
            fontFamily: 'Consolas, monospace',
            textAlign: 'left',
          },
        },
      });
    });

    // Generate edges from foreign keys
    tables.forEach((table) => {
      table.foreignKeys.forEach((fk) => {
        const sourceId = tableIdMap.get(table.name);
        const targetId = tableIdMap.get(fk.referencesTable);
        if (sourceId && targetId) {
          newEdges.push({
            id: generateId(),
            source: sourceId,
            target: targetId,
            type: 'bezier',
            data: { label: `${fk.column} → ${fk.referencesColumn}` },
            style: { stroke: '#d4a844', strokeWidth: 1.5, arrowEnd: 'arrow' },
          });
        }
      });
    });

    // Also detect implicit FK: column names like xxx_id
    tables.forEach((table) => {
      table.columns.forEach((col) => {
        if (col.isForeignKey && col.referencesTable) {
          // Already handled above
        } else if (col.name.endsWith('_id') && !col.isForeignKey) {
          const refTable = col.name.replace(/_id$/, '');
          const targetId = tableIdMap.get(refTable);
          const sourceId = tableIdMap.get(table.name);
          // Only if the referenced table exists and no explicit FK edge exists
          if (targetId && sourceId && table.name !== refTable) {
            const exists = newEdges.some((e) =>
              e.source === sourceId && e.target === targetId
            );
            if (!exists) {
              newEdges.push({
                id: generateId(),
                source: sourceId,
                target: targetId,
                type: 'bezier',
                data: { label: `${col.name}` },
                style: { stroke: '#888', strokeWidth: 1, strokeDasharray: '4,3' },
              });
            }
          }
        }
      });
    });

    set((s) => ({
      nodes: [...s.nodes, ...newNodes],
      edges: [...s.edges, ...newEdges],
      isDirty: true,
    }));
  },

  loadFromServer: (nodes, edges, viewport) => set({
    nodes, edges, viewport, isDirty: false, lastSavedAt: Date.now(),
  }),

  reset: () => set({
    nodes: [], edges: [], viewport: initialViewport,
    selectedNodeIds: [], selectedEdgeIds: [],
    pages: [], activePageId: null,
    diagramId: null, projectId: null, diagramName: 'Untitled',
    clipboard: null, history: [], historyIndex: -1,
    isDirty: false, lastSavedAt: null,
  }),

  setDirty: (dirty) => set({ isDirty: dirty }),
}));
