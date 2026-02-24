import { useGameStore } from './store';
import { SetupPanel } from './components/SetupPanel';
import { GameStatePanel } from './components/GameStatePanel';
import { ActionPanel } from './components/ActionPanel';
import { AIAdvicePanel } from './components/AIAdvicePanel';

function App() {
  const store = useGameStore();

  const isSetup = (store.totalLive + store.totalBlank > 0);

  return (
    <div className="min-h-screen bg-brand-bg text-brand-gray crt vignette p-4 md:p-8 flex flex-col font-mono relative select-none">
      <div className="absolute top-0 left-0 right-0 h-1 bg-brand-red opacity-50 shadow-[0_0_10px_red] animate-pulse"></div>

      <header className="mb-6 flex justify-between items-center z-10 border-b border-brand-panel pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-widest text-brand-red uppercase drop-shadow-[0_0_5px_rgba(220,38,38,0.5)]">
            OUTER HEAVEN
          </h1>
          <p className="text-xs text-brand-gray/50 opacity-80">BUCKSHOT TACTICAL TERMINAL v2.0</p>
        </div>
        
        {isSetup && (
          <button 
            onClick={() => store.resetGame()}
            className="text-xs px-3 py-1 border border-brand-red/30 text-brand-red hover:bg-brand-red/10 rounded transition-colors"
          >
            [ REBOOT SYSTEM ]
          </button>
        )}
      </header>

      {!isSetup ? (
        <SetupPanel />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 z-10 flex-1">
          {/* Left Panel: State & Sequence */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            <GameStatePanel />
          </div>

          {/* Center Panel: Radar & AI */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <AIAdvicePanel />
          </div>

          {/* Right Panel: Actions & Inventory */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <ActionPanel />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;