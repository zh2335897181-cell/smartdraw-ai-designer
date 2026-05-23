import React, { memo, useState, useCallback } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { useEditorStore } from '@/store/editorStore';
import { cn } from '@/lib/utils';

const CustomNode = memo(({ id, data, selected, type }: NodeProps) => {
  const updateNode = useEditorStore((s) => s.updateNode);
  const selectNode = useEditorStore((s) => s.selectNode);
  const [editing, setEditing] = useState(false);
  const [editLabel, setEditLabel] = useState('');

  const style = data?.style || {};
  const label = data?.label || '';

  const handleDoubleClick = useCallback(() => {
    setEditLabel(label);
    setEditing(true);
  }, [label]);

  const handleBlur = useCallback(() => {
    setEditing(false);
    if (editLabel !== label) {
      updateNode(id, { data: { ...data, label: editLabel } });
    }
  }, [editLabel, label, id, data, updateNode]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setEditing(false);
      if (editLabel !== label) {
        updateNode(id, { data: { ...data, label: editLabel } });
      }
    }
    if (e.key === 'Escape') setEditing(false);
  }, [editLabel, label, id, data, updateNode]);

  const fill = style.fill || '#2d2d30';
  const stroke = style.stroke || '#5a5a5a';
  const sw = style.strokeWidth ?? 1;
  const opacity = style.opacity ?? 1;
  const rx = style.borderRadius ?? 0;
  const shadow = style.shadow ? `drop-shadow(0 2px 4px rgba(0,0,0,0.4))` : 'none';
  const dash = style.dashArray || 'none';

  // All node types get handles (connection points)
  const showHandles = true;

  return (
    <div
      className={cn('relative', selected && 'selected')}
      style={{ opacity }}
      onDoubleClick={handleDoubleClick}
      onClick={(e) => { e.stopPropagation(); selectNode(id, e.ctrlKey || e.metaKey); }}
    >
      {/* Shape rendering based on node type */}
      {type === 'ellipse' || type === 'startEnd' ? (
        <EllipseShape w={style.width || 120} h={style.height || 80} fill={fill} stroke={stroke} sw={sw} rx={rx} shadow={shadow} dash={dash} />
      ) : type === 'diamond' || type === 'decision' || type === 'erRelationship' ? (
        <DiamondShape w={style.width || 120} h={style.height || 80} fill={fill} stroke={stroke} sw={sw} shadow={shadow} dash={dash} />
      ) : type === 'triangle' ? (
        <TriangleShape w={style.width || 100} h={style.height || 80} fill={fill} stroke={stroke} sw={sw} shadow={shadow} dash={dash} />
      ) : type === 'cylinder' || type === 'database' ? (
        <CylinderShape w={style.width || 100} h={style.height || 80} fill={fill} stroke={stroke} sw={sw} shadow={shadow} dash={dash} />
      ) : type === 'hexagon' ? (
        <HexagonShape w={style.width || 120} h={style.height || 70} fill={fill} stroke={stroke} sw={sw} shadow={shadow} dash={dash} />
      ) : type === 'parallelogram' ? (
        <ParallelogramShape w={style.width || 120} h={style.height || 60} fill={fill} stroke={stroke} sw={sw} shadow={shadow} dash={dash} />
      ) : type === 'cloud' ? (
        <CloudShape w={style.width || 140} h={style.height || 80} fill={fill} stroke={stroke} sw={sw} shadow={shadow} dash={dash} />
      ) : type === 'document' ? (
        <DocumentShape w={style.width || 100} h={style.height || 120} fill={fill} stroke={stroke} sw={sw} shadow={shadow} dash={dash} />
      ) : type === 'umlClass' ? (
        <UMLClassShape w={style.width || 160} h={style.height || 100} fill={fill} stroke={stroke} sw={sw} shadow={shadow} dash={dash} label={label} />
      ) : type === 'networkRouter' ? (
        <RouterShape w={80} h={80} fill={fill} stroke={stroke} sw={sw} shadow={shadow} />
      ) : type === 'networkServer' ? (
        <ServerShape w={70} h={100} fill={fill} stroke={stroke} sw={sw} shadow={shadow} />
      ) : (
        <RectShape w={style.width || 120} h={style.height || 60} fill={fill} stroke={stroke} sw={sw} rx={rx} shadow={shadow} dash={dash} />
      )}

      {/* Label */}
      {!['umlClass'].includes(type) && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none px-2">
          {editing ? (
            <input
              className="pointer-events-auto bg-editor-bg border border-editor-accent rounded px-1 text-center text-xs text-editor-text outline-none z-10"
              value={editLabel}
              onChange={(e) => setEditLabel(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              autoFocus
              style={{
                fontSize: style.fontSize || 14,
                fontFamily: style.fontFamily || 'Arial',
                fontWeight: style.fontWeight || 'normal',
                color: style.fontColor || '#cccccc',
                width: '90%',
              }}
            />
          ) : (
            <span
              style={{
                fontSize: style.fontSize || 14,
                fontFamily: style.fontFamily || 'Arial',
                fontWeight: style.fontWeight || 'normal',
                color: style.fontColor || '#cccccc',
                textAlign: style.textAlign || 'center',
              }}
              className="w-full break-words select-none"
            >
              {label}
            </span>
          )}
        </div>
      )}

      {/* Handles */}
      {showHandles && (
        <>
          <Handle type="target" position={Position.Top} id="top" className="!w-2 !h-2" />
          <Handle type="source" position={Position.Top} id="top-src" className="!w-2 !h-2" />
          <Handle type="target" position={Position.Bottom} id="bottom" className="!w-2 !h-2" />
          <Handle type="source" position={Position.Bottom} id="bottom-src" className="!w-2 !h-2" />
          <Handle type="target" position={Position.Left} id="left" className="!w-2 !h-2" />
          <Handle type="source" position={Position.Left} id="left-src" className="!w-2 !h-2" />
          <Handle type="target" position={Position.Right} id="right" className="!w-2 !h-2" />
          <Handle type="source" position={Position.Right} id="right-src" className="!w-2 !h-2" />
        </>
      )}
    </div>
  );
});

CustomNode.displayName = 'CustomNode';

// Shape components
function RectShape({ w, h, fill, stroke, sw, rx, shadow, dash }: any) {
  return (
    <div style={{
      width: w, height: h, background: fill, border: `${sw}px solid ${stroke}`,
      borderRadius: rx, filter: shadow, borderStyle: dash !== 'none' ? 'dashed' : 'solid',
    }} />
  );
}

function EllipseShape({ w, h, fill, stroke, sw, shadow, dash }: any) {
  return (
    <div style={{
      width: w, height: h, background: fill, border: `${sw}px solid ${stroke}`,
      borderRadius: '50%', filter: shadow, borderStyle: dash !== 'none' ? 'dashed' : 'solid',
    }} />
  );
}

function DiamondShape({ w, h, fill, stroke, sw, shadow, dash }: any) {
  return (
    <div style={{ width: w, height: h, position: 'relative', filter: shadow }}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        <polygon
          points={`${w/2},0 ${w},${h/2} ${w/2},${h} 0,${h/2}`}
          fill={fill} stroke={stroke} strokeWidth={sw}
          strokeDasharray={dash !== 'none' ? dash : undefined}
        />
      </svg>
    </div>
  );
}

function TriangleShape({ w, h, fill, stroke, sw, shadow, dash }: any) {
  return (
    <div style={{ width: w, height: h, filter: shadow }}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        <polygon points={`${w/2},0 ${w},${h} 0,${h}`} fill={fill} stroke={stroke} strokeWidth={sw}
          strokeDasharray={dash !== 'none' ? dash : undefined} />
      </svg>
    </div>
  );
}

function CylinderShape({ w, h, fill, stroke, sw, shadow, dash }: any) {
  const eH = h * 0.2;
  return (
    <div style={{ width: w, height: h, filter: shadow }}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        <rect x={0} y={eH/2} width={w} height={h - eH} fill={fill} stroke="none" />
        <ellipse cx={w/2} cy={eH/2} rx={w/2} ry={eH/2} fill={fill} stroke={stroke} strokeWidth={sw}
          strokeDasharray={dash !== 'none' ? dash : undefined} />
        <line x1={0} y1={eH/2} x2={0} y2={h - eH/2} stroke={stroke} strokeWidth={sw}
          strokeDasharray={dash !== 'none' ? dash : undefined} />
        <line x1={w} y1={eH/2} x2={w} y2={h - eH/2} stroke={stroke} strokeWidth={sw}
          strokeDasharray={dash !== 'none' ? dash : undefined} />
        <ellipse cx={w/2} cy={h - eH/2} rx={w/2} ry={eH/2} fill={fill} stroke={stroke} strokeWidth={sw}
          strokeDasharray={dash !== 'none' ? dash : undefined} />
      </svg>
    </div>
  );
}

function HexagonShape({ w, h, fill, stroke, sw, shadow, dash }: any) {
  const points = `${w*0.2},0 ${w*0.8},0 ${w},${h/2} ${w*0.8},${h} ${w*0.2},${h} 0,${h/2}`;
  return (
    <div style={{ width: w, height: h, filter: shadow }}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        <polygon points={points} fill={fill} stroke={stroke} strokeWidth={sw}
          strokeDasharray={dash !== 'none' ? dash : undefined} />
      </svg>
    </div>
  );
}

function ParallelogramShape({ w, h, fill, stroke, sw, shadow, dash }: any) {
  const skew = w * 0.2;
  const points = `${skew},0 ${w},0 ${w - skew},${h} 0,${h}`;
  return (
    <div style={{ width: w, height: h, filter: shadow }}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        <polygon points={points} fill={fill} stroke={stroke} strokeWidth={sw}
          strokeDasharray={dash !== 'none' ? dash : undefined} />
      </svg>
    </div>
  );
}

function CloudShape({ w, h, fill, stroke, sw, shadow, dash }: any) {
  return (
    <div style={{ width: w, height: h, filter: shadow }}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        <path d={`M${w*0.3},${h*0.7} Q${w*0.1},${h*0.7} ${w*0.1},${h*0.45} Q${w*0.05},${h*0.15} ${w*0.3},${h*0.2} Q${w*0.35},${h*0.02} ${w*0.55},${h*0.1} Q${w*0.8},${h*0.02} ${w*0.85},${h*0.25} Q${w*0.98},${h*0.3} ${w*0.9},${h*0.5} Q${w*0.95},${h*0.7} ${w*0.8},${h*0.7} Z`}
          fill={fill} stroke={stroke} strokeWidth={sw} strokeDasharray={dash !== 'none' ? dash : undefined} />
      </svg>
    </div>
  );
}

function DocumentShape({ w, h, fill, stroke, sw, shadow, dash }: any) {
  const fold = Math.min(w * 0.25, 25);
  return (
    <div style={{ width: w, height: h, filter: shadow }}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        <path d={`M0,0 L${w-fold},0 L${w},${fold} L${w},${h} L0,${h} Z`}
          fill={fill} stroke={stroke} strokeWidth={sw}
          strokeDasharray={dash !== 'none' ? dash : undefined} />
        <path d={`M${w-fold},0 L${w-fold},${fold} L${w},${fold}`} fill="none" stroke={stroke} strokeWidth={sw}
          strokeDasharray={dash !== 'none' ? dash : undefined} />
      </svg>
    </div>
  );
}

function UMLClassShape({ w, h, fill, stroke, sw, shadow, dash, label }: any) {
  const lines = (label || 'Class').split('\n');
  return (
    <div style={{ width: w, height: h, filter: shadow }}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        <rect x={0} y={0} width={w} height={h} fill={fill} stroke={stroke} strokeWidth={sw}
          strokeDasharray={dash !== 'none' ? dash : undefined} />
        <line x1={0} y1={28} x2={w} y2={28} stroke={stroke} strokeWidth={sw} />
        <line x1={0} y1={28 + Math.max(lines.length - 1, 1) * 20} x2={w} y2={28 + Math.max(lines.length - 1, 1) * 20} stroke={stroke} strokeWidth={sw} />
        <text x={w/2} y={18} textAnchor="middle" fill="#ccc" fontSize={13} fontWeight="bold">{lines[0] || 'Class'}</text>
      </svg>
    </div>
  );
}

function RouterShape({ w, h, fill, stroke, sw, shadow }: any) {
  return (
    <div style={{ width: w, height: h, filter: shadow, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={w} height={h} viewBox="0 0 80 80">
        <rect x={10} y={20} width={60} height={15} rx={3} fill={fill} stroke={stroke} strokeWidth={sw} />
        <rect x={10} y={40} width={60} height={15} rx={3} fill={fill} stroke={stroke} strokeWidth={sw} />
        <circle cx={25} cy={27} r={3} fill="#4a4" />
        <circle cx={40} cy={27} r={3} fill="#4a4" />
        <circle cx={55} cy={27} r={3} fill="#4a4" />
        <circle cx={25} cy={47} r={3} fill="#4a4" />
        <circle cx={40} cy={47} r={3} fill="#4a4" />
        <circle cx={55} cy={47} r={3} fill="#4a4" />
      </svg>
    </div>
  );
}

function ServerShape({ w, h, fill, stroke, sw, shadow }: any) {
  return (
    <div style={{ width: w, height: h, filter: shadow }}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        <rect x={5} y={0} width={w-10} height={h/3-5} rx={2} fill={fill} stroke={stroke} strokeWidth={sw} />
        <rect x={5} y={h/3+3} width={w-10} height={h/3-5} rx={2} fill={fill} stroke={stroke} strokeWidth={sw} />
        <rect x={5} y={2*h/3+5} width={w-10} height={h/3-5} rx={2} fill={fill} stroke={stroke} strokeWidth={sw} />
        <circle cx={w/2} cy={h/6} r={4} fill="#4a4" />
        <circle cx={w/2} cy={h/2} r={4} fill="#4a4" />
        <circle cx={w/2} cy={5*h/6} r={4} fill="#4a4" />
      </svg>
    </div>
  );
}

export default CustomNode;
