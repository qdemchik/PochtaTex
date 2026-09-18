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
    <div className="flex-1 overflow-y-auto p-6 bg-[#141414]">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white mb-1">Проверка корректности</h2>
            <p className="text-sm text-slate-400">Анализ плана на ошибки и предупреждения</p>
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
          <div className="bg-[#1e1e1e] rounded-xl border border-slate-800 p-8 text-center">
            <div className="text-4xl mb-3">🔍</div>
            <p className="text-sm text-slate-400">Нажмите «Проверить план» для запуска анализа</p>
          </div>
        ) : (
          <>
            {/* Summary */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className={`rounded-xl p-4 border ${errors.length > 0 ? 'bg-red-900/20 border-red-800' : 'bg-[#1e1e1e] border-slate-800'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle size={16} className={errors.length > 0 ? 'text-red-400' : 'text-slate-500'} />
                  <span className="text-xs font-medium text-slate-400">Ошибки</span>
                </div>
                <div className={`text-2xl font-bold ${errors.length > 0 ? 'text-red-400' : 'text-slate-600'}`}>{errors.length}</div>
              </div>
              <div className={`rounded-xl p-4 border ${warnings.length > 0 ? 'bg-amber-900/20 border-amber-800' : 'bg-[#1e1e1e] border-slate-800'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle size={16} className={warnings.length > 0 ? 'text-amber-400' : 'text-slate-500'} />
                  <span className="text-xs font-medium text-slate-400">Предупреждения</span>
                </div>
                <div className={`text-2xl font-bold ${warnings.length > 0 ? 'text-amber-400' : 'text-slate-600'}`}>{warnings.length}</div>
              </div>
              <div className="rounded-xl p-4 border bg-[#1e1e1e] border-slate-800">
                <div className="flex items-center gap-2 mb-1">
                  <Info size={16} className="text-blue-400" />
                  <span className="text-xs font-medium text-slate-400">Информация</span>
                </div>
                <div className="text-2xl font-bold text-blue-400">{infos.length}</div>
              </div>
            </div>

            {/* Results list */}
            <div className="bg-[#1e1e1e] rounded-xl border border-slate-800 overflow-hidden">
              <div className="divide-y divide-slate-800">
                {validationResults.map((result, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-3 px-4 py-3 ${
                      (result.objectId || result.zoneId) ? 'cursor-pointer hover:bg-[#252525]' : ''
                    } transition-colors`}
                    onClick={() => focusOnItem(result.objectId, result.zoneId)}
                  >
                    {result.type === 'error' && <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />}
                    {result.type === 'warning' && <AlertTriangle size={16} className="text-amber-400 mt-0.5 shrink-0" />}
                    {result.type === 'info' && <Info size={16} className="text-blue-400 mt-0.5 shrink-0" />}
                    <div className="flex-1">
                      <p className="text-sm text-slate-200">{result.message}</p>
                      <div className="flex gap-3 mt-1">
                        {result.objectId && (
                          <span className="text-[10px] text-slate-500 font-mono">Объект: {result.objectId.substring(0, 12)}</span>
                        )}
                        {result.zoneId && (
                          <span className="text-[10px] text-slate-500 font-mono">Зона: {result.zoneId.substring(0, 12)}</span>
                        )}
                        {result.position && (
                          <span className="text-[10px] text-slate-500 flex items-center gap-0.5">
                            <MapPin size={10} /> ({result.position.x}, {result.position.y})
                          </span>
                        )}
                      </div>
                    </div>
                    {(result.objectId || result.zoneId) && (
                      <span className="text-[10px] text-blue-400 shrink-0">Показать →</span>
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
