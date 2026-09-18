import { useAppState, validatePlan, generateAIRecommendations } from '../store';
import {
  MousePointer2,
  Upload,
  CheckCircle2,
  Sparkles,
  Box,
  Layers,
  BarChart3,
  ShieldCheck,
  Brain,
  Save,
} from 'lucide-react';

export default function TopBar() {
  const { state, dispatch } = useAppState();
  const { activeTab, currentPlan } = state;

  const handleSave = () => {
    const data = JSON.stringify(currentPlan, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentPlan.name.replace(/[^a-zA-Zа-яА-Я0-9]/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLoad = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target?.result as string);
          dispatch({ type: 'SET_PLAN', payload: data });
        } catch {
          alert('Ошибка чтения файла');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleValidate = () => {
    const results = validatePlan(currentPlan);
    dispatch({ type: 'SET_VALIDATION', payload: results });
    dispatch({ type: 'SET_TAB', payload: 'validation' });
  };

  const handleAI = () => {
    const recs = generateAIRecommendations(currentPlan);
    dispatch({ type: 'SET_AI_RECOMMENDATIONS', payload: recs });
    dispatch({ type: 'SET_TAB', payload: 'ai' });
  };

  const tabs = [
    { id: 'editor' as const, label: 'Редактор', icon: MousePointer2 },
    { id: 'inventory' as const, label: 'Инвентаризация', icon: BarChart3 },
    { id: 'validation' as const, label: 'Проверка', icon: ShieldCheck },
    { id: 'ai' as const, label: 'ИИ-ассистент', icon: Brain },
    { id: '3d' as const, label: '3D-вид', icon: Box },
  ];

  return (
    <header className="h-14 bg-[#737676] border-b border-slate-700 flex items-center px-4 gap-4 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2.5 mr-4">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
          <Layers size={16} className="text-white" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-white leading-tight">Почта Тех</h1>
          <p className="text-[10px] text-slate-300 leading-tight">Планировщик отделений</p>
        </div>
      </div>

      {/* Tabs */}
      <nav className="flex items-center gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => dispatch({ type: 'SET_TAB', payload: tab.id })}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-white/20 text-white shadow-sm'
                  : 'text-slate-200 hover:text-white hover:bg-white/10'
              }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </nav>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Plan name */}
      <div className="text-xs text-slate-200 max-w-48 truncate">
        <span className="font-medium text-white">{currentPlan.name}</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white hover:bg-white/10 transition-colors"
          title="Сохранить план"
        >
          <Save size={14} />
          Сохранить
        </button>
        <button
          onClick={handleLoad}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white hover:bg-white/10 transition-colors"
          title="Загрузить план"
        >
          <Upload size={14} />
          Загрузить
        </button>
      </div>
    </header>
  );
}
