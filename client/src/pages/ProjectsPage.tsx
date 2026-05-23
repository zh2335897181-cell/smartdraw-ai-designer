import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Layout, Clock, FileText, Search } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/utils';
import { Project } from '@/lib/types';

export default function ProjectsPage() {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return; }
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const data = await api.get('/projects');
      setProjects(data);
    } catch {}
    setLoading(false);
  };

  const deleteProject = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('确认删除此项目？此操作不可撤销。')) return;
    await api.delete(`/projects/${id}`);
    setProjects((p) => p.filter((pr) => pr.id !== id));
  };

  const openProject = async (proj: Project) => {
    try {
      const diagrams = await api.get(`/diagrams/project/${proj.id}`);
      if (diagrams.length > 0) {
        navigate(`/editor/${diagrams[0].id}?projectId=${proj.id}`);
      } else {
        const d = await api.post('/diagrams', { projectId: proj.id, name: 'Diagram 1' });
        navigate(`/editor/${d.id}?projectId=${proj.id}`);
      }
    } catch {}
  };

  const filtered = projects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-editor-bg">
      <div className="h-12 bg-editor-header border-b border-editor-border flex items-center px-4">
        <div className="flex items-center gap-2">
          <button className="text-sm text-editor-text hover:text-editor-accent" onClick={() => navigate('/')}>← 返回</button>
        </div>
        <div className="flex-1 text-center text-sm font-semibold text-editor-text">项目管理</div>
        <Button variant="primary" size="sm" onClick={() => navigate('/')}>
          <Plus size={14} className="mr-1" /> 新建
        </Button>
      </div>

      <div className="max-w-5xl mx-auto p-6">
        <div className="relative mb-4">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-editor-textMuted" />
          <input className="w-full h-9 pl-8 pr-3 bg-editor-surface border border-editor-border rounded text-sm text-editor-text focus:outline-none focus:border-editor-accent"
            placeholder="搜索项目..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        {loading ? (
          <div className="text-center py-16 text-editor-textMuted">加载中...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((proj) => (
              <div key={proj.id} className="bg-editor-surface border border-editor-border rounded-lg p-4 hover:border-editor-accent cursor-pointer group transition-colors"
                onClick={() => openProject(proj)}>
                <div className="flex items-start justify-between mb-2">
                  <Layout size={24} className="text-editor-accent" />
                  <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-900/30 rounded text-red-400 transition-opacity"
                    onClick={(e) => deleteProject(proj.id, e)}>
                    <Trash2 size={14} />
                  </button>
                </div>
                <h3 className="text-sm font-medium text-editor-text mb-1">{proj.name}</h3>
                {proj.description && <p className="text-xs text-editor-textMuted line-clamp-2 mb-2">{proj.description}</p>}
                <div className="flex items-center gap-3 text-[10px] text-editor-textMuted">
                  <span className="flex items-center gap-1"><Clock size={10} /> {new Date(proj.createdAt).toLocaleDateString()}</span>
                  <span className="flex items-center gap-1"><FileText size={10} /> {proj.isArchived ? '已归档' : '活跃'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
