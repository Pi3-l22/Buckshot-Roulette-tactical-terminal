import { useGameStore } from '../store';
import { getAIAdvice, calculateProbabilities } from '../ai-engine';
import { AlertTriangle, Crosshair, Radar } from 'lucide-react';

export function AIAdvicePanel() {
  const store = useGameStore();
  const { liveProb, blankProb } = calculateProbabilities(store);
  const advices = getAIAdvice(store);

  const dangerColor = liveProb > 0.6 ? 'text-brand-red' : (liveProb < 0.4 ? 'text-brand-gray' : 'text-brand-amber');
  const dangerBarWidth = `${Math.round(liveProb * 100)}%`;

  return (
    <div className="bg-[#111] border border-brand-green/20 p-6 flex flex-col gap-6 relative shadow-[0_0_30px_rgba(34,197,94,0.05)] rounded h-full">
      <div className="absolute top-2 right-4 text-[10px] text-brand-green/50 animate-pulse font-mono tracking-widest">
        AI_SUBROUTINE: ONLINE
      </div>

      {/* Probability Radar */}
      <div className="border-b border-brand-green/20 pb-6">
        <h2 className="text-sm font-mono tracking-[0.3em] uppercase text-brand-green/80 flex items-center gap-2 mb-6">
          <Radar size={16} /> LIVE PROBABILITY 雷达
        </h2>
        
        <div className="flex justify-between items-end mb-2">
          <div className="flex flex-col">
             <span className="text-[10px] text-brand-red uppercase tracking-widest">LIVE / 实弹</span>
             <span className={`text-5xl font-bold ${dangerColor} font-mono tracking-tighter`}>
               {Math.round(liveProb * 100)}<span className="text-xl">%</span>
             </span>
          </div>
          <div className="flex flex-col text-right">
             <span className="text-[10px] text-brand-gray uppercase tracking-widest">BLANK / 空包弹</span>
             <span className="text-5xl font-bold text-brand-gray/80 font-mono tracking-tighter">
               {Math.round(blankProb * 100)}<span className="text-xl">%</span>
             </span>
          </div>
        </div>

        {/* Danger Bar */}
        <div className="h-2 w-full bg-brand-bg relative mt-4 overflow-hidden border border-brand-panel/50 rounded-sm">
          <div 
             className="absolute top-0 left-0 bottom-0 bg-gradient-to-r from-brand-amber to-brand-red transition-all duration-500 ease-in-out"
             style={{ width: dangerBarWidth }}
          />
          {/* Tick marks */}
          <div className="absolute top-0 bottom-0 left-1/2 w-px bg-brand-bg/50"></div>
          <div className="absolute top-0 bottom-0 left-1/4 w-px bg-brand-bg/20"></div>
          <div className="absolute top-0 bottom-0 right-1/4 w-px bg-brand-bg/20"></div>
        </div>
      </div>

      {/* AI Advice Stream */}
      <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
        <h3 className="text-xs font-mono tracking-[0.2em] uppercase text-brand-green/60 flex items-center gap-2 mt-2">
          <Crosshair size={14} /> TACTICAL RECOMMENDATIONS
        </h3>

        {advices.length === 0 ? (
           <div className="text-brand-gray/30 text-sm italic font-mono p-4 border border-brand-panel/20 border-dashed text-center">
             NO DATA AVAILABLE...
           </div>
        ) : (
          advices.map((advice, idx) => {
            let badgeColor = 'bg-brand-gray/10 text-brand-gray';
            if (advice.tier === 'S') badgeColor = 'bg-brand-red/20 text-brand-red border border-brand-red animate-pulse shadow-[0_0_10px_rgba(220,38,38,0.5)]';
            if (advice.tier === 'A') badgeColor = 'bg-brand-amber/20 text-brand-amber border border-brand-amber/50';
            if (advice.tier === 'B') badgeColor = 'bg-brand-green/10 text-brand-green border border-brand-green/30';

            return (
              <div 
                key={idx} 
                className={`p-4 rounded-sm border-l-4 font-mono text-sm leading-relaxed ${badgeColor.split(' ')[0]} ${badgeColor.split(' ')[1]} relative group transition-all`}
                style={{ borderLeftColor: 'currentColor' }}
              >
                <div className="flex items-start gap-3">
                  {advice.tier === 'S' && <AlertTriangle size={18} className="mt-0.5 shrink-0" />}
                  <div>
                    <span className="text-[10px] uppercase tracking-widest opacity-70 block mb-1">
                      TIER: {advice.tier} | PROB: {advice.dangerLevel.toFixed(0)}%
                    </span>
                    {advice.message}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}