import { useState, useEffect } from 'react';
import { useGameStore } from '../store';
import { ShieldAlert, Fingerprint } from 'lucide-react';

export function SetupPanel() {
  const store = useGameStore();
  const [live, setLive] = useState(1);
  const [blank, setBlank] = useState(1);
  
  // Decide default HP based on if someone died
  const isFreshRound = store.playerHp <= 0 || store.dealerHp <= 0 || (store.maxPlayerHp === 4 && store.playerHp === 4);
  const [playerHp, setPlayerHp] = useState(isFreshRound ? 4 : store.playerHp);
  const [dealerHp, setDealerHp] = useState(isFreshRound ? 4 : store.dealerHp);

  useEffect(() => {
    const fresh = store.playerHp <= 0 || store.dealerHp <= 0;
    setPlayerHp(fresh ? 4 : store.playerHp);
    setDealerHp(fresh ? 4 : store.dealerHp);
  }, [store.playerHp, store.dealerHp]);

  const handleStart = () => {
    store.initRound(live, blank, playerHp, dealerHp);
  };

  return (
    <div className="flex flex-col items-center justify-center flex-1 z-10 w-full max-w-md mx-auto">
      <div className="border border-brand-red/30 bg-brand-panel/80 backdrop-blur-sm p-8 rounded-lg shadow-[0_0_20px_rgba(220,38,38,0.15)] w-full">
        <h2 className="text-xl font-bold mb-6 text-brand-gray border-b border-brand-panel pb-2 flex items-center gap-2">
          <ShieldAlert className="text-brand-red w-5 h-5" />
          SYSTEM INITIALIZATION
        </h2>

        <div className="space-y-6">
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-wider text-brand-red flex items-center justify-between">
              <span>LIVE BULLETS (实弹)</span>
              <span className="font-bold text-lg">{live}</span>
            </label>
            <input 
              type="range" 
              min="0" max="8" 
              value={live} 
              onChange={e => setLive(parseInt(e.target.value))}
              className="accent-brand-red"
            />
          </div>

          <div className="flex flex-col gap-2">
             <label className="text-xs uppercase tracking-wider text-brand-gray flex items-center justify-between">
              <span>BLANK BULLETS (空包弹)</span>
              <span className="font-bold text-lg">{blank}</span>
            </label>
            <input 
              type="range" 
              min="0" max="8" 
              value={blank} 
              onChange={e => setBlank(parseInt(e.target.value))}
              className="accent-brand-gray"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-brand-bg/50">
             <div className="flex flex-col gap-2">
               <label className="text-xs uppercase tracking-wider text-brand-green flex items-center justify-between">
                <span>PLAYER HP</span>
                <span className="font-bold text-lg">{playerHp}</span>
              </label>
              <input 
                type="range" 
                min="1" max="8" 
                value={playerHp} 
                onChange={e => setPlayerHp(parseInt(e.target.value))}
                className="accent-brand-green"
              />
            </div>

            <div className="flex flex-col gap-2">
               <label className="text-xs uppercase tracking-wider text-brand-red flex items-center justify-between">
                <span>DEALER HP</span>
                <span className="font-bold text-lg">{dealerHp}</span>
              </label>
              <input 
                type="range" 
                min="1" max="8" 
                value={dealerHp} 
                onChange={e => setDealerHp(parseInt(e.target.value))}
                className="accent-brand-red"
              />
            </div>
          </div>

          <button 
            onClick={handleStart}
            disabled={live + blank === 0}
            className="mt-6 w-full py-4 border border-brand-red text-brand-red font-bold tracking-[0.2em] uppercase hover:bg-brand-red hover:text-brand-bg transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Fingerprint className="w-5 h-5" />
            ENGAGE TACTICAL MODE
          </button>
        </div>
      </div>
    </div>
  );
}