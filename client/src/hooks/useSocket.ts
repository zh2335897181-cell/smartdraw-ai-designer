import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useEditorStore } from '@/store/editorStore';
import { useCollaborationStore } from '@/store/collaborationStore';

export function useSocket(diagramId: string | null) {
  const socketRef = useRef<Socket | null>(null);
  const { setSocket, setConnected, addUser, removeUser, setUsers, updateCursor, updateSelection } = useCollaborationStore();
  const { addNode, updateNode, deleteNodes, addEdge, deleteEdges, nodes } = useEditorStore();

  useEffect(() => {
    if (!diagramId) return;

    const token = localStorage.getItem('smartdraw-token');
    const socket = io('/', {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      setConnected(true);
      socket.emit('join-diagram', diagramId);
      setSocket(socket);
    });

    socket.on('disconnect', () => setConnected(false));

    socket.on('users-online', (users) => setUsers(users));

    socket.on('user-joined', (user) => addUser(user));

    socket.on('user-left', ({ userId }) => removeUser(userId));

    socket.on('pointer', ({ userId, x, y }) => updateCursor(userId, x, y));

    socket.on('selection-change', ({ userId, selectedIds }) => updateSelection(userId, selectedIds));

    socket.on('op', ({ op }) => {
      switch (op.type) {
        case 'node_add':
          addNode(op.data);
          break;
        case 'node_move':
          updateNode(op.data.id, { position: op.data.position });
          break;
        case 'node_delete':
          deleteNodes([op.data.id]);
          break;
        case 'node_update':
          updateNode(op.data.id, op.data);
          break;
        case 'edge_add':
          addEdge(op.data);
          break;
        case 'edge_delete':
          deleteEdges([op.data.id]);
          break;
        case 'edge_update':
          useEditorStore.setState((s) => ({
            edges: s.edges.map((e) => (e.id === op.data.id ? { ...e, ...op.data } : e)),
          }));
          break;
      }
    });

    socketRef.current = socket;

    return () => {
      socket.emit('leave-diagram', diagramId);
      socket.disconnect();
      setConnected(false);
      setSocket(null);
      useCollaborationStore.getState().reset();
    };
  }, [diagramId]);

  const emitOp = (op: any) => {
    if (socketRef.current?.connected && diagramId) {
      socketRef.current.emit('op', { diagramId, op });
    }
  };

  const emitPointer = (x: number, y: number) => {
    if (socketRef.current?.connected && diagramId) {
      socketRef.current.emit('pointer', { diagramId, x, y });
    }
  };

  const emitCursorMove = (position: { x: number; y: number }) => {
    if (socketRef.current?.connected && diagramId) {
      socketRef.current.emit('cursor-move', { diagramId, position });
    }
  };

  return { emitOp, emitPointer, emitCursorMove };
}
