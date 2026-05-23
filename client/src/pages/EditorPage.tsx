import React, { useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useEditorStore } from '@/store/editorStore';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useSocket } from '@/hooks/useSocket';
import { useExport } from '@/hooks/useExport';
import { useImport } from '@/hooks/useImport';
import { api } from '@/lib/utils';
import { MenuBar } from '@/components/layout/MenuBar';
import { StatusBar } from '@/components/layout/StatusBar';
import { PageTabs } from '@/components/layout/PageTabs';
import { LeftPanel } from '@/components/panels/LeftPanel';
import { RightPanel } from '@/components/panels/RightPanel';
import EditorCanvas from '@/components/editor/EditorCanvas';
import AIPanel from '@/components/ai/AIPanel';
import ImportDialog from '@/components/editor/ImportDialog';
import ExportDialog from '@/components/editor/ExportDialog';
import FloatingToolbar from '@/components/editor/FloatingToolbar';

export default function EditorPage() {
  const { diagramId } = useParams<{ diagramId: string }>();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId');
  const { isAuthenticated, fetchMe } = useAuthStore();
  const { setDiagram, setPages, setActivePage, loadFromServer } = useEditorStore();
  const { showImportDialog, showExportDialog } = useUIStore();

  useKeyboardShortcuts();
  useAutoSave();
  const { emitOp, emitPointer } = useSocket(diagramId || null);

  useEffect(() => {
    if (!isAuthenticated) { window.location.href = '/login'; return; }
    fetchMe();
    if (diagramId && projectId) {
      setDiagram(diagramId, projectId, '');
      loadDiagram(diagramId);
    }
  }, [diagramId, projectId, isAuthenticated, fetchMe, setDiagram]);

  const loadDiagram = async (id: string) => {
    try {
      const diagram = await api.get(`/diagrams/${id}`);
      useEditorStore.setState({ diagramName: diagram.name });
      if (diagram.pages && diagram.pages.length > 0) {
        setPages(diagram.pages);
        const activePage = diagram.pages.find((p: any) => p.isActive) || diagram.pages[0];
        setActivePage(activePage.id);
        // Load first page data
        const data = await api.get(`/sync/load/${activePage.id}`);
        loadFromServer(data.nodes, data.edges, data.viewport);
      }
    } catch (err) {
      console.error('Failed to load diagram:', err);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-editor-bg">
      <MenuBar />
      <PageTabs />
      <div className="flex-1 flex overflow-hidden">
        <LeftPanel />
        <EditorCanvas />
        <RightPanel />
        <AIPanel />
      </div>
      <StatusBar />
      <FloatingToolbar />
      {showImportDialog && <ImportDialog />}
      {showExportDialog && <ExportDialog />}
    </div>
  );
}
