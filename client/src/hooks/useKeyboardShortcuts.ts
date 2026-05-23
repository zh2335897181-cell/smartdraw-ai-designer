import { useEffect } from 'react';
import { useEditorStore } from '@/store/editorStore';

export function useKeyboardShortcuts() {
  const {
    deleteNodes, deleteEdges, selectedNodeIds, selectedEdgeIds,
    copy, cut, paste, duplicate, undo, redo, selectAll, clearSelection,
  } = useEditorStore();

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      const ctrl = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

      // Allow shortcuts in inputs for standard editing keys
      if (isInput && !['delete', 'backspace', 'escape'].includes(key) && !(ctrl && key === 'a')) return;

      if (ctrl && key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
        return;
      }
      if ((ctrl && key === 'y') || (ctrl && e.shiftKey && key === 'z')) {
        e.preventDefault();
        redo();
        return;
      }
      if (ctrl && key === 'c') {
        if (selectedNodeIds.length > 0 || selectedEdgeIds.length > 0) {
          e.preventDefault();
          copy();
        }
        return;
      }
      if (ctrl && key === 'x') {
        e.preventDefault();
        if (selectedNodeIds.length > 0) cut();
        return;
      }
      if (ctrl && key === 'v') {
        e.preventDefault();
        paste();
        return;
      }
      if (ctrl && key === 'd') {
        e.preventDefault();
        if (selectedNodeIds.length > 0) duplicate();
        return;
      }
      if (ctrl && key === 'a') {
        if (!isInput) {
          e.preventDefault();
          selectAll();
        }
        return;
      }
      if (key === 'delete' || key === 'backspace') {
        if (isInput) return;
        e.preventDefault();
        if (selectedNodeIds.length > 0) deleteNodes(selectedNodeIds);
        if (selectedEdgeIds.length > 0) deleteEdges(selectedEdgeIds);
        return;
      }
      if (key === 'escape') {
        clearSelection();
        return;
      }
    }

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedNodeIds, selectedEdgeIds, deleteNodes, deleteEdges, copy, cut, paste, duplicate, undo, redo, selectAll, clearSelection]);
}
