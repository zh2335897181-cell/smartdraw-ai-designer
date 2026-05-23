import { useCallback } from 'react';
import { useEditorStore } from '@/store/editorStore';
import { SmartNode, SmartEdge } from '@/lib/types';
import { generateId } from '@/lib/utils';

export function useImport() {
  const { setNodes, setEdges, setViewport } = useEditorStore();

  const importJSON = useCallback((jsonStr: string) => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.nodes) setNodes(data.nodes);
      if (data.edges) setEdges(data.edges);
      if (data.viewport) setViewport(data.viewport);
    } catch {
      throw new Error('Invalid JSON format');
    }
  }, [setNodes, setEdges, setViewport]);

  const importDrawIO = useCallback((xmlStr: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlStr, 'text/xml');
    const cells = doc.querySelectorAll('mxCell');
    const nodes: SmartNode[] = [];
    const edges: SmartEdge[] = [];
    const idMap = new Map<string, string>();

    cells.forEach((cell) => {
      const id = cell.getAttribute('id') || '';
      const parent = cell.getAttribute('parent') || '';
      const style = cell.getAttribute('style') || '';
      const value = cell.getAttribute('value') || '';
      const vertex = cell.getAttribute('vertex');
      const edge = cell.getAttribute('edge');
      const geometry = cell.querySelector('mxGeometry');

      if (vertex === '1' && geometry) {
        const x = parseFloat(geometry.getAttribute('x') || '0');
        const y = parseFloat(geometry.getAttribute('y') || '0');
        const w = parseFloat(geometry.getAttribute('width') || '120');
        const h = parseFloat(geometry.getAttribute('height') || '60');

        // Parse draw.io style
        const styleObj: any = {};
        const fillMatch = style.match(/fillColor=([^;]*)/);
        if (fillMatch) styleObj.fill = fillMatch[1] === 'none' ? 'transparent' : fillMatch[1];
        const strokeMatch = style.match(/strokeColor=([^;]*)/);
        if (strokeMatch) styleObj.stroke = strokeMatch[1] === 'none' ? 'transparent' : strokeMatch[1];
        const rounded = style.includes('rounded=1');
        const shape = style.includes('ellipse') ? 'ellipse' : style.includes('rhombus') ? 'diamond' : rounded ? 'roundedRect' : 'rectangle';

        const newId = generateId();
        idMap.set(id, newId);
        nodes.push({
          id: newId,
          type: shape,
          position: { x, y },
          width: w,
          height: h,
          data: { label: value || '', style: { ...styleObj, borderRadius: rounded ? 12 : 0, width: w, height: h } },
        });
      }

      if (edge === '1' && geometry) {
        const source = cell.getAttribute('source') || '';
        const target = cell.getAttribute('target') || '';
        const sourceId = idMap.get(source);
        const targetId = idMap.get(target);
        if (sourceId && targetId) {
          edges.push({
            id: generateId(),
            source: sourceId,
            target: targetId,
            type: 'bezier',
            data: { label: value || '' },
            style: { stroke: '#888', strokeWidth: 1.5 },
          });
        }
      }
    });

    if (nodes.length > 0) setNodes([...useEditorStore.getState().nodes, ...nodes]);
    if (edges.length > 0) setEdges([...useEditorStore.getState().edges, ...edges]);
  }, [setNodes, setEdges]);

  const importMermaid = useCallback((mermaidStr: string) => {
    const nodes: SmartNode[] = [];
    const edges: SmartEdge[] = [];
    const idMap = new Map<string, string>();
    let y = 50;

    const lines = mermaidStr.split('\n').filter((l) => l.trim());
    const isFlowchart = lines.some((l) => l.includes('graph ') || l.includes('flowchart '));

    for (const line of lines) {
      const trimmed = line.trim();

      // Node definitions: A[Label], B{Decision}, C((Circle)), D[(Database)]
      const nodeMatch = trimmed.match(/^\s*(\w+)\s*(\[.*?\]|\{.*?\}|\(\(.*?\)\)|\[\(.*?\)\]|\[\[.*?\]\])\s*;?\s*$/);
      if (nodeMatch) {
        const nodeId = nodeMatch[1];
        const content = nodeMatch[2];
        let label = content.replace(/[\[\]{}\(\)]+/g, '');
        let shape: SmartNode['type'] = 'rectangle';

        if (content.startsWith('{')) shape = 'diamond';
        else if (content.startsWith('((')) shape = 'ellipse';
        else if (content.startsWith('[(')) shape = 'cylinder';
        else if (content.startsWith('[[')) shape = 'roundedRect';

        const newId = generateId();
        idMap.set(nodeId, newId);
        nodes.push({
          id: newId, type: shape,
          position: { x: 200, y },
          width: 120, height: shape === 'diamond' || shape === 'ellipse' ? 80 : 60,
          data: { label, style: { fill: '#2d2d30', stroke: '#5a5a5a', strokeWidth: 1.5, width: 120, height: 60 } },
        });
        y += 100;
      }

      // Edge definitions: A --> B, A -->|text| B
      const edgeMatch = trimmed.match(/^\s*(\w+)\s*-+>+\s*\|?([^|]*)\|?\s*(\w+)\s*;?\s*$/);
      if (edgeMatch) {
        const src = idMap.get(edgeMatch[1]) || edgeMatch[1];
        const tgt = idMap.get(edgeMatch[3]) || edgeMatch[3];
        const label = edgeMatch[2]?.trim();
        edges.push({
          id: generateId(), source: src, target: tgt, type: 'bezier',
          data: { label: label || '' },
          style: { stroke: '#888', strokeWidth: 1.5 },
        });
      }
    }

    if (nodes.length > 0) setNodes([...useEditorStore.getState().nodes, ...nodes]);
    if (edges.length > 0) setEdges([...useEditorStore.getState().edges, ...edges]);
  }, [setNodes, setEdges]);

  return { importJSON, importDrawIO, importMermaid };
}
