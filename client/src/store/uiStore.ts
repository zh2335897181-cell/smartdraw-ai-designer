import { create } from 'zustand';

interface UIState {
  // Panel visibility
  leftPanelOpen: boolean;
  rightPanelOpen: boolean;
  leftPanelTab: string;
  rightPanelTab: string;

  // Search
  shapeSearch: string;

  // Favorites
  favoriteShapeIds: string[];
  recentShapeIds: string[];

  // Context menu
  contextMenu: { x: number; y: number; type: 'canvas' | 'node' | 'edge'; targetId?: string } | null;

  // Modal states
  showExportDialog: boolean;
  showImportDialog: boolean;
  showAIPanel: boolean;
  showMermaidDialog: boolean;
  showPlantUMLDialog: boolean;
  showCollaborators: boolean;

  // AI
  aiPrompt: string;
  aiLoading: boolean;

  // Theme
  darkMode: boolean;

  // Actions
  toggleLeftPanel: () => void;
  toggleRightPanel: () => void;
  setLeftPanelTab: (tab: string) => void;
  setRightPanelTab: (tab: string) => void;
  setShapeSearch: (query: string) => void;
  toggleFavorite: (shapeId: string) => void;
  addRecentShape: (shapeId: string) => void;
  openContextMenu: (menu: UIState['contextMenu']) => void;
  closeContextMenu: () => void;
  setShowExportDialog: (show: boolean) => void;
  setShowImportDialog: (show: boolean) => void;
  setShowAIPanel: (show: boolean) => void;
  setShowMermaidDialog: (show: boolean) => void;
  setShowPlantUMLDialog: (show: boolean) => void;
  setShowCollaborators: (show: boolean) => void;
  setAiPrompt: (prompt: string) => void;
  setAiLoading: (loading: boolean) => void;
  toggleDarkMode: () => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  leftPanelOpen: true,
  rightPanelOpen: false,
  leftPanelTab: 'basic',
  rightPanelTab: 'style',
  shapeSearch: '',
  favoriteShapeIds: [],
  recentShapeIds: [],
  contextMenu: null,
  showExportDialog: false,
  showImportDialog: false,
  showAIPanel: false,
  showMermaidDialog: false,
  showPlantUMLDialog: false,
  showCollaborators: false,
  aiPrompt: '',
  aiLoading: false,
  darkMode: true,

  toggleLeftPanel: () => set((s) => ({ leftPanelOpen: !s.leftPanelOpen })),
  toggleRightPanel: () => set((s) => ({ rightPanelOpen: !s.rightPanelOpen })),
  setLeftPanelTab: (tab) => set({ leftPanelTab: tab }),
  setRightPanelTab: (tab) => set({ rightPanelTab: tab }),
  setShapeSearch: (query) => set({ shapeSearch: query }),
  toggleFavorite: (shapeId) => set((s) => ({
    favoriteShapeIds: s.favoriteShapeIds.includes(shapeId)
      ? s.favoriteShapeIds.filter((id) => id !== shapeId)
      : [...s.favoriteShapeIds, shapeId],
  })),
  addRecentShape: (shapeId) => set((s) => ({
    recentShapeIds: [shapeId, ...s.recentShapeIds.filter((id) => id !== shapeId)].slice(0, 10),
  })),
  openContextMenu: (menu) => set({ contextMenu: menu }),
  closeContextMenu: () => set({ contextMenu: null }),
  setShowExportDialog: (show) => set({ showExportDialog: show }),
  setShowImportDialog: (show) => set({ showImportDialog: show }),
  setShowAIPanel: (show) => set({ showAIPanel: show }),
  setShowMermaidDialog: (show) => set({ showMermaidDialog: show }),
  setShowPlantUMLDialog: (show) => set({ showPlantUMLDialog: show }),
  setShowCollaborators: (show) => set({ showCollaborators: show }),
  setAiPrompt: (prompt) => set({ aiPrompt: prompt }),
  setAiLoading: (loading) => set({ aiLoading: loading }),
  toggleDarkMode: () => set((s) => {
    const newVal = !s.darkMode;
    const root = document.documentElement;
    if (newVal) {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    localStorage.setItem('smartdraw-theme', newVal ? 'dark' : 'light');
    return { darkMode: newVal };
  }),
  initTheme: () => {
    const saved = localStorage.getItem('smartdraw-theme');
    const isDark = saved ? saved === 'dark' : true; // default dark
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    set({ darkMode: isDark });
  },
}));
