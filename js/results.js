import { CLASSES } from './classes.js';
import { EMOTIONS, OBSTACLE_OPTIONS, STRENGTH_OPTIONS } from './questions.js';

const optionLabel = (options, id) => options.find(([key]) => key === id)?.[1] || id;
const emotionLabel = (id) => EMOTIONS.find((item) => item.id === id)?.label || id;
const classLabel = (id) => CLASSES.find((item) => item.id === id)?.name || id;
const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));
const hairShapes = {
  short: [[8, 5, 17, 4], [7, 8, 4, 7], [10, 8, 13, 2], [22, 8, 4, 5], [11, 4, 11, 2]],
  messy: [[8, 5, 17, 5], [7, 8, 4, 7], [22, 8, 4, 5], [10, 3, 5, 4], [17, 4, 5, 3], [23, 3, 2, 5], [6, 6, 3, 3], [12, 9, 11, 2]],
  long: [[8, 5, 17, 5], [7, 8, 4, 16], [23, 8, 4, 16], [11, 8, 12, 2], [9, 21, 4, 5], [23, 21, 3, 5]],
  ponytail: [[8, 5, 17, 5], [7, 8, 4, 8], [22, 8, 4, 6], [3, 10, 5, 5], [2, 13, 3, 10], [11, 8, 12, 2]],
  bald: []
};

function characterSvg(appearance) {
  const hair = (hairShapes[appearance.hairType] || hairShapes.short).map(([x, y, width, height]) => `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${appearance.hairColor}" />`).join('');
  const glasses = appearance.glasses ? '<g fill="none" stroke="#242025" stroke-width="1"><rect x="11" y="12" width="6" height="4"/><rect x="19" y="12" width="6" height="4"/><rect x="17" y="13" width="2" height="1" fill="#242025"/></g>' : '';
  return `<svg viewBox="0 0 32 36" role="img" aria-label="Personaje Pixel Art" style="width:180px;height:210px;image-rendering:pixelated;shape-rendering:crispEdges"><ellipse cx="16" cy="33" rx="10" ry="1.5" fill="#bbb"/><g fill="${appearance.pantsColor}"><rect x="10" y="27" width="5" height="5"/><rect x="18" y="27" width="5" height="5"/></g><g fill="${appearance.shirtColor}"><rect x="9" y="19" width="15" height="10"/><rect x="8" y="21" width="3" height="6"/><rect x="23" y="21" width="3" height="6"/></g><g fill="${appearance.skin}"><rect x="15" y="17" width="5" height="5"/><rect x="8" y="25" width="3" height="3"/><rect x="24" y="25" width="3" height="3"/><path d="M9 8H24V19H9Z"/></g><rect x="14" y="13" width="2" height="3" fill="#242025"/><rect x="20" y="13" width="2" height="3" fill="#242025"/>${glasses}<g>${hair}</g><rect x="12" y="24" width="10" height="2" fill="#17151c" opacity=".35"/></svg>`;
}

export function buildResult(state) {
  return {
    schema: 'sprint-quest-result',
    version: 1,
    exportedAt: new Date().toISOString(),
    player: {
      name: state.player.name,
      avatar: state.player.avatar,
      avatarName: 'Pixel Art personalizado',
      appearance: state.player.appearance,
      classId: state.player.classId,
      className: classLabel(state.player.classId)
    },
    emotion: state.emotion,
    emotionLabel: emotionLabel(state.emotion),
    followups: state.followups,
    obstacles: state.obstacles,
    obstacleLabels: state.obstacles.map((id) => optionLabel(OBSTACLE_OPTIONS, id)),
    obstacleNote: state.obstacleNote,
    strengths: state.strengths,
    strengthLabels: state.strengths.map((id) => optionLabel(STRENGTH_OPTIONS, id)),
    strengthNote: state.strengthNote,
    powerups: state.powerups,
    combat: { victory: state.combat.victory, bossHp: state.combat.bossHp, answers: state.combat.answered },
    upgrade: state.upgrade,
    stats: state.player.stats,
    xp: state.player.xp
  };
}

export function downloadJson(state) {
  const result = buildResult(state);
  const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `sprint-quest-${state.player.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'resultado'}.json`;
  link.click();
  URL.revokeObjectURL(link.href);
}

export function aggregateResults(results) {
  const countKeys = (key) => results
    .flatMap((result) => result[key] || [])
    .reduce((map, value) => ({ ...map, [value]: (map[value] || 0) + 1 }), {});

  return {
    count: results.length,
    emotions: results.map((result) => result.emotionLabel || emotionLabel(result.emotion)).filter(Boolean),
    obstacles: countKeys('obstacleLabels'),
    strengths: countKeys('strengthLabels'),
    upgrades: results.map((result) => result.upgrade?.branch).filter(Boolean),
    actions: results.map((result) => result.upgrade?.action).filter(Boolean)
  };
}

export function printableSummary(state) {
  const result = buildResult(state);
  const obstacleText = result.obstacleLabels.length ? result.obstacleLabels.join(', ') : 'Ninguno señalado';
  const strengthText = result.strengthLabels.length ? result.strengthLabels.join(', ') : 'Por descubrir';
  const html = `<!doctype html><html lang="es"><head><meta charset="UTF-8"><title>Sprint Quest · ${escapeHtml(result.player.name)}</title><style>body{font:16px system-ui;max-width:760px;margin:40px auto;color:#172033}h1{color:#eb5e55;border-bottom:4px solid #ffd166;padding-bottom:12px}section{border:1px solid #d8dde8;padding:18px;margin:16px 0;border-radius:12px}.character{background:#172033;color:white;display:flex;align-items:center;gap:24px}.character h2{margin:0 0 8px}dt{font-weight:700;margin-top:10px}dd{margin:3px 0}</style></head><body><h1>SPRINT COMPLETED</h1><section class="character">${characterSvg(result.player.appearance)}<div><h2>${escapeHtml(result.player.name)}</h2><p>Clase: ${escapeHtml(result.player.className)}</p></div></section><section><dl><dt>Resultado</dt><dd>${result.combat.victory ? 'Victoria reflexiva' : 'Continuará: jefe pendiente'}</dd><dt>Vida restante</dt><dd>${state.player.hp} / ${state.combat.playerMaxHp || 100} HP</dd><dt>XP</dt><dd>${result.xp}</dd><dt>Estado emocional</dt><dd>${escapeHtml(result.emotionLabel || 'Sin registrar')}</dd><dt>Obstáculos</dt><dd>${escapeHtml(obstacleText)}</dd><dt>Fortalezas</dt><dd>${escapeHtml(strengthText)}</dd><dt>Mejora prioritaria</dt><dd>${escapeHtml(result.upgrade?.skill || 'Sin seleccionar')}</dd><dt>Misión</dt><dd>${escapeHtml(result.upgrade?.action || 'Sin definir')}</dd></dl></section><script>window.print()<\/script></body></html>`;
  const blob = new Blob([html], { type: 'text/html' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `sprint-quest-${result.player.name || 'resumen'}.html`;
  link.click();
  URL.revokeObjectURL(link.href);
}
