import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/utils';

export default function SettingsPage() {
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useUIStore();

  const [gridEnabled, setGridEnabled] = useState(true);
  const [snapEnabled, setSnapEnabled] = useState(true);
  const [autoSaveInterval, setAutoSaveInterval] = useState(30);
  const [defaultFont, setDefaultFont] = useState('Arial');
  const [defaultFontSize, setDefaultFontSize] = useState(14);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return; }
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const s = await api.get('/user/settings');
      if (s.grid_enabled !== undefined) setGridEnabled(!!s.grid_enabled);
      if (s.snap_enabled !== undefined) setSnapEnabled(!!s.snap_enabled);
      if (s.auto_save_interval) setAutoSaveInterval(s.auto_save_interval);
      if (s.default_font) setDefaultFont(s.default_font);
      if (s.default_font_size) setDefaultFontSize(s.default_font_size);
    } catch {}
  };

  const saveSettings = async () => {
    try {
      await api.put('/user/settings', {
        grid_enabled: gridEnabled,
        snap_enabled: snapEnabled,
        auto_save_interval: autoSaveInterval,
        default_font: defaultFont,
        default_font_size: defaultFontSize,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {}
  };

  return (
    <div className="min-h-screen bg-editor-bg">
      <div className="h-12 bg-editor-header border-b border-editor-border flex items-center px-4">
        <button className="flex items-center gap-1 text-sm text-editor-text hover:text-editor-accent" onClick={() => navigate('/')}>
          <ArrowLeft size={16} /> 返回首页
        </button>
        <div className="flex-1 text-center text-sm font-semibold text-editor-text">设置</div>
      </div>

      <div className="max-w-lg mx-auto p-6 space-y-6">
        <div className="bg-editor-surface border border-editor-border rounded-lg p-4 space-y-4">
          <h3 className="text-sm font-semibold text-editor-text">账户信息</h3>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div><Label>用户名</Label><p className="text-editor-text mt-0.5">{user?.username}</p></div>
            <div><Label>邮箱</Label><p className="text-editor-text mt-0.5">{user?.email}</p></div>
            <div><Label>显示名称</Label><p className="text-editor-text mt-0.5">{user?.displayName || '-'}</p></div>
          </div>
        </div>

        <div className="bg-editor-surface border border-editor-border rounded-lg p-4 space-y-4">
          <h3 className="text-sm font-semibold text-editor-text">编辑器设置</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label>深色模式</Label>
                <p className="text-[10px] text-editor-textMuted">切换编辑器的深/浅色主题</p>
              </div>
              <button
                className={`relative w-10 h-5 rounded-full transition-colors ${darkMode ? 'bg-editor-accent' : 'bg-editor-border'}`}
                onClick={toggleDarkMode}
              >
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${darkMode ? 'left-5' : 'left-0.5'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>显示网格</Label>
                <p className="text-[10px] text-editor-textMuted">在画布上显示点状网格</p>
              </div>
              <input type="checkbox" checked={gridEnabled} onChange={(e) => setGridEnabled(e.target.checked)} className="rounded" />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>自动吸附</Label>
                <p className="text-[10px] text-editor-textMuted">移动节点时自动吸附到网格</p>
              </div>
              <input type="checkbox" checked={snapEnabled} onChange={(e) => setSnapEnabled(e.target.checked)} className="rounded" />
            </div>

            <div>
              <Label>自动保存间隔 (秒)</Label>
              <input type="number" className="w-24 h-8 mt-1 bg-editor-bg border border-editor-border rounded px-2 text-xs text-editor-text" value={autoSaveInterval}
                onChange={(e) => setAutoSaveInterval(parseInt(e.target.value) || 30)} min={10} max={300} />
            </div>

            <div>
              <Label>默认字体</Label>
              <select className="w-full h-8 mt-1 bg-editor-bg border border-editor-border rounded px-2 text-xs text-editor-text"
                value={defaultFont} onChange={(e) => setDefaultFont(e.target.value)}>
                {['Arial','Helvetica','Segoe UI','system-ui','Times New Roman','Consolas','Courier New','Verdana'].map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>

            <div>
              <Label>默认字号</Label>
              <input type="number" className="w-24 h-8 mt-1 bg-editor-bg border border-editor-border rounded px-2 text-xs text-editor-text"
                value={defaultFontSize} onChange={(e) => setDefaultFontSize(parseInt(e.target.value) || 14)} min={8} max={48} />
            </div>
          </div>

          <Button variant="primary" size="sm" onClick={saveSettings} className="w-full">
            <Save size={14} className="mr-1" /> {saved ? '已保存 ✓' : '保存设置'}
          </Button>
        </div>
      </div>
    </div>
  );
}
