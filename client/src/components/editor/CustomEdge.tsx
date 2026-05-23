import React, { memo, useState, useCallback, useMemo } from 'react';
import { BaseEdge, EdgeLabelRenderer, EdgeProps, getBezierPath, getSmoothStepPath, getStraightPath } from 'reactflow';
import { useEditorStore } from '@/store/editorStore';
import { buildEdgePath, getHandleDirection } from '@/lib/edgeRouter';

const CustomEdge = memo((props: EdgeProps) => {
  const {
    id, sourceX, sourceY, targetX, targetY,
    sourcePosition, targetPosition,
    data, style = {}, markerEnd, markerStart,
  } = props;

  const selectEdge = useEditorStore((s) => s.selectEdge);
  const updateEdge = useEditorStore((s) => s.updateEdge);
  const nodes = useEditorStore((s) => s.nodes);
  const selected = useEditorStore((s) => s.selectedEdgeIds.includes(id));

  const edgeType = (data as any)?.edgeType || 'bezier';
  const strokeColor = (style as any).stroke || '#888';
  const strokeW = (style as any).strokeWidth || 1.5;
  const lineStyle = (style as any).lineStyle || 'solid';
  const dashArray = lineStyle === 'dashed' ? '8,4' : lineStyle === 'dotted' ? '2,4' : undefined;
  const animated = (data as any)?.animated;

  // Label editing
  const label = (data as any)?.label as string | undefined;
  const [editing, setEditing] = useState(false);
  const [editVal, setEditVal] = useState('');

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setEditVal(label || '');
    setEditing(true);
  }, [label]);

  const handleLabelDone = useCallback(() => {
    setEditing(false);
    updateEdge(id, { data: { ...data, label: editVal } });
  }, [editVal, id, data, updateEdge]);

  const handleLabelKey = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleLabelDone();
    if (e.key === 'Escape') setEditing(false);
  }, [handleLabelDone]);

  // Build obstacle list (all nodes except source and target)
  const obstacles = useMemo(() => {
    const sourceId = props.source;
    const targetId = props.target;
    return nodes
      .filter((n) => n.id !== sourceId && n.id !== targetId && !n.hidden)
      .map((n) => ({
        x: n.position.x,
        y: n.position.y,
        w: n.width || 120,
        h: n.height || 60,
      }));
  }, [nodes, props.source, props.target]);

  // Calculate path
  const sourceDir = getHandleDirection((props as any).sourceHandleId || (props as any).sourceHandle || null);
  const targetDir = getHandleDirection((props as any).targetHandleId || (props as any).targetHandle || null);

  const { path, labelX, labelY, waypoints } = useMemo(() => {
    if (edgeType === 'orthogonal') {
      return buildEdgePath(
        { x: sourceX, y: sourceY }, { x: targetX, y: targetY },
        'orthogonal', obstacles, sourceDir, targetDir
      );
    }
    if (edgeType === 'bezier' && obstacles.length > 0) {
      return buildEdgePath(
        { x: sourceX, y: sourceY }, { x: targetX, y: targetY },
        'bezier', obstacles, sourceDir, targetDir
      );
    }

    // Standard ReactFlow paths
    const params: any = { sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition };
    let p = '';
    switch (edgeType) {
      case 'straight': [p] = getStraightPath(params); break;
      case 'step': [p] = getSmoothStepPath({ ...params, borderRadius: 0 }); break;
      case 'smooth': [p] = getSmoothStepPath(params); break;
      default: [p] = getBezierPath(params);
    }
    return { path: p, labelX: (sourceX + targetX) / 2, labelY: (sourceY + targetY) / 2, waypoints: [] as { x: number; y: number }[] };
  }, [edgeType, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, obstacles, sourceDir, targetDir]);

  // Edge click
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    selectEdge(id, e.ctrlKey || e.metaKey);
  }, [id, selectEdge]);

  const glowColor = selected ? '#0078d4' : 'transparent';
  const actualStroke = selected ? '#0078d4' : strokeColor;
  const actualWidth = selected ? strokeW + 1 : strokeW;

  return (
    <>
      {/* Glow layer (selected) */}
      {selected && (
        <path
          d={path}
          fill="none"
          stroke="#0078d4"
          strokeWidth={actualWidth + 4}
          strokeOpacity={0.3}
          className="pointer-events-none"
        />
      )}

      {/* Hit area (wider invisible path for easier clicking) */}
      <path
        d={path}
        fill="none"
        stroke="transparent"
        strokeWidth={Math.max(12, actualWidth + 8)}
        className="cursor-pointer"
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
      />

      {/* Main edge path */}
      <BaseEdge
        id={id}
        path={path}
        style={{
          stroke: actualStroke,
          strokeWidth: actualWidth,
          strokeDasharray: dashArray,
          transition: 'stroke 0.15s, stroke-width 0.15s',
        }}
        markerEnd={markerEnd}
        markerStart={markerStart}
      />

      {/* Animated flow (if animated) */}
      {animated && (
        <path
          d={path}
          fill="none"
          stroke={actualStroke}
          strokeWidth={actualWidth}
          strokeOpacity={0.6}
          strokeDasharray="6,8"
          className="pointer-events-none"
          style={{ animation: 'edgeFlow 0.6s linear infinite' }}
        />
      )}

      {/* Waypoints (for orthogonal edges) */}
      {waypoints.length > 0 && waypoints.map((wp, i) => (
        <circle
          key={i}
          cx={wp.x}
          cy={wp.y}
          r={3}
          fill={selected ? '#0078d4' : actualStroke}
          stroke="var(--editor-bg)"
          strokeWidth={1}
          className="pointer-events-none opacity-60"
        />
      ))}

      {/* Edge label */}
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            pointerEvents: 'all',
          }}
          onDoubleClick={handleDoubleClick}
        >
          {editing ? (
            <input
              className="bg-editor-bg border border-editor-accent rounded px-1.5 py-0.5 text-[10px] text-editor-text outline-none min-w-[40px] text-center z-10"
              value={editVal}
              onChange={(e) => setEditVal(e.target.value)}
              onBlur={handleLabelDone}
              onKeyDown={handleLabelKey}
              autoFocus
              style={{ width: Math.max(40, (editVal.length || 2) * 8) }}
            />
          ) : label ? (
            <div className="text-[10px] text-editor-text bg-editor-bg/90 px-1.5 py-0.5 rounded border border-editor-border cursor-default hover:border-editor-accent transition-colors select-none whitespace-nowrap">
              {label}
            </div>
          ) : null}
        </div>
      </EdgeLabelRenderer>

      {/* Edge flow animation keyframes */}
      <style>{`
        @keyframes edgeFlow {
          from { stroke-dashoffset: 14; }
          to { stroke-dashoffset: 0; }
        }
      `}</style>
    </>
  );
});

CustomEdge.displayName = 'CustomEdge';
export default CustomEdge;
