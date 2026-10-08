export const BOSSES = [
  { id: 'dragon', icon: '🐉', name: 'Dragón del Alcance', problem: 'Cambios de alcance inesperados', special: 'Scope Shift', maxHp: 22 },
  { id: 'bugzilla', icon: '🐛', name: 'Bugzilla', problem: 'Errores en frontend', special: 'Pantalla Blanca', maxHp: 18 },
  { id: 'chronophage', icon: '⏳', name: 'Cronófago', problem: 'Desajuste de tiempos y estimaciones', special: 'Deadline Rush', maxHp: 20 },
  { id: 'meeting-zombie', icon: '🧟', name: 'Meeting Zombie', problem: 'Exceso de reuniones', special: 'Reunión Infinita', maxHp: 19 },
  { id: 'dependency-ghost', icon: '👻', name: 'Fantasma de las Dependencias', problem: 'Bloqueos con otros equipos', special: 'Esperando Respuesta', maxHp: 21 },
  { id: 'qa-scorpion', icon: '🦂', name: 'Escorpión de QA', problem: 'Errores detectados tarde', special: 'Bug de Última Hora', maxHp: 17 },
  { id: 'communication-troll', icon: '🧌', name: 'Troll de Comunicación', problem: 'Malentendidos en el equipo', special: 'Mensaje Perdido', maxHp: 18 },
  { id: 'octopus', icon: '🐙', name: 'Pulpo Multitarea', problem: 'Demasiadas tareas simultáneas', special: 'Ocho Tentáculos', maxHp: 20 },
  { id: 'deploy-demon', icon: '🔥', name: 'Demonio del Deploy', problem: 'Problemas en despliegues', special: 'Rollback Infernal', maxHp: 23 },
  { id: 'block-golem', icon: '🧊', name: 'Gólem de Bloqueos', problem: 'Impedimentos sin resolver', special: 'Muro de Piedra', maxHp: 25 },
  { id: 'energy-vampire', icon: '🦇', name: 'Vampiro de Energía', problem: 'Cansancio y sobrecarga', special: 'Burnout Bite', maxHp: 18 }
];

const ROLE_MATCHUPS = {
  dragon: { favorable: ['sm', 'rem'], unfavorable: ['po', 'dev'] },
  bugzilla: { favorable: ['dev'], unfavorable: ['po', 'support'] },
  chronophage: { favorable: ['rem'], unfavorable: ['po', 'support'] },
  'meeting-zombie': { favorable: ['sm'], unfavorable: ['dev', 'rem'] },
  'dependency-ghost': { favorable: ['rem', 'po', 'sm'], unfavorable: ['dev', 'support'] },
  'qa-scorpion': { favorable: ['dev', 'rem'], unfavorable: ['po', 'support'] },
  'communication-troll': { favorable: ['sm', 'support'], unfavorable: ['dev', 'rem'] },
  octopus: { favorable: ['rem'], unfavorable: ['dev', 'support'] },
  'deploy-demon': { favorable: ['dev'], unfavorable: ['po', 'support'] },
  'block-golem': { favorable: ['sm', 'rem'], unfavorable: ['dev', 'po'] },
  'energy-vampire': { favorable: ['support'], unfavorable: ['dev', 'rem'] }
};

function roleMatchup(boss, classId) {
  const matchup = ROLE_MATCHUPS[boss.id] || { favorable: [], unfavorable: [] };
  if (matchup.favorable.includes(classId)) return 'favorable';
  if (matchup.unfavorable.includes(classId)) return 'unfavorable';
  return 'neutral';
}

export function getBoss(state) {
  return BOSSES.find((boss) => boss.id === state.combat.bossId) || BOSSES[0];
}

export function startCombat(state) {
  const boss = BOSSES[Math.floor(Math.random() * BOSSES.length)];
  const parsedEnergy = Number.parseInt(state.followups.energy, 10);
  const energyPercent = Number.isNaN(parsedEnergy) ? state.player.stats.energy : parsedEnergy;
  const motivationBuff = { 'Muy motivado': 20, Motivado: 12, Variable: 5, Desconectado: 0 }[state.followups.motivation] || 0;
  state.combat.bossId = boss.id;
  state.combat.bossHp = boss.maxHp;
  state.combat.bossMaxHp = boss.maxHp;
  state.combat.initialEnergy = energyPercent;
  state.combat.energyBuff = motivationBuff;
  const emergencyHealth = energyPercent === 0 && motivationBuff === 0;
  state.combat.playerMaxHp = emergencyHealth ? 1 : Math.min(120, energyPercent + motivationBuff);
  state.combat.lowLifeWarning = emergencyHealth;
  state.combat.lowLifeWarningDismissed = false;
  state.player.hp = state.combat.playerMaxHp;
  state.combat.actionMessage = `${boss.icon} ${boss.name} aparece: ${boss.problem}.`;
  return boss;
}

export function bossName(obstacles, obstacleMap) {
  const key = obstacles[0] || 'none';
  return obstacleMap[key]?.[0] || 'Sprint Shadow';
}

export function bossSubtitle(obstacles, obstacleMap) {
  const key = obstacles[0] || 'none';
  return obstacleMap[key]?.[1] || 'Lo que quedó sin nombrar';
}

export function resolveAttack(answer, state, classId) {
  const boss = getBoss(state);
  if (state.combat.skipTurn) {
    state.combat.skipTurn = false;
    state.combat.actionMessage = `⏸ ${state.player.name} pierde el turno por ${boss.special}.`;
    return { damage: 0, meaningful: false, skipped: true, message: state.combat.actionMessage };
  }
  const meaningful = answer.trim().length > 0;
  const matchup = roleMatchup(boss, classId);
  const roleBonus = classId === 'dev' || classId === 'po' ? 1 : 0;
  const matchupBonus = matchup === 'favorable' ? 2 : matchup === 'unfavorable' ? -1 : 0;
  const damage = Math.max(1, (meaningful ? 4 : 2) + roleBonus + matchupBonus);
  state.combat.bossHp = Math.max(0, state.combat.bossHp - damage);
  state.player.xp += meaningful ? 12 : 7;
  state.player.stats.clarity = Math.min(100, state.player.stats.clarity + (meaningful ? 3 : 1));
  const matchupMessage = matchup === 'favorable' ? ' Ventaja de clase.' : matchup === 'unfavorable' ? ' Desventaja de clase.' : '';
  state.combat.actionMessage = `⚔ ${state.player.name} ataca a ${boss.name}: -${damage} HP.${matchupMessage}`;
  return { damage, meaningful, message: state.combat.actionMessage };
}

export function bossTurn(state, classId) {
  const boss = getBoss(state);
  if (state.combat.bossHp <= 0) return { damage: 0, message: `${boss.icon} ${boss.name} ha caído.` };
  if (state.combat.specialUsed === 'shield') {
    state.combat.specialUsed = false;
    return { damage: 0, blocked: true, message: `🛡 Escudo Anti-Reuniones bloquea ${boss.special}.` };
  }

  let damage = Math.floor(Math.random() * 7) + 4;
  const specialAttack = Math.random() < 0.6;
  let message = specialAttack
    ? `${boss.icon} ${boss.name} usa ${boss.special}.`
    : `${boss.icon} ${boss.name} lanza un ataque básico de ${damage} daño.`;
  const support = classId === 'support';
  const scrum = classId === 'sm';
  const rem = classId === 'rem';
  const matchup = roleMatchup(boss, classId);

  if (scrum) damage = Math.max(0, damage - 2);

  if (!specialAttack) {
    state.combat.actionMessage = message;
  } else if (boss.id === 'bugzilla' || boss.id === 'dependency-ghost') {
    state.combat.skipTurn = !rem;
    damage = rem ? 2 : 0;
    message += rem ? ' Visión del Futuro anticipa el bloqueo.' : ' El jugador pierde el próximo turno.';
  } else if (boss.id === 'chronophage') {
    state.player.stats.energy = Math.max(0, state.player.stats.energy - (support ? 5 : 12));
    message += ` Energía -${support ? 5 : 12}.`;
  } else if (boss.id === 'meeting-zombie') {
    state.player.xp = Math.max(0, state.player.xp - 5);
    state.player.stats.energy = Math.max(0, state.player.stats.energy - (support ? 4 : 8));
    message += ' Tiempo y XP robados.';
  } else if (boss.id === 'qa-scorpion') {
    damage = 12;
    message += ' Daño sorpresa.';
  } else if (boss.id === 'communication-troll') {
    state.player.stats.collaboration = Math.max(0, state.player.stats.collaboration - 10);
    message += ' Colaboración -10.';
  } else if (boss.id === 'octopus') {
    state.player.stats.clarity = Math.max(0, state.player.stats.clarity - 10);
    message += ' Claridad -10.';
  } else if (boss.id === 'deploy-demon') {
    state.combat.bossHp = Math.min(state.combat.bossMaxHp, state.combat.bossHp + 2);
    message += ' El jefe recupera 2 HP por el rollback.';
  } else if (boss.id === 'block-golem') {
    state.combat.defense = Math.min(3, (state.combat.defense || 0) + 1);
    message += ' Su defensa aumenta.';
  } else if (boss.id === 'energy-vampire') {
    state.player.stats.energy = Math.max(0, state.player.stats.energy - (support ? 7 : 15));
    message += ` Energía -${support ? 7 : 15}.`;
  }

  const healthRatio = state.combat.playerMaxHp ? state.player.hp / state.combat.playerMaxHp : 0;
  const emotionDamage = { excellent: -2, good: -1, regular: 0, bad: 2, 'very-bad': 4 }[state.emotion] || 0;
  if (healthRatio <= 0.35) message += ' La poca vida vuelve el golpe más peligroso.';
  if (healthRatio <= 0.2 && Math.random() < 0.25) {
    damage += 4;
    message += ' Golpe crítico por vulnerabilidad.';
  }
  if (matchup === 'favorable') {
    damage = Math.max(0, damage - 2);
    message += ' Tu clase resiste bien este boss.';
  } else if (matchup === 'unfavorable') {
    damage += 3;
    message += ' Este boss es especialmente fuerte contra tu clase.';
  }
  damage = Math.max(0, damage + emotionDamage);
  if (emotionDamage < 0) message += ' Tu buen estado reduce el impacto.';
  if (emotionDamage > 0) message += ' El estado emocional aumenta el impacto.';

  state.player.hp = Math.max(0, state.player.hp - Math.max(0, damage - (state.combat.defense || 0)));
  state.combat.defense = 0;
  state.combat.specialUsed = false;
  state.combat.actionMessage = message;
  return { damage, message, skipTurn: state.combat.skipTurn };
}

export function useSpecial(state, classId) {
  if (state.combat.specialUsed) return null;
  state.combat.specialUsed = classId === 'sm' ? 'shield' : classId === 'rem' ? 'forecast' : true;
  if (classId === 'dev') state.combat.bossHp = Math.max(0, state.combat.bossHp - 2);
  if (classId === 'po') state.combat.bossHp = Math.max(0, state.combat.bossHp - 3);
  if (classId === 'support') state.player.hp = Math.min(state.combat.playerMaxHp, state.player.hp + 18);
  state.combat.actionMessage = `✨ ${classId.toUpperCase()} activa su habilidad especial.`;
  return state.combat.specialUsed;
}

export function usePowerup(state, powerup) {
  if (!powerup || state.combat.usedPowerup) return 0;
  state.combat.usedPowerup = true;
  const damage = powerup.damage || 2;
  state.combat.bossHp = Math.max(0, state.combat.bossHp - damage);
  state.player.xp += 8;
  state.combat.actionMessage = `💫 ${powerup.name} inflige -${damage} HP.`;
  return damage;
}
