import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Copy, Trash2, BringToFront, SendToBack, MoreHorizontal,
  PaintBucket, Type, Bold, AlignCenter, AlignLeft, AlignRight,
  ArrowUp, ArrowDown, ArrowLeft, ArrowRight,
  Spline, ArrowRightFromLine, Minus,
} from 'lucide-react';
import { useEditorStore } from '@/store/editorStore';
import { useUIStore } from '@/store/uiStore';
import { cn } from '@/lib/utils';

export default function FloatingToolbar() {
  const {
    selectedNodeIds, selectedEdgeIds, nodes, edges,
    updateNodeStyle, deleteNodes, deleteEdges,
    copy, duplicate,
  } = useEditorStore();
  const { rightPanelOpen, setRightPanelTab, toggleRightPanel } = useUIStore();
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const hasSelection = selectedNodeIds.length > 0 || selectedEdgeIds.length > 0;

  // Calculate screen position from canvas coordinates (accounting for zoom/pan)
  useEffect(() => {
    if (!hasSelection) return;
    const nodeId = selectedNodeIds[0];
    const node = nodes.find((n) => n.id === nodeId);
    if (node) {
      const flowEl = document.querySelector('.react-flow');
      if (!flowEl) return;
      const rect = flowEl.getBoundingClientRect();
      const vp = useEditorStore.getState().viewport;
      const sx = node.position.x * vp.zoom + vp.x + rect.left;
      const sy = node.position.y * vp.zoom + vp.y + rect.top;
      setPosition({
        x: sx + ((node.width || 120) * vp.zoom) / 2,
        y: sy - 50,
      });
    }
  }, [selectedNodeIds, nodes, hasSelection]);

  if (!hasSelection) return null;

  const selectedNode = selectedNodeIds.length === 1 ? nodes.find((n) => n.id === selectedNodeIds[0]) : null;
  const style = selectedNode?.data?.style || {};
  const edge = selectedEdgeIds.length === 1 ? edges.find((e) => e.id === selectedEdgeIds[0]) : null;

  const fontSize = style.fontSize || 14;
  const fontColor = style.fontColor || '#cccccc';
  const fill = style.fill || '#2d2d30';
  const stroke = style.stroke || '#5a5a5a';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 5 }}
        transition={{ duration: 0.15 }}
        className="fixed z-[80] flex items-center gap-0.5 px-1.5 py-1 bg-editor-surface border border-editor-border rounded-lg shadow-2xl"
        style={{ left: position.x, top: position.y, transform: 'translate(-50%, 0)' }}
      >
        {/* Fill color */}
        <div className="relative group">
          <button className="w-8 h-7 flex items-center justify-center rounded hover:bg-editor-hover">
            <div className="w-4 h-4 rounded border border-editor-border" style={{ background: fill }} />
          </button>
          <input
            type="color"
            value={fill}
            onChange={(e) => { if (selectedNode) updateNodeStyle(selectedNode.id, { fill: e.target.value }); }}
            className="absolute top-full left-0 mt-2 w-0 h-0 opacity-0 group-hover:w-auto group-hover:h-auto group-hover:opacity-100"
          />
        </div>

        {/* Stroke color */}
        <div className="relative group">
          <button className="w-8 h-7 flex items-center justify-center rounded hover:bg-editor-hover">
            <div className="w-4 h-4 rounded-full border-2" style={{ borderColor: stroke, background: 'transparent' }} />
          </button>
          <input
            type="color"
            value={stroke}
            onChange={(e) => { if (selectedNode) updateNodeStyle(selectedNode.id, { stroke: e.target.value }); }}
            className="absolute top-full left-0 mt-2 w-0 h-0 opacity-0 group-hover:w-auto group-hover:h-auto group-hover:opacity-100"
          />
        </div>

        <div className="w-px h-5 bg-editor-border mx-0.5" />

        {/* Font size */}
        <div className="flex items-center gap-0.5">
          <button
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-editor-hover text-xs text-editor-text"
            onClick={() => { if (selectedNode) updateNodeStyle(selectedNode.id, { fontSize: Math.max(8, fontSize - 2) }); }}
          >A-</button>
          <span className="text-[10px] text-editor-textMuted w-7 text-center">{fontSize}</span>
          <button
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-editor-hover text-xs text-editor-text"
            onClick={() => { if (selectedNode) updateNodeStyle(selectedNode.id, { fontSize: Math.min(48, fontSize + 2) }); }}
          >A+</button>
        </div>

        {/* Bold */}
        <button
          className={cn('w-8 h-7 flex items-center justify-center rounded hover:bg-editor-hover text-editor-text',
            style.fontWeight === 'bold' && 'bg-editor-active')}
          onClick={() => { if (selectedNode) updateNodeStyle(selectedNode.id, { fontWeight: style.fontWeight === 'bold' ? 'normal' : 'bold' }); }}
        >
          <Bold size={14} />
        </button>

        {/* Text align */}
        <div className="flex items-center gap-0">
          {(['left', 'center', 'right'] as const).map((align) => (
            <button
              key={align}
              className={cn('w-7 h-7 flex items-center justify-center rounded hover:bg-editor-hover text-editor-textMuted',
                (style.textAlign || 'center') === align && 'text-editor-accent')}
              onClick={() => { if (selectedNode) updateNodeStyle(selectedNode.id, { textAlign: align }); }}
            >
              {align === 'left' ? <AlignLeft size={14} /> : align === 'center' ? <AlignCenter size={14} /> : <AlignRight size={14} />}
            </button>
          ))}
        </div>

        <div className="w-px h-5 bg-editor-border mx-0.5" />

        {/* Z-order */}
        <button
          className="w-8 h-7 flex items-center justify-center rounded hover:bg-editor-hover text-editor-textMuted"
          onClick={() => {
            if (selectedNode) {
              const maxZ = Math.max(...nodes.map((n) => n.zIndex || 0));
              updateNodeStyle(selectedNode.id, { /* not right, use editorStore */ });
              useEditorStore.getState().updateNode(selectedNode.id, { zIndex: maxZ + 1 });
            }
          }}
          title="置于顶层"
        >
          <BringToFront size={14} />
        </button>
        <button
          className="w-8 h-7 flex items-center justify-center rounded hover:bg-editor-hover text-editor-textMuted"
          onClick={() => {
            if (selectedNode) {
              const minZ = Math.min(...nodes.map((n) => n.zIndex || 0));
              useEditorStore.getState().updateNode(selectedNode.id, { zIndex: minZ - 1 });
            }
          }}
          title="置于底层"
        >
          <SendToBack size={14} />
        </button>

        <div className="w-px h-5 bg-editor-border mx-0.5" />

        {/* Edge-specific controls (only when edge selected and no node selected) */}
        {edge && !selectedNode && (
          <>
            {/* Edge type quick switch */}
            <button
              className="w-8 h-7 flex items-center justify-center rounded hover:bg-editor-hover text-editor-textMuted"
              onClick={() => {
                const types: Array<'bezier' | 'orthogonal' | 'straight' | 'step' | 'smooth'> = ['bezier', 'orthogonal', 'straight', 'step', 'smooth'];
                const idx = types.indexOf((edge.type as any) || 'bezier');
                const next = types[(idx + 1) % types.length];
                useEditorStore.getState().updateEdge(edge.id, { type: next });
              }}
              title={`连线类型: ${edge.type || 'bezier'} (点击切换)`}
            >
              {edge.type === 'orthogonal' ? <ArrowRightFromLine size={14} /> :
               edge.type === 'straight' ? <Minus size={14} /> :
               <Spline size={14} />}
            </button>

            {/* Edge color */}
            <div className="relative group">
              <button className="w-8 h-7 flex items-center justify-center rounded hover:bg-editor-hover">
                <div className="w-4 h-0.5 rounded" style={{ background: edge.style?.stroke || '#888' }} />
              </button>
              <input
                type="color"
                value={edge.style?.stroke || '#888'}
                onChange={(e) => useEditorStore.getState().updateEdgeStyle(edge.id, { stroke: e.target.value })}
                className="absolute top-full left-0 mt-2 w-0 h-0 opacity-0 group-hover:w-auto group-hover:h-auto group-hover:opacity-100"
              />
            </div>

            {/* Arrow toggle */}
            <button
              className="w-8 h-7 flex items-center justify-center rounded hover:bg-editor-hover text-editor-textMuted"
              onClick={() => {
                const arrows: Array<'none' | 'arrow' | 'arrowClosed'> = ['none', 'arrow', 'arrowClosed'];
                const cur = (edge.style?.arrowEnd as any) || 'arrow';
                const idx = arrows.indexOf(cur);
                useEditorStore.getState().updateEdgeStyle(edge.id, { arrowEnd: arrows[(idx + 1) % arrows.length] });
              }}
              title={`箭头: ${edge.style?.arrowEnd || 'arrow'}`}
            >
              <ArrowRight size={14} />
            </button>

            <div className="w-px h-5 bg-editor-border mx-0.5" />
          </>
        )}

        {/* Copy & Delete */}
        {selectedNode && (
          <button
            className="w-8 h-7 flex items-center justify-center rounded hover:bg-editor-hover text-editor-textMuted"
            onClick={() => { copy(); duplicate(); }}
            title="复制"
          >
            <Copy size={14} />
          </button>
        )}
        <button
          className="w-8 h-7 flex items-center justify-center rounded hover:bg-red-900/30 text-red-400"
          onClick={() => {
            if (selectedNodeIds.length > 0) deleteNodes(selectedNodeIds);
            if (selectedEdgeIds.length > 0) deleteEdges(selectedEdgeIds);
          }}
          title="删除"
        >
          <Trash2 size={14} />
        </button>

        <div className="w-px h-5 bg-editor-border mx-0.5" />

        {/* More → opens right panel */}
        <button
          className={cn('w-8 h-7 flex items-center justify-center rounded hover:bg-editor-hover text-editor-textMuted',
            rightPanelOpen && 'bg-editor-active text-editor-accent')}
          onClick={() => {
            if (!rightPanelOpen) {
              setRightPanelTab('style');
              toggleRightPanel();
            } else {
              toggleRightPanel();
            }
          }}
          title="更多属性"
        >
          <MoreHorizontal size={14} />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
