import React from 'react';
import {
  PaintBucket, Sliders, Type, AlignLeft, Layers,
  Palette, BoxSelect, Trash2,
} from 'lucide-react';
import { useEditorStore } from '@/store/editorStore';
import { useUIStore } from '@/store/uiStore';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { FONT_FAMILIES, EDGE_TYPE_OPTIONS, ARROW_OPTIONS } from '@/lib/constants';
import { NodeStyle, EdgeStyle } from '@/lib/types';

const tabs = [
  { key: 'style', label: '样式', icon: <PaintBucket size={14} /> },
  { key: 'text', label: '文字', icon: <Type size={14} /> },
  { key: 'layout', label: '布局', icon: <AlignLeft size={14} /> },
  { key: 'layers', label: '图层', icon: <Layers size={14} /> },
];

export function RightPanel() {
  const { rightPanelOpen, rightPanelTab, setRightPanelTab } = useUIStore();
  const {
    selectedNodeIds, nodes, updateNodeStyle,
    selectedEdgeIds, edges, updateEdgeStyle,
    deleteNodes, deleteEdges,
  } = useEditorStore();

  if (!rightPanelOpen) return null;

  const selectedNode = selectedNodeIds.length === 1 ? nodes.find((n) => n.id === selectedNodeIds[0]) : null;
  const selectedEdge = selectedEdgeIds.length === 1 ? edges.find((e) => e.id === selectedEdgeIds[0]) : null;
  const hasSelection = selectedNode || selectedEdge;

  return (
    <div className="w-64 bg-editor-sidebar border-l border-editor-border flex flex-col overflow-hidden flex-shrink-0">
      {/* Tabs */}
      <div className="flex border-b border-editor-border">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={cn(
              'flex-1 flex items-center justify-center gap-1 py-2 text-xs text-editor-textMuted hover:text-editor-text hover:bg-editor-hover',
              rightPanelTab === tab.key && 'text-editor-accent border-b border-editor-accent'
            )}
            onClick={() => setRightPanelTab(tab.key)}
          >
            {tab.icon}
            <span className="hidden xl:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3">
        {!hasSelection && (
          <div className="text-xs text-editor-textMuted text-center mt-8">
            选择一个图形或连线以编辑属性
          </div>
        )}

        {/* Node style editing */}
        {selectedNode && rightPanelTab === 'style' && <NodeStyleEditor nodeId={selectedNode.id} />}
        {selectedNode && rightPanelTab === 'text' && <NodeTextEditor nodeId={selectedNode.id} />}
        {selectedNode && rightPanelTab === 'layout' && <LayoutEditor />}
        {selectedNode && rightPanelTab === 'layers' && <LayerEditor />}

        {/* Edge style editing — show only on style tab when edge is selected */}
        {selectedEdge && !selectedNode && rightPanelTab === 'style' && <EdgeStyleEditor edgeId={selectedEdge.id} />}
        {selectedEdge && !selectedNode && rightPanelTab !== 'style' && (
          <div className="text-xs text-editor-textMuted text-center mt-4">连线属性在"样式"标签页中编辑</div>
        )}

        {/* Multi-select actions */}
        {selectedNodeIds.length > 1 && (
          <div className="space-y-2">
            <p className="text-xs text-editor-textMuted">已选中 {selectedNodeIds.length} 个图形</p>
            <Button variant="outline" size="sm" className="w-full" onClick={() => deleteNodes(selectedNodeIds)}>
              <Trash2 size={14} className="mr-1" /> 删除选中
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function NodeStyleEditor({ nodeId }: { nodeId: string }) {
  const node = useEditorStore((s) => s.nodes.find((n) => n.id === nodeId));
  const updateNodeStyle = useEditorStore((s) => s.updateNodeStyle);
  if (!node) return null;
  const style = node.data.style || {};

  return (
    <div className="space-y-3">
      <div>
        <Label>填充颜色</Label>
        <div className="flex items-center gap-2 mt-1">
          <input type="color" value={style.fill || '#2d2d30'} onChange={(e) => updateNodeStyle(nodeId, { fill: e.target.value })} className="w-8 h-8 rounded cursor-pointer border border-editor-border" />
          <input
            className="flex-1 h-8 bg-editor-bg border border-editor-border rounded px-2 text-xs text-editor-text"
            value={style.fill || '#2d2d30'}
            onChange={(e) => updateNodeStyle(nodeId, { fill: e.target.value })}
          />
        </div>
      </div>

      <div>
        <Label>边框颜色</Label>
        <div className="flex items-center gap-2 mt-1">
          <input type="color" value={style.stroke || '#5a5a5a'} onChange={(e) => updateNodeStyle(nodeId, { stroke: e.target.value })} className="w-8 h-8 rounded cursor-pointer border border-editor-border" />
          <input
            className="flex-1 h-8 bg-editor-bg border border-editor-border rounded px-2 text-xs text-editor-text"
            value={style.stroke || '#5a5a5a'}
            onChange={(e) => updateNodeStyle(nodeId, { stroke: e.target.value })}
          />
        </div>
      </div>

      <div>
        <Label>边框粗细</Label>
        <div className="flex items-center gap-2 mt-1">
          <input type="range" min={0} max={10} step={0.5} value={style.strokeWidth || 1}
            onChange={(e) => updateNodeStyle(nodeId, { strokeWidth: parseFloat(e.target.value) })}
            className="flex-1" />
          <span className="text-xs text-editor-text w-8">{style.strokeWidth || 1}px</span>
        </div>
      </div>

      <div>
        <Label>圆角</Label>
        <div className="flex items-center gap-2 mt-1">
          <input type="range" min={0} max={40} step={1} value={style.borderRadius || 0}
            onChange={(e) => updateNodeStyle(nodeId, { borderRadius: parseInt(e.target.value) })}
            className="flex-1" />
          <span className="text-xs text-editor-text w-8">{style.borderRadius || 0}px</span>
        </div>
      </div>

      <div>
        <Label>透明度</Label>
        <div className="flex items-center gap-2 mt-1">
          <input type="range" min={0.1} max={1} step={0.05} value={style.opacity ?? 1}
            onChange={(e) => updateNodeStyle(nodeId, { opacity: parseFloat(e.target.value) })}
            className="flex-1" />
          <span className="text-xs text-editor-text w-8">{Math.round((style.opacity ?? 1) * 100)}%</span>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <input type="checkbox" id="shadow" checked={style.shadow || false}
          onChange={(e) => updateNodeStyle(nodeId, { shadow: e.target.checked })}
          className="rounded" />
        <Label><BoxSelect size={12} className="inline mr-1" />阴影</Label>
      </div>

      <div>
        <Label>虚线</Label>
        <select
          className="w-full h-8 bg-editor-bg border border-editor-border rounded px-2 text-xs text-editor-text mt-1"
          value={style.dashArray || ''}
          onChange={(e) => updateNodeStyle(nodeId, { dashArray: e.target.value })}
        >
          <option value="">实线</option>
          <option value="4,2">短虚线</option>
          <option value="8,4">长虚线</option>
          <option value="12,4,2,4">点划线</option>
        </select>
      </div>
    </div>
  );
}

function NodeTextEditor({ nodeId }: { nodeId: string }) {
  const node = useEditorStore((s) => s.nodes.find((n) => n.id === nodeId));
  const updateNode = useEditorStore((s) => s.updateNode);
  const updateNodeStyle = useEditorStore((s) => s.updateNodeStyle);
  if (!node) return null;
  const style = node.data.style || {};

  return (
    <div className="space-y-3">
      <div>
        <Label>文本内容</Label>
        <textarea
          className="w-full h-20 mt-1 bg-editor-bg border border-editor-border rounded p-2 text-xs text-editor-text resize-none focus:outline-none focus:border-editor-accent"
          value={node.data.label || ''}
          onChange={(e) => updateNode(nodeId, { data: { ...node.data, label: e.target.value } })}
        />
      </div>

      <div>
        <Label>字体</Label>
        <select
          className="w-full h-8 bg-editor-bg border border-editor-border rounded px-2 text-xs text-editor-text mt-1"
          value={style.fontFamily || 'Arial'}
          onChange={(e) => updateNodeStyle(nodeId, { fontFamily: e.target.value })}
        >
          {FONT_FAMILIES.map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
      </div>

      <div>
        <Label>字号</Label>
        <div className="flex items-center gap-2 mt-1">
          <input type="range" min={8} max={48} step={1} value={style.fontSize || 14}
            onChange={(e) => updateNodeStyle(nodeId, { fontSize: parseInt(e.target.value) })}
            className="flex-1" />
          <span className="text-xs text-editor-text w-8">{style.fontSize || 14}px</span>
        </div>
      </div>

      <div>
        <Label>字体颜色</Label>
        <div className="flex items-center gap-2 mt-1">
          <input type="color" value={style.fontColor || '#cccccc'} onChange={(e) => updateNodeStyle(nodeId, { fontColor: e.target.value })} className="w-8 h-8 rounded cursor-pointer border border-editor-border" />
          <input className="flex-1 h-8 bg-editor-bg border border-editor-border rounded px-2 text-xs text-editor-text" value={style.fontColor || '#cccccc'}
            onChange={(e) => updateNodeStyle(nodeId, { fontColor: e.target.value })} />
        </div>
      </div>

      <div>
        <Label>字体粗细</Label>
        <select
          className="w-full h-8 bg-editor-bg border border-editor-border rounded px-2 text-xs text-editor-text mt-1"
          value={style.fontWeight || 'normal'}
          onChange={(e) => updateNodeStyle(nodeId, { fontWeight: e.target.value })}
        >
          <option value="normal">正常</option>
          <option value="bold">粗体</option>
          <option value="lighter">细体</option>
        </select>
      </div>

      <div>
        <Label>文本对齐</Label>
        <div className="flex gap-1 mt-1">
          {(['left', 'center', 'right'] as const).map((align) => (
            <button
              key={align}
              className={cn('flex-1 py-1 px-2 text-xs rounded border border-editor-border hover:bg-editor-hover',
                (style.textAlign || 'center') === align ? 'bg-editor-accent text-white' : 'text-editor-text')}
              onClick={() => updateNodeStyle(nodeId, { textAlign: align })}
            >
              {align === 'left' ? '左' : align === 'center' ? '中' : '右'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function EdgeStyleEditor({ edgeId }: { edgeId: string }) {
  const edge = useEditorStore((s) => s.edges.find((e) => e.id === edgeId));
  const updateEdge = useEditorStore((s) => s.updateEdge);
  const updateEdgeStyle = useEditorStore((s) => s.updateEdgeStyle);
  if (!edge) return null;

  return (
    <div className="space-y-3">
      <Label>连线样式</Label>

      <div>
        <Label>类型</Label>
        <select
          className="w-full h-8 bg-editor-bg border border-editor-border rounded px-2 text-xs text-editor-text mt-1"
          value={edge.type || 'bezier'}
          onChange={(e) => updateEdge(edgeId, { type: e.target.value as any })}
        >
          {EDGE_TYPE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <div>
        <Label>颜色</Label>
        <div className="flex items-center gap-2 mt-1">
          <input type="color" value={edge.style?.stroke || '#888888'} onChange={(e) => updateEdgeStyle(edgeId, { stroke: e.target.value })} className="w-8 h-8 rounded cursor-pointer border border-editor-border" />
          <input className="flex-1 h-8 bg-editor-bg border border-editor-border rounded px-2 text-xs text-editor-text" value={edge.style?.stroke || '#888888'}
            onChange={(e) => updateEdgeStyle(edgeId, { stroke: e.target.value })} />
        </div>
      </div>

      <div>
        <Label>线宽</Label>
        <div className="flex items-center gap-2 mt-1">
          <input type="range" min={0.5} max={6} step={0.5} value={edge.style?.strokeWidth || 1.5}
            onChange={(e) => updateEdgeStyle(edgeId, { strokeWidth: parseFloat(e.target.value) })}
            className="flex-1" />
          <span className="text-xs text-editor-text w-8">{edge.style?.strokeWidth || 1.5}px</span>
        </div>
      </div>

      <div>
        <Label>起始箭头</Label>
        <select
          className="w-full h-8 bg-editor-bg border border-editor-border rounded px-2 text-xs text-editor-text mt-1"
          value={edge.style?.arrowStart || 'none'}
          onChange={(e) => updateEdgeStyle(edgeId, { arrowStart: e.target.value as any })}
        >
          {ARROW_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <div>
        <Label>终点箭头</Label>
        <select
          className="w-full h-8 bg-editor-bg border border-editor-border rounded px-2 text-xs text-editor-text mt-1"
          value={edge.style?.arrowEnd || 'arrow'}
          onChange={(e) => updateEdgeStyle(edgeId, { arrowEnd: e.target.value as any })}
        >
          {ARROW_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <div>
        <Label>线型</Label>
        <select
          className="w-full h-8 bg-editor-bg border border-editor-border rounded px-2 text-xs text-editor-text mt-1"
          value={edge.style?.lineStyle || 'solid'}
          onChange={(e) => updateEdgeStyle(edgeId, { lineStyle: e.target.value as any })}
        >
          <option value="solid">实线</option>
          <option value="dashed">虚线</option>
          <option value="dotted">点线</option>
        </select>
      </div>

      <div>
        <Label>连线文字</Label>
        <input
          className="w-full h-8 mt-1 bg-editor-bg border border-editor-border rounded px-2 text-xs text-editor-text"
          value={edge.data?.label || ''}
          placeholder="标签"
          onChange={(e) => updateEdge(edgeId, { data: { ...edge.data, label: e.target.value } })}
        />
      </div>

      <div className="flex items-center gap-2 pt-1">
        <input type="checkbox" id="animated" checked={edge.animated || false}
          onChange={(e) => updateEdge(edgeId, { animated: e.target.checked })}
          className="rounded" />
        <Label>动画</Label>
      </div>
    </div>
  );
}

function LayoutEditor() {
  const { updateNode, nodes } = useEditorStore();

  return (
    <div className="space-y-3">
      <div>
        <Label>位置</Label>
        <div className="grid grid-cols-2 gap-2 mt-1">
          <div>
            <span className="text-[10px] text-editor-textMuted">X</span>
            <input type="number" className="w-full h-7 bg-editor-bg border border-editor-border rounded px-2 text-xs text-editor-text"
              placeholder="0" onChange={(e) => {
                const x = parseFloat(e.target.value);
                if (!isNaN(x)) {
                  useEditorStore.getState().selectedNodeIds.forEach((id) => useEditorStore.getState().updateNode(id, { position: { x, y: useEditorStore.getState().nodes.find(n => n.id === id)?.position.y || 0 } }));
                }
              }} />
          </div>
          <div>
            <span className="text-[10px] text-editor-textMuted">Y</span>
            <input type="number" className="w-full h-7 bg-editor-bg border border-editor-border rounded px-2 text-xs text-editor-text"
              placeholder="0" onChange={(e) => {
                const y = parseFloat(e.target.value);
                if (!isNaN(y)) {
                  useEditorStore.getState().selectedNodeIds.forEach((id) => useEditorStore.getState().updateNode(id, { position: { x: useEditorStore.getState().nodes.find(n => n.id === id)?.position.x || 0, y } }));
                }
              }} />
          </div>
        </div>
      </div>

      <div>
        <Label>尺寸</Label>
        <div className="grid grid-cols-2 gap-2 mt-1">
          <div>
            <span className="text-[10px] text-editor-textMuted">宽</span>
            <input type="number" className="w-full h-7 bg-editor-bg border border-editor-border rounded px-2 text-xs text-editor-text"
              placeholder="120" onChange={(e) => {
                const w = parseFloat(e.target.value);
                if (!isNaN(w) && w > 0) {
                  useEditorStore.getState().selectedNodeIds.forEach((id) => useEditorStore.getState().updateNode(id, { width: w }));
                }
              }} />
          </div>
          <div>
            <span className="text-[10px] text-editor-textMuted">高</span>
            <input type="number" className="w-full h-7 bg-editor-bg border border-editor-border rounded px-2 text-xs text-editor-text"
              placeholder="60" onChange={(e) => {
                const h = parseFloat(e.target.value);
                if (!isNaN(h) && h > 0) {
                  useEditorStore.getState().selectedNodeIds.forEach((id) => useEditorStore.getState().updateNode(id, { height: h }));
                }
              }} />
          </div>
        </div>
      </div>

      <div>
        <Label>快速布局</Label>
        <div className="space-y-1 mt-1">
          <button className="w-full py-1.5 text-xs bg-editor-bg border border-editor-border rounded hover:bg-editor-hover text-editor-text"
            onClick={() => useEditorStore.getState().autoLayout('TB')}>智能整理 (上→下)</button>
          <button className="w-full py-1.5 text-xs bg-editor-bg border border-editor-border rounded hover:bg-editor-hover text-editor-text"
            onClick={() => useEditorStore.getState().autoLayout('LR')}>智能整理 (左→右)</button>
        </div>
      </div>

      <div>
        <Label>对齐 (选中多个节点)</Label>
        <div className="grid grid-cols-3 gap-1 mt-1">
          {[
            { label: '左对齐', action: () => {
              const s = useEditorStore.getState();
              const selected = s.nodes.filter(n => s.selectedNodeIds.includes(n.id));
              if (selected.length < 2) return;
              const minX = Math.min(...selected.map(n => n.position.x));
              selected.forEach(n => s.updateNode(n.id, { position: { x: minX, y: n.position.y } }));
            }},
            { label: '居中', action: () => {
              const s = useEditorStore.getState();
              const selected = s.nodes.filter(n => s.selectedNodeIds.includes(n.id));
              if (selected.length < 2) return;
              const avgX = selected.reduce((sum, n) => sum + n.position.x, 0) / selected.length;
              selected.forEach(n => s.updateNode(n.id, { position: { x: avgX, y: n.position.y } }));
            }},
            { label: '右对齐', action: () => {
              const s = useEditorStore.getState();
              const selected = s.nodes.filter(n => s.selectedNodeIds.includes(n.id));
              if (selected.length < 2) return;
              const maxX = Math.max(...selected.map(n => n.position.x));
              selected.forEach(n => s.updateNode(n.id, { position: { x: maxX, y: n.position.y } }));
            }},
            { label: '顶对齐', action: () => {
              const s = useEditorStore.getState();
              const selected = s.nodes.filter(n => s.selectedNodeIds.includes(n.id));
              if (selected.length < 2) return;
              const minY = Math.min(...selected.map(n => n.position.y));
              selected.forEach(n => s.updateNode(n.id, { position: { x: n.position.x, y: minY } }));
            }},
            { label: '中齐', action: () => {
              const s = useEditorStore.getState();
              const selected = s.nodes.filter(n => s.selectedNodeIds.includes(n.id));
              if (selected.length < 2) return;
              const avgY = selected.reduce((sum, n) => sum + n.position.y, 0) / selected.length;
              selected.forEach(n => s.updateNode(n.id, { position: { x: n.position.x, y: avgY } }));
            }},
            { label: '底对齐', action: () => {
              const s = useEditorStore.getState();
              const selected = s.nodes.filter(n => s.selectedNodeIds.includes(n.id));
              if (selected.length < 2) return;
              const maxY = Math.max(...selected.map(n => n.position.y));
              selected.forEach(n => s.updateNode(n.id, { position: { x: n.position.x, y: maxY } }));
            }},
          ].map((btn) => (
            <button key={btn.label} className="py-1 px-1 text-[10px] bg-editor-bg border border-editor-border rounded hover:bg-editor-hover text-editor-text"
              onClick={btn.action}>{btn.label}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

function LayerEditor() {
  const { nodes, updateNode } = useEditorStore();
  const sorted = [...nodes].sort((a, b) => (b.zIndex || 0) - (a.zIndex || 0));

  return (
    <div className="space-y-1">
      <Label>图层顺序</Label>
      {sorted.map((node, i) => (
        <div key={node.id} className="flex items-center gap-2 p-1.5 rounded hover:bg-editor-hover text-xs text-editor-text">
          <span className="text-editor-textMuted w-5">{i + 1}</span>
          <span className="flex-1 truncate">{node.data.label || node.type}</span>
          <button
            className="text-editor-textMuted hover:text-editor-text"
            title="上移"
            onClick={() => updateNode(node.id, { zIndex: (node.zIndex || 0) + 1 })}
          >↑</button>
          <button
            className="text-editor-textMuted hover:text-editor-text"
            title="下移"
            onClick={() => updateNode(node.id, { zIndex: (node.zIndex || 0) - 1 })}
          >↓</button>
        </div>
      ))}
    </div>
  );
}
