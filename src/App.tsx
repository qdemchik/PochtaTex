import { AppProvider, useAppState } from './store';
import TopBar from './components/TopBar';
import Editor2D from './components/Editor2D';
import Sidebar from './components/Sidebar';
import InventoryPanel from './components/InventoryPanel';
import ValidationPanel from './components/ValidationPanel';
import AIAssistant from './components/AIAssistant';
import View3D from './components/View3D';

function AppContent() {
  const { state } = useAppState();

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-100 overflow-hidden">
      <TopBar />
      <div className="flex-1 flex overflow-hidden">
        {state.activeTab === 'editor' && (
          <>
            <div className="flex-1 relative">
              <Editor2D />
            </div>
            <Sidebar />
          </>
        )}
        {state.activeTab === 'inventory' && <InventoryPanel />}
        {state.activeTab === 'validation' && <ValidationPanel />}
        {state.activeTab === 'ai' && <AIAssistant />}
        {state.activeTab === '3d' && <View3D />}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
