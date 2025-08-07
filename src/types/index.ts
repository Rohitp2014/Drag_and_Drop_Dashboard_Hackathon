export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Widget {
  id: string;
  type: 'metric' | 'chart' | 'table' | 'progress' | 'text';
  title: string;
  position: Position;
  size: Size;
  data: any;
  config: Record<string, any>;
}

export interface DashboardLayout {
  title: string;
  widgets: Widget[];
  lastModified: string;
}

export interface DragItem {
  type: string;
  id: string;
  widget?: Widget;
}