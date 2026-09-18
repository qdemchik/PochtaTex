import { useAppState, generateAIRecommendations } from '../store';
import { Sparkles, Lightbulb, ArrowRight, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function AIAssistant() {
  const { state, dispatch } = useAppState();
  const { currentPlan, aiRecommendations } = state;

  const handleAnalyze = () => {
    const recs = generateAIRecommendations(currentPlan);
    dispatch({ type: 'SET_AI_RECOMMENDATIONS', payload: recs });
  };

  const applyRecommendation = (recId: string) => {
    dispatch({ type: 'APPLY_RECOMMENDATION', payload: recId });
    dispatch({ type: 'SET_TAB', payload: 'editor' });
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-[#141414]">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
              <Sparkles size={20} className="text-purple-400" />
              ИИ-ассистент
            </h2>
            <p className="text-sm text-slate-400">Анализ конфигурации и рекомендации по оптимизации</p>
          </div>
          <button
            onClick={handleAnalyze}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-medium hover:from-purple-700 hover:to-blue-700 transition-all shadow-sm"
          >
            <Sparkles size={16} />
            Анализировать план
          </button>
        </div>

        {aiRecommendations.length === 0 ? (
          <div className="bg-[#1e1e1e] rounded-xl border border-slate-800 p-8 text-center">
            <div className="text-4xl mb-3">🤖</div>
            <p className="text-sm text-slate-400 mb-2">Нажмите «Анализировать план» для получения рекомендаций</p>
            <p className="text-xs text-slate-500">
              Ассистент проанализирует расположение оборудования, загрузку зон и предложит улучшения
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Summary */}
            <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-xl border border-purple-800 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb size={16} className="text-purple-400" />
                <span className="text-sm font-semibold text-purple-300">Результат анализа</span>
              </div>
              <p className="text-sm text-purple-200">
                Обнаружено {aiRecommendations.length} рекомендаций. 
                {aiRecommendations.filter((r) => r.action).length} из них можно применить автоматически.
              </p>
            </div>

            {/* Recommendations */}
            {aiRecommendations.map((rec) => (
              <div
                key={rec.id}
                className="bg-[#1e1e1e] rounded-xl border border-slate-800 overflow-hidden"
              >
                <div className="px-5 py-4 border-b border-slate-800">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-900/30 flex items-center justify-center shrink-0">
                      <Lightbulb size={16} className="text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-white">{rec.title}</h3>
                      <p className="text-xs text-slate-300 mt-1">{rec.description}</p>
                    </div>
                  </div>
                </div>

                <div className="px-5 py-3 space-y-2.5 bg-[#252525]/50">
                  <div>
                    <span className="text-[10px] uppercase tracking-wide text-slate-500 font-medium">Обоснование</span>
                    <p className="text-xs text-slate-300 mt-0.5">{rec.reason}</p>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase tracking-wide text-slate-500 font-medium">Влияние</span>
                    <p className="text-xs text-slate-300 mt-0.5 flex items-start gap-1">
                      <ArrowRight size={12} className="mt-0.5 shrink-0 text-blue-400" />
                      {rec.impact}
                    </p>
                  </div>

                  {rec.assumption && (
                    <div>
                      <span className="text-[10px] uppercase tracking-wide text-amber-400 font-medium flex items-center gap-1">
                        <AlertTriangle size={10} /> Допущение
                      </span>
                      <p className="text-xs text-slate-400 mt-0.5">{rec.assumption}</p>
                    </div>
                  )}

                  {rec.affectedZones.length > 0 && (
                    <div>
                      <span className="text-[10px] uppercase tracking-wide text-slate-500 font-medium">Затронутые зоны</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {rec.affectedZones.map((zId) => {
                          const zone = currentPlan.zones.find((z) => z.id === zId);
                          return zone ? (
                            <span
                              key={zId}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-300"
                            >
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: zone.color }} />
                              {zone.name}
                            </span>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {rec.action && (
                  <div className="px-5 py-3 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      <CheckCircle2 size={12} className="inline mr-1 text-emerald-400" />
                      Можно применить к плану
                    </span>
                    <button
                      onClick={() => applyRecommendation(rec.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition-colors"
                    >
                      Применить
                      <ArrowRight size={12} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
