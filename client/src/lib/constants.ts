import { ShapeTemplate } from './types';

export const SHAPE_CATEGORIES: { key: string; label: string; icon: string }[] = [
  { key: 'basic', label: '基础图形', icon: 'Square' },
  { key: 'flowchart', label: '流程图', icon: 'GitBranch' },
  { key: 'uml', label: 'UML', icon: 'Boxes' },
  { key: 'er', label: 'ER图', icon: 'Database' },
  { key: 'network', label: '网络拓扑', icon: 'Network' },
  { key: 'bpmn', label: 'BPMN', icon: 'Workflow' },
  { key: 'arrows', label: '箭头', icon: 'ArrowRight' },
  { key: 'icons', label: '图标', icon: 'Star' },
];

export const SHAPE_TEMPLATES: ShapeTemplate[] = [
  // Basic shapes
  { id: 'rect', category: 'basic', name: '矩形', icon: 'Square', nodeType: 'rectangle', defaultData: { label: 'Rectangle' }, defaultStyle: { fill: '#2d2d30', stroke: '#5a5a5a', strokeWidth: 1, width: 120, height: 60, borderRadius: 0 } },
  { id: 'rounded-rect', category: 'basic', name: '圆角矩形', icon: 'Square', nodeType: 'roundedRect', defaultData: { label: 'Rounded Rect' }, defaultStyle: { fill: '#2d2d30', stroke: '#5a5a5a', strokeWidth: 1, width: 120, height: 60, borderRadius: 12 } },
  { id: 'ellipse', category: 'basic', name: '椭圆', icon: 'Circle', nodeType: 'ellipse', defaultData: { label: 'Ellipse' }, defaultStyle: { fill: '#2d2d30', stroke: '#5a5a5a', strokeWidth: 1, width: 120, height: 80 } },
  { id: 'diamond', category: 'basic', name: '菱形', icon: 'Diamond', nodeType: 'diamond', defaultData: { label: 'Diamond' }, defaultStyle: { fill: '#2d2d30', stroke: '#5a5a5a', strokeWidth: 1, width: 120, height: 80 } },
  { id: 'triangle', category: 'basic', name: '三角形', icon: 'Triangle', nodeType: 'triangle', defaultData: { label: 'Triangle' }, defaultStyle: { fill: '#2d2d30', stroke: '#5a5a5a', strokeWidth: 1, width: 100, height: 80 } },
  { id: 'parallelogram', category: 'basic', name: '平行四边形', icon: 'Square', nodeType: 'parallelogram', defaultData: { label: 'Data' }, defaultStyle: { fill: '#2d2d30', stroke: '#5a5a5a', strokeWidth: 1, width: 120, height: 60 } },
  { id: 'cylinder', category: 'basic', name: '圆柱体', icon: 'Database', nodeType: 'cylinder', defaultData: { label: 'Storage' }, defaultStyle: { fill: '#2d2d30', stroke: '#5a5a5a', strokeWidth: 1, width: 100, height: 80 } },
  { id: 'hexagon', category: 'basic', name: '六边形', icon: 'Hexagon', nodeType: 'hexagon', defaultData: { label: 'Hexagon' }, defaultStyle: { fill: '#2d2d30', stroke: '#5a5a5a', strokeWidth: 1, width: 120, height: 70 } },
  { id: 'cloud', category: 'basic', name: '云', icon: 'Cloud', nodeType: 'cloud', defaultData: { label: 'Cloud' }, defaultStyle: { fill: '#2d2d30', stroke: '#5a5a5a', strokeWidth: 1, width: 140, height: 80 } },
  { id: 'document', category: 'basic', name: '文档', icon: 'FileText', nodeType: 'document', defaultData: { label: 'Document' }, defaultStyle: { fill: '#2d2d30', stroke: '#5a5a5a', strokeWidth: 1, width: 100, height: 120 } },
  // Flowchart shapes
  { id: 'process', category: 'flowchart', name: '处理', icon: 'Square', nodeType: 'process', defaultData: { label: 'Process' }, defaultStyle: { fill: '#2d2d30', stroke: '#5a5a5a', strokeWidth: 1.5, width: 120, height: 60 } },
  { id: 'decision-flow', category: 'flowchart', name: '判断', icon: 'Diamond', nodeType: 'decision', defaultData: { label: 'Decision?' }, defaultStyle: { fill: '#2d2d30', stroke: '#f0c040', strokeWidth: 1.5, width: 120, height: 80 } },
  { id: 'start-end', category: 'flowchart', name: '开始/结束', icon: 'Circle', nodeType: 'startEnd', defaultData: { label: 'Start' }, defaultStyle: { fill: '#2d2d30', stroke: '#5a5a5a', strokeWidth: 1.5, width: 100, height: 60, borderRadius: 30 } },
  { id: 'data-io', category: 'flowchart', name: '数据', icon: 'Database', nodeType: 'data', defaultData: { label: 'Data' }, defaultStyle: { fill: '#2d2d30', stroke: '#5a5a5a', strokeWidth: 1.5, width: 110, height: 65 } },
  // UML shapes
  { id: 'uml-class', category: 'uml', name: '类(Class)', icon: 'Box', nodeType: 'umlClass', defaultData: { label: 'ClassName\n+ attribute\n+ method()' }, defaultStyle: { fill: '#2d2d30', stroke: '#5a5a5a', strokeWidth: 1, width: 160, height: 100 } },
  { id: 'uml-interface', category: 'uml', name: '接口(Interface)', icon: 'Box', nodeType: 'umlInterface', defaultData: { label: '«interface»\nInterfaceName' }, defaultStyle: { fill: '#2d2d30', stroke: '#5a5a5a', strokeWidth: 1, width: 160, height: 80, dashArray: '6,3' } },
  { id: 'uml-actor', category: 'uml', name: '角色(Actor)', icon: 'User', nodeType: 'umlActor', defaultData: { label: 'Actor' }, defaultStyle: { fill: 'transparent', stroke: '#5a5a5a', strokeWidth: 1, width: 24, height: 60 } },
  // ER shapes
  { id: 'er-entity', category: 'er', name: '实体', icon: 'Square', nodeType: 'erEntity', defaultData: { label: 'Entity' }, defaultStyle: { fill: '#2d2d30', stroke: '#5a5a5a', strokeWidth: 1.5, width: 120, height: 60 } },
  { id: 'er-attribute', category: 'er', name: '属性', icon: 'Circle', nodeType: 'erAttribute', defaultData: { label: 'Attribute' }, defaultStyle: { fill: '#2d2d30', stroke: '#5a5a5a', strokeWidth: 1, width: 90, height: 50, borderRadius: 25 } },
  { id: 'er-relationship', category: 'er', name: '关系', icon: 'Diamond', nodeType: 'erRelationship', defaultData: { label: 'Relates' }, defaultStyle: { fill: '#2d2d30', stroke: '#5a5a5a', strokeWidth: 1, width: 90, height: 60 } },
  // Network topology
  { id: 'router', category: 'network', name: '路由器', icon: 'Router', nodeType: 'networkRouter', defaultData: { label: 'Router' }, defaultStyle: { fill: '#2d2d30', stroke: '#5a5a5a', strokeWidth: 1.5, width: 80, height: 80 } },
  { id: 'switch', category: 'network', name: '交换机', icon: 'Network', nodeType: 'networkSwitch', defaultData: { label: 'Switch' }, defaultStyle: { fill: '#2d2d30', stroke: '#5a5a5a', strokeWidth: 1.5, width: 100, height: 50 } },
  { id: 'server', category: 'network', name: '服务器', icon: 'Server', nodeType: 'networkServer', defaultData: { label: 'Server' }, defaultStyle: { fill: '#2d2d30', stroke: '#5a5a5a', strokeWidth: 1.5, width: 70, height: 100 } },
  // Network topology (more)
  { id: 'firewall', category: 'network', name: '防火墙', icon: 'Router', nodeType: 'rectangle', defaultData: { label: 'Firewall' }, defaultStyle: { fill: '#3d2020', stroke: '#d44', strokeWidth: 1.5, width: 80, height: 50, borderRadius: 4 } },
  { id: 'client', category: 'network', name: '客户端', icon: 'Square', nodeType: 'rectangle', defaultData: { label: 'Client' }, defaultStyle: { fill: '#2d2d30', stroke: '#5a5a5a', strokeWidth: 1, width: 60, height: 50, borderRadius: 4 } },
  { id: 'cloud-net', category: 'network', name: '云端', icon: 'Cloud', nodeType: 'cloud', defaultData: { label: 'Cloud' }, defaultStyle: { fill: '#2d3d40', stroke: '#4a9', strokeWidth: 1.5, width: 100, height: 60 } },
  // BPMN
  { id: 'bpmn-task', category: 'bpmn', name: '任务', icon: 'Square', nodeType: 'roundedRect', defaultData: { label: 'Task' }, defaultStyle: { fill: '#2d2d30', stroke: '#5a5a5a', strokeWidth: 1.5, width: 120, height: 60, borderRadius: 8 } },
  { id: 'bpmn-gateway', category: 'bpmn', name: '网关', icon: 'Diamond', nodeType: 'diamond', defaultData: { label: '' }, defaultStyle: { fill: '#2d2d30', stroke: '#f0c040', strokeWidth: 2, width: 60, height: 60 } },
  { id: 'bpmn-event', category: 'bpmn', name: '事件', icon: 'Circle', nodeType: 'ellipse', defaultData: { label: '' }, defaultStyle: { fill: '#2d2d30', stroke: '#5a5a5a', strokeWidth: 1.5, width: 50, height: 50 } },
  { id: 'bpmn-pool', category: 'bpmn', name: '泳池', icon: 'Square', nodeType: 'rectangle', defaultData: { label: 'Pool' }, defaultStyle: { fill: 'transparent', stroke: '#5a5a5a', strokeWidth: 2, width: 200, height: 120, borderRadius: 0 } },
  { id: 'bpmn-lane', category: 'bpmn', name: '泳道', icon: 'Square', nodeType: 'rectangle', defaultData: { label: 'Lane' }, defaultStyle: { fill: 'transparent', stroke: '#5a5a5a', strokeWidth: 1, width: 200, height: 60, borderRadius: 0 } },
  // Arrows
  { id: 'arrow-right', category: 'arrows', name: '右箭头', icon: 'ArrowRight', nodeType: 'rectangle', defaultData: { label: '' }, defaultStyle: { fill: '#5a5a5a', stroke: 'transparent', strokeWidth: 0, width: 80, height: 20, borderRadius: 0 } },
  { id: 'arrow-left', category: 'arrows', name: '左箭头', icon: 'ArrowRight', nodeType: 'rectangle', defaultData: { label: '' }, defaultStyle: { fill: '#5a5a5a', stroke: 'transparent', strokeWidth: 0, width: 80, height: 20, borderRadius: 0 } },
  { id: 'arrow-up', category: 'arrows', name: '上箭头', icon: 'ArrowRight', nodeType: 'rectangle', defaultData: { label: '' }, defaultStyle: { fill: '#5a5a5a', stroke: 'transparent', strokeWidth: 0, width: 20, height: 80, borderRadius: 0 } },
  { id: 'arrow-down', category: 'arrows', name: '下箭头', icon: 'ArrowRight', nodeType: 'rectangle', defaultData: { label: '' }, defaultStyle: { fill: '#5a5a5a', stroke: 'transparent', strokeWidth: 0, width: 20, height: 80, borderRadius: 0 } },
  { id: 'arrow-both', category: 'arrows', name: '双向箭头', icon: 'ArrowRight', nodeType: 'rectangle', defaultData: { label: '' }, defaultStyle: { fill: '#5a5a5a', stroke: 'transparent', strokeWidth: 0, width: 80, height: 20, borderRadius: 0 } },
  { id: 'connector', category: 'arrows', name: '连接线', icon: 'ArrowRight', nodeType: 'rectangle', defaultData: { label: '' }, defaultStyle: { fill: '#5a5a5a', stroke: 'transparent', strokeWidth: 0, width: 60, height: 6, borderRadius: 3 } },
  // Icons
  { id: 'icon-user', category: 'icons', name: '用户', icon: 'Square', nodeType: 'ellipse', defaultData: { label: '👤' }, defaultStyle: { fill: '#2d2d30', stroke: '#5a5a5a', strokeWidth: 1, width: 50, height: 50, fontSize: 24 } },
  { id: 'icon-doc', category: 'icons', name: '文件', icon: 'FileText', nodeType: 'document', defaultData: { label: '📄' }, defaultStyle: { fill: '#2d2d30', stroke: '#5a5a5a', strokeWidth: 1, width: 60, height: 70, fontSize: 20 } },
  { id: 'icon-db', category: 'icons', name: '数据库', icon: 'Database', nodeType: 'cylinder', defaultData: { label: '🗄️' }, defaultStyle: { fill: '#2d2d30', stroke: '#5a5a5a', strokeWidth: 1, width: 60, height: 70, fontSize: 20 } },
  { id: 'icon-gear', category: 'icons', name: '设置', icon: 'Square', nodeType: 'ellipse', defaultData: { label: '⚙️' }, defaultStyle: { fill: '#2d2d30', stroke: '#5a5a5a', strokeWidth: 1, width: 50, height: 50, fontSize: 24 } },
  { id: 'icon-star', category: 'icons', name: '星标', icon: 'Star', nodeType: 'ellipse', defaultData: { label: '⭐' }, defaultStyle: { fill: '#2d2d30', stroke: '#f0c040', strokeWidth: 1, width: 50, height: 50, fontSize: 24 } },
  { id: 'icon-check', category: 'icons', name: '确认', icon: 'Square', nodeType: 'ellipse', defaultData: { label: '✓' }, defaultStyle: { fill: '#2d402d', stroke: '#4a4', strokeWidth: 1.5, width: 50, height: 50, fontSize: 24 } },
  { id: 'icon-x', category: 'icons', name: '拒绝', icon: 'Square', nodeType: 'ellipse', defaultData: { label: '✗' }, defaultStyle: { fill: '#402d2d', stroke: '#d44', strokeWidth: 1.5, width: 50, height: 50, fontSize: 24 } },
  { id: 'icon-msg', category: 'icons', name: '消息', icon: 'Square', nodeType: 'ellipse', defaultData: { label: '💬' }, defaultStyle: { fill: '#2d2d30', stroke: '#5a5a5a', strokeWidth: 1, width: 50, height: 50, fontSize: 24 } },
  // Text & Image
  { id: 'text', category: 'basic', name: '文本', icon: 'Type', nodeType: 'text', defaultData: { label: 'Text' }, defaultStyle: { fill: 'transparent', stroke: 'transparent', strokeWidth: 0, width: 120, height: 40, fontSize: 16 } },
  { id: 'image', category: 'basic', name: '图片', icon: 'Image', nodeType: 'image', defaultData: { label: '' }, defaultStyle: { fill: '#2d2d30', stroke: '#5a5a5a', strokeWidth: 1, width: 150, height: 100 } },
];

export const EDGE_TYPE_OPTIONS = [
  { value: 'bezier', label: '贝塞尔曲线' },
  { value: 'orthogonal', label: '正交线 (推荐)' },
  { value: 'straight', label: '直线' },
  { value: 'step', label: '折线' },
  { value: 'smooth', label: '平滑曲线' },
];

export const ARROW_OPTIONS = [
  { value: 'none', label: '无' },
  { value: 'arrow', label: '箭头' },
  { value: 'arrowClosed', label: '实心箭头' },
  { value: 'arrowDiamond', label: '菱形' },
  { value: 'arrowCircle', label: '圆形' },
];

export const FONT_FAMILIES = [
  'Arial', 'Helvetica', 'Segoe UI', 'system-ui',
  'Times New Roman', 'Georgia', 'Courier New', 'Consolas', 'Monaco',
  'Verdana', 'Trebuchet MS', 'Impact',
];

export const DEFAULT_VIEWPORT = { x: 0, y: 0, zoom: 1 };
export const MIN_ZOOM = 0.1;
export const MAX_ZOOM = 5;
export const SNAP_GRID = 10;
export const AUTO_SAVE_INTERVAL = 30000;

export const KEYBOARD_SHORTCUTS: Record<string, string> = {
  'ctrl+s': '保存',
  'ctrl+z': '撤销',
  'ctrl+y': '重做',
  'ctrl+c': '复制',
  'ctrl+v': '粘贴',
  'ctrl+x': '剪切',
  'ctrl+d': '复制选中',
  'ctrl+a': '全选',
  'delete': '删除',
  'ctrl+0': '重置缩放',
  'ctrl+=': '放大',
  'ctrl+-': '缩小',
  'ctrl+g': '组合',
  'ctrl+shift+g': '取消组合',
  'space+drag': '拖动画布',
  'ctrl+shift+e': '导出PNG',
};
