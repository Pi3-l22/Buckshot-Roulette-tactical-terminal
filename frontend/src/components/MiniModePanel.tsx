import { useState } from 'react';
import { useGameStore } from '../store';
import type { Item } from '../store';
import { calculateProbabilities, getAIAdvice } from '../ai-engine';
import { Heart } from 'lucide-react';

const ITEMS: { id: Item, icon: string, label: string }[] = [
  { id: 'magnifying_glass', icon: '🔍', label: '放大镜' },
  { id: 'beer', icon: '🍺', label: '啤酒' },
  { id: 'handsaw', icon: '🔪', label: '手锯' },
  { id: 'cigarettes', icon: '🚬', label: '香烟' },
  { id: 'handcuffs', icon: '🔗', label: '手铐' },
  { id: 'inverter', icon: '🔄', label: '逆转器' },
  { id: 'burner_phone', icon: '📱', label: '手机' },
  { id: 'expired_medicine', icon: '💊', label: '过期药' },
  { id: 'adrenaline', icon: '💉', label: '肾上腺' },
];

export function MiniModePanel() {
  const store = useGameStore();
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [phoneIdx, setPhoneIdx] = useState(1);
  const [phoneResult, setPhoneResult] = useState<'LIVE' | 'BLANK'>('LIVE');
  const [showMedicineModal, setShowMedicineModal] = useState(false);
  const [showBeerModal, setShowBeerModal] = useState(false);
  const [showMagModal, setShowMagModal] = useState(false);
  const [showAdrenalineModal, setShowAdrenalineModal] = useState(false);

  const { liveProb } = calculateProbabilities(store);
  const advices = getAIAdvice(store);
  const topAdvice = advices[0];

  const handleFire = (target: 'player' | 'dealer', result: 'LIVE' | 'BLANK', shooter: 'player' | 'dealer') => {
    store.fire(target, result, shooter);
  };

  const handleUseItem = (item: Item) => {
    if (!store.inventory.includes(item)) return;

    if (item === 'magnifying_glass') {
      setShowMagModal(true); return;
    } else if (item === 'beer') {
      setShowBeerModal(true); return;
    } else if (item === 'handsaw') {
      store.useHandsaw();
    } else if (item === 'cigarettes') {
      store.useCigarettes();
    } else if (item === 'handcuffs') {
      store.useHandcuffs();
    } else if (item === 'inverter') {
      store.useInverter();
    } else if (item === 'burner_phone') {
      setShowPhoneModal(true); return;
    } else if (item === 'expired_medicine') {
      setShowMedicineModal(true); return;
    } else if (item === 'adrenaline') {
      setShowAdrenalineModal(true); return;
    }
    store.removeItem(item);
  };

  const submitPhone = () => { store.useBurnerPhone(phoneIdx, phoneResult); store.removeItem('burner_phone'); setShowPhoneModal(false); };
  const submitMedicine = (success: boolean) => { store.useExpiredMedicine(success); store.removeItem('expired_medicine'); setShowMedicineModal(false); };
  const submitBeer = (result: 'LIVE' | 'BLANK') => { store.useBeer(result); store.removeItem('beer'); setShowBeerModal(false); }
  const submitMag = (result: 'LIVE' | 'BLANK') => { store.useMagnifyingGlass(result); store.removeItem('magnifying_glass'); setShowMagModal(false); };
  const submitAdrenaline = () => { store.removeItem('adrenaline'); setShowAdrenalineModal(false); };

  const livePercent = Math.round(liveProb * 100);
  const probColor = livePercent > 60 ? 'text-brand-red' : (livePercent < 40 ? 'text-brand-gray' : 'text-brand-amber');

  const renderMiniHealth = (current: number, max: number, colorClass: string) => {
    return Array.from({ length: max }).map((_, i) => (
      <div key={i} className={`w-3 h-3 ${i < current ? colorClass : 'bg-transparent border border-brand-panel/50'}`} />
    ));
  };

  return (
    <div className="flex flex-col gap-2 h-full font-mono text-xs pb-4">
      {/* HP Bar */}
      <div className="flex justify-between items-center bg-brand-panel/30 p-2 border border-brand-panel">
        <div className="flex flex-col gap-1">
          <span className="text-brand-green flex items-center gap-1 text-[10px]"><Heart size={10} /> YOU</span>
          <div className="flex gap-[2px] flex-wrap max-w-[50px]">{renderMiniHealth(store.playerHp, store.maxPlayerHp, 'bg-brand-green')}</div>
        </div>
        <div className="text-center">
           <div className="text-[10px] text-brand-gray/50">L {store.totalLive} | B {store.totalBlank}</div>
           <div className={`text-xl font-bold ${probColor}`}>{livePercent}%🔴</div>
        </div>
        <div className="flex flex-col gap-1 items-end">
          <span className="text-brand-red flex items-center gap-1 text-[10px]">DEALER <Heart size={10} /></span>
          <div className="flex gap-[2px] flex-wrap max-w-[50px] justify-end">{renderMiniHealth(store.dealerHp, store.maxDealerHp, 'bg-brand-red')}</div>
        </div>
      </div>

      {/* AI Advice (Mini) */}
      {topAdvice && (
        <div className={`p-1 border text-center text-[10px] ${topAdvice.tier === 'S' ? 'border-brand-red text-brand-red bg-brand-red/10 animate-pulse' : 'border-brand-panel text-brand-amber bg-brand-amber/5'}`}>
          <span className="font-bold">[{topAdvice.tier}]</span> {topAdvice.action}
        </div>
      )}

      {/* Actions (Fire) */}
      <div className="grid grid-cols-2 gap-2 mt-1">
         <div className="flex flex-col gap-1">
            <span className="text-[9px] text-center text-brand-gray bg-brand-panel py-1">YOU SHOOT</span>
            <div className="flex gap-1">
               <button onClick={() => handleFire('dealer', 'LIVE', 'player')} className="flex-1 bg-brand-red/20 text-brand-red border border-brand-red py-1 cursor-pointer hover:bg-brand-red/40">D-🔴</button>
               <button onClick={() => handleFire('dealer', 'BLANK', 'player')} className="flex-1 bg-brand-gray/20 text-brand-gray border border-brand-gray py-1 cursor-pointer hover:bg-brand-gray/40">D-⚪</button>
            </div>
            <div className="flex gap-1">
               <button onClick={() => handleFire('player', 'LIVE', 'player')} className="flex-1 bg-brand-red/20 text-brand-red border border-brand-red/30 opacity-70 py-1 cursor-pointer hover:bg-brand-red/40 hover:opacity-100">U-🔴</button>
               <button onClick={() => handleFire('player', 'BLANK', 'player')} className="flex-1 bg-brand-gray/20 text-brand-gray border border-brand-gray/30 opacity-70 py-1 cursor-pointer hover:bg-brand-gray/40 hover:opacity-100">U-⚪</button>
            </div>
         </div>
         <div className="flex flex-col gap-1">
            <span className="text-[9px] text-center text-brand-gray bg-brand-panel py-1">DEALER SHOOTS</span>
            <div className="flex gap-1">
               <button onClick={() => handleFire('player', 'LIVE', 'dealer')} className="flex-1 bg-brand-red/20 text-brand-red border border-brand-red/30 opacity-70 py-1 cursor-pointer hover:bg-brand-red/40 hover:opacity-100">U-🔴</button>
               <button onClick={() => handleFire('player', 'BLANK', 'dealer')} className="flex-1 bg-brand-gray/20 text-brand-gray border border-brand-gray/30 opacity-70 py-1 cursor-pointer hover:bg-brand-gray/40 hover:opacity-100">U-⚪</button>
            </div>
            <div className="flex gap-1">
               <button onClick={() => handleFire('dealer', 'LIVE', 'dealer')} className="flex-1 bg-brand-red/20 text-brand-red border border-brand-red py-1 cursor-pointer hover:bg-brand-red/40">D-🔴</button>
               <button onClick={() => handleFire('dealer', 'BLANK', 'dealer')} className="flex-1 bg-brand-gray/20 text-brand-gray border border-brand-gray py-1 cursor-pointer hover:bg-brand-gray/40">D-⚪</button>
            </div>
         </div>
      </div>

      {/* Inventory */}
      <div className="mt-1 bg-brand-panel/10 border border-brand-green/20 p-2 relative">
         <div className="grid grid-cols-5 gap-1">
            {ITEMS.map((item) => {
               const count = store.inventory.filter(i => i === item.id).length;
               return (
                  <div key={item.id} className="flex flex-col items-center gap-1 border border-brand-panel p-1 relative" title={item.label}>
                     {count > 0 && <span className="absolute -top-1 -right-1 text-[8px] bg-brand-green text-brand-bg px-1 rounded-sm z-10">{count}</span>}
                     <span className="text-sm cursor-help">{item.icon}</span>
                     <div className="flex w-full mt-1">
                        <button onClick={() => store.addItem(item.id)} className="flex-1 bg-brand-green/20 hover:bg-brand-green/40 text-brand-green text-[8px] border-r border-brand-panel cursor-pointer">+</button>
                        <button disabled={count === 0} onClick={() => handleUseItem(item.id)} className="flex-1 bg-brand-red/20 hover:bg-brand-red/40 text-brand-red text-[8px] disabled:opacity-30 cursor-pointer">U</button>
                     </div>
                  </div>
               )
            })}
            <div className="flex flex-col items-center gap-1 border border-brand-panel p-1 justify-center">
              {store.isSawed && <span className="text-[8px] bg-brand-red/20 text-brand-red px-1 border border-brand-red animate-pulse w-full text-center">SAWED</span>}
              {store.isHandcuffed && <span className="text-[8px] bg-brand-gray/20 text-brand-gray px-1 border border-brand-gray w-full text-center">CUFF</span>}
            </div>
         </div>
      </div>

      {/* Compact Modals */}
      {showPhoneModal && (
        <div className="absolute inset-0 bg-brand-bg/95 flex flex-col justify-center items-center z-50 p-4">
          <span className="text-brand-green text-sm mb-2">PHONE (手机)</span>
          <input type="number" min={1} max={store.totalLive + store.totalBlank} value={phoneIdx} onChange={e => setPhoneIdx(parseInt(e.target.value))} className="bg-transparent border border-brand-gray w-full p-1 text-center mb-2" />
          <select value={phoneResult} onChange={e => setPhoneResult(e.target.value as 'LIVE' | 'BLANK')} className="bg-transparent border border-brand-gray w-full p-1 text-center mb-4 text-brand-gray">
             <option value="LIVE">🔴 LIVE</option><option value="BLANK">⚪ BLANK</option>
          </select>
          <div className="flex w-full gap-2"><button onClick={submitPhone} className="flex-1 border border-brand-green text-brand-green p-1">OK</button><button onClick={() => setShowPhoneModal(false)} className="flex-1 border border-brand-gray p-1 text-brand-gray">X</button></div>
        </div>
      )}
      {showMedicineModal && (
        <div className="absolute inset-0 bg-brand-bg/95 flex flex-col justify-center items-center z-50 p-4">
          <span className="text-brand-amber text-sm mb-4">MEDICINE (过期药)</span>
          <div className="flex w-full gap-2"><button onClick={() => submitMedicine(true)} className="flex-1 border border-brand-green text-brand-green p-1">+2 HP</button><button onClick={() => submitMedicine(false)} className="flex-1 border border-brand-red text-brand-red p-1">-1 HP</button></div>
          <button onClick={() => setShowMedicineModal(false)} className="w-full mt-2 border border-brand-gray p-1 text-brand-gray">CANCEL</button>
        </div>
      )}
      {showBeerModal && (
        <div className="absolute inset-0 bg-brand-bg/95 flex flex-col justify-center items-center z-50 p-4">
          <span className="text-brand-amber text-sm mb-4">BEER (啤酒退弹)</span>
          <div className="flex w-full gap-2"><button onClick={() => submitBeer('LIVE')} className="flex-1 border border-brand-red text-brand-red p-1">🔴 LIVE</button><button onClick={() => submitBeer('BLANK')} className="flex-1 border border-brand-gray text-brand-gray p-1">⚪ BLANK</button></div>
          <button onClick={() => setShowBeerModal(false)} className="w-full mt-2 border border-brand-gray p-1 text-brand-gray">CANCEL</button>
        </div>
      )}
      {showMagModal && (
        <div className="absolute inset-0 bg-brand-bg/95 flex flex-col justify-center items-center z-50 p-4">
          <span className="text-brand-green text-sm mb-4">MAGNIFYING GLASS (放大镜)</span>
          <div className="flex w-full gap-2"><button onClick={() => submitMag('LIVE')} className="flex-1 border border-brand-red text-brand-red p-1">🔴 LIVE</button><button onClick={() => submitMag('BLANK')} className="flex-1 border border-brand-gray text-brand-gray p-1">⚪ BLANK</button></div>
          <button onClick={() => setShowMagModal(false)} className="w-full mt-2 border border-brand-gray p-1 text-brand-gray">CANCEL</button>
        </div>
      )}
      {showAdrenalineModal && (
        <div className="absolute inset-0 bg-brand-bg/95 flex flex-col justify-center items-center z-50 p-4">
          <span className="text-brand-green text-sm mb-2 text-center">ADRENALINE (肾上腺素)</span>
          <span className="text-[10px] text-center mb-4 text-brand-gray">Add stolen item via inventory [+] below.</span>
          <button onClick={submitAdrenaline} className="w-full border border-brand-green text-brand-green p-1">ACKNOWLEDGE</button>
        </div>
      )}
    </div>
  );
}