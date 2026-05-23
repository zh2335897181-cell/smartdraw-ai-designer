import { create } from 'zustand';
import { CollaborationUser } from '@/lib/types';

interface CollaborationState {
  socket: any | null;
  connected: boolean;
  users: CollaborationUser[];
  remoteCursors: Map<string, { x: number; y: number }>;
  remoteSelections: Map<string, string[]>;

  setSocket: (socket: any) => void;
  setConnected: (connected: boolean) => void;
  setUsers: (users: CollaborationUser[]) => void;
  addUser: (user: CollaborationUser) => void;
  removeUser: (userId: string) => void;
  updateCursor: (userId: string, x: number, y: number) => void;
  updateSelection: (userId: string, selectedIds: string[]) => void;
  reset: () => void;
}

export const useCollaborationStore = create<CollaborationState>((set) => ({
  socket: null,
  connected: false,
  users: [],
  remoteCursors: new Map(),
  remoteSelections: new Map(),

  setSocket: (socket) => set({ socket }),
  setConnected: (connected) => set({ connected }),
  setUsers: (users) => set({ users }),
  addUser: (user) => set((s) => {
    const exists = s.users.find((u) => u.userId === user.userId);
    if (exists) return { users: s.users.map((u) => u.userId === user.userId ? user : u) };
    return { users: [...s.users, user] };
  }),
  removeUser: (userId) => set((s) => {
    const cursors = new Map(s.remoteCursors);
    cursors.delete(userId);
    const selections = new Map(s.remoteSelections);
    selections.delete(userId);
    return {
      users: s.users.filter((u) => u.userId !== userId),
      remoteCursors: cursors,
      remoteSelections: selections,
    };
  }),
  updateCursor: (userId, x, y) => set((s) => {
    const cursors = new Map(s.remoteCursors);
    cursors.set(userId, { x, y });
    return { remoteCursors: cursors };
  }),
  updateSelection: (userId, selectedIds) => set((s) => {
    const selections = new Map(s.remoteSelections);
    selections.set(userId, selectedIds);
    return { remoteSelections: selections };
  }),
  reset: () => set({ users: [], remoteCursors: new Map(), remoteSelections: new Map() }),
}));
