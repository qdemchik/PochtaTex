import { useAppState } from '../store';
import {
  ObjectType,
  OBJECT_TYPE_LABELS,
  OBJECT_TYPE_ICONS,
  OBJECT_DEFAULT_SIZES,
  OBJECT_DEFAULT_COLORS,
  ZONE_TYPE_LABELS,
  ZONE_TYPE_COLORS,
  ZoneType,
} from '../types';
import { v4 as uuidv4 } from 'uuid';
import { Trash2, RotateCw, Plus, Layers, Box } from 'lucide-react';
import { useState } from 'react';

export default function Sidebar() {
  const { state, dispatch } = useAppState();
  const { currentPlan, selectedObjectId, selectedZoneId } = state;
  const [sidebarTab, setSidebarTab] = useState<'library' | 'properties' | 'zones'>('library');

  const selectedObject = currentPlan.objects.find((o) => o.id === selectedObjectId);
  const selectedZone = currentPlan.zones.find((z) => z.id === selectedZoneId);

  const addObject = (type: ObjectType) => {
    const defaults = OBJECT_DEFAULT_SIZES[type];
    const newObj = {
      id: uuidv4(),
      type,
      name: OBJECT_TYPE_LABELS[type],
      x: 1,
      y: 1,
      width: defaults.width,
      height: defaults.height,
      rotation: 0,
      zoneId: null,
      attributes: {},
      color: OBJECT_DEFAULT_COLORS[type],
    };
    dispatch({ type: 'ADD_OBJECT', payload: newObj });
  };

  const addZone = (type: ZoneType) => {
    const newZone = {
      id: uuidv4(),
      name: ZONE_TYPE_LABELS[type],
      type,
      points: [
        { x: 1, y: 1 },
        { x: 4, y: 1 },
        { x: 4, y: 4 },
        { x: 1, y: 4 },
      ],
      color: ZONE_TYPE_COLORS[type],
    };
    dispatch({ type: 'ADD_ZONE', payload: newZone });
  };

  const deleteSelected = () => {
    if (selectedObjectId) dispatch({ type: 'DELETE_OBJECT', payload: selectedObjectId });
    if (selectedZoneId) dispatch({ type: 'DELETE_ZONE', payload: selectedZoneId });
  };

  const rotateSelected = () => {
    if (selectedObject) {
      dispatch({
        type: 'UPDATE_OBJECT',
        payload: { ...selectedObject, rotation: (selectedObject.rotation + 90) % 360 },
      });
    }
  };

  return (
    <div className="w-72 bg-white border-l border-slate-200 flex flex-col h-full overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setSidebarTab('library')}
          className={`flex-1 px-3 py-2.5 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
            sidebarTab === 'library'
              ? 'text-blue-700 border-b-2 border-blue-600 bg-blue-50/50'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Box size={14} /> Библиотека
        </button>
        <button
          onClick={() => setSidebarTab('zones')}
          className={`flex-1 px-3 py-2.5 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
            sidebarTab === 'zones'
              ? 'text-blue-700 border-b-2 border-blue-600 bg-blue-50/50'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Layers size={14} /> Зоны
        </button>
        <button
          onClick={() => setSidebarTab('properties')}
          className={`flex-1 px-3 py-2.5 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
            sidebarTab === 'properties'
              ? 'text-blue-700 border-b-2 border-blue-600 bg-blue-50/50'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          ⚙️ Свойства
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {sidebarTab === 'library' && (
          <div className="p-3">
            <p className="text-xs text-slate-500 mb-2">Нажмите для добавления на план:</p>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(OBJECT_TYPE_LABELS) as ObjectType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => addObject(type)}
                  className="flex flex-col items-center gap-1 p-2.5 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all text-center group"
                >
                  <span className="text-xl">{OBJECT_TYPE_ICONS[type]}</span>
                  <span className="text-[10px] text-slate-600 group-hover:text-blue-700 leading-tight">
                    {OBJECT_TYPE_LABELS[type]}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {sidebarTab === 'zones' && (
          <div className="p-3">
            <p className="text-xs text-slate-500 mb-2">Добавить зону:</p>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {(Object.keys(ZONE_TYPE_LABELS) as ZoneType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => addZone(type)}
                  className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all"
                >
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: ZONE_TYPE_COLORS[type] }}
                  />
                  <span className="text-[10px] text-slate-600 leading-tight">
                    {ZONE_TYPE_LABELS[type]}
                  </span>
                </button>
              ))}
            </div>

            <p className="text-xs text-slate-500 mb-2 mt-4">Текущие зоны:</p>
            <div className="space-y-1.5">
              {currentPlan.zones.map((zone) => (
                <div
                  key={zone.id}
                  onClick={() => dispatch({ type: 'SELECT_ZONE', payload: zone.id })}
                  className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all ${
                    selectedZoneId === zone.id
                      ? 'border-blue-400 bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: zone.color }} />
                  <span className="text-xs text-slate-700 flex-1 truncate">{zone.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {sidebarTab === 'properties' && (
          <div className="p-3">
            {selectedObject && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-800">Объект</h3>
                  <div className="flex gap-1">
                    <button
                      onClick={rotateSelected}
                      className="p-1.5 rounded hover:bg-slate-100 text-slate-500"
                      title="Повернуть"
                    >
                      <RotateCw size={14} />
                    </button>
                    <button
                      onClick={deleteSelected}
                      className="p-1.5 rounded hover:bg-red-50 text-red-500"
                      title="Удалить"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div>
                    <label className="text-[10px] text-slate-500 uppercase tracking-wide">Название</label>
                    <input
                      type="text"
                      value={selectedObject.name}
                      onChange={(e) =>
                        dispatch({
                          type: 'UPDATE_OBJECT',
                          payload: { ...selectedObject, name: e.target.value },
                        })
                      }
                      className="w-full mt-0.5 px-2 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-500 uppercase tracking-wide">X (м)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={selectedObject.x}
                        onChange={(e) =>
                          dispatch({
                            type: 'UPDATE_OBJECT',
                            payload: { ...selectedObject, x: parseFloat(e.target.value) || 0 },
                          })
                        }
                        className="w-full mt-0.5 px-2 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 uppercase tracking-wide">Y (м)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={selectedObject.y}
                        onChange={(e) =>
                          dispatch({
                            type: 'UPDATE_OBJECT',
                            payload: { ...selectedObject, y: parseFloat(e.target.value) || 0 },
                          })
                        }
                        className="w-full mt-0.5 px-2 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 uppercase tracking-wide">Ширина (м)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={selectedObject.width}
                        onChange={(e) =>
                          dispatch({
                            type: 'UPDATE_OBJECT',
                            payload: { ...selectedObject, width: parseFloat(e.target.value) || 0.1 },
                          })
                        }
                        className="w-full mt-0.5 px-2 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 uppercase tracking-wide">Высота (м)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={selectedObject.height}
                        onChange={(e) =>
                          dispatch({
                            type: 'UPDATE_OBJECT',
                            payload: { ...selectedObject, height: parseFloat(e.target.value) || 0.1 },
                          })
                        }
                        className="w-full mt-0.5 px-2 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-500 uppercase tracking-wide">Поворот (°)</label>
                    <input
                      type="number"
                      step="15"
                      value={selectedObject.rotation}
                      onChange={(e) =>
                        dispatch({
                          type: 'UPDATE_OBJECT',
                          payload: { ...selectedObject, rotation: parseInt(e.target.value) || 0 },
                        })
                      }
                      className="w-full mt-0.5 px-2 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-500 uppercase tracking-wide">Зона</label>
                    <select
                      value={selectedObject.zoneId || ''}
                      onChange={(e) =>
                        dispatch({
                          type: 'UPDATE_OBJECT',
                          payload: { ...selectedObject, zoneId: e.target.value || null },
                        })
                      }
                      className="w-full mt-0.5 px-2 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="">— Не привязана —</option>
                      {currentPlan.zones.map((z) => (
                        <option key={z.id} value={z.id}>
                          {z.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-500 uppercase tracking-wide">Тип</label>
                    <p className="text-xs text-slate-700 mt-0.5">
                      {OBJECT_TYPE_ICONS[selectedObject.type]} {OBJECT_TYPE_LABELS[selectedObject.type]}
                    </p>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-500 uppercase tracking-wide">ID</label>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5 break-all">{selectedObject.id}</p>
                  </div>
                </div>

                {/* Attributes */}
                <div className="border-t border-slate-200 pt-3">
                  <h4 className="text-xs font-semibold text-slate-700 mb-2">Атрибуты</h4>
                  <div className="space-y-1.5">
                    {Object.entries(selectedObject.attributes).map(([key, value]) => (
                      <div key={key}>
                        <label className="text-[10px] text-slate-500">{key}</label>
                        <input
                          type="text"
                          value={value}
                          onChange={(e) =>
                            dispatch({
                              type: 'UPDATE_OBJECT',
                              payload: {
                                ...selectedObject,
                                attributes: { ...selectedObject.attributes, [key]: e.target.value },
                              },
                            })
                          }
                          className="w-full mt-0.5 px-2 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        const key = prompt('Название атрибута:');
                        if (key) {
                          dispatch({
                            type: 'UPDATE_OBJECT',
                            payload: {
                              ...selectedObject,
                              attributes: { ...selectedObject.attributes, [key]: '' },
                            },
                          });
                        }
                      }}
                      className="flex items-center gap-1 text-[10px] text-blue-600 hover:text-blue-700 mt-1"
                    >
                      <Plus size={10} /> Добавить атрибут
                    </button>
                  </div>
                </div>
              </div>
            )}

            {selectedZone && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-800">Зона</h3>
                  <button
                    onClick={deleteSelected}
                    className="p-1.5 rounded hover:bg-red-50 text-red-500"
                    title="Удалить"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 uppercase tracking-wide">Название</label>
                  <input
                    type="text"
                    value={selectedZone.name}
                    onChange={(e) =>
                      dispatch({
                        type: 'UPDATE_ZONE',
                        payload: { ...selectedZone, name: e.target.value },
                      })
                    }
                    className="w-full mt-0.5 px-2 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 uppercase tracking-wide">Тип</label>
                  <p className="text-xs text-slate-700 mt-0.5">{ZONE_TYPE_LABELS[selectedZone.type]}</p>
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 uppercase tracking-wide">ID</label>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5 break-all">{selectedZone.id}</p>
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 uppercase tracking-wide">Объектов в зоне</label>
                  <p className="text-xs text-slate-700 mt-0.5">
                    {currentPlan.objects.filter((o) => o.zoneId === selectedZone.id).length}
                  </p>
                </div>
              </div>
            )}

            {!selectedObject && !selectedZone && (
              <div className="text-center py-8">
                <div className="text-3xl mb-2">👆</div>
                <p className="text-xs text-slate-500">Выберите объект или зону на плане для редактирования свойств</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
