import React, { useState, useCallback } from 'react';
import { Sparkles, Loader2, X, FileCode, Database, Wand2, Settings, Key, Zap, Search, Lightbulb } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { useEditorStore } from '@/store/editorStore';
import { useImport } from '@/hooks/useImport';
import { generateId } from '@/lib/utils';
import { parseSQL, formatTableSummary } from '@/lib/sqlParser';
import { generateDiagram, analyzeDiagram, isAIConfigured, configureAI } from '@/lib/aiService';
import { SmartNode, SmartEdge } from '@/lib/types';

type Tab = 'ai' | 'sql' | 'mermaid' | 'config';

const flowKeywords: Record<string, any> = {
  '用户登录流程': { nodes: [
    { id:'1', type:'startEnd', label:'开始', x:250, y:0, w:100, h:50 },
    { id:'2', type:'process', label:'输入用户名密码', x:250, y:80, w:130, h:60 },
    { id:'3', type:'decision', label:'验证信息?', x:250, y:170, w:120, h:80 },
    { id:'4', type:'process', label:'查询数据库', x:120, y:280, w:120, h:60 },
    { id:'5', type:'process', label:'生成JWT Token', x:250, y:280, w:130, h:60 },
    { id:'6', type:'decision', label:'密码正确?', x:120, y:370, w:120, h:80 },
    { id:'7', type:'process', label:'返回错误', x:0, y:480, w:120, h:60 },
    { id:'8', type:'startEnd', label:'登录成功', x:250, y:480, w:100, h:50 },
    { id:'9', type:'startEnd', label:'登录失败', x:0, y:570, w:100, h:50 },
  ], edges: [
    { s:'1',t:'2'},{s:'2',t:'3'},{s:'3',t:'4',l:'是'},{s:'4',t:'6'},{s:'6',t:'7',l:'否'},{s:'6',t:'5',l:'是'},{s:'5',t:'8'},{s:'7',t:'9'},
  ]},
  'CRUD操作流程': { nodes: [
    { id:'1', type:'startEnd', label:'开始', x:200, y:0, w:100, h:50 },
    { id:'2', type:'process', label:'接收HTTP请求', x:200, y:80, w:130, h:60 },
    { id:'3', type:'decision', label:'请求方法?', x:200, y:170, w:120, h:80 },
    { id:'4', type:'process', label:'GET: 查询', x:0, y:280, w:110, h:60 },
    { id:'5', type:'process', label:'POST: 创建', x:130, y:280, w:110, h:60 },
    { id:'6', type:'process', label:'PUT: 更新', x:260, y:280, w:110, h:60 },
    { id:'7', type:'process', label:'DELETE: 删除', x:390, y:280, w:120, h:60 },
    { id:'8', type:'process', label:'返回JSON响应', x:200, y:370, w:130, h:60 },
    { id:'9', type:'startEnd', label:'结束', x:200, y:460, w:100, h:50 },
  ], edges: [
    { s:'1',t:'2'},{s:'2',t:'3'},{s:'3',t:'4',l:'GET'},{s:'3',t:'5',l:'POST'},{s:'3',t:'6',l:'PUT'},{s:'3',t:'7',l:'DELETE'},
    { s:'4',t:'8'},{s:'5',t:'8'},{s:'6',t:'8'},{s:'7',t:'8'},{s:'8',t:'9'},
  ]},
  '微服务架构图': { nodes: [
    { id:'1', type:'process', label:'API Gateway', x:180, y:0, w:130, h:50 },
    { id:'2', type:'process', label:'Auth Service', x:30, y:120, w:120, h:60 },
    { id:'3', type:'process', label:'User Service', x:190, y:120, w:120, h:60 },
    { id:'4', type:'process', label:'Order Service', x:350, y:120, w:120, h:60 },
    { id:'5', type:'cylinder', label:'User DB', x:190, y:240, w:100, h:70 },
    { id:'6', type:'cylinder', label:'Order DB', x:360, y:240, w:100, h:70 },
    { id:'7', type:'process', label:'Message Queue', x:180, y:360, w:130, h:50 },
  ], edges: [
    { s:'1',t:'2'},{s:'1',t:'3'},{s:'1',t:'4'},{s:'3',t:'5'},{s:'4',t:'6'},{s:'2',t:'7'},{s:'3',t:'7'},{s:'4',t:'7'},
  ]},
};

const safeJsonParse = (v: any) => {
  if (!v) return {};
  if (typeof v === 'object') return v;
  try { return JSON.parse(v); } catch { return {}; }
};

export default function AIPanel() {
  const { showAIPanel, setShowAIPanel, aiPrompt, setAiPrompt, aiLoading, setAiLoading } = useUIStore();
  const { importMermaid } = useImport();
  const { nodes: existingNodes, edges: existingEdges, setNodes, setEdges, generateErFromSQL } = useEditorStore();
  const [tab, setTab] = useState<Tab>('ai');
  const [sqlInput, setSqlInput] = useState('');
  const [mermaidInput, setMermaidInput] = useState('');
  const [apiKey, setApiKey] = useState(localStorage.getItem('sd-ai-key') || '');
  const [aiModel, setAiModel] = useState(localStorage.getItem('sd-ai-model') || 'gpt-4o');
  const [analysis, setAnalysis] = useState('');

  // ALL hooks must be before any early return
  const applyTemplate = useCallback((template: any) => {
    const idMap = new Map<string, string>();
    const newNodes: SmartNode[] = template.nodes.map((n: any) => {
      const newId = generateId();
      idMap.set(n.id, newId);
      return {
        id: newId, type: n.type, position: { x: n.x + 100, y: n.y + 100 },
        width: n.w || 120, height: n.h || 60,
        data: { label: n.label, style: { fill: '#2d2d30', stroke: '#5a5a5a', strokeWidth: 1.5, width: n.w || 120, height: n.h || 60, borderRadius: n.type === 'startEnd' ? 25 : 0 } },
      };
    });
    const newEdges: SmartEdge[] = template.edges.map((e: any) => ({
      id: generateId(), source: idMap.get(e.s) || e.s, target: idMap.get(e.t) || e.t,
      type: 'bezier' as const, data: { label: e.l || '' },
      style: { stroke: '#888', strokeWidth: 1.5 },
    }));
    setNodes([...useEditorStore.getState().nodes, ...newNodes]);
    setEdges([...useEditorStore.getState().edges, ...newEdges]);
  }, [setNodes, setEdges]);

  // Real AI generation
  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    try {
      if (isAIConfigured()) {
        const result = await generateDiagram(aiPrompt);
        const idMap = new Map<string, string>();
        const newNodes: SmartNode[] = result.nodes.map((n: any) => {
          const newId = generateId();
          idMap.set(n.id, newId);
          return {
            id: newId, type: n.type || 'process',
            position: { x: (n.x || 200) + 50, y: (n.y || 100) + 50 },
            width: n.width || 120, height: n.height || 60,
            data: { label: n.label || '', style: { fill: n.fill || '#2d2d30', stroke: n.stroke || '#5a5a5a', strokeWidth: 1.5, width: n.width || 120, height: n.height || 60 } },
          };
        });
        const newEdges: SmartEdge[] = (result.edges || []).map((e: any) => ({
          id: generateId(), source: idMap.get(e.source) || e.source, target: idMap.get(e.target) || e.target,
          type: e.type || 'bezier', data: { label: e.label || '' },
          style: { stroke: '#888', strokeWidth: 1.5 },
        }));
        setNodes([...useEditorStore.getState().nodes, ...newNodes]);
        setEdges([...useEditorStore.getState().edges, ...newEdges]);
      } else {
        // Fallback: keyword matching from templates
        const matched = Object.entries(flowKeywords).find(([key]) => aiPrompt.includes(key));
        if (matched) { applyTemplate(matched[1]); } else {
          // Generic template
          applyTemplate({
            nodes: [
              { id:'1', type:'startEnd', label:'开始', x:250, y:0, w:100, h:50 },
              { id:'2', type:'process', label:aiPrompt, x:250, y:100, w:160, h:70 },
              { id:'3', type:'startEnd', label:'结束', x:250, y:220, w:100, h:50 },
            ],
            edges: [{ s:'1',t:'2' },{ s:'2',t:'3' }],
          });
        }
      }
      setAiPrompt('');
    } catch (err: any) { alert(err.message); }
    setAiLoading(false);
  };

  // SQL → ER
  const handleSQLToER = () => {
    if (!sqlInput.trim()) return;
    try {
      const tables = parseSQL(sqlInput);
      if (tables.length === 0) { alert('未识别到 CREATE TABLE 语句'); return; }
      generateErFromSQL(tables);
      setSqlInput('');
    } catch (err: any) { alert('SQL 解析错误: ' + err.message); }
  };

  // Mermaid import
  const handleMermaidImport = () => {
    if (!mermaidInput.trim()) return;
    importMermaid(mermaidInput);
    setMermaidInput('');
  };

  // Analyze diagram
  const handleAnalyze = async () => {
    const { nodes, edges } = useEditorStore.getState();
    if (nodes.length === 0) { alert('画布为空，请先添加节点'); return; }
    setAiLoading(true);
    try {
      const result = await analyzeDiagram(nodes, edges);
      setAnalysis(result);
    } catch (err: any) { alert(err.message); }
    setAiLoading(false);
  };

  // Save AI config
  const handleSaveConfig = () => {
    configureAI(apiKey, aiModel);
    alert('AI 配置已保存');
  };

  if (!showAIPanel) return null;

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'ai', label: 'AI 生成', icon: <Sparkles size={14} /> },
    { key: 'sql', label: 'SQL→ER', icon: <Database size={14} /> },
    { key: 'mermaid', label: 'Mermaid', icon: <FileCode size={14} /> },
    { key: 'config', label: '设置', icon: <Settings size={14} /> },
  ];

  return (
    <div className="w-80 bg-editor-sidebar border-l border-editor-border flex flex-col overflow-hidden flex-shrink-0">
      <div className="flex items-center justify-between px-3 py-2 border-b border-editor-border">
        <h3 className="text-xs font-semibold text-editor-text flex items-center gap-1">
          <Wand2 size={14} className="text-purple-400" /> 智能工具
        </h3>
        <button onClick={() => setShowAIPanel(false)} className="p-1 hover:bg-editor-hover rounded">
          <X size={14} className="text-editor-textMuted" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-editor-border px-1">
        {tabs.map((t) => (
          <button key={t.key}
            className={`flex items-center gap-1 px-2.5 py-2 text-[11px] border-b-2 transition-colors ${
              tab === t.key ? 'border-purple-500 text-editor-text' : 'border-transparent text-editor-textMuted hover:text-editor-text'
            }`}
            onClick={() => setTab(t.key)}
          >{t.icon}{t.label}</button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* AI Tab */}
        {tab === 'ai' && (
          <>
            <div>
              <p className="text-[10px] text-editor-textMuted mb-1.5">
                {isAIConfigured() ? '输入描述，AI 自动生成图表' : '输入描述生成图表（未配置AI将使用模板）'}
              </p>
              <textarea
                className="w-full h-16 bg-editor-bg border border-editor-border rounded p-2 text-xs text-editor-text resize-none focus:outline-none focus:border-purple-500 placeholder:text-editor-textMuted"
                placeholder='例如："电子商务订单处理流程"、"用户注册和邮箱验证"、"K8s Pod 调度流程"'
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                onKeyDown={(e) => e.ctrlKey && e.key === 'Enter' && handleAIGenerate()}
              />
              <div className="flex gap-1.5 mt-1.5">
                <button
                  className="flex-1 h-8 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded flex items-center justify-center gap-1 transition-colors disabled:opacity-50"
                  onClick={handleAIGenerate}
                  disabled={aiLoading || !aiPrompt.trim()}
                >
                  {aiLoading ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
                  {aiLoading ? '...' : '生成'}
                </button>
                <button
                  className="h-8 px-2 bg-editor-surface hover:bg-editor-hover border border-editor-border text-editor-text text-xs rounded flex items-center gap-1 transition-colors disabled:opacity-50"
                  onClick={handleAnalyze}
                  disabled={aiLoading || !isAIConfigured()}
                  title="分析当前图表结构"
                >
                  <Search size={13} /> 分析
                </button>
              </div>
              {analysis && (
                <div className="mt-2 bg-editor-bg border border-editor-border rounded p-2 text-[10px] text-editor-text leading-relaxed">
                  <p className="text-xs font-medium mb-1 flex items-center gap-1"><Lightbulb size={12} className="text-yellow-400" /> 分析结果</p>
                  {analysis}
                </div>
              )}
            </div>
            <div className="border-t border-editor-border pt-2">
              <p className="text-[10px] text-editor-textMuted mb-1.5">快速模板</p>
              <div className="grid grid-cols-2 gap-1">
                {Object.keys(flowKeywords).map((key) => (
                  <button key={key} className="text-left px-2 py-1.5 text-[10px] text-editor-textMuted hover:text-editor-text hover:bg-editor-hover rounded border border-editor-border"
                    onClick={() => applyTemplate(flowKeywords[key])}>{key}</button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* SQL Tab */}
        {tab === 'sql' && (
          <>
            <p className="text-[10px] text-editor-textMuted">
              粘贴 CREATE TABLE 语句，自动生成 ER 图。支持 MySQL / PostgreSQL 语法。
            </p>
            <textarea
              className="w-full h-40 bg-editor-bg border border-editor-border rounded p-2 text-[11px] text-editor-text font-mono resize-none focus:outline-none focus:border-purple-500"
              placeholder={`CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL,
  email VARCHAR(100) UNIQUE
);

CREATE TABLE orders (
  id INT PRIMARY KEY,
  user_id INT NOT NULL,
  total DECIMAL(10,2),
  FOREIGN KEY (user_id) REFERENCES users(id)
);`}
              value={sqlInput}
              onChange={(e) => setSqlInput(e.target.value)}
            />
            <button
              className="w-full h-8 bg-amber-600 hover:bg-amber-700 text-white text-xs rounded flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
              onClick={handleSQLToER}
              disabled={!sqlInput.trim()}
            >
              <Database size={13} /> 生成 ER 图
            </button>
            <div className="text-[10px] text-editor-textMuted space-y-1">
              <p>支持识别：</p>
              <ul className="list-disc pl-3 space-y-0.5">
                <li>表名和列定义</li>
                <li>PRIMARY KEY 主键</li>
                <li>FOREIGN KEY / REFERENCES 外键</li>
                <li>NOT NULL / DEFAULT 约束</li>
                <li>自动检测 xxx_id 隐式外键</li>
              </ul>
            </div>
          </>
        )}

        {/* Mermaid Tab */}
        {tab === 'mermaid' && (
          <>
            <p className="text-[10px] text-editor-textMuted">粘贴 Mermaid 语法，自动转换为流程图。</p>
            <textarea
              className="w-full h-40 bg-editor-bg border border-editor-border rounded p-2 text-xs text-editor-text font-mono resize-none focus:outline-none focus:border-purple-500"
              placeholder={`graph TD
    A[开始] --> B[处理]
    B --> C{判断}
    C -->|是| D[结束]
    C -->|否| B`}
              value={mermaidInput}
              onChange={(e) => setMermaidInput(e.target.value)}
            />
            <button
              className="w-full h-8 bg-editor-surface hover:bg-editor-hover border border-editor-border text-editor-text text-xs rounded flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
              onClick={handleMermaidImport}
              disabled={!mermaidInput.trim()}
            >
              <FileCode size={13} /> 导入 Mermaid
            </button>
          </>
        )}

        {/* Config Tab */}
        {tab === 'config' && (
          <>
            <p className="text-[10px] text-editor-textMuted">配置 AI API 以启用智能生成和分析功能。</p>
            <div className="space-y-2">
              <div>
                <label className="text-[10px] text-editor-textMuted">API Key</label>
                <input
                  type="password"
                  className="w-full h-8 mt-0.5 bg-editor-bg border border-editor-border rounded px-2 text-xs text-editor-text focus:outline-none focus:border-purple-500"
                  placeholder="sk-..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
              </div>
              <div>
                <label className="text-[10px] text-editor-textMuted">模型</label>
                <select
                  className="w-full h-8 mt-0.5 bg-editor-bg border border-editor-border rounded px-2 text-xs text-editor-text"
                  value={aiModel}
                  onChange={(e) => setAiModel(e.target.value)}
                >
                  <option value="gpt-4o">GPT-4o</option>
                  <option value="gpt-4o-mini">GPT-4o Mini</option>
                  <option value="claude-sonnet-4-6">Claude Sonnet 4.6</option>
                  <option value="claude-opus-4-7">Claude Opus 4.7</option>
                  <option value="deepseek-v4">DeepSeek V4</option>
                </select>
              </div>
              <button
                className="w-full h-8 bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded flex items-center justify-center gap-1.5 transition-colors"
                onClick={handleSaveConfig}
              >
                <Key size={13} /> 保存配置
              </button>
              <p className="text-[10px] text-editor-textMuted">
                支持 OpenAI / Anthropic 兼容 API。API Key 仅保存在浏览器本地存储中。
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
