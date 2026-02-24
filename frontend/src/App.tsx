import { useState } from 'react';
import { useGameStore } from './store';
import { SetupPanel } from './components/SetupPanel';
import { GameStatePanel } from './components/GameStatePanel';
import { ActionPanel } from './components/ActionPanel';
import { AIAdvicePanel } from './components/AIAdvicePanel';
import { MiniModePanel } from './components/MiniModePanel';
import { Minimize2, Maximize2 } from 'lucide-react';
import { WindowSetAlwaysOnTop, WindowSetSize, WindowSetMinSize } from '../wailsjs/runtime/runtime';

function App() {
  const store = useGameStore();
  const [isMiniMode, setIsMiniMode] = useState(false);

  const isSetup = (store.totalLive + store.totalBlank > 0);

  const toggleMiniMode = () => {
    if (!isMiniMode) {
      WindowSetMinSize(300, 300);
      WindowSetSize(350, 480);
      WindowSetAlwaysOnTop(true);
      setIsMiniMode(true);
    } else {
      WindowSetMinSize(800, 600);
      WindowSetSize(1024, 768);
      WindowSetAlwaysOnTop(false);
      setIsMiniMode(false);
    }
  };

  if (isMiniMode) {
    return (
      <div className="h-screen bg-brand-bg text-brand-gray crt vignette flex flex-col font-mono relative select-none overflow-hidden" style={{'--wails-draggable': 'drag'} as React.CSSProperties}>
        <div className="absolute top-0 left-0 right-0 h-1 bg-brand-red opacity-50 shadow-[0_0_10px_red] animate-pulse"></div>
        <header className="flex justify-between items-center z-10 border-b border-brand-panel p-2 bg-brand-bg">
          <div className="flex flex-col">
            <h1 className="text-sm font-bold tracking-widest text-brand-red uppercase drop-shadow-[0_0_5px_rgba(220,38,38,0.5)]">
              OUTER HEAVEN
            </h1>
            <span className="text-[8px] text-brand-gray/50">TACTICAL TERMINAL v2.0</span>
          </div>
          <div className="flex gap-2 items-center" style={{'--wails-draggable': 'no-drag'} as React.CSSProperties}>
            {isSetup && (
              <button onClick={() => store.resetGame()} className="text-[8px] px-1 py-1 border border-brand-red/30 text-brand-red hover:bg-brand-red/10 cursor-pointer">REBOOT</button>
            )}
            <button onClick={toggleMiniMode} className="text-brand-gray hover:text-white p-1 cursor-pointer">
              <Maximize2 size={14} />
            </button>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto" style={{'--wails-draggable': 'no-drag'} as React.CSSProperties}>
          {!isSetup ? (
            <div className="p-4 flex flex-col gap-4">
              <span className="text-brand-green text-sm text-center">SYSTEM REBOOT (初始化)</span>
              <div className="flex justify-between items-center bg-brand-panel p-2">
                <span className="text-xs text-brand-red">LIVE (实弹)</span>
                <input type="number" min={0} max={8} defaultValue={0} className="w-12 bg-transparent border-b border-brand-red text-center outline-none text-brand-red" id="miniLive" />
              </div>
              <div className="flex justify-between items-center bg-brand-panel p-2">
                <span className="text-xs text-brand-gray">BLANK (空包弹)</span>
                <input type="number" min={0} max={8} defaultValue={0} className="w-12 bg-transparent border-b border-brand-gray text-center outline-none text-brand-gray" id="miniBlank" />
              </div>
              <button 
                onClick={() => {
                  const l = parseInt((document.getElementById('miniLive') as HTMLInputElement).value) || 0;
                  const b = parseInt((document.getElementById('miniBlank') as HTMLInputElement).value) || 0;
                  if (l+b > 0) store.initRound(l, b, store.playerHp, store.dealerHp);
                }}
                className="w-full bg-brand-green/20 text-brand-green border border-brand-green py-2 cursor-pointer mt-4 hover:bg-brand-green hover:text-brand-bg"
              >
                INITIALIZE
              </button>
            </div>
          ) : <MiniModePanel />}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg text-brand-gray crt vignette p-4 md:p-8 flex flex-col font-mono relative select-none">
      <div className="absolute top-0 left-0 right-0 h-1 bg-brand-red opacity-50 shadow-[0_0_10px_red] animate-pulse" style={{'--wails-draggable': 'drag'} as React.CSSProperties}></div>

      <header className="mb-6 flex justify-between items-center z-10 border-b border-brand-panel pb-4" style={{'--wails-draggable': 'drag'} as React.CSSProperties}>
        <div>
          <h1 className="text-2xl font-bold tracking-widest text-brand-red uppercase drop-shadow-[0_0_5px_rgba(220,38,38,0.5)]">
            OUTER HEAVEN
          </h1>
          <p className="text-xs text-brand-gray/50 opacity-80">BUCKSHOT TACTICAL TERMINAL v2.0</p>
        </div>
        
        <div className="flex gap-4 items-center" style={{'--wails-draggable': 'no-drag'} as React.CSSProperties}>
          <button 
            onClick={toggleMiniMode}
            className="text-xs flex items-center gap-1 px-3 py-1 border border-brand-gray/30 text-brand-gray hover:bg-brand-gray/10 hover:text-white rounded transition-colors cursor-pointer"
          >
            <Minimize2 size={14} /> [ MINI MODE ]
          </button>
          {isSetup && (
            <button 
              onClick={() => store.resetGame()}
              className="text-xs px-3 py-1 border border-brand-red/30 text-brand-red hover:bg-brand-red/10 rounded transition-colors cursor-pointer"
            >
              [ REBOOT SYSTEM ]
            </button>
          )}
        </div>
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