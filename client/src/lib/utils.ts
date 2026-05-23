import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export const api = {
  baseUrl: '/api',
  token: () => localStorage.getItem('smartdraw-token'),

  headers: (isJson = true) => {
    const h: Record<string, string> = {};
    if (isJson) h['Content-Type'] = 'application/json';
    const t = api.token();
    if (t) h['Authorization'] = `Bearer ${t}`;
    return h;
  },

  async get(path: string) {
    const res = await fetch(`${api.baseUrl}${path}`, { headers: api.headers() });
    if (!res.ok) throw new Error((await res.json()).error || 'Request failed');
    return res.json();
  },

  async post(path: string, body?: any) {
    const res = await fetch(`${api.baseUrl}${path}`, {
      method: 'POST',
      headers: api.headers(),
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Request failed');
    return res.json();
  },

  async put(path: string, body?: any) {
    const res = await fetch(`${api.baseUrl}${path}`, {
      method: 'PUT',
      headers: api.headers(),
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Request failed');
    return res.json();
  },

  async delete(path: string) {
    const res = await fetch(`${api.baseUrl}${path}`, {
      method: 'DELETE',
      headers: api.headers(),
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Request failed');
    return res.json();
  },
};

export function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function debounce<T extends (...args: any[]) => any>(fn: T, ms: number) {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

export function throttle<T extends (...args: any[]) => any>(fn: T, ms: number) {
  let last = 0;
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - last >= ms) {
      last = now;
      fn(...args);
    }
  };
}
