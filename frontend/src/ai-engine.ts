import type { GameState, Item, Bullet } from './store';

export type AIAdvice = {
  tier: 'S' | 'A' | 'B' | 'C';
  message: string;
  action: string;
  dangerLevel: number; // 0-100
};

export function calculateProbabilities(state: GameState): { liveProb: number, blankProb: number, currentBullet: Bullet } {
  let { totalLive, totalBlank, knownSequence } = state;
  const currentBullet = knownSequence.length > 0 ? knownSequence[0] : 'UNKNOWN';

  if (totalLive + totalBlank === 0) return { liveProb: 0, blankProb: 0, currentBullet };

  if (currentBullet === 'LIVE') return { liveProb: 1, blankProb: 0, currentBullet };
  if (currentBullet === 'BLANK') return { liveProb: 0, blankProb: 1, currentBullet };

  // Calculate based on remaining unknown bullets
  let knownLive = 0;
  let knownBlank = 0;
  let invertedUnknowns = 0;

  for (let i = 1; i < knownSequence.length; i++) {
    if (knownSequence[i] === 'LIVE') knownLive++;
    if (knownSequence[i] === 'BLANK') knownBlank++;
    if (knownSequence[i] === 'INVERTED_UNKNOWN') invertedUnknowns++;
  }

  let unknownLivePool = Math.max(0, totalLive - knownLive);
  let unknownBlankPool = Math.max(0, totalBlank - knownBlank);
  let unknownTotal = unknownLivePool + unknownBlankPool;

  if (unknownTotal === 0) {
     return { liveProb: 0, blankProb: 0, currentBullet };
  }

  let liveProb = unknownLivePool / unknownTotal;

  if (currentBullet === 'INVERTED_UNKNOWN') {
    liveProb = 1 - liveProb; // Probability flips!
  }

  return { liveProb, blankProb: 1 - liveProb, currentBullet };
}

export function getAIAdvice(state: GameState): AIAdvice[] {
  const advices: AIAdvice[] = [];
  const { liveProb, currentBullet } = calculateProbabilities(state);
  const inventory = state.inventory;

  const hasItem = (item: Item) => inventory.includes(item);

  // Danger Level
  const dangerLevel = liveProb * 100;

  // S-Tier: Lethal / Guaranteed
  if (currentBullet === 'LIVE') {
    let damage = state.isSawed ? 2 : 1;
    if (hasItem('handsaw') && !state.isSawed) damage = 2;

    if (state.dealerHp <= damage) {
      advices.push({
        tier: 'S',
        message: `绝对斩杀线！${!state.isSawed && hasItem('handsaw') ? '使用【手锯】后' : ''}直接向庄家开火！`,
        action: 'SHOOT_DEALER',
        dangerLevel
      });
    } else {
      advices.push({
        tier: 'A',
        message: `确认为实弹！${!state.isSawed && hasItem('handsaw') ? '推荐使用【手锯】增加伤害，并' : ''}向庄家开火。`,
        action: 'SHOOT_DEALER',
        dangerLevel
      });
    }
  }

  if (currentBullet === 'BLANK') {
    if (hasItem('inverter')) {
       let damage = state.isSawed ? 2 : 1;
       if (hasItem('handsaw') && !state.isSawed) damage = 2;
       if (state.dealerHp <= damage) {
         advices.push({
           tier: 'S',
           message: `斩杀组合：使用【逆转器】将空弹转为实弹，${!state.isSawed && hasItem('handsaw') ? '使用【手锯】，' : ''}向庄家开火！`,
           action: 'INVERT_AND_SHOOT_DEALER',
           dangerLevel
         });
       } else {
         advices.push({
           tier: 'A',
           message: `确认为空弹。可以向自己开火获得额外回合，或者使用【逆转器】转为实弹打庄家。`,
           action: 'SHOOT_SELF_OR_INVERT',
           dangerLevel
         });
       }
    } else {
      advices.push({
        tier: 'A',
        message: `确认为空弹！向自己开火以获得额外回合。`,
        action: 'SHOOT_SELF',
        dangerLevel
      });
    }
  }

  // A-Tier: High Value Setup
  if (hasItem('cigarettes') && state.playerHp < state.maxPlayerHp) {
    advices.push({
      tier: 'A',
      message: `血量未满，优先使用【香烟】恢复1点生命值。`,
      action: 'USE_CIGARETTES',
      dangerLevel
    });
  }

  // B-Tier: Information & Control
  if (currentBullet === 'UNKNOWN' || currentBullet === 'INVERTED_UNKNOWN') {
    if (hasItem('magnifying_glass')) {
      advices.push({
        tier: 'B',
        message: `当前子弹未知，强烈建议使用【放大镜】查看当前子弹。`,
        action: 'USE_MAGNIFYING_GLASS',
        dangerLevel
      });
    } else if (hasItem('burner_phone')) {
      advices.push({
         tier: 'B',
         message: `缺乏信息，可以使用【手机】预知未来的子弹。`,
         action: 'USE_PHONE',
         dangerLevel
      });
    }

    if (liveProb > 0.6 && hasItem('beer')) {
      advices.push({
        tier: 'B',
        message: `实弹率较高（${Math.round(liveProb * 100)}%），如果不愿冒险或想逼出空弹，可使用【啤酒】退弹。`,
        action: 'USE_BEER',
        dangerLevel
      });
    }

    if (hasItem('adrenaline')) {
      advices.push({
        tier: 'B',
        message: `极度缺乏信息，可以使用【肾上腺素】偷取庄家的【放大镜】或【手机】。`,
        action: 'USE_ADRENALINE',
        dangerLevel
      });
    }
  }

  // C-Tier: Probabilistic Guess
  if (advices.filter(a => a.tier === 'S' || a.tier === 'A').length === 0 && (currentBullet === 'UNKNOWN' || currentBullet === 'INVERTED_UNKNOWN')) {
    if (liveProb >= 0.5) {
      advices.push({
        tier: 'C',
        message: `概率博弈：实弹率 ${Math.round(liveProb * 100)}%，建议向庄家开火。`,
        action: 'GUESS_SHOOT_DEALER',
        dangerLevel
      });
      if (hasItem('handcuffs') && !state.isHandcuffed) {
         advices.push({
            tier: 'C',
            message: `为了防范失败风险，可以先使用【手铐】限制庄家下一回合行动。`,
            action: 'USE_HANDCUFFS',
            dangerLevel
         });
      }
    } else {
      advices.push({
        tier: 'C',
        message: `概率博弈：实弹率仅 ${Math.round(liveProb * 100)}%，建议向自己开火（若为空弹可获额外回合）。`,
        action: 'GUESS_SHOOT_SELF',
        dangerLevel
      });
    }
  }

  // Sort by Tier S -> A -> B -> C
  const tierWeight = { 'S': 4, 'A': 3, 'B': 2, 'C': 1 };
  advices.sort((a, b) => tierWeight[b.tier] - tierWeight[a.tier]);

  return advices;
}
