import React, { useMemo, useRef, useEffect } from 'react';
import {
  Search, Star, Clock, X, ChevronDown, ChevronRight,
  Square, Circle, Diamond, Triangle, Hexagon, Type, Image,
  GitBranch, Boxes, Database, Network, Workflow,
  ArrowRight, FileText, Cloud, Server, Router, Wifi, Shield, Monitor,
} from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { SHAPE_CATEGORIES, SHAPE_TEMPLATES } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { ShapeTemplate } from '@/lib/types';

const iconMap: Record<string, React.ReactNode> = {
  Square: <Square size={20} />, Circle: <Circle size={20} />, Diamond: <Diamond size={20} />,
  Triangle: <Triangle size={20} />, Hexagon: <Hexagon size={20} />, Type: <Type size={20} />,
  Image: <Image size={20} />, GitBranch: <GitBranch size={20} />, Boxes: <Boxes size={20} />,
  Database: <Database size={20} />, Network: <Network size={20} />, Workflow: <Workflow size={20} />,
  ArrowRight: <ArrowRight size={20} />, Star: <Star size={20} />, FileText: <FileText size={20} />,
  Cloud: <Cloud size={20} />, Server: <Server size={20} />, Router: <Router size={20} />,
  Wifi: <Wifi size={20} />, Shield: <Shield size={20} />, Monitor: <Monitor size={20} />,
};

export function LeftPanel() {
  const {
    leftPanelOpen, leftPanelTab, setLeftPanelTab,
    shapeSearch, setShapeSearch, favoriteShapeIds, toggleFavorite,
    addRecentShape, recentShapeIds,
  } = useUIStore();
  const [collapsed, setCollapsed] = React.useState<Record<string, boolean>>({});
  const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const listRef = useRef<HTMLDivElement>(null);

  if (!leftPanelOpen) return null;

  // Filter shapes by search query AND selected category tab
  const filtered = useMemo(() => {
    let result = SHAPE_TEMPLATES;
    if (shapeSearch) {
      const q = shapeSearch.toLowerCase();
      result = result.filter((s) => s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q));
    }
    // If a specific tab is selected, only show that category
    if (!shapeSearch && leftPanelTab) {
      result = result.filter((s) => s.category === leftPanelTab);
    }
    return result;
  }, [shapeSearch, leftPanelTab]);

  const grouped = useMemo(() => {
    const map: Record<string, ShapeTemplate[]> = {};
    filtered.forEach((s) => {
      if (!map[s.category]) map[s.category] = [];
      map[s.category].push(s);
    });
    return map;
  }, [filtered]);

  // Auto-expand and scroll to category when tab is clicked
  useEffect(() => {
    if (!shapeSearch && leftPanelTab) {
      // Auto-expand the selected category
      setCollapsed((c) => {
        const next = { ...c };
        // Collapse all except selected
        Object.keys(next).forEach((k) => { if (k !== leftPanelTab) next[k] = true; });
        next[leftPanelTab] = false;
        return next;
      });
      // Scroll to the category
      setTimeout(() => {
        categoryRefs.current[leftPanelTab]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    }
  }, [leftPanelTab, shapeSearch]);

  const favorites = SHAPE_TEMPLATES.filter((s) => favoriteShapeIds.includes(s.id));
  const recent = recentShapeIds.map((id) => SHAPE_TEMPLATES.find((s) => s.id === id)).filter(Boolean) as ShapeTemplate[];

  return (
    <div className="w-60 bg-editor-sidebar border-r border-editor-border flex flex-col overflow-hidden flex-shrink-0">
      {/* Search */}
      <div className="p-2">
        <div className="relative">
          <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-editor-textMuted" />
          <input
            className="w-full h-8 pl-7 pr-2 bg-editor-bg border border-editor-border rounded text-xs text-editor-text placeholder:text-editor-textMuted focus:outline-none focus:border-editor-accent"
            placeholder="搜索图形..."
            value={shapeSearch}
            onChange={(e) => setShapeSearch(e.target.value)}
          />
          {shapeSearch && (
            <button className="absolute right-2 top-1/2 -translate-y-1/2 text-editor-textMuted hover:text-editor-text" onClick={() => setShapeSearch('')}>
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Category tabs — click to filter */}
      <div className="flex overflow-x-auto border-b border-editor-border px-1 gap-0">
        {SHAPE_CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            className={cn(
              'flex-shrink-0 px-2.5 py-1.5 text-xs border-b-2 transition-colors',
              leftPanelTab === cat.key
                ? 'text-editor-accent border-editor-accent'
                : 'text-editor-textMuted border-transparent hover:text-editor-text'
            )}
            onClick={() => setLeftPanelTab(leftPanelTab === cat.key ? '' : cat.key)}
            title={`${cat.label}${leftPanelTab === cat.key ? ' (点击取消筛选)' : ''}`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Shape list */}
      <div ref={listRef} className="flex-1 overflow-y-auto p-2">
        {/* Favorites */}
        {favorites.length > 0 && !shapeSearch && !leftPanelTab && (
          <div className="mb-3">
            <button
              className="flex items-center gap-1 text-xs text-editor-textMuted mb-1 hover:text-editor-text"
              onClick={() => setCollapsed((c) => ({ ...c, favorites: !c.favorites }))}
            >
              {collapsed.favorites ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
              <Star size={12} className="text-yellow-400" /> 收藏
            </button>
            {!collapsed.favorites && (
              <div className="grid grid-cols-3 gap-1">
                {favorites.map((shape) => (
                  <DraggableShape key={shape.id} shape={shape} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Recent */}
        {recent.length > 0 && !shapeSearch && !leftPanelTab && (
          <div className="mb-3">
            <button
              className="flex items-center gap-1 text-xs text-editor-textMuted mb-1 hover:text-editor-text"
              onClick={() => setCollapsed((c) => ({ ...c, recent: !c.recent }))}
            >
              {collapsed.recent ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
              <Clock size={12} /> 最近使用
            </button>
            {!collapsed.recent && (
              <div className="grid grid-cols-3 gap-1">
                {recent.slice(0, 6).map((shape) => (
                  <DraggableShape key={shape.id + '-recent'} shape={shape} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Shapes grouped by category */}
        {Object.entries(grouped).map(([category, shapes]) => {
          const catLabel = SHAPE_CATEGORIES.find((c) => c.key === category)?.label || category;
          const hasShapes = shapes.length > 0;
          return (
            <div key={category} className="mb-3" ref={(el) => { categoryRefs.current[category] = el; }}>
              <button
                className="flex items-center gap-1 text-xs text-editor-textMuted mb-1 hover:text-editor-text w-full text-left"
                onClick={() => setCollapsed((c) => ({ ...c, [category]: !c[category] }))}
              >
                {collapsed[category] ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                {catLabel}
                <span className="text-editor-textMuted/50 ml-auto text-[10px]">{shapes.length}</span>
              </button>
              {!collapsed[category] && (
                hasShapes ? (
                  <div className="grid grid-cols-3 gap-1">
                    {shapes.map((shape) => (
                      <DraggableShape key={shape.id + '-' + category} shape={shape} />
                    ))}
                  </div>
                ) : (
                  <p className="text-[10px] text-editor-textMuted/50 py-2 text-center">此分类暂无图形</p>
                )
              )}
            </div>
          );
        })}

        {Object.keys(grouped).length === 0 && (
          <div className="text-center py-8 text-xs text-editor-textMuted">
            没有匹配的图形
          </div>
        )}
      </div>
    </div>
  );
}

function DraggableShape({ shape }: { shape: ShapeTemplate }) {
  const { addRecentShape, favoriteShapeIds, toggleFavorite } = useUIStore();
  const isFav = favoriteShapeIds.includes(shape.id);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('application/shape', JSON.stringify(shape));
    e.dataTransfer.effectAllowed = 'copy';
    addRecentShape(shape.id);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className="relative flex flex-col items-center justify-center p-2 rounded hover:bg-editor-hover cursor-grab active:cursor-grabbing border border-transparent hover:border-editor-border transition-colors group"
      title={shape.name}
    >
      <div className="text-editor-textMuted group-hover:text-editor-text">
        {iconMap[shape.icon] || <Square size={20} />}
      </div>
      <span className="text-[10px] text-editor-textMuted mt-0.5 truncate w-full text-center leading-tight">{shape.name}</span>
      {/* Favorite toggle */}
      <button
        className="absolute top-0.5 right-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => { e.stopPropagation(); e.preventDefault(); toggleFavorite(shape.id); }}
      >
        <Star size={10} className={cn(isFav ? 'text-yellow-400 fill-yellow-400' : 'text-editor-textMuted')} />
      </button>
    </div>
  );
}
