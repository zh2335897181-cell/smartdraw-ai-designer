import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FolderOpen, Search, Trash2, Clock, Layout } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/utils';
import { Project } from '@/lib/types';

export default function HomePage() {
  const { user, isAuthenticated, fetchMe, logout } = useAuthStore();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState('');
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return; }
    fetchMe();
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const data = await api.get('/projects');
      setProjects(data);
    } catch { setProjects([]); }
    setLoading(false);
  };

  const createProject = async () => {
    if (!newName.trim()) return;
    try {
      const proj = await api.post('/projects', { name: newName });
      // Create default diagram
      const diag = await api.post('/diagrams', { projectId: proj.id, name: 'Diagram 1', diagramType: 'flowchart' });
      setNewName('');
      navigate(`/editor/${diag.id}?projectId=${proj.id}`);
    } catch {}
  };

  const deleteProject = async (id: string) => {
    if (!confirm('确认删除此项目？')) return;
    try {
      await api.delete(`/projects/${id}`);
      setProjects((p) => p.filter((pr) => pr.id !== id));
    } catch {}
  };

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) && !p.isArchived
  );

  return (
    <div className="min-h-screen bg-editor-bg">
      {/* Header */}
      <div className="h-12 bg-editor-header border-b border-editor-border flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-editor-accent rounded flex items-center justify-center text-white text-xs font-bold">SD</div>
          <span className="text-sm font-semibold text-editor-text">SmartDraw</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-editor-textMuted">{user?.email}</span>
          <button className="text-xs text-editor-textMuted hover:text-editor-text" onClick={() => { logout(); navigate('/login'); }}>退出</button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-lg font-semibold text-editor-text">我的项目</h1>
            <p className="text-xs text-editor-textMuted mt-0.5">{projects.length} 个项目</p>
          </div>
          <div className="flex items-center gap-2">
            <Input
              className="w-52"
              placeholder="项目名称"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && createProject()}
            />
            <Button variant="primary" size="sm" onClick={createProject} disabled={!newName.trim()}>
              <Plus size={14} className="mr-1" /> 新建项目
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-editor-textMuted" />
          <input
            className="w-full h-9 pl-8 pr-3 bg-editor-surface border border-editor-border rounded text-sm text-editor-text placeholder:text-editor-textMuted focus:outline-none focus:border-editor-accent"
            placeholder="搜索项目..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Project grid */}
        {loading ? (
          <div className="text-center text-editor-textMuted text-sm py-12">加载中...</div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-16">
            <FolderOpen size={40} className="mx-auto text-editor-border mb-3" />
            <p className="text-editor-textMuted text-sm">{search ? '没有找到匹配的项目' : '还没有项目，创建一个开始吧'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredProjects.map((proj) => (
              <div
                key={proj.id}
                className="bg-editor-surface border border-editor-border rounded-lg p-3 hover:border-editor-accent transition-colors cursor-pointer group"
                onClick={() => {
                  // Get first diagram or create one
                  api.get(`/projects/${proj.id}`).then((p) => {
                    if (p.diagrams?.length > 0) {
                      navigate(`/editor/${p.diagrams[0].id}?projectId=${proj.id}`);
                    } else {
                      // Create new diagram
                      api.post('/diagrams', { projectId: proj.id, name: 'Diagram 1' }).then((d) => {
                        navigate(`/editor/${d.id}?projectId=${proj.id}`);
                      });
                    }
                  }).catch(() => {});
                }}
              >
                <div className="w-full h-24 bg-editor-bg rounded border border-editor-border mb-2 flex items-center justify-center">
                  <Layout size={28} className="text-editor-border" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-editor-text truncate">{proj.name}</p>
                    <p className="text-[10px] text-editor-textMuted flex items-center gap-1">
                      <Clock size={10} /> {new Date(proj.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-editor-hover rounded text-red-400 transition-opacity"
                    onClick={(e) => { e.stopPropagation(); deleteProject(proj.id); }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
