import { useCallback } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useEditorStore } from '@/store/editorStore';
import { downloadFile } from '@/lib/utils';

export function useExport() {
  const { nodes, edges, diagramName } = useEditorStore();

  const exportJSON = useCallback(() => {
    downloadFile(
      JSON.stringify({ nodes, edges, name: diagramName, version: '1.0', exportedAt: new Date().toISOString() }, null, 2),
      `${diagramName || 'diagram'}.json`,
      'application/json'
    );
  }, [nodes, edges, diagramName]);

  const exportSVG = useCallback(() => {
    const bbox = getBoundingBox(nodes);
    const pad = 20;
    const w = bbox.maxX - bbox.minX + pad * 2;
    const h = bbox.maxY - bbox.minY + pad * 2;

    let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="${bbox.minX - pad} ${bbox.minY - pad} ${w} ${h}">`;
    svgContent += `<rect width="${w}" height="${h}" fill="#1e1e1e"/>`;

    // Render edges
    edges.forEach((e) => {
      const s = nodes.find((n) => n.id === e.source);
      const t = nodes.find((n) => n.id === e.target);
      if (!s || !t) return;
      const sx = s.position.x + (s.width || 120) / 2;
      const sy = s.position.y + (s.height || 60) / 2;
      const tx = t.position.x + (t.width || 120) / 2;
      const ty = t.position.y + (t.height || 60) / 2;
      svgContent += `<path d="M${sx},${sy} C${sx},${(sy+ty)/2} ${tx},${(sy+ty)/2} ${tx},${ty}" stroke="#888" stroke-width="1.5" fill="none" marker-end="url(#arrow)"/>`;
    });

    // Render nodes
    nodes.forEach((n) => {
      const x = n.position.x;
      const y = n.position.y;
      const w2 = n.width || 120;
      const h2 = n.height || 60;
      const style = n.data.style || {};
      const fill = style.fill || '#2d2d30';
      const stroke = style.stroke || '#5a5a5a';
      sw = style.strokeWidth || 1;
      const rx = style.borderRadius || 0;
      svgContent += `<rect x="${x}" y="${y}" width="${w2}" height="${h2}" rx="${rx}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
      svgContent += `<text x="${x + w2/2}" y="${y + h2/2 + 5}" text-anchor="middle" fill="${style.fontColor || '#ccc'}" font-size="${style.fontSize || 14}" font-family="${style.fontFamily || 'Arial'}">${escapeXml(n.data.label || '')}</text>`;
    });

    svgContent += '<defs><marker id="arrow" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill="#888"/></marker></defs>';
    svgContent += '</svg>';
    downloadFile(svgContent, `${diagramName || 'diagram'}.svg`, 'image/svg+xml');
  }, [nodes, edges, diagramName]);

  const exportPNG = useCallback(async () => {
    const flowEl = document.querySelector('.react-flow') as HTMLElement;
    if (!flowEl) return;
    const canvas = await html2canvas(flowEl, { backgroundColor: '#1e1e1e' });
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${diagramName || 'diagram'}.png`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }, [diagramName]);

  const exportPDF = useCallback(async () => {
    const flowEl = document.querySelector('.react-flow') as HTMLElement;
    if (!flowEl) return;
    const canvas = await html2canvas(flowEl, { backgroundColor: '#1e1e1e' });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('landscape', 'px', [canvas.width, canvas.height]);
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save(`${diagramName || 'diagram'}.pdf`);
  }, [diagramName]);

  return { exportJSON, exportSVG, exportPNG, exportPDF };
}

let sw = 1;
function getBoundingBox(nodes: any[]) {
  if (nodes.length === 0) return { minX: 0, minY: 0, maxX: 800, maxY: 600 };
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  nodes.forEach((n) => {
    minX = Math.min(minX, n.position.x);
    minY = Math.min(minY, n.position.y);
    maxX = Math.max(maxX, n.position.x + (n.width || 120));
    maxY = Math.max(maxY, n.position.y + (n.height || 60));
  });
  return { minX, minY, maxX, maxY };
}

function escapeXml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
