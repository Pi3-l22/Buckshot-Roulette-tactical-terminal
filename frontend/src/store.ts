import { create } from 'zustand';

export type Bullet = 'LIVE' | 'BLANK' | 'UNKNOWN' | 'INVERTED_UNKNOWN';

export type Item = 'magnifying_glass' | 'cigarettes' | 'handcuffs' | 'beer' | 'handsaw' | 'inverter' | 'expired_medicine' | 'burner_phone' | 'adrenaline';

export interface GameState {
  playerHp: number;
  dealerHp: number;
  maxPlayerHp: number;
  maxDealerHp: number;

  totalLive: number;
  totalBlank: number;
  knownSequence: Bullet[];

  isSawed: boolean;
  isHandcuffed: boolean; // Is dealer handcuffed?

  inventory: Item[];
  addItem: (item: Item) => void;
  removeItem: (item: Item) => void;

  initRound: (live: number, blank: number, playerHp: number, dealerHp: number) => void;
  resetGame: () => void;
  updateHp: (player: number, dealer: number) => void;

  fire: (target: 'player' | 'dealer', result: 'LIVE' | 'BLANK', shooter: 'player' | 'dealer') => void;

  useMagnifyingGlass: (result: 'LIVE' | 'BLANK') => void;
  useBeer: (result: 'LIVE' | 'BLANK') => void;
  useInverter: () => void;
  useBurnerPhone: (index: number, result: 'LIVE' | 'BLANK') => void;
  useCigarettes: () => void;
  useHandsaw: () => void;
  useHandcuffs: () => void;
  useExpiredMedicine: (success: boolean) => void;
}

export const useGameStore = create<GameState>()((set) => ({
  playerHp: 4,
  dealerHp: 4,
  maxPlayerHp: 4,
  maxDealerHp: 4,

  totalLive: 0,
  totalBlank: 0,
  knownSequence: [],

  isSawed: false,
  isHandcuffed: false,

  inventory: [],
  addItem: (item) => set((state) => ({ inventory: [...state.inventory, item] })),
  removeItem: (item) => set((state) => {
    const idx = state.inventory.indexOf(item);
    if (idx === -1) return {};
    const newInv = [...state.inventory];
    newInv.splice(idx, 1);
    return { inventory: newInv };
  }),

  initRound: (live, blank, playerHp, dealerHp) => set((state) => ({
    totalLive: live,
    totalBlank: blank,
    playerHp,
    dealerHp,
    maxPlayerHp: Math.max(state.maxPlayerHp || 0, playerHp),
    maxDealerHp: Math.max(state.maxDealerHp || 0, dealerHp),
    knownSequence: Array(live + blank).fill('UNKNOWN'),
    isSawed: false,
    isHandcuffed: false,
  })),

  resetGame: () => set({
    totalLive: 0,
    totalBlank: 0,
    playerHp: 4,
    dealerHp: 4,
    maxPlayerHp: 4,
    maxDealerHp: 4,
    inventory: [],
    knownSequence: [],
    isSawed: false,
    isHandcuffed: false,
  }),

  updateHp: (playerHp, dealerHp) => set({ playerHp, dealerHp }),

  fire: (target, result) => set((state) => {
    let newPlayerHp = state.playerHp;
    let newDealerHp = state.dealerHp;

    if (result === 'LIVE') {
      const damage = state.isSawed ? 2 : 1;
      if (target === 'player') newPlayerHp = Math.max(0, newPlayerHp - damage);
      if (target === 'dealer') newDealerHp = Math.max(0, newDealerHp - damage);
    }

    const newKnownSequence = [...state.knownSequence];
    let popped: Bullet = 'UNKNOWN';
    if (newKnownSequence.length > 0) {
      popped = newKnownSequence.shift() || 'UNKNOWN';
    }

    let decLive = result === 'LIVE';
    let decBlank = result === 'BLANK';

    if (popped === 'INVERTED_UNKNOWN') {
      decLive = result === 'BLANK';
      decBlank = result === 'LIVE';
    }

    return {
      playerHp: newPlayerHp,
      dealerHp: newDealerHp,
      totalLive: decLive ? Math.max(0, state.totalLive - 1) : state.totalLive,
      totalBlank: decBlank ? Math.max(0, state.totalBlank - 1) : state.totalBlank,
      knownSequence: newKnownSequence,
      isSawed: false, // reset saw after any shot
    };
  }),

  useMagnifyingGlass: (result) => set((state) => {
    const newKnownSequence = [...state.knownSequence];
    if (newKnownSequence.length > 0) {
      // if it was INVERTED_UNKNOWN, and we see it's LIVE, we know it's a LIVE bullet *now*.
      // We should update totalLive/totalBlank?
      // Wait, if it was INVERTED_UNKNOWN and we see it is LIVE, then it WAS BLANK.
      // So we must decrement totalBlank, increment totalLive, and set to LIVE.
      if (newKnownSequence[0] === 'INVERTED_UNKNOWN') {
        newKnownSequence[0] = result;
        const wasLive = result === 'BLANK';
        const wasBlank = result === 'LIVE';
        return {
          knownSequence: newKnownSequence,
          totalLive: state.totalLive + (wasBlank ? 1 : -1),
          totalBlank: state.totalBlank + (wasLive ? 1 : -1),
        };
      }
      newKnownSequence[0] = result;
    }
    return { knownSequence: newKnownSequence };
  }),

  useBeer: (result) => set((state) => {
    const newKnownSequence = [...state.knownSequence];
    let popped: Bullet = 'UNKNOWN';
    if (newKnownSequence.length > 0) {
      popped = newKnownSequence.shift() || 'UNKNOWN';
    }

    let decLive = result === 'LIVE';
    let decBlank = result === 'BLANK';

    if (popped === 'INVERTED_UNKNOWN') {
      decLive = result === 'BLANK';
      decBlank = result === 'LIVE';
    }

    return {
      totalLive: decLive ? Math.max(0, state.totalLive - 1) : state.totalLive,
      totalBlank: decBlank ? Math.max(0, state.totalBlank - 1) : state.totalBlank,
      knownSequence: newKnownSequence,
      // isSawed stays true because beer just ejects
    };
  }),

  useInverter: () => set((state) => {
    const newKnownSequence = [...state.knownSequence];
    let newTotalLive = state.totalLive;
    let newTotalBlank = state.totalBlank;

    if (newKnownSequence.length > 0) {
      const current = newKnownSequence[0];
      if (current === 'LIVE') {
        newKnownSequence[0] = 'BLANK';
        newTotalLive = Math.max(0, newTotalLive - 1);
        newTotalBlank++;
      } else if (current === 'BLANK') {
        newKnownSequence[0] = 'LIVE';
        newTotalBlank = Math.max(0, newTotalBlank - 1);
        newTotalLive++;
      } else if (current === 'UNKNOWN') {
        newKnownSequence[0] = 'INVERTED_UNKNOWN';
      } else if (current === 'INVERTED_UNKNOWN') {
        newKnownSequence[0] = 'UNKNOWN';
      }
    }

    return { 
      knownSequence: newKnownSequence,
      totalLive: newTotalLive,
      totalBlank: newTotalBlank
    };
  }),

  useBurnerPhone: (index, result) => set((state) => {
    const newKnownSequence = [...state.knownSequence];
    // index is 1-based from the game perspective (e.g., "the 3rd bullet is LIVE")
    if (index - 1 < newKnownSequence.length) {
      newKnownSequence[index - 1] = result;
    }
    return { knownSequence: newKnownSequence };
  }),

  useCigarettes: () => set((state) => ({
    playerHp: Math.min(state.maxPlayerHp, state.playerHp + 1)
  })),

  useHandsaw: () => set({ isSawed: true }),
  
  useHandcuffs: () => set({ isHandcuffed: true }),

  useExpiredMedicine: (success) => set((state) => ({
    playerHp: success ? Math.min(state.maxPlayerHp, state.playerHp + 2) : Math.max(0, state.playerHp - 1)
  })),
}));
