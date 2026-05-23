import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/index.css';
import { useUIStore } from '@/store/uiStore';

// Init theme before first render
const saved = localStorage.getItem('smartdraw-theme');
const isDark = saved ? saved === 'dark' : true;
const root = document.documentElement;
if (isDark) {
  root.classList.add('dark');
} else {
  root.classList.add('light');
}
// Apply body classes immediately to avoid flash
document.body.className = isDark ? 'bg-editor-bg text-editor-text' : 'bg-editor-bg text-editor-text';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
