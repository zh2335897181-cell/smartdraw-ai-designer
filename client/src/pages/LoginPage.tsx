import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sparkles } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || '登录失败');
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
          <p className="text-sm text-editor-textMuted mt-1">专业在线绘图系统</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-editor-surface border border-editor-border rounded-lg p-6 space-y-4">
          <h2 className="text-sm font-semibold text-editor-text">登录</h2>
          {error && (
            <div className="bg-red-900/20 border border-red-800 text-red-400 text-xs rounded p-2">{error}</div>
          )}
          <div>
            <label className="block text-xs text-editor-textMuted mb-1">邮箱</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
          </div>
          <div>
            <label className="block text-xs text-editor-textMuted mb-1">密码</label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••" required />
          </div>
          <Button type="submit" variant="primary" className="w-full" disabled={isLoading}>
            {isLoading ? '登录中...' : '登录'}
          </Button>
          <p className="text-xs text-editor-textMuted text-center">
            还没有账号？<Link to="/register" className="text-editor-accent hover:underline">注册</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
