import { useState } from 'react';
import { useGameStore } from '../store';
import type { Item } from '../store';
import { BoxSelect, Swords, HelpCircle } from 'lucide-react';

const ITEMS: { id: Item, label: string, icon: string }[] = [
  { id: 'magnifying_glass', label: '放大镜', icon: '🔍' },
  { id: 'beer', label: '啤酒', icon: '🍺' },
  { id: 'handsaw', label: '手锯', icon: '🔪' },
  { id: 'cigarettes', label: '香烟', icon: '🚬' },
  { id: 'handcuffs', label: '手铐', icon: '🔗' },
  { id: 'inverter', label: '逆转器', icon: '🔄' },
  { id: 'burner_phone', label: '手机', icon: '📱' },
  { id: 'expired_medicine', label: '过期药', icon: '💊' },
  { id: 'adrenaline', label: '肾上腺素', icon: '💉' },
];

export function ActionPanel() {
  const store = useGameStore();
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [phoneIdx, setPhoneIdx] = useState(1);
  const [phoneResult, setPhoneResult] = useState<'LIVE' | 'BLANK'>('LIVE');
  const [showMedicineModal, setShowMedicineModal] = useState(false);
  const [showBeerModal, setShowBeerModal] = useState(false);
  const [showMagModal, setShowMagModal] = useState(false);
  const [showAdrenalineModal, setShowAdrenalineModal] = useState(false);

  const handleFire = (target: 'player' | 'dealer', result: 'LIVE' | 'BLANK', shooter: 'player' | 'dealer') => {
    store.fire(target, result, shooter);
  };

  const handleUseItem = (item: Item) => {
    if (!store.inventory.includes(item)) return;

    if (item === 'magnifying_glass') {
      setShowMagModal(true);
      return; // Handled in modal
    } else if (item === 'beer') {
      setShowBeerModal(true);
      return; // Handled in modal
    } else if (item === 'handsaw') {
      store.useHandsaw();
    } else if (item === 'cigarettes') {
      store.useCigarettes();
    } else if (item === 'handcuffs') {
      store.useHandcuffs();
    } else if (item === 'inverter') {
      store.useInverter();
    } else if (item === 'burner_phone') {
      setShowPhoneModal(true);
      return; // Handled in modal
    } else if (item === 'expired_medicine') {
      setShowMedicineModal(true);
      return; // Handled in modal
    } else if (item === 'adrenaline') {
      setShowAdrenalineModal(true);
      return; // Handled in modal
    }
    
    // Actually using items means removing from inventory
    store.removeItem(item);
  };

  const submitPhone = () => {
    store.useBurnerPhone(phoneIdx, phoneResult);
    store.removeItem('burner_phone');
    setShowPhoneModal(false);
  };

  const submitMedicine = (success: boolean) => {
     store.useExpiredMedicine(success);
     store.removeItem('expired_medicine');
     setShowMedicineModal(false);
  };

  const submitBeer = (result: 'LIVE' | 'BLANK') => {
    store.useBeer(result);
    store.removeItem('beer');
    setShowBeerModal(false);
  }

  const submitMag = (result: 'LIVE' | 'BLANK') => {
    store.useMagnifyingGlass(result);
    store.removeItem('magnifying_glass');
    setShowMagModal(false);
  };

  const submitAdrenaline = () => {
    store.removeItem('adrenaline');
    setShowAdrenalineModal(false);
  };

  return (
    <div className="flex flex-col gap-6 h-full font-mono">
       
      {/* Inventory Control */}
      <div className="bg-brand-panel/20 border border-brand-green/20 p-4 rounded-sm flex-1">
         <h3 className="text-brand-green flex items-center gap-2 mb-4 text-xs tracking-widest uppercase border-b border-brand-panel pb-2">
            <BoxSelect size={14} /> INVENTORY (背包管理)
         </h3>
         
         <div className="grid grid-cols-3 gap-2">
            {ITEMS.map((item) => {
               const count = store.inventory.filter(i => i === item.id).length;
               return (
                  <div key={item.id} className="flex flex-col border border-brand-panel p-2 rounded-sm bg-brand-bg relative group">
                     {count > 0 && <span className="absolute top-1 right-1 text-[10px] bg-brand-green text-brand-bg px-1 rounded-sm">{count}</span>}
                     <div className="text-center text-xl mb-1">{item.icon}</div>
                     <div className="text-[10px] text-center text-brand-gray/60">{item.label}</div>
                     
                     <div className="mt-2 flex gap-1 justify-center">
                        <button 
                          onClick={() => store.addItem(item.id)}
                          className="text-[10px] bg-brand-green/20 hover:bg-brand-green/40 text-brand-green px-2 py-1 rounded-sm transition-colors"
                        >+ GET</button>
                        <button 
                          onClick={() => handleUseItem(item.id)}
                          disabled={count === 0}
                          className="text-[10px] bg-brand-red/20 hover:bg-brand-red/40 text-brand-red px-2 py-1 rounded-sm transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >USE</button>
                     </div>
                  </div>
               )
            })}
         </div>

         {/* Status Indicators */}
         <div className="mt-4 flex gap-2">
           {store.isSawed && <div className="text-xs bg-brand-red/20 text-brand-red px-2 py-1 border border-brand-red inline-block animate-pulse">SAWED (伤害x2)</div>}
           {store.isHandcuffed && <div className="text-xs bg-brand-gray/20 text-brand-gray px-2 py-1 border border-brand-gray inline-block">DEALER HANDCUFFED</div>}
         </div>
      </div>

      {/* Action Resolutions */}
      <div className="bg-brand-red/5 border border-brand-red/20 p-4 rounded-sm">
         <h3 className="text-brand-red flex items-center gap-2 mb-4 text-xs tracking-widest uppercase border-b border-brand-red/20 pb-2">
            <Swords size={14} /> ACTION RESOLUTION (开火结算)
         </h3>
         
         <div className="space-y-4">
            <div className="flex flex-col gap-2">
               <span className="text-[10px] text-brand-gray tracking-widest uppercase">PLAYER SHOOTS (你开枪)</span>
               <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1">
                     <span className="text-[10px] text-brand-amber text-center bg-brand-bg py-1 border border-brand-amber/30">AT SELF</span>
                     <div className="flex gap-1">
                        <button onClick={() => handleFire('player', 'LIVE', 'player')} className="flex-1 bg-brand-red/20 hover:bg-brand-red/40 border border-brand-red text-brand-red text-[10px] py-2 tracking-widest">LIVE</button>
                        <button onClick={() => handleFire('player', 'BLANK', 'player')} className="flex-1 bg-brand-gray/20 hover:bg-brand-gray/40 border border-brand-gray text-brand-gray text-[10px] py-2 tracking-widest">BLANK</button>
                     </div>
                  </div>
                  <div className="flex flex-col gap-1">
                     <span className="text-[10px] text-brand-green text-center bg-brand-bg py-1 border border-brand-green/30">AT DEALER</span>
                     <div className="flex gap-1">
                        <button onClick={() => handleFire('dealer', 'LIVE', 'player')} className="flex-1 bg-brand-red/20 hover:bg-brand-red/40 border border-brand-red text-brand-red text-[10px] py-2 tracking-widest">LIVE</button>
                        <button onClick={() => handleFire('dealer', 'BLANK', 'player')} className="flex-1 bg-brand-gray/20 hover:bg-brand-gray/40 border border-brand-gray text-brand-gray text-[10px] py-2 tracking-widest">BLANK</button>
                     </div>
                  </div>
               </div>
            </div>

            <div className="flex flex-col gap-2 pt-2 border-t border-brand-red/10">
               <span className="text-[10px] text-brand-red/80 tracking-widest uppercase">DEALER SHOOTS (庄家开枪)</span>
               <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1">
                     <span className="text-[10px] text-brand-amber text-center bg-brand-bg py-1 border border-brand-amber/30">AT PLAYER</span>
                     <div className="flex gap-1">
                        <button onClick={() => handleFire('player', 'LIVE', 'dealer')} className="flex-1 bg-brand-red/10 hover:bg-brand-red/30 border border-brand-red/50 text-brand-red text-[10px] py-2 tracking-widest">LIVE</button>
                        <button onClick={() => handleFire('player', 'BLANK', 'dealer')} className="flex-1 bg-brand-gray/10 hover:bg-brand-gray/30 border border-brand-gray/50 text-brand-gray text-[10px] py-2 tracking-widest">BLANK</button>
                     </div>
                  </div>
                  <div className="flex flex-col gap-1">
                     <span className="text-[10px] text-brand-green text-center bg-brand-bg py-1 border border-brand-green/30">AT HIMSELF</span>
                     <div className="flex gap-1">
                        <button onClick={() => handleFire('dealer', 'LIVE', 'dealer')} className="flex-1 bg-brand-red/10 hover:bg-brand-red/30 border border-brand-red/50 text-brand-red text-[10px] py-2 tracking-widest">LIVE</button>
                        <button onClick={() => handleFire('dealer', 'BLANK', 'dealer')} className="flex-1 bg-brand-gray/10 hover:bg-brand-gray/30 border border-brand-gray/50 text-brand-gray text-[10px] py-2 tracking-widest">BLANK</button>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* Modals */}
      {showPhoneModal && (
        <div className="fixed inset-0 bg-brand-bg/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-brand-panel border border-brand-green p-6 shadow-[0_0_20px_rgba(34,197,94,0.2)] flex flex-col gap-4 max-w-sm w-full mx-4">
            <h4 className="text-brand-green font-bold text-lg flex items-center gap-2 border-b border-brand-green/20 pb-2"><HelpCircle size={18} /> PHONE INTERCEPT</h4>
            
            <label className="text-xs text-brand-gray tracking-widest uppercase">预知第几发？ (位置)</label>
            <input type="number" min={1} max={store.totalLive + store.totalBlank} value={phoneIdx} onChange={e => setPhoneIdx(parseInt(e.target.value))} className="bg-brand-bg border border-brand-gray p-2 text-brand-gray font-mono outline-none" />
            
            <label className="text-xs text-brand-gray tracking-widest uppercase mt-2">结果是？</label>
            <select value={phoneResult} onChange={e => setPhoneResult(e.target.value as 'LIVE' | 'BLANK')} className="bg-brand-bg border border-brand-gray p-2 text-brand-gray font-mono outline-none">
               <option value="LIVE">🔴 实弹 (LIVE)</option>
               <option value="BLANK">⚪ 空弹 (BLANK)</option>
            </select>

            <div className="flex gap-2 mt-4">
              <button onClick={submitPhone} className="flex-1 bg-brand-green/20 hover:bg-brand-green text-brand-green hover:text-brand-bg border border-brand-green py-2 transition-colors">CONFIRM</button>
              <button onClick={() => setShowPhoneModal(false)} className="flex-1 bg-brand-gray/10 hover:bg-brand-gray/30 border border-brand-gray text-brand-gray py-2 transition-colors">CANCEL</button>
            </div>
          </div>
        </div>
      )}

      {showMedicineModal && (
        <div className="fixed inset-0 bg-brand-bg/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-brand-panel border border-brand-amber p-6 shadow-[0_0_20px_rgba(245,158,11,0.2)] flex flex-col gap-4 max-w-sm w-full mx-4">
            <h4 className="text-brand-amber font-bold text-lg flex items-center gap-2 border-b border-brand-amber/20 pb-2"><HelpCircle size={18} /> EXPIRED MEDICINE</h4>
            
            <p className="text-sm text-brand-gray font-mono leading-relaxed">你吃下了过期药。成功恢复2点血，还是损失了1点血？</p>

            <div className="flex gap-2 mt-4">
              <button onClick={() => submitMedicine(true)} className="flex-1 bg-brand-green/20 hover:bg-brand-green text-brand-green hover:text-brand-bg border border-brand-green py-2 transition-colors text-xs">SUCCESS (+2)</button>
              <button onClick={() => submitMedicine(false)} className="flex-1 bg-brand-red/20 hover:bg-brand-red text-brand-red hover:text-brand-bg border border-brand-red py-2 transition-colors text-xs">FAIL (-1)</button>
            </div>
            <button onClick={() => setShowMedicineModal(false)} className="mt-2 w-full bg-brand-gray/10 hover:bg-brand-gray/30 border border-brand-gray text-brand-gray py-2 transition-colors text-xs">CANCEL</button>
          </div>
        </div>
      )}

      {showBeerModal && (
        <div className="fixed inset-0 bg-brand-bg/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-brand-panel border border-brand-amber p-6 shadow-[0_0_20px_rgba(245,158,11,0.2)] flex flex-col gap-4 max-w-sm w-full mx-4">
            <h4 className="text-brand-amber font-bold text-lg flex items-center gap-2 border-b border-brand-amber/20 pb-2"><HelpCircle size={18} /> DRINK BEER</h4>
            
            <p className="text-sm text-brand-gray font-mono leading-relaxed">退出来的是什么子弹？</p>

            <div className="flex gap-2 mt-4">
              <button onClick={() => submitBeer('LIVE')} className="flex-1 bg-brand-red/20 hover:bg-brand-red text-brand-red hover:text-brand-bg border border-brand-red py-2 transition-colors tracking-widest font-bold text-xs">🔴 LIVE</button>
              <button onClick={() => submitBeer('BLANK')} className="flex-1 bg-brand-gray/20 hover:bg-brand-gray text-brand-gray hover:text-brand-bg border border-brand-gray py-2 transition-colors tracking-widest font-bold text-xs">⚪ BLANK</button>
            </div>
            <button onClick={() => setShowBeerModal(false)} className="mt-2 w-full bg-brand-gray/10 hover:bg-brand-gray/30 border border-brand-gray text-brand-gray py-2 transition-colors tracking-widest text-xs">CANCEL</button>
          </div>
        </div>
      )}

      {showMagModal && (
        <div className="fixed inset-0 bg-brand-bg/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-brand-panel border border-brand-green p-6 shadow-[0_0_20px_rgba(34,197,94,0.2)] flex flex-col gap-4 max-w-sm w-full mx-4">
            <h4 className="text-brand-green font-bold text-lg flex items-center gap-2 border-b border-brand-green/20 pb-2"><HelpCircle size={18} /> MAGNIFYING GLASS</h4>
            
            <p className="text-sm text-brand-gray font-mono leading-relaxed">放大镜看到的是什么子弹？</p>

            <div className="flex gap-2 mt-4">
              <button onClick={() => submitMag('LIVE')} className="flex-1 bg-brand-red/20 hover:bg-brand-red text-brand-red hover:text-brand-bg border border-brand-red py-2 transition-colors tracking-widest font-bold text-xs">🔴 LIVE</button>
              <button onClick={() => submitMag('BLANK')} className="flex-1 bg-brand-gray/20 hover:bg-brand-gray text-brand-gray hover:text-brand-bg border border-brand-gray py-2 transition-colors tracking-widest font-bold text-xs">⚪ BLANK</button>
            </div>
            <button onClick={() => setShowMagModal(false)} className="mt-2 w-full bg-brand-gray/10 hover:bg-brand-gray/30 border border-brand-gray text-brand-gray py-2 transition-colors tracking-widest text-xs">CANCEL</button>
          </div>
        </div>
      )}

      {showAdrenalineModal && (
        <div className="fixed inset-0 bg-brand-bg/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-brand-panel border border-brand-green p-6 shadow-[0_0_20px_rgba(34,197,94,0.2)] flex flex-col gap-4 max-w-sm w-full mx-4">
            <h4 className="text-brand-green font-bold text-lg flex items-center gap-2 border-b border-brand-green/20 pb-2"><HelpCircle size={18} /> ADRENALINE</h4>
            
            <p className="text-sm text-brand-gray font-mono leading-relaxed">已使用肾上腺素！</p>
            <p className="text-xs text-brand-gray/70 font-mono leading-relaxed">请直接在下方背包中手动点击【+ GET】添加你偷到的道具并使用。</p>

            <button onClick={submitAdrenaline} className="mt-4 w-full bg-brand-green/20 hover:bg-brand-green text-brand-green hover:text-brand-bg border border-brand-green py-2 transition-colors tracking-widest text-xs font-bold">ACKNOWLEDGE (确认)</button>
          </div>
        </div>
      )}

    </div>
  );
}