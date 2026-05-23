import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Calendar, FolderOpen } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/utils';

export default function UserCenterPage() {
  const { isAuthenticated, user, fetchMe, logout } = useAuthStore();
  const navigate = useNavigate();
  const [projectCount, setProjectCount] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return; }
    fetchMe();
    api.get('/projects').then((data) => setProjectCount(data.length)).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-editor-bg">
      <div className="h-12 bg-editor-header border-b border-editor-border flex items-center px-4">
        <button className="flex items-center gap-1 text-sm text-editor-text hover:text-editor-accent" onClick={() => navigate('/')}>
          <ArrowLeft size={16} /> 返回
        </button>
        <div className="flex-1 text-center text-sm font-semibold text-editor-text">个人中心</div>
      </div>

      <div className="max-w-lg mx-auto p-6">
        <div className="bg-editor-surface border border-editor-border rounded-lg p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-editor-accent flex items-center justify-center text-white text-2xl font-bold">
              {(user?.displayName || user?.username || 'U')[0].toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-editor-text">{user?.displayName || user?.username}</h2>
              <p className="text-xs text-editor-textMuted">@{user?.username}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm text-editor-text p-2 rounded hover:bg-editor-hover">
              <User size={16} className="text-editor-textMuted" />
              <span className="text-editor-textMuted">用户名</span>
              <span className="ml-auto">{user?.username}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-editor-text p-2 rounded hover:bg-editor-hover">
              <Mail size={16} className="text-editor-textMuted" />
              <span className="text-editor-textMuted">邮箱</span>
              <span className="ml-auto">{user?.email}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-editor-text p-2 rounded hover:bg-editor-hover">
              <Calendar size={16} className="text-editor-textMuted" />
              <span className="text-editor-textMuted">注册时间</span>
              <span className="ml-auto">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-editor-text p-2 rounded hover:bg-editor-hover">
              <FolderOpen size={16} className="text-editor-textMuted" />
              <span className="text-editor-textMuted">项目数量</span>
              <span className="ml-auto">{projectCount}</span>
            </div>
          </div>
        </div>

        <div className="mt-4 text-center">
          <button
            className="text-xs text-red-400 hover:text-red-300"
            onClick={() => { logout(); navigate('/login'); }}
          >
            退出登录
          </button>
        </div>
      </div>
    </div>
  );
}
