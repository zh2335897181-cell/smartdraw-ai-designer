import React from 'react';
import { X, FileJson, FileImage, FileText, FileDown } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { useExport } from '@/hooks/useExport';
import { Button } from '@/components/ui/button';

export default function ExportDialog() {
  const { setShowExportDialog } = useUIStore();
  const { exportJSON, exportSVG, exportPNG, exportPDF } = useExport();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200]" onClick={() => setShowExportDialog(false)}>
      <div className="bg-editor-surface border border-editor-border rounded-lg w-80 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-editor-border">
          <h3 className="text-sm font-semibold text-editor-text">导出图表</h3>
          <button onClick={() => setShowExportDialog(false)} className="p-1 hover:bg-editor-hover rounded">
            <X size={16} className="text-editor-textMuted" />
          </button>
        </div>

        <div className="p-3 space-y-1">
          <button
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded hover:bg-editor-hover text-sm text-editor-text transition-colors"
            onClick={() => { exportJSON(); setShowExportDialog(false); }}
          >
            <FileJson size={18} className="text-yellow-400" />
            <div className="text-left">
              <p className="text-xs font-medium">JSON</p>
              <p className="text-[10px] text-editor-textMuted">导出为 SmartDraw JSON 格式</p>
            </div>
          </button>

          <button
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded hover:bg-editor-hover text-sm text-editor-text transition-colors"
            onClick={() => { exportSVG(); setShowExportDialog(false); }}
          >
            <FileText size={18} className="text-orange-400" />
            <div className="text-left">
              <p className="text-xs font-medium">SVG</p>
              <p className="text-[10px] text-editor-textMuted">矢量图形，可缩放入</p>
            </div>
          </button>

          <button
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded hover:bg-editor-hover text-sm text-editor-text transition-colors"
            onClick={() => { exportPNG(); setShowExportDialog(false); }}
          >
            <FileImage size={18} className="text-blue-400" />
            <div className="text-left">
              <p className="text-xs font-medium">PNG</p>
              <p className="text-[10px] text-editor-textMuted">高清位图图像</p>
            </div>
          </button>

          <button
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded hover:bg-editor-hover text-sm text-editor-text transition-colors"
            onClick={() => { exportPDF(); setShowExportDialog(false); }}
          >
            <FileDown size={18} className="text-red-400" />
            <div className="text-left">
              <p className="text-xs font-medium">PDF</p>
              <p className="text-[10px] text-editor-textMuted">适合打印</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
