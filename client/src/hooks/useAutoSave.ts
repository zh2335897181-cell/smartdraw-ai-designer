import { useEffect, useRef, useCallback } from 'react';
import { useEditorStore } from '@/store/editorStore';
import { api, debounce } from '@/lib/utils';

export function useAutoSave() {
  const { nodes, edges, viewport, activePageId, isDirty, setDirty } = useEditorStore();
  const debouncedSave = useRef(
    debounce(async (pageId: string, n: any[], e: any[], vp: any) => {
      try {
        await api.post('/sync/save', { pageId, nodes: n, edges: e, viewport: vp });
        useEditorStore.setState({ lastSavedAt: Date.now(), isDirty: false, isSaving: false });
      } catch (err) {
        console.error('Auto-save failed:', err);
        useEditorStore.setState({ isSaving: false });
      }
    }, 1000)
  );

  const save = useCallback(() => {
    if (!activePageId) return;
    useEditorStore.setState({ isSaving: true });
    debouncedSave.current(activePageId, nodes, edges, viewport);
  }, [nodes, edges, viewport, activePageId]);

  // Auto-save every 30 seconds if dirty
  useEffect(() => {
    if (!isDirty) return;
    const interval = setInterval(() => {
      save();
    }, 30000);
    return () => clearInterval(interval);
  }, [isDirty, save]);

  return { save, isSaving: useEditorStore((s) => s.isSaving) };
}
