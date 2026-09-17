import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { PlanData, EquipmentObject, FunctionalZone, ValidationResult, AIRecommendation } from './types';
import { demoPlan } from './data/demoPlan';
import { v4 as uuidv4 } from 'uuid';

interface AppState {
  currentPlan: PlanData;
  selectedObjectId: string | null;
  selectedZoneId: string | null;
  activeTab: 'editor' | 'inventory' | 'validation' | 'ai' | '3d';
  tool: 'select' | 'move' | 'rotate' | 'zone' | 'add';
  validationResults: ValidationResult[];
  aiRecommendations: AIRecommendation[];
  zoom: number;
  panOffset: { x: number; y: number };
}

type AppAction =
  | { type: 'SET_PLAN'; payload: PlanData }
  | { type: 'SELECT_OBJECT'; payload: string | null }
  | { type: 'SELECT_ZONE'; payload: string | null }
  | { type: 'SET_TAB'; payload: AppState['activeTab'] }
  | { type: 'SET_TOOL'; payload: AppState['tool'] }
  | { type: 'UPDATE_OBJECT'; payload: EquipmentObject }
  | { type: 'DELETE_OBJECT'; payload: string }
  | { type: 'ADD_OBJECT'; payload: EquipmentObject }
  | { type: 'UPDATE_ZONE'; payload: FunctionalZone }
  | { type: 'DELETE_ZONE'; payload: string }
  | { type: 'ADD_ZONE'; payload: FunctionalZone }
  | { type: 'SET_VALIDATION'; payload: ValidationResult[] }
  | { type: 'SET_AI_RECOMMENDATIONS'; payload: AIRecommendation[] }
  | { type: 'SET_ZOOM'; payload: number }
  | { type: 'SET_PAN'; payload: { x: number; y: number } }
  | { type: 'APPLY_RECOMMENDATION'; payload: string };

const initialState: AppState = {
  currentPlan: demoPlan,
  selectedObjectId: null,
  selectedZoneId: null,
  activeTab: 'editor',
  tool: 'select',
  validationResults: [],
  aiRecommendations: [],
  zoom: 50,
  panOffset: { x: 0, y: 0 },
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_PLAN':
      return { ...state, currentPlan: action.payload, selectedObjectId: null, selectedZoneId: null };
    case 'SELECT_OBJECT':
      return { ...state, selectedObjectId: action.payload, selectedZoneId: null };
    case 'SELECT_ZONE':
      return { ...state, selectedZoneId: action.payload, selectedObjectId: null };
    case 'SET_TAB':
      return { ...state, activeTab: action.payload };
    case 'SET_TOOL':
      return { ...state, tool: action.payload };
    case 'UPDATE_OBJECT': {
      const objects = state.currentPlan.objects.map((obj) =>
        obj.id === action.payload.id ? action.payload : obj
      );
      return {
        ...state,
        currentPlan: { ...state.currentPlan, objects, updatedAt: new Date().toISOString() },
      };
    }
    case 'DELETE_OBJECT': {
      const objects = state.currentPlan.objects.filter((obj) => obj.id !== action.payload);
      return {
        ...state,
        currentPlan: { ...state.currentPlan, objects, updatedAt: new Date().toISOString() },
        selectedObjectId: state.selectedObjectId === action.payload ? null : state.selectedObjectId,
      };
    }
    case 'ADD_OBJECT': {
      const objects = [...state.currentPlan.objects, action.payload];
      return {
        ...state,
        currentPlan: { ...state.currentPlan, objects, updatedAt: new Date().toISOString() },
        selectedObjectId: action.payload.id,
      };
    }
    case 'UPDATE_ZONE': {
      const zones = state.currentPlan.zones.map((z) =>
        z.id === action.payload.id ? action.payload : z
      );
      return {
        ...state,
        currentPlan: { ...state.currentPlan, zones, updatedAt: new Date().toISOString() },
      };
    }
    case 'DELETE_ZONE': {
      const zones = state.currentPlan.zones.filter((z) => z.id !== action.payload);
      const objects = state.currentPlan.objects.map((obj) =>
        obj.zoneId === action.payload ? { ...obj, zoneId: null } : obj
      );
      return {
        ...state,
        currentPlan: { ...state.currentPlan, zones, objects, updatedAt: new Date().toISOString() },
        selectedZoneId: state.selectedZoneId === action.payload ? null : state.selectedZoneId,
      };
    }
    case 'ADD_ZONE': {
      const zones = [...state.currentPlan.zones, action.payload];
      return {
        ...state,
        currentPlan: { ...state.currentPlan, zones, updatedAt: new Date().toISOString() },
      };
    }
    case 'SET_VALIDATION':
      return { ...state, validationResults: action.payload };
    case 'SET_AI_RECOMMENDATIONS':
      return { ...state, aiRecommendations: action.payload };
    case 'SET_ZOOM':
      return { ...state, zoom: action.payload };
    case 'SET_PAN':
      return { ...state, panOffset: action.payload };
    case 'APPLY_RECOMMENDATION': {
      const rec = state.aiRecommendations.find((r) => r.id === action.payload);
      if (!rec || !rec.action) return state;
      if (rec.action.type === 'add_object') {
        const newObj: EquipmentObject = {
          id: uuidv4(),
          ...rec.action.data,
        };
        return {
          ...state,
          currentPlan: {
            ...state.currentPlan,
            objects: [...state.currentPlan.objects, newObj],
            updatedAt: new Date().toISOString(),
          },
        };
      }
      if (rec.action.type === 'move_object') {
        const objects = state.currentPlan.objects.map((obj) =>
          obj.id === rec.action!.data.id
            ? { ...obj, x: rec.action!.data.x, y: rec.action!.data.y }
            : obj
        );
        return {
          ...state,
          currentPlan: { ...state.currentPlan, objects, updatedAt: new Date().toISOString() },
        };
      }
      return state;
    }
    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}

export function useAppState() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppState must be used within AppProvider');
  return context;
}

// Utility functions
export function pointInPolygon(point: { x: number; y: number }, polygon: { x: number; y: number }[]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x, yi = polygon[i].y;
    const xj = polygon[j].x, yj = polygon[j].y;
    const intersect = ((yi > point.y) !== (yj > point.y)) &&
      (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

export function getObjectCenter(obj: EquipmentObject): { x: number; y: number } {
  return { x: obj.x + obj.width / 2, y: obj.y + obj.height / 2 };
}

export function calculateZoneArea(zone: FunctionalZone): number {
  const points = zone.points;
  let area = 0;
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;
    area += points[i].x * points[j].y;
    area -= points[j].x * points[i].y;
  }
  return Math.abs(area / 2);
}

export function objectsOverlap(a: EquipmentObject, b: EquipmentObject): boolean {
  return !(
    a.x + a.width <= b.x ||
    b.x + b.width <= a.x ||
    a.y + a.height <= b.y ||
    b.y + b.height <= a.y
  );
}

export function objectOutsideRoom(obj: EquipmentObject, room: PlanData['room']): boolean {
  return (
    obj.x < 0 ||
    obj.y < 0 ||
    obj.x + obj.width > room.width ||
    obj.y + obj.height > room.height
  );
}

export function validatePlan(plan: PlanData): ValidationResult[] {
  const results: ValidationResult[] = [];
  const ids = new Set<string>();

  plan.objects.forEach((obj) => {
    if (ids.has(obj.id)) {
      results.push({
        type: 'error',
        message: `Дублирующийся ID: ${obj.id} (${obj.name})`,
        objectId: obj.id,
      });
    }
    ids.add(obj.id);
  });

  plan.objects.forEach((obj) => {
    if (objectOutsideRoom(obj, plan.room)) {
      results.push({
        type: 'warning',
        message: `Объект "${obj.name}" расположен за пределами помещения`,
        objectId: obj.id,
        position: { x: obj.x, y: obj.y },
      });
    }
  });

  for (let i = 0; i < plan.objects.length; i++) {
    for (let j = i + 1; j < plan.objects.length; j++) {
      if (objectsOverlap(plan.objects[i], plan.objects[j])) {
        results.push({
          type: 'warning',
          message: `Пересечение объектов: "${plan.objects[i].name}" и "${plan.objects[j].name}"`,
          objectId: plan.objects[i].id,
        });
      }
    }
  }

  plan.objects.forEach((obj) => {
    if (obj.zoneId) {
      const zone = plan.zones.find((z) => z.id === obj.zoneId);
      if (!zone) {
        results.push({
          type: 'error',
          message: `Объект "${obj.name}" привязан к несуществующей зоне ${obj.zoneId}`,
          objectId: obj.id,
          zoneId: obj.zoneId,
        });
      } else {
        const center = getObjectCenter(obj);
        if (!pointInPolygon(center, zone.points)) {
          results.push({
            type: 'info',
            message: `Объект "${obj.name}" физически вне зоны "${zone.name}"`,
            objectId: obj.id,
            zoneId: zone.id,
          });
        }
      }
    }
  });

  if (results.length === 0) {
    results.push({ type: 'info', message: 'План прошёл все проверки. Ошибок не обнаружено.' });
  }

  return results;
}

export function generateAIRecommendations(plan: PlanData): AIRecommendation[] {
  const recommendations: AIRecommendation[] = [];
  const roomArea = plan.room.width * plan.room.height;
  const objectsArea = plan.objects.reduce((sum, obj) => sum + obj.width * obj.height, 0);
  const freeArea = roomArea - objectsArea;
  const freeAreaPercent = (freeArea / roomArea) * 100;

  const cashWindows = plan.objects.filter((o) => o.type === 'cash_window');
  const workplaces = plan.objects.filter((o) => o.type === 'workplace');
  const waitingSeats = plan.objects.filter((o) => o.type === 'waiting_seat');
  const shelves = plan.objects.filter((o) => o.type === 'shelf');
  const cameras = plan.objects.filter((o) => o.type === 'camera');

  const waitingZone = plan.zones.find((z) => z.type === 'waiting');
  if (waitingZone && waitingSeats.length < 6) {
    const zoneArea = calculateZoneArea(waitingZone);
    recommendations.push({
      id: uuidv4(),
      title: 'Увеличить количество мест ожидания',
      description: `В зоне ожидания (${waitingZone.name}, ${zoneArea.toFixed(1)} м²) размещено только ${waitingSeats.length} мест. Рекомендуется добавить ещё 2-3 места.`,
      reason: `Свободная площадь зоны ожидания составляет ${(zoneArea - waitingSeats.length * 0.25).toFixed(1)} м².`,
      affectedZones: [waitingZone.id],
      affectedObjects: waitingSeats.map((s) => s.id),
      impact: `Увеличение пропускной способности на 50%. Свободная площадь уменьшится на ~1 м².`,
      assumption: 'Норматив: 1 место на каждые 20 клиентов в час пик.',
      action: {
        type: 'add_object',
        data: {
          type: 'waiting_seat',
          name: 'Кресло ожидания (доп.)',
          x: 1.5,
          y: 5.0,
          width: 0.5,
          height: 0.5,
          rotation: 0,
          zoneId: waitingZone.id,
          attributes: { 'Тип': 'Кресло с подлокотниками' },
          color: '#DB2777',
        },
      },
    });
  }

  const storageZone = plan.zones.find((z) => z.type === 'storage');
  if (storageZone) {
    const storageArea = calculateZoneArea(storageZone);
    const shelfArea = shelves.reduce((sum, s) => sum + s.width * s.height, 0);
    const storageUtilization = (shelfArea / storageArea) * 100;
    if (storageUtilization < 30) {
      recommendations.push({
        id: uuidv4(),
        title: 'Добавить стеллажи в зоне хранения',
        description: `Зона хранения (${storageZone.name}, ${storageArea.toFixed(1)} м²) заполнена стеллажами на ${storageUtilization.toFixed(0)}%. Можно добавить ещё 2 стеллажа.`,
        reason: `Свободное пространство позволяет разместить доп. оборудование без нарушения проходов.`,
        affectedZones: [storageZone.id],
        affectedObjects: shelves.map((s) => s.id),
        impact: `Увеличение вместимости на ~80 посылок. Свободная площадь уменьшится на ~1.5 м².`,
        action: {
          type: 'add_object',
          data: {
            type: 'shelf',
            name: 'Стеллаж для посылок E',
            x: 11.0,
            y: 9.0,
            width: 1.5,
            height: 0.5,
            rotation: 0,
            zoneId: storageZone.id,
            attributes: { 'Вместимость': '40 посылок', 'Ярусы': '4' },
            color: '#D97706',
          },
        },
      });
    }
  }

  const zonesWithoutCameras = plan.zones.filter((zone) => {
    const zoneCameras = cameras.filter((cam) => cam.zoneId === zone.id);
    return zoneCameras.length === 0 && zone.type !== 'corridor';
  });
  if (zonesWithoutCameras.length > 0) {
    recommendations.push({
      id: uuidv4(),
      title: 'Установить камеры в зонах без видеонаблюдения',
      description: `Зоны без видеонаблюдения: ${zonesWithoutCameras.map((z) => z.name).join(', ')}.`,
      reason: 'Требования безопасности предусматривают видеонаблюдение во всех зонах.',
      affectedZones: zonesWithoutCameras.map((z) => z.id),
      affectedObjects: [],
      impact: 'Повышение безопасности. +' + zonesWithoutCameras.length + ' камер.',
      assumption: 'Правило: минимум 1 камера на каждую функциональную зону.',
    });
  }

  if (freeAreaPercent > 60) {
    recommendations.push({
      id: uuidv4(),
      title: 'Высокая доля свободной площади',
      description: `${freeAreaPercent.toFixed(0)}% площади свободно (${freeArea.toFixed(1)} м² из ${roomArea.toFixed(1)} м²).`,
      reason: 'Оптимальная загрузка — 40-60%.',
      affectedZones: [],
      affectedObjects: [],
      impact: 'Добавление оборудования повысит эффективность.',
      assumption: 'Норматив загрузки: 40-60% для отделений среднего размера.',
    });
  }

  if (cashWindows.length > 0 && workplaces.length < cashWindows.length) {
    recommendations.push({
      id: uuidv4(),
      title: 'Недостаточно рабочих мест для операторов',
      description: `Рабочих мест (${workplaces.length}) меньше кассовых окон (${cashWindows.length}).`,
      reason: 'Каждое окно должно иметь закреплённое рабочее место.',
      affectedZones: ['zone-service'],
      affectedObjects: [...cashWindows.map((c) => c.id), ...workplaces.map((w) => w.id)],
      impact: `Добавление ${cashWindows.length - workplaces.length} рабочих мест.`,
      assumption: 'Правило: 1 рабочее место на каждое кассовое окно.',
      action: {
        type: 'add_object',
        data: {
          type: 'workplace',
          name: 'Рабочее место оператора (доп.)',
          x: 13.5,
          y: 2.2,
          width: 1.4,
          height: 0.8,
          rotation: 0,
          zoneId: 'zone-service',
          attributes: { 'Сотрудник': 'Не назначен', 'ПК': 'Не укомплектовано' },
          color: '#2563EB',
        },
      },
    });
  }

  return recommendations;
}
