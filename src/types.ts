export interface Point {
  x: number;
  y: number;
}

export interface Room {
  id: string;
  name: string;
  width: number; // в метрах
  height: number; // в метрах
  walls: Point[]; // внешние стены
}

export interface FunctionalZone {
  id: string;
  name: string;
  type: ZoneType;
  points: Point[]; // полигон зоны
  color: string;
}

export type ZoneType =
  | 'service'
  | 'storage'
  | 'office'
  | 'waiting'
  | 'technical'
  | 'entrance'
  | 'corridor';

export type ObjectType =
  | 'workplace'
  | 'cash_window'
  | 'terminal'
  | 'printer'
  | 'shelf'
  | 'waiting_seat'
  | 'camera'
  | 'engineering'
  | 'counter'
  | 'safe'
  | 'sorting_table';

export interface EquipmentObject {
  id: string;
  type: ObjectType;
  name: string;
  x: number; // позиция в метрах
  y: number;
  width: number; // в метрах
  height: number;
  rotation: number; // градусы
  zoneId: string | null;
  attributes: Record<string, string>;
  color: string;
}

export interface PlanData {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  room: Room;
  zones: FunctionalZone[];
  objects: EquipmentObject[];
}

export interface ValidationResult {
  type: 'error' | 'warning' | 'info';
  message: string;
  objectId?: string;
  zoneId?: string;
  position?: Point;
}

export interface AIRecommendation {
  id: string;
  title: string;
  description: string;
  reason: string;
  affectedZones: string[];
  affectedObjects: string[];
  impact: string;
  assumption?: string;
  action?: {
    type: 'add_object' | 'move_object' | 'remove_object' | 'add_zone';
    data: any;
  };
}

export const ZONE_TYPE_LABELS: Record<ZoneType, string> = {
  service: 'Зона обслуживания',
  storage: 'Зона хранения',
  office: 'Офисная зона',
  waiting: 'Зона ожидания',
  technical: 'Техническая зона',
  entrance: 'Входная группа',
  corridor: 'Коридор',
};

export const ZONE_TYPE_COLORS: Record<ZoneType, string> = {
  service: '#3B82F6',
  storage: '#8B5CF6',
  office: '#10B981',
  waiting: '#F59E0B',
  technical: '#6B7280',
  entrance: '#EC4899',
  corridor: '#94A3B8',
};

export const OBJECT_TYPE_LABELS: Record<ObjectType, string> = {
  workplace: 'Рабочее место',
  cash_window: 'Кассовое окно',
  terminal: 'Терминал',
  printer: 'Принтер',
  shelf: 'Стеллаж',
  waiting_seat: 'Место ожидания',
  camera: 'Камера видеонаблюдения',
  engineering: 'Инженерное оборудование',
  counter: 'Стойка',
  safe: 'Сейф',
  sorting_table: 'Стол сортировки',
};

export const OBJECT_TYPE_ICONS: Record<ObjectType, string> = {
  workplace: '🖥️',
  cash_window: '💰',
  terminal: '🖳',
  printer: '🖨️',
  shelf: '📦',
  waiting_seat: '💺',
  camera: '📹',
  engineering: '⚙️',
  counter: '🪑',
  safe: '🔒',
  sorting_table: '📋',
};

export const OBJECT_DEFAULT_SIZES: Record<ObjectType, { width: number; height: number }> = {
  workplace: { width: 1.4, height: 0.8 },
  cash_window: { width: 1.2, height: 0.7 },
  terminal: { width: 0.5, height: 0.5 },
  printer: { width: 0.6, height: 0.5 },
  shelf: { width: 1.5, height: 0.5 },
  waiting_seat: { width: 0.5, height: 0.5 },
  camera: { width: 0.3, height: 0.3 },
  engineering: { width: 0.8, height: 0.6 },
  counter: { width: 2.0, height: 0.6 },
  safe: { width: 0.6, height: 0.5 },
  sorting_table: { width: 2.0, height: 1.0 },
};

export const OBJECT_DEFAULT_COLORS: Record<ObjectType, string> = {
  workplace: '#2563EB',
  cash_window: '#DC2626',
  terminal: '#7C3AED',
  printer: '#059669',
  shelf: '#D97706',
  waiting_seat: '#DB2777',
  camera: '#4B5563',
  engineering: '#64748B',
  counter: '#0891B2',
  safe: '#1E293B',
  sorting_table: '#65A30D',
};
