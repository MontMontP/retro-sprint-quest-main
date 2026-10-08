import { CHARACTER_DEFAULTS } from './classes.js';

const STORAGE_KEY = 'sprint-quest-rpg-v1';
export const freshState = () => ({ screen: 'home', player: { name: '', avatar: 'ember', classId: 'dev', appearance: { ...CHARACTER_DEFAULTS }, hp: 10, xp: 0, level: 1, stats: { energy: 50, clarity: 50, collaboration: 50, confidence: 50 } }, achievements: [], emotion: null, followups: {}, obstacles: [], obstacleNote: '', strengths: [], strengthNote: '', powerups: [], combat: { bossId: null, bossHp: 0, bossMaxHp: 0, playerMaxHp: 100, initialEnergy: 100, energyBuff: 0, lowLifeWarning: false, lowLifeWarningDismissed: false, questionIndex: 0, answered: {}, log: [], actionMessage: '', specialUsed: false, usedPowerup: false, skipTurn: false, defense: 0, victory: null }, upgrade: null, savedAt: null });
export function loadState() { return freshState(); }
export function saveState(state) { return { ...state, savedAt: null }; }
export function clearState() { }
export { STORAGE_KEY };
