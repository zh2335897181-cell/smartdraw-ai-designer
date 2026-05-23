import React from 'react';
import { useEditorStore } from '@/store/editorStore';
import { useCollaborationStore } from '@/store/collaborationStore';

export function StatusBar() {
  const { nodes, edges, selectedNodeIds, selectedEdgeIds, viewport, lastSavedAt, activePageId } = useEditorStore();
  const { connected, users } = useCollaborationStore();

  const pages = useEditorStore((s) => s.pages);
  const activePage = pages.find((p) => p.id === activePageId);

  return (
    <div className="h-6 bg-editor-header border-t border-editor-border flex items-center justify-between px-3 text-[11px] text-editor-textMuted flex-shrink-0">
      <div className="flex items-center gap-4">
        <span>节点: {nodes.length}</span>
        <span>连线: {edges.length}</span>
        {selectedNodeIds.length > 0 && <span>已选: {selectedNodeIds.length} 个节点</span>}
        {selectedEdgeIds.length > 0 && <span>已选: {selectedEdgeIds.length} 条连线</span>}
        {activePage && <span>页面: {activePage.name}</span>}
      </div>
      <div className="flex items-center gap-4">
        {lastSavedAt && (
          <span>上次保存: {new Date(lastSavedAt).toLocaleTimeString()}</span>
        )}
        <span>缩放: {Math.round(viewport.zoom * 100)}%</span>
        <span className="flex items-center gap-1">
          <span className={cn('w-2 h-2 rounded-full', connected ? 'bg-green-500' : 'bg-gray-500')} />
          {connected ? `${users.length} 人在线` : '离线'}
        </span>
      </div>
    </div>
  );
}

function cn(...c: any[]) { return c.filter(Boolean).join(' '); }
