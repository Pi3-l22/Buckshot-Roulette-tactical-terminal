import { useGameStore } from '../store';
import type { Bullet } from '../store';
import { Heart, Disc } from 'lucide-react';

export function GameStatePanel() {
  const store = useGameStore();

  const total = store.totalLive + store.totalBlank;
  
  const getBulletSymbol = (bullet: Bullet) => {
    switch(bullet) {
      case 'LIVE': return <span className="text-brand-red animate-pulse">🔴</span>;
      case 'BLANK': return <span className="text-brand-gray">⚪</span>;
      case 'INVERTED_UNKNOWN': return <span className="text-brand-amber">🔄</span>;
      default: return <span className="text-brand-panel opacity-50">❓</span>;
    }
  };

  const renderHealth = (current: number, max: number, colorClass: string) => {
    return Array.from({ length: max }).map((_, i) => (
      <div 
        key={i} 
        className={`w-6 h-8 border ${i < current ? `${colorClass} shadow-[0_0_10px_currentColor]` : 'border-brand-panel opacity-20'}`}
      />
    ));
  };

  return (
    <div className="bg-brand-panel/30 border border-brand-red/20 p-4 rounded flex flex-col gap-6 font-mono h-full relative">
      <div className="absolute top-0 right-0 p-2 text-[10px] text-brand-red/50">DATA_LINK: ACTIVE</div>
      
      {/* Player HP */}
      <div>
        <h3 className="text-brand-green flex items-center gap-2 mb-2 text-sm tracking-widest uppercase border-b border-brand-panel pb-1">
          <Heart size={16} /> YOU [PLAYER]
        </h3>
        <div className="flex gap-1 flex-wrap">{renderHealth(store.playerHp, store.maxPlayerHp, 'bg-brand-green border-brand-green text-brand-green')}</div>
      </div>

      {/* Dealer HP */}
      <div>
        <h3 className="text-brand-red flex items-center gap-2 mb-2 text-sm tracking-widest uppercase border-b border-brand-panel pb-1">
          <Heart size={16} /> DEALER
        </h3>
        <div className="flex gap-1 flex-wrap">{renderHealth(store.dealerHp, store.maxDealerHp, 'bg-brand-red border-brand-red text-brand-red')}</div>
      </div>

      {/* Bullet Sequence */}
      <div className="mt-auto pt-6 border-t border-brand-panel/50">
        <h3 className="text-brand-gray flex items-center gap-2 mb-4 text-xs tracking-[0.2em] uppercase opacity-70">
          <Disc size={14} /> CHAMBER SEQUENCE (膛内序列)
        </h3>
        <div className="flex flex-wrap gap-2 justify-center">
           {store.knownSequence.map((b, i) => (
             <div 
               key={i} 
               className={`w-10 h-14 border ${i === 0 ? 'border-brand-amber/50 animate-pulse bg-brand-panel' : 'border-brand-panel/30'} flex items-center justify-center text-xl relative`}
             >
                {i === 0 && <span className="absolute -top-3 text-[10px] text-brand-amber">CURRENT</span>}
                {getBulletSymbol(b)}
             </div>
           ))}
           {total === 0 && <div className="text-sm text-brand-red animate-pulse uppercase tracking-widest mt-4">CHAMBER EMPTY</div>}
        </div>
      </div>
    </div>
  );
}