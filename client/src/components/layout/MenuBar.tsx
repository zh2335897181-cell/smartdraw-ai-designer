import React, { useState, useRef, useEffect } from 'react';
import {
  Menu, Save, Download, Upload, Undo2, Redo2, ZoomIn, ZoomOut,
  Maximize, User, FileText, Settings, LogOut, ChevronDown,
  Sun, Moon,
} from 'lucide-react';
import { useEditorStore } from '@/store/editorStore';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';

export function MenuBar() {
  const { undo, redo, diagramName, viewport, setViewport } = useEditorStore();
  const auth = useAuthStore();
  const ui = useUIStore();

  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const menus: Record<string, { label: string; action?: () => void; shortcut?: string }[]> = {
    file: [
      { label: '新建项目', action: () => window.location.href = '/projects' },
      { label: '保存', action: () => useEditorStore.getState().setDirty(true), shortcut: 'Ctrl+S' },
      { label: '导出...', action: () => useUIStore.getState().setShowExportDialog(true) },
      { label: '导入 draw.io XML', action: () => ui.setShowImportDialog(true) },
    ],
    edit: [
      { label: '撤销', action: undo, shortcut: 'Ctrl+Z' },
      { label: '重做', action: redo, shortcut: 'Ctrl+Y' },
      { label: '复制', action: () => useEditorStore.getState().copy(), shortcut: 'Ctrl+C' },
      { label: '粘贴', action: () => useEditorStore.getState().paste(), shortcut: 'Ctrl+V' },
      { label: '删除', action: () => {
        const s = useEditorStore.getState();
        s.deleteNodes(s.selectedNodeIds);
        s.deleteEdges(s.selectedEdgeIds);
      }, shortcut: 'Delete' },
      { label: '全选', action: () => useEditorStore.getState().selectAll(), shortcut: 'Ctrl+A' },
    ],
    view: [
      { label: '放大', action: () => setViewport({ ...viewport, zoom: Math.min(viewport.zoom * 1.2, 5) }), shortcut: 'Ctrl+=' },
      { label: '缩小', action: () => setViewport({ ...viewport, zoom: Math.max(viewport.zoom / 1.2, 0.1) }), shortcut: 'Ctrl+-' },
      { label: '重置缩放', action: () => setViewport({ ...viewport, zoom: 1 }), shortcut: 'Ctrl+0' },
      { label: useEditorStore.getState().showMiniMap ? '隐藏小地图' : '显示小地图', action: () => useEditorStore.setState({ showMiniMap: !useEditorStore.getState().showMiniMap }) },
      { label: '切换左侧面板', action: () => ui.toggleLeftPanel() },
      { label: '切换右侧面板', action: () => ui.toggleRightPanel() },
    ],
    arrange: [
      { label: '智能整理 (上→下)', action: () => useEditorStore.getState().autoLayout('TB') },
      { label: '智能整理 (左→右)', action: () => useEditorStore.getState().autoLayout('LR') },
      { label: '智能整理 (右→左)', action: () => useEditorStore.getState().autoLayout('RL') },
      { label: '智能整理 (下→上)', action: () => useEditorStore.getState().autoLayout('BT') },
      { label: '置于顶层', action: () => {
        const s = useEditorStore.getState();
        s.selectedNodeIds.forEach((id) => {
          const maxZ = Math.max(...s.nodes.map((n) => n.zIndex || 0));
          s.updateNode(id, { zIndex: maxZ + 1 });
        });
      }},
      { label: '置于底层', action: () => {
        const s = useEditorStore.getState();
        s.selectedNodeIds.forEach((id) => {
          const minZ = Math.min(...s.nodes.map((n) => n.zIndex || 0));
          s.updateNode(id, { zIndex: minZ - 1 });
        });
      }},
    ],
    help: [
      { label: '快捷键参考', action: () => {} },
      { label: '关于 SmartDraw', action: () => {} },
    ],
  };

  return (
    <div ref={menuRef} className="flex items-center h-10 bg-editor-header border-b border-editor-border px-2 select-none z-50">
      {/* App brand */}
      <div className="flex items-center gap-2 mr-4 text-sm font-semibold text-editor-text">
        <div className="w-5 h-5 bg-editor-accent rounded flex items-center justify-center text-white text-xs">SD</div>
        <span className="hidden sm:inline">SmartDraw</span>
      </div>

      {/* Menus */}
      <div className="flex items-center gap-0">
        {Object.entries(menus).map(([key, items]) => (
          <div key={key} className="relative">
            <button
              className={cn(
                'px-2 py-1 text-xs rounded hover:bg-editor-hover text-editor-text',
                activeMenu === key && 'bg-editor-hover'
              )}
              onClick={() => setActiveMenu(activeMenu === key ? null : key)}
              onMouseEnter={() => activeMenu && setActiveMenu(key)}
            >
              {key === 'file' ? '文件' : key === 'edit' ? '编辑' : key === 'view' ? '查看' : key === 'arrange' ? '排列' : '帮助'}
            </button>
            {activeMenu === key && (
              <div className="absolute top-full left-0 mt-1 w-52 bg-editor-surface border border-editor-border rounded-md shadow-lg py-1 z-50">
                {items.map((item, i) => (
                  <button
                    key={i}
                    className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-editor-text hover:bg-editor-hover"
                    onClick={() => {
                      item.action?.();
                      setActiveMenu(null);
                    }}
                  >
                    <span>{item.label}</span>
                    {item.shortcut && <span className="text-editor-textMuted ml-4">{item.shortcut}</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Center: project name */}
      <div className="flex-1 text-center text-xs text-editor-textMuted truncate px-4">
        {diagramName || 'Untitled'}
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1">
        <button className="p-1.5 rounded hover:bg-editor-hover text-editor-text" onClick={undo} title="撤销 (Ctrl+Z)">
          <Undo2 size={16} />
        </button>
        <button className="p-1.5 rounded hover:bg-editor-hover text-editor-text" onClick={redo} title="重做 (Ctrl+Y)">
          <Redo2 size={16} />
        </button>
        <div className="w-px h-5 bg-editor-border mx-1" />
        <button className="p-1.5 rounded hover:bg-editor-hover text-editor-text" onClick={() => setViewport({ ...viewport, zoom: Math.max(viewport.zoom / 1.2, 0.1) })} title="缩小">
          <ZoomOut size={16} />
        </button>
        <span className="text-xs text-editor-textMuted w-10 text-center">{Math.round(viewport.zoom * 100)}%</span>
        <button className="p-1.5 rounded hover:bg-editor-hover text-editor-text" onClick={() => setViewport({ ...viewport, zoom: Math.min(viewport.zoom * 1.2, 5) })} title="放大">
          <ZoomIn size={16} />
        </button>
        <button className="p-1.5 rounded hover:bg-editor-hover text-editor-text" onClick={() => setViewport({ x: 0, y: 0, zoom: 1 })} title="重置缩放">
          <Maximize size={16} />
        </button>
        <div className="w-px h-5 bg-editor-border mx-1" />

        {/* AI button */}
        <button
          className={cn('px-2 py-1 text-xs rounded hover:bg-editor-hover text-editor-text', ui.showAIPanel && 'bg-editor-active')}
          onClick={() => ui.setShowAIPanel(!ui.showAIPanel)}
        >
          AI
        </button>

        {/* Theme toggle */}
        <button
          className="p-1.5 rounded hover:bg-editor-hover text-editor-textMuted hover:text-editor-text"
          onClick={() => useUIStore.getState().toggleDarkMode()}
          title={useUIStore.getState().darkMode ? '切换浅色模式' : '切换深色模式'}
        >
          {useUIStore.getState().darkMode ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        {/* Save status */}
        <span className="text-xs text-editor-textMuted">
          {useEditorStore.getState().isDirty ? '● 未保存' : '✓ 已保存'}
        </span>

        {/* User menu */}
        <div className="relative">
          <button
            className="flex items-center gap-1 px-2 py-1 rounded hover:bg-editor-hover"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
          >
            <div className="w-6 h-6 rounded-full bg-editor-accent flex items-center justify-center text-white text-xs">
              {(auth.user?.displayName || auth.user?.username || 'U')[0].toUpperCase()}
            </div>
            <ChevronDown size={12} className="text-editor-textMuted" />
          </button>
          {userMenuOpen && (
            <div className="absolute top-full right-0 mt-1 w-44 bg-editor-surface border border-editor-border rounded-md shadow-lg py-1 z-50">
              <div className="px-3 py-2 text-xs text-editor-text border-b border-editor-border">
                {auth.user?.email}
              </div>
              <button className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-editor-text hover:bg-editor-hover" onClick={() => window.location.href = '/settings'}>
                <Settings size={14} /> 设置
              </button>
              <button className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-400 hover:bg-editor-hover" onClick={() => { auth.logout(); window.location.href = '/login'; }}>
                <LogOut size={14} /> 退出登录
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
