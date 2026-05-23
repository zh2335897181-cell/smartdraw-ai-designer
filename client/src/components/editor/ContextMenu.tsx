import React, { useEffect, useRef } from 'react';
import { Copy, Trash2, BringToFront, SendToBack, Lock, EyeOff, Group, Ungroup } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { useEditorStore } from '@/store/editorStore';

export default function ContextMenu() {
  const { contextMenu, closeContextMenu } = useUIStore();
  const { copy, cut, duplicate, deleteNodes, deleteEdges, updateNode, selectedNodeIds, selectedEdgeIds, nodes } = useEditorStore();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!contextMenu) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        closeContextMenu();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [contextMenu, closeContextMenu]);

  useEffect(() => {
    const handler = () => closeContextMenu();
    window.addEventListener('scroll', handler, true);
    return () => window.removeEventListener('scroll', handler, true);
  }, [closeContextMenu]);

  if (!contextMenu) return null;

  const items: { label: string; icon: React.ReactNode; action: () => void; danger?: boolean }[] = [];

  if (contextMenu.type === 'node') {
    items.push(
      { label: '复制', icon: <Copy size={14} />, action: () => { copy(); closeContextMenu(); } },
      { label: '复制选中', icon: <Copy size={14} />, action: () => { duplicate(); closeContextMenu(); } },
      { label: '置于顶层', icon: <BringToFront size={14} />, action: () => {
        const maxZ = Math.max(...nodes.map((n) => n.zIndex || 0));
        updateNode(contextMenu.targetId!, { zIndex: maxZ + 1 });
        closeContextMenu();
      }},
      { label: '置于底层', icon: <SendToBack size={14} />, action: () => {
        const minZ = Math.min(...nodes.map((n) => n.zIndex || 0));
        updateNode(contextMenu.targetId!, { zIndex: minZ - 1 });
        closeContextMenu();
      }},
      { label: '锁定', icon: <Lock size={14} />, action: () => {
        updateNode(contextMenu.targetId!, { draggable: false });
        closeContextMenu();
      }},
      { label: '删除', icon: <Trash2 size={14} />, action: () => { deleteNodes([contextMenu.targetId!]); closeContextMenu(); }, danger: true },
    );
  } else if (contextMenu.type === 'edge') {
    items.push(
      { label: '删除连线', icon: <Trash2 size={14} />, action: () => { deleteEdges([contextMenu.targetId!]); closeContextMenu(); }, danger: true },
    );
  } else {
    items.push(
      { label: '粘贴', icon: <Copy size={14} />, action: () => { useEditorStore.getState().paste(); closeContextMenu(); } },
    );
  }

  // Position the menu within viewport bounds
  const x = Math.min(contextMenu.x, window.innerWidth - 200);
  const y = Math.min(contextMenu.y, window.innerHeight - items.length * 32 - 20);

  return (
    <div
      ref={ref}
      className="fixed z-[100] w-44 bg-editor-surface border border-editor-border rounded-md shadow-xl py-1"
      style={{ left: x, top: y }}
    >
      {items.map((item, i) => (
        <button
          key={i}
          className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-editor-hover ${item.danger ? 'text-red-400' : 'text-editor-text'}`}
          onClick={item.action}
        >
          {item.icon}
          {item.label}
        </button>
      ))}
    </div>
  );
}
