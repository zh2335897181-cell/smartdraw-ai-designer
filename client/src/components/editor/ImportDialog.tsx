import React, { useState, useRef } from 'react';
import { X, Upload, FileText } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { useImport } from '@/hooks/useImport';
import { Button } from '@/components/ui/button';

export default function ImportDialog() {
  const { setShowImportDialog } = useUIStore();
  const { importJSON, importDrawIO, importMermaid } = useImport();
  const [mode, setMode] = useState<'xml' | 'json' | 'mermaid'>('xml');
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImport = () => {
    setError('');
    try {
      if (mode === 'xml') importDrawIO(text);
      else if (mode === 'json') importJSON(text);
      else if (mode === 'mermaid') importMermaid(text);
      setShowImportDialog(false);
    } catch (err: any) {
      setError(err.message || '导入失败');
    }
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { setText(reader.result as string); };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200]" onClick={() => setShowImportDialog(false)}>
      <div className="bg-editor-surface border border-editor-border rounded-lg w-[500px] max-h-[80vh] flex flex-col shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-editor-border">
          <h3 className="text-sm font-semibold text-editor-text">导入图表</h3>
          <button onClick={() => setShowImportDialog(false)} className="p-1 hover:bg-editor-hover rounded">
            <X size={16} className="text-editor-textMuted" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="flex gap-2">
            {(['xml', 'json', 'mermaid'] as const).map((m) => (
              <button
                key={m}
                className={`px-3 py-1.5 text-xs rounded ${mode === m ? 'bg-editor-accent text-white' : 'bg-editor-bg text-editor-text border border-editor-border'}`}
                onClick={() => setMode(m)}
              >
                {m === 'xml' ? 'draw.io XML' : m === 'json' ? 'JSON' : 'Mermaid'}
              </button>
            ))}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-editor-textMuted">
                {mode === 'xml' ? '粘贴 draw.io XML 内容' : mode === 'json' ? '粘贴 JSON 内容' : '粘贴 Mermaid 语法'}
              </span>
              <button className="text-xs text-editor-accent hover:underline" onClick={() => fileRef.current?.click()}>
                或选择文件
              </button>
              <input ref={fileRef} type="file" accept={mode === 'xml' ? '.xml,.drawio' : mode === 'json' ? '.json' : '.mmd,.mermaid'} className="hidden" onChange={handleFile} />
            </div>
            <textarea
              className="w-full h-48 bg-editor-bg border border-editor-border rounded p-3 text-xs text-editor-text font-mono resize-none focus:outline-none focus:border-editor-accent"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={mode === 'xml' ? '<mxfile>...</mxfile>' : mode === 'json' ? '{"nodes": [...], "edges": [...]}' : 'graph TD\n  A --> B'}
            />
          </div>

          {error && <div className="bg-red-900/20 border border-red-800 text-red-400 text-xs rounded p-2">{error}</div>}

          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowImportDialog(false)}>取消</Button>
            <Button variant="primary" size="sm" onClick={handleImport} disabled={!text.trim()}>
              <FileText size={14} className="mr-1" /> 导入
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
