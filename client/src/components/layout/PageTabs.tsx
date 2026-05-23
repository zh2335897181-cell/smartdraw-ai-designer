import React from 'react';
import { Plus, X } from 'lucide-react';
import { useEditorStore } from '@/store/editorStore';
import { cn } from '@/lib/utils';

export function PageTabs() {
  const { pages, activePageId, setActivePage, addPage, removePage } = useEditorStore();

  return (
    <div className="h-8 bg-editor-bg border-b border-editor-border flex items-center px-2 gap-0 flex-shrink-0 overflow-x-auto">
      {pages.map((page) => (
        <div
          key={page.id}
          className={cn(
            'flex items-center gap-1 px-2.5 py-1 text-xs border-r border-editor-border cursor-pointer select-none hover:bg-editor-hover group',
            activePageId === page.id ? 'bg-editor-surface text-editor-text border-t-2 border-t-editor-accent' : 'text-editor-textMuted'
          )}
          onClick={() => setActivePage(page.id)}
        >
          <span>{page.name}</span>
          {pages.length > 1 && (
            <button
              className="ml-1 p-0.5 rounded hover:bg-editor-hover opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => { e.stopPropagation(); removePage(page.id); }}
            >
              <X size={10} />
            </button>
          )}
        </div>
      ))}
      <button
        className="p-1 ml-1 rounded hover:bg-editor-hover text-editor-textMuted hover:text-editor-text"
        onClick={() => {
          const newPage = {
            id: `page-${Date.now()}`,
            diagramId: useEditorStore.getState().diagramId || '',
            name: `Page ${pages.length + 1}`,
            pageOrder: pages.length,
            isActive: true,
          };
          addPage(newPage);
          setActivePage(newPage.id);
        }}
        title="添加页面"
      >
        <Plus size={14} />
      </button>
    </div>
  );
}
