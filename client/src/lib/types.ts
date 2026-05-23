// ============================================================
// Core data types for SmartDraw AI Designer
// ============================================================

export interface User {
  id: string;
  username: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
  createdAt?: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  thumbnailUrl?: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Diagram {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  diagramType: DiagramType;
  createdAt: string;
  updatedAt: string;
  pages?: DiagramPage[];
}

export type DiagramType = 'flowchart' | 'er' | 'uml' | 'mindmap' | 'network' | 'bpmn' | 'custom';

export interface DiagramPage {
  id: string;
  diagramId: string;
  name: string;
  pageOrder: number;
  isActive: boolean;
  viewport?: Viewport;
}

export interface Viewport {
  x: number;
  y: number;
  zoom: number;
}

export interface SmartNode {
  id: string;
  type: NodeType;
  position: { x: number; y: number };
  data: NodeData;
  width?: number;
  height?: number;
  zIndex?: number;
  selected?: boolean;
  draggable?: boolean;
  hidden?: boolean;
  parentId?: string;
}

export type NodeType =
  | 'rectangle' | 'roundedRect' | 'ellipse' | 'diamond' | 'triangle'
  | 'parallelogram' | 'cylinder' | 'hexagon' | 'cloud' | 'document'
  | 'process' | 'decision' | 'startEnd' | 'data' | 'database'
  | 'umlClass' | 'umlInterface' | 'umlActor'
  | 'erEntity' | 'erAttribute' | 'erRelationship'
  | 'networkRouter' | 'networkSwitch' | 'networkServer'
  | 'text' | 'image' | 'group';

export interface NodeData {
  label: string;
  style?: NodeStyle;
  groupId?: string;
  [key: string]: any;
}

export interface NodeStyle {
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
  borderRadius?: number;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  fontColor?: string;
  textAlign?: 'left' | 'center' | 'right';
  shadow?: boolean;
  shadowColor?: string;
  shadowBlur?: number;
  dashArray?: string;
  width?: number;
  height?: number;
}

export interface SmartEdge {
  id: string;
  source: string;
  target: string;
  type: EdgeType;
  sourceHandle?: string;
  targetHandle?: string;
  data?: EdgeData;
  style?: EdgeStyle;
  zIndex?: number;
  animated?: boolean;
}

export type EdgeType = 'straight' | 'bezier' | 'step' | 'smooth' | 'orthogonal';

export interface EdgeData {
  label?: string;
  [key: string]: any;
}

export interface EdgeStyle {
  stroke?: string;
  strokeWidth?: number;
  animated?: boolean;
  arrowStart?: ArrowType;
  arrowEnd?: ArrowType;
  lineStyle?: 'solid' | 'dashed' | 'dotted';
  strokeDasharray?: string;
}

export type ArrowType = 'none' | 'arrow' | 'arrowClosed' | 'arrowDiamond' | 'arrowCircle';

export interface ShapeTemplate {
  id: string;
  category: string;
  name: string;
  icon: string;
  nodeType: NodeType;
  defaultData: NodeData;
  defaultStyle: NodeStyle;
}

export interface EditorState {
  nodes: SmartNode[];
  edges: SmartEdge[];
  viewport: Viewport;
  selectedNodeIds: string[];
  selectedEdgeIds: string[];
  activePageId?: string;
}

export interface Operation {
  type: string;
  data: any;
  inverse: any;
  timestamp: number;
}

export interface CollaborationUser {
  userId: string;
  username: string;
  socketId: string;
  cursor?: { x: number; y: number };
  selectedIds?: string[];
}

export interface UserSettings {
  theme: 'dark' | 'light';
  language: string;
  gridEnabled: boolean;
  snapEnabled: boolean;
  autoSaveInterval: number;
  defaultFont: string;
  defaultFontSize: number;
}
