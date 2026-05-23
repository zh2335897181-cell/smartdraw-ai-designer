import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sparkles } from 'lucide-react';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const { register, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('密码至少6位');
      return;
    }
    try {
      await register(username, email, password, displayName);
      navigate('/');
    } catch (err: any) {
      setError(err.message || '注册失败');
    }
  };

  return (
    <div className="min-h-screen bg-editor-bg flex items-center justify-center">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-editor-accent rounded-lg mb-3">
            <Sparkles className="text-white" size={24} />
          </div>
          <h1 className="text-xl font-bold text-editor-text">SmartDraw AI</h1>
          <p className="text-sm text-editor-textMuted mt-1">创建您的账号</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-editor-surface border border-editor-border rounded-lg p-6 space-y-4">
          <h2 className="text-sm font-semibold text-editor-text">注册</h2>
          {error && (
            <div className="bg-red-900/20 border border-red-800 text-red-400 text-xs rounded p-2">{error}</div>
          )}
          <div>
            <label className="block text-xs text-editor-textMuted mb-1">用户名</label>
            <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="yourname" required />
          </div>
          <div>
            <label className="block text-xs text-editor-textMuted mb-1">显示名称</label>
            <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="可选" />
          </div>
          <div>
            <label className="block text-xs text-editor-textMuted mb-1">邮箱</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
          </div>
          <div>
            <label className="block text-xs text-editor-textMuted mb-1">密码</label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="至少6位" required />
          </div>
          <Button type="submit" variant="primary" className="w-full" disabled={isLoading}>
            {isLoading ? '注册中...' : '注册'}
          </Button>
          <p className="text-xs text-editor-textMuted text-center">
            已有账号？<Link to="/login" className="text-editor-accent hover:underline">登录</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
