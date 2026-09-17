import { useAppState, calculateZoneArea } from '../store';
import { OBJECT_TYPE_LABELS, OBJECT_TYPE_ICONS, ZONE_TYPE_LABELS } from '../types';

export default function InventoryPanel() {
  const { state, dispatch } = useAppState();
  const { currentPlan } = state;

  const roomArea = currentPlan.room.width * currentPlan.room.height;
  const objectsArea = currentPlan.objects.reduce((sum, obj) => sum + obj.width * obj.height, 0);
  const freeArea = roomArea - objectsArea;

  // Count by type
  const typeCounts: Record<string, number> = {};
  currentPlan.objects.forEach((obj) => {
    typeCounts[obj.type] = (typeCounts[obj.type] || 0) + 1;
  });

  // Count by zone
  const zoneStats = currentPlan.zones.map((zone) => {
    const zoneObjects = currentPlan.objects.filter((o) => o.zoneId === zone.id);
    const zoneArea = calculateZoneArea(zone);
    const objArea = zoneObjects.reduce((s, o) => s + o.width * o.height, 0);
    return {
      zone,
      objectCount: zoneObjects.length,
      zoneArea,
      occupiedArea: objArea,
      freeArea: zoneArea - objArea,
      objects: zoneObjects,
    };
  });

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-xl font-bold text-slate-800 mb-1">Инвентаризация оборудования</h2>
        <p className="text-sm text-slate-500 mb-6">{currentPlan.name}</p>

        {/* Summary cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
            <div className="text-xs text-slate-500 mb-1">Площадь помещения</div>
            <div className="text-2xl font-bold text-slate-800">{roomArea.toFixed(1)} м²</div>
            <div className="text-xs text-slate-400 mt-1">{currentPlan.room.width} × {currentPlan.room.height} м</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
            <div className="text-xs text-slate-500 mb-1">Занято оборудованием</div>
            <div className="text-2xl font-bold text-blue-700">{objectsArea.toFixed(1)} м²</div>
            <div className="text-xs text-slate-400 mt-1">{((objectsArea / roomArea) * 100).toFixed(0)}% от площади</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
            <div className="text-xs text-slate-500 mb-1">Свободная площадь</div>
            <div className="text-2xl font-bold text-emerald-700">{freeArea.toFixed(1)} м²</div>
            <div className="text-xs text-slate-400 mt-1">{((freeArea / roomArea) * 100).toFixed(0)}% от площади</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
            <div className="text-xs text-slate-500 mb-1">Всего объектов</div>
            <div className="text-2xl font-bold text-slate-800">{currentPlan.objects.length}</div>
            <div className="text-xs text-slate-400 mt-1">{currentPlan.zones.length} зон</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Objects by type */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
              <h3 className="text-sm font-semibold text-slate-700">Оборудование по типам</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {Object.entries(typeCounts).map(([type, count]) => (
                <div key={type} className="flex items-center gap-3 px-4 py-2.5">
                  <span className="text-lg">{OBJECT_TYPE_ICONS[type as keyof typeof OBJECT_TYPE_ICONS]}</span>
                  <span className="text-sm text-slate-700 flex-1">{OBJECT_TYPE_LABELS[type as keyof typeof OBJECT_TYPE_LABELS]}</span>
                  <span className="text-sm font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Zones */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
              <h3 className="text-sm font-semibold text-slate-700">Статистика по зонам</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {zoneStats.map(({ zone, objectCount, zoneArea, occupiedArea, freeArea }) => (
                <div
                  key={zone.id}
                  className="px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={() => {
                    dispatch({ type: 'SELECT_ZONE', payload: zone.id });
                    dispatch({ type: 'SET_TAB', payload: 'editor' });
                  }}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: zone.color }} />
                    <span className="text-sm font-medium text-slate-700">{zone.name}</span>
                    <span className="text-xs text-slate-400 ml-auto">{ZONE_TYPE_LABELS[zone.type]}</span>
                  </div>
                  <div className="flex gap-4 text-xs text-slate-500">
                    <span>Площадь: {zoneArea.toFixed(1)} м²</span>
                    <span>Занято: {occupiedArea.toFixed(1)} м²</span>
                    <span>Свободно: {freeArea.toFixed(1)} м²</span>
                    <span className="font-medium text-slate-700">Объектов: {objectCount}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Full equipment list */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mt-6">
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
            <h3 className="text-sm font-semibold text-slate-700">Полный перечень оборудования</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-2 font-medium text-slate-500">ID</th>
                  <th className="text-left px-4 py-2 font-medium text-slate-500">Тип</th>
                  <th className="text-left px-4 py-2 font-medium text-slate-500">Название</th>
                  <th className="text-left px-4 py-2 font-medium text-slate-500">Зона</th>
                  <th className="text-left px-4 py-2 font-medium text-slate-500">Позиция</th>
                  <th className="text-left px-4 py-2 font-medium text-slate-500">Размер</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentPlan.objects.map((obj) => {
                  const zone = currentPlan.zones.find((z) => z.id === obj.zoneId);
                  return (
                    <tr
                      key={obj.id}
                      className="hover:bg-blue-50 cursor-pointer transition-colors"
                      onClick={() => {
                        dispatch({ type: 'SELECT_OBJECT', payload: obj.id });
                        dispatch({ type: 'SET_TAB', payload: 'editor' });
                      }}
                    >
                      <td className="px-4 py-2 font-mono text-slate-400">{obj.id.substring(0, 8)}...</td>
                      <td className="px-4 py-2">
                        <span className="mr-1">{OBJECT_TYPE_ICONS[obj.type]}</span>
                        {OBJECT_TYPE_LABELS[obj.type]}
                      </td>
                      <td className="px-4 py-2 text-slate-700 font-medium">{obj.name}</td>
                      <td className="px-4 py-2">
                        {zone ? (
                          <span className="inline-flex items-center gap-1">
                            <span className="w-2 h-2 rounded" style={{ backgroundColor: zone.color }} />
                            {zone.name}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-2 text-slate-500">({obj.x}, {obj.y})</td>
                      <td className="px-4 py-2 text-slate-500">{obj.width}×{obj.height} м</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
