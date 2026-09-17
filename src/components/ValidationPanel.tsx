import { useAppState, validatePlan } from '../store';
import { AlertCircle, AlertTriangle, Info, RefreshCw, MapPin } from 'lucide-react';

export default function ValidationPanel() {
  const { state, dispatch } = useAppState();
  const { currentPlan, validationResults } = state;

  const handleValidate = () => {
    const results = validatePlan(currentPlan);
    dispatch({ type: 'SET_VALIDATION', payload: results });
  };

  const errors = validationResults.filter((r) => r.type === 'error');
  const warnings = validationResults.filter((r) => r.type === 'warning');
  const infos = validationResults.filter((r) => r.type === 'info');

  const focusOnItem = (objectId?: string, zoneId?: string) => {
    if (objectId) {
      dispatch({ type: 'SELECT_OBJECT', payload: objectId });
    } else if (zoneId) {
      dispatch({ type: 'SELECT_ZONE', payload: zoneId });
    }
    dispatch({ type: 'SET_TAB', payload: 'editor' });
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800 mb-1">Проверка корректности</h2>
            <p className="text-sm text-slate-500">Анализ плана на ошибки и предупреждения</p>
          </div>
          <button
            onClick={handleValidate}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
          >
            <RefreshCw size={16} />
            Проверить план
          </button>
        </div>

        {validationResults.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
            <div className="text-4xl mb-3">🔍</div>
            <p className="text-sm text-slate-500">Нажмите «Проверить план» для запуска анализа</p>
          </div>
        ) : (
          <>
            {/* Summary */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className={`rounded-xl p-4 border ${errors.length > 0 ? 'bg-red-50 border-red-200' : 'bg-white border-slate-200'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle size={16} className={errors.length > 0 ? 'text-red-600' : 'text-slate-400'} />
                  <span className="text-xs font-medium text-slate-500">Ошибки</span>
                </div>
                <div className={`text-2xl font-bold ${errors.length > 0 ? 'text-red-700' : 'text-slate-300'}`}>{errors.length}</div>
              </div>
              <div className={`rounded-xl p-4 border ${warnings.length > 0 ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-200'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle size={16} className={warnings.length > 0 ? 'text-amber-600' : 'text-slate-400'} />
                  <span className="text-xs font-medium text-slate-500">Предупреждения</span>
                </div>
                <div className={`text-2xl font-bold ${warnings.length > 0 ? 'text-amber-700' : 'text-slate-300'}`}>{warnings.length}</div>
              </div>
              <div className="rounded-xl p-4 border bg-white border-slate-200">
                <div className="flex items-center gap-2 mb-1">
                  <Info size={16} className="text-blue-500" />
                  <span className="text-xs font-medium text-slate-500">Информация</span>
                </div>
                <div className="text-2xl font-bold text-blue-700">{infos.length}</div>
              </div>
            </div>

            {/* Results list */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="divide-y divide-slate-100">
                {validationResults.map((result, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-3 px-4 py-3 ${
                      (result.objectId || result.zoneId) ? 'cursor-pointer hover:bg-slate-50' : ''
                    } transition-colors`}
                    onClick={() => focusOnItem(result.objectId, result.zoneId)}
                  >
                    {result.type === 'error' && <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />}
                    {result.type === 'warning' && <AlertTriangle size={16} className="text-amber-500 mt-0.5 shrink-0" />}
                    {result.type === 'info' && <Info size={16} className="text-blue-500 mt-0.5 shrink-0" />}
                    <div className="flex-1">
                      <p className="text-sm text-slate-700">{result.message}</p>
                      <div className="flex gap-3 mt-1">
                        {result.objectId && (
                          <span className="text-[10px] text-slate-400 font-mono">Объект: {result.objectId.substring(0, 12)}</span>
                        )}
                        {result.zoneId && (
                          <span className="text-[10px] text-slate-400 font-mono">Зона: {result.zoneId.substring(0, 12)}</span>
                        )}
                        {result.position && (
                          <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                            <MapPin size={10} /> ({result.position.x}, {result.position.y})
                          </span>
                        )}
                      </div>
                    </div>
                    {(result.objectId || result.zoneId) && (
                      <span className="text-[10px] text-blue-500 shrink-0">Показать →</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
