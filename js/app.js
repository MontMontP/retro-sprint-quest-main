import {
  AVATARS,
  CLASSES,
  POWERUPS,
  OBSTACLES,
  CHARACTER_OPTIONS
} from './classes.js';
import {
  EMOTIONS,
  EMOTION_FOLLOWUPS,
  OBSTACLE_OPTIONS,
  STRENGTH_OPTIONS,
  BOSS_QUESTIONS,
  SKILL_TREE
} from './questions.js';
import { freshState, loadState, saveState, clearState } from './gameState.js';
import {
  bossName,
  bossSubtitle,
  getBoss,
  startCombat,
  resolveAttack,
  bossTurn,
  useSpecial,
  usePowerup
} from './combat.js';
import { downloadJson, printableSummary, aggregateResults } from './results.js';
import { renderPixelCharacter, refreshPixelCharacters } from './characterRenderer.js';
import { setSoundEnabled, playActionSound, playAchievementSound, playMusic, playDebugAudio } from './sound.js';

const app = document.querySelector('#app');
const soundToggle = document.querySelector('#sound-toggle');
let state = loadState();
let soundOn = true;
let emotionCharacterClicks = 0;
const earnedAchievements = new Set();
const achievementsCatalog = ['Taking Inventory', 'Who I am?', '125%', 'Zombie boy', 'Está vivo!', 'Blue baby'];

setSoundEnabled(soundOn);

const $ = (selector) => document.querySelector(selector);
const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
}[char]));
const avatar = () => AVATARS.find((item) => item.id === state.player.avatar) || AVATARS[0];
const playerClass = () => CLASSES.find((item) => item.id === state.player.classId) || CLASSES[0];
const appearance = () => state.player.appearance;
const emotionLabel = (id) => EMOTIONS.find((item) => item.id === id)?.label || id;
const obstacleLabel = (id) => OBSTACLE_OPTIONS.find(([key]) => key === id)?.[1] || id;

function persist() {
  state = saveState(state);
}

function toast(message) {
  const element = $('#toast');
  element.textContent = message;
  element.classList.add('show');
  setTimeout(() => element.classList.remove('show'), 2400);
}

function unlockAchievement(name) {
  if (earnedAchievements.has(name)) return;
  earnedAchievements.add(name);
  if (!state.achievements.includes(name)) state.achievements.push(name);
  playAchievementSound();
  toast(`🏆 Logro desbloqueado: ${name}`);
}

function checkEmotionAchievements() {
  if (state.emotion === 'excellent' && state.followups.energy === '100%' && state.followups.motivation === 'Muy motivado') unlockAchievement('125%');
  if (state.emotion === 'very-bad' && state.followups.energy === '0%' && state.followups.motivation === 'Desconectado') unlockAchievement('Zombie boy');
}

function navigate(screen) {
  state.screen = screen;
  persist();
  render();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function layout(content) {
  app.innerHTML = `<section class="screen">${content}</section>`;
  refreshPixelCharacters(app, appearance());
}

function progress(current) {
  return `<div class="progress-wrap">
    <div class="progress-label"><span>PROGRESO</span><span>${current} / 9</span></div>
    <div class="progress"><span style="width:${Math.round(current / 9 * 100)}%"></span></div>
  </div>`;
}

function choiceCards(items, selected, name, multi = false) {
  return `<div class="grid choice-grid">${items.map(([id, label, extra]) => `
    <button class="choice ${selected?.includes?.(id) || selected === id ? 'selected' : ''}"
      type="button" data-choice="${id}" data-choice-name="${name}" data-choice-multi="${multi}">
      <strong>${label}</strong>${extra ? `<small>${extra}</small>` : ''}
    </button>`).join('')}</div>`;
}

function characterSprite(size = 'normal', label = '') {
  return renderPixelCharacter(appearance(), escapeHtml(label), size);
}

function classBadge() {
  return `<span class="class-badge">${escapeHtml(playerClass().icon)}</span>`;
}

function bindNavigation() {
  document.querySelectorAll('[data-nav]').forEach((button) => {
    button.addEventListener('click', () => {
      playActionSound('select');
      navigate(button.dataset.nav);
    });
  });
}

function bindChoices() {
  document.querySelectorAll('[data-choice]').forEach((button) => {
    button.addEventListener('click', () => {
      const name = button.dataset.choiceName;
      const id = button.dataset.choice;
      if (button.dataset.choiceMulti === 'true') {
        state[name] = state[name].includes(id)
          ? state[name].filter((item) => item !== id)
          : [...state[name].filter((item) => item !== 'none'), id];
        if (state[name].includes('none')) state[name] = ['none'];
      } else {
        state[name] = id;
      }
      persist();
      button.classList.toggle('selected', state[name].includes?.(id) || state[name] === id);
    });
  });
}

function refreshCharacterSelection() {
  document.querySelectorAll('[data-avatar]').forEach((button) => {
    button.classList.toggle('selected', button.dataset.avatar === state.player.avatar);
  });
}

function refreshCharacterPreviews() {
  refreshPixelCharacters(document, appearance());
  document.querySelectorAll('[data-color-key]').forEach((button) => {
    button.classList.toggle('selected', button.dataset.colorValue === appearance()[button.dataset.colorKey]);
  });
}

function renderHome() {
  playMusic('start');
  layout(`<div class="hero">
    <div>
      <span class="eyebrow">RETROSPECTIVA: Cuentas Límitadas</span>
      <h1>Sprint Quest RPG</h1>
      <div class="panel">
        <label for="player-name"><strong>¿Elije el nombre que tendrás en esta aventura?</strong></label>
        <div class="form-row">
          <input class="text-input" id="player-name" maxlength="32" placeholder="Tu nombre o alias" value="${escapeHtml(state.player.name)}">
          <button class="primary-button" id="start-button" type="button">Comenzar aventura →</button>
        </div>
      </div>
    </div>
  </div>`);

  $('#start-button').addEventListener('click', () => {
    const name = $('#player-name').value.trim();
    if (!name) return toast('Escribe un nombre para comenzar.');
    state.player.name = name;
    playMusic('start');
    unlockAchievement('Taking Inventory');
    navigate('avatar');
  });
}

function renderAvatar() {
  const optionSelect = (key, label) => `<label class="builder-field"><span>${label}</span><select class="text-input" data-appearance="${key}">${CHARACTER_OPTIONS[key].map(([value, text]) => `<option value="${value}" ${appearance()[key] === value ? 'selected' : ''}>${text}</option>`).join('')}</select></label>`;
  const colorPicker = (key, label) => `<label class="builder-field"><span>${label}</span><input type="color" class="text-input" value="${appearance()[key]}" data-color-key="${key}"></label>`;

  layout(`<div id="character-creator" class="screen-head"><div>
    <span class="eyebrow">NIVEL 01 · IDENTIDAD</span><h2>Diseña tu aventurero Pixel Art</h2>
  </div>${progress(1)}</div>
  <div class="panel">
    <div class="character-builder">
      <div class="character-stage">${characterSprite('large', state.player.name || 'AVENTURERO')}</div>
      <div class="builder-fields">
        ${optionSelect('gender', 'Identidad')}
        ${optionSelect('hairType', 'Tipo de cabello')}
        ${colorPicker('hairColor', 'Color de cabello')}
        <label class="builder-field"><span>Gafas</span><select class="text-input" data-appearance="glasses"><option value="false" ${!appearance().glasses ? 'selected' : ''}>Sin gafas</option><option value="true" ${appearance().glasses ? 'selected' : ''}>Con gafas</option></select></label>
        ${colorPicker('skin', 'Color de piel')}
        ${colorPicker('shirtColor', 'Color de playera')}
        ${colorPicker('pantsColor', 'Color de pantalón')}
      </div>
    </div>
    <div class="actions"><button class="secondary-button" data-nav="home" type="button">← Atrás</button><button class="primary-button" data-nav="class" type="button">Elegir clase →</button></div>
  </div>`);

  document.querySelectorAll('[data-appearance]').forEach((field) => field.addEventListener('change', () => {
    const key = field.dataset.appearance;
    appearance()[key] = key === 'glasses' ? field.value === 'true' : field.value;
    persist();
    refreshCharacterPreviews();
  }));
  document.querySelectorAll('[data-color-key]').forEach((field) => field.addEventListener('input', () => {
    appearance()[field.dataset.colorKey] = field.value;
    persist();
    refreshCharacterPreviews();
  }));
  bindNavigation();
}

function renderClass() {
  const cards = CLASSES.map((item) => `<button class="choice class-choice ${state.player.classId === item.id ? 'selected' : ''}" data-class="${item.id}" type="button">
    <strong>${item.name}</strong>
    
    <small>${item.title}</small>
      
    <p><b>${item.skill}</b><br>${item.effect}</p>
  </button>`).join('');
  const chosen = playerClass();

  layout(`<div class="screen-head">
  <div><span class="eyebrow">NIVEL 02 · ESPECIALIDAD</span>
    <h2>Escoge tu clase</h2>
    <p>Todas parten con las mismas estadísticas. Elige la habilidad que quieras llevar a esta retrospectiva.</p>
  </div>${progress(2)}
</div>
<div class="panel">
  <div class="grid class-grid">${cards}</div>
  <div class="avatar-preview">${characterSprite('small', state.player.name)}<div>
       <strong>Especialidad:</strong> <span data-class-summary>${chosen.skill}</span><br><small class="muted">
        <strong>Debilidad:</strong> <span data-class-weakness>${chosen.weakness}</span></small></div>
  </div>
  <div class="actions"><button class="secondary-button" data-nav="avatar" type="button">← Atrás</button><button
      class="primary-button" data-nav="emotion" type="button">Entrar al bosque →</button></div>
  </div>`);

  document.querySelectorAll('[data-class]').forEach((button) => button.addEventListener('click', () => {
    state.player.classId = button.dataset.class;
    persist();
    document.querySelectorAll('[data-class]').forEach((item) => item.classList.toggle('selected', item.dataset.class === state.player.classId));
    const summary = document.querySelector('[data-class-summary]');
    if (summary) summary.textContent = playerClass().skill;
    const weakness = document.querySelector('[data-class-weakness]');
    if (weakness) weakness.textContent = playerClass().weakness;
  }));
  bindNavigation();
}

function renderEmotion() {
  emotionCharacterClicks = 0;
  layout(`<div class="screen-head">
  <div><span class="eyebrow">BOSQUE INICIAL · NIVEL 03</span>
    <h2>¿Cómo te sentiste?</h2>
    <p>Menciona como te sentiste al iniciar el sprint</p>
  </div>${progress(3)}
</div>
<div class="split">
  <div class="scene">
    <div class="emotion-character-area"><div class="speech-bubble" id="emotion-bubble" aria-live="polite">Selecciona cómo te sentiste</div><button class="emotion-character" id="emotion-character" type="button" aria-label="Interactuar con tu personaje">${characterSprite('small', state.player.name)}</button></div>
    <div><span class="eyebrow">${state.player.name.toUpperCase()}</span>
    </div>
  </div>
  <div class="panel">
    <div class="grid choice-grid">${EMOTIONS.map((item) => `<button
        class="choice ${state.emotion === item.id ? 'selected' : ''}" data-emotion="${item.id}"
        type="button"><strong>${item.label}</strong></button>`).join('')}</div>
    <div class="question-card">
    ${EMOTION_FOLLOWUPS.map((item) => `<label><strong>${item.label}</strong><select
          class="text-input" data-followup="${item.id}">
          <option value="">Selecciona</option>${item.options.map((option) => `<option
            ${state.followups[item.id]===option ? 'selected' : '' }>${option}</option>`).join('')}
        </select></label><br>`).join('')}
    </div>
    <div class="actions"><button class="secondary-button" data-nav="class" type="button">← Atrás</button><button
        class="primary-button" id="emotion-next" type="button">Atravesar el bosque →</button></div>
  </div>
</div>`);

  document.querySelectorAll('[data-emotion]').forEach((button) => button.addEventListener('click', () => {
    state.emotion = button.dataset.emotion;
    state.player.stats.energy = Math.max(20, 100 - EMOTIONS.findIndex((item) => item.id === state.emotion) * 15);
    persist();
    document.querySelectorAll('[data-emotion]').forEach((item) => item.classList.toggle('selected', item.dataset.emotion === state.emotion));
    const messages = { excellent: 'La trifuerza me acompaña', good: 'Todo va bien', regular: 'Al menos hay salud', bad: 'Odio los lunes', 'very-bad': 'Ando chipil, necesito apapachos' };
    $('#emotion-bubble').textContent = messages[state.emotion];
    checkEmotionAchievements();
  }));
  document.querySelectorAll('[data-followup]').forEach((select) => select.addEventListener('change', () => {
    state.followups[select.dataset.followup] = select.value;
    persist();
    checkEmotionAchievements();
  }));
  $('#emotion-character').addEventListener('click', () => {
    emotionCharacterClicks += 1;
    if (emotionCharacterClicks === 5) unlockAchievement('Who I am?');
  });
  $('#emotion-next').addEventListener('click', () => {
    if (!state.emotion) return toast('Elige cómo te sentiste para continuar.');
    const missingFollowup = EMOTION_FOLLOWUPS.find((item) => !state.followups[item.id]);
    if (missingFollowup) return toast(`Indica: ${missingFollowup.label.toLowerCase()}`);
    state.player.xp += 10;
    playActionSound('select');
    navigate('obstacles');
  });
  bindNavigation();
}

function renderObstacles() {
  layout(`<div class="screen-head"><div><span class="eyebrow">CUEVA DE ENEMIGOS · NIVEL 04</span><h2>Nombra los obstáculos</h2><p>Selecciona todo lo que haya dificultado tu trabajo.</p></div>${progress(4)}</div>
  <div class="panel"><h3>¿Qué fue lo que más dificultó tu trabajo?</h3>${choiceCards(OBSTACLE_OPTIONS, state.obstacles, 'obstacles', true)}
    
  <label for="obstacle-note"><strong>Contexto opcional</strong><textarea class="note-input" id="obstacle-note" maxlength="600" placeholder="¿Qué ocurrió?">${escapeHtml(state.obstacleNote)}</textarea></label>
    <div class="actions"><button class="secondary-button" data-nav="emotion" type="button">← Atrás</button><button class="primary-button" id="obstacles-next" type="button">Nombrar fortalezas →</button></div>
  </div>`);
  bindChoices();
  $('#obstacle-note').addEventListener('input', (event) => { state.obstacleNote = event.target.value; persist(); });
  $('#obstacles-next').addEventListener('click', () => {
    if (!state.obstacles.length) return toast('Elige “ningún obstáculo” si el sprint fue tranquilo.');
    state.player.xp += state.obstacles.includes('none') ? 7 : 12;
    playActionSound('select');
    navigate('strengths');
  });
  bindNavigation();
}

function renderStrengths() {
  layout(`<div class="screen-head"><div><span class="eyebrow">TEMPLO DEL TESORO · NIVEL 05</span><h2>Recoge lo que funcionó</h2><p>Las fortalezas no borran los problemas.</p></div>${progress(5)}</div>
  <div class="panel"><h3>¿Qué funcionó especialmente bien?</h3>${choiceCards(STRENGTH_OPTIONS, state.strengths, 'strengths', true)}
    <label for="strength-note"><strong>Un ejemplo opcional</strong><textarea class="note-input" id="strength-note" maxlength="600" placeholder="¿Qué te gustaría conservar?">${escapeHtml(state.strengthNote)}</textarea></label>
    <div class="actions"><button class="secondary-button" data-nav="obstacles" type="button">← Atrás</button><button class="primary-button" id="strengths-next" type="button">Preparar combate →</button></div>
  </div>`);
  bindChoices();
  $('#strength-note').addEventListener('input', (event) => { state.strengthNote = event.target.value; persist(); });
  $('#strengths-next').addEventListener('click', () => {
    if (!state.strengths.length) return toast('Elige al menos una fortaleza para desbloquear un recurso.');
    state.powerups = [...new Set(state.strengths)].map((id) => ({ id, ...POWERUPS[id] }));
    startCombat(state);
    state.player.xp += 10;
    playActionSound('select');
    navigate('combat');
  });
  bindNavigation();
}

function renderCombat() {
  const question = BOSS_QUESTIONS[Math.min(state.combat.questionIndex, BOSS_QUESTIONS.length - 1)];
  const boss = getBoss(state);
  const victory = state.combat.victory === true && state.combat.bossHp <= 0;
  const defeated = state.player.hp <= 0;
  const questionsFinished = state.combat.questionIndex >= BOSS_QUESTIONS.length;
  const spiritCombat = defeated && !questionsFinished && !victory;
  if (victory) unlockAchievement('Está vivo!');
  if (defeated && !spiritCombat && !victory) unlockAchievement('Blue baby');
  const lowLifeWarning = state.combat.lowLifeWarning && !state.combat.lowLifeWarningDismissed;
  const hpPercent = Math.round(state.combat.bossHp / state.combat.bossMaxHp * 100);
  const log = state.combat.log.at(-1) || 'El jefe espera tu siguiente movimiento.';
  const powerup = state.powerups.find((item) => !state.combat.usedPowerup);

  layout(`<div class="screen-head">
  <div><span class="eyebrow">CASTILLO DEL JEFE · NIVEL 06</span>
    <h2>${boss.icon} ${boss.name}</h2>
    <p>${boss.problem} · Ataque: ${boss.special}.</p>
  </div>${progress(6)}
</div>
  <div class="combat-arena">
    <div class="fighter">${defeated ? `<span class="fighter-icon">${spiritCombat ? '👻' : '🪦'}</span>` : characterSprite('small', state.player.name)}<div class="fighter-meta">${classBadge()}
      <strong>${spiritCombat ? 'Tu espíritu aún combate' : defeated ? '¡Has sido derrotado!' : escapeHtml(playerClass().name)}</strong></div>
      <div class="health-label"><span>HP</span><strong>${state.player.hp} / ${state.combat.playerMaxHp}</strong></div><div class="hp-bar player-health" role="progressbar" aria-label="Vida del jugador" aria-valuenow="${state.player.hp}" aria-valuemin="0" aria-valuemax="${state.combat.playerMaxHp}"><span style="width:${Math.max(0, state.player.hp / state.combat.playerMaxHp * 100)}%"></span></div><small>${state.player.hp} / ${state.combat.playerMaxHp} HP 
    <span>
    </br>
      ${state.player.xp} XP</small>
      </span>
  </div>
  <div class="fighter boss"><span class="fighter-icon">${victory ? '🪦' : boss.icon}</span><strong>${victory ? '¡Ganaste!' : boss.name}</strong>
    <div class="health-label"><span>HP</span><strong>${state.combat.bossHp} / ${state.combat.bossMaxHp}</strong></div><div class="hp-bar boss-health" role="progressbar" aria-label="Vida del enemigo" aria-valuenow="${state.combat.bossHp}" aria-valuemin="0" aria-valuemax="${state.combat.bossMaxHp}"><span style="width:${hpPercent}%"></span></div><small>${state.combat.bossHp} /
      ${state.combat.bossMaxHp} HP</small>
  </div>
  <div class="action-banner action-banner--active" aria-live="polite">${escapeHtml(state.combat.actionMessage || 'El combate comienza.')}</div>
</div>
${lowLifeWarning ? `<div class="low-life-modal" role="dialog" aria-modal="true" aria-labelledby="low-life-title"><div class="low-life-modal__card"><span class="low-life-modal__icon">⚠</span><h2 id="low-life-title">tas bien?</h2><p>Creo que llegaste con poca vida :c</p><button class="primary-button" id="close-low-life" type="button">Continuar</button></div></div>` : ''}
${victory ? `<div class="panel victory-panel"><h2>¡Ganaste el combate!</h2><p>Convertiste lo ocurrido en una reflexión útil para el siguiente sprint.</p><button class="primary-button" id="continue-upgrade" type="button">Continuar →</button></div>` : defeated && !spiritCombat ? `<div class="panel defeat-panel"><h2>Fuiste derrotado</h2><p>El boss sigue en pie, pero el proyecto continúa.</p><button class="primary-button" id="continue-upgrade" type="button">Continuar →</button></div>` : questionsFinished ? `<div class="panel question-card action-only-panel"><span class="eyebrow">PREGUNTAS COMPLETADAS</span><h3>Ya no hay más preguntas</h3><p>Ahora solo puedes ejecutar acciones hasta derrotar al enemigo.</p><div class="combat-controls"><button class="primary-button" id="basic-action" type="button">Ataque básico</button><button class="skill-button" id="special-button" type="button" ${state.combat.specialUsed ? 'disabled' : ''}>${escapeHtml(playerClass().skill)}</button>${powerup ? `<button class="powerup-button" id="powerup-button" type="button">${escapeHtml(powerup.name)}</button>` : ''}</div></div>` : `
<div class="panel question-card"><span class="eyebrow">RONDA ${state.combat.questionIndex + 1} /
    ${BOSS_QUESTIONS.length}</span>
  <h3>${question[1]}</h3>
  <p class="muted">${question[2]}</p>
  <textarea class="note-input" id="combat-answer" maxlength="800"
    placeholder="Escribe lo que realmente piensas.">${escapeHtml(state.combat.answered[question[0]] || '')}</textarea>
    <div class="combat-controls"><button class="primary-button" id="attack-button" type="button" disabled>${spiritCombat ? 'Responder como espíritu' : 'Atacar'}</button>${spiritCombat ? '' : `<button class="skill-button" id="special-button" type="button" ${state.combat.specialUsed
      ? 'disabled' : '' }>${escapeHtml(playerClass().skill)}</button>${powerup ? `<button class="powerup-button"
      id="powerup-button" type="button">${escapeHtml(powerup.name)}</button>` : ''}`}</div>
  <div class="actions"><button class="secondary-button" id="combat-back" type="button">← Revisar
      fortalezas</button>
</div>`}`);

  if (victory || (defeated && !spiritCombat)) {
    $('#continue-upgrade').addEventListener('click', () => {
      playActionSound('select');
      navigate('upgrade');
    });
    return;
  }

  $('#close-low-life')?.addEventListener('click', () => {
    state.combat.lowLifeWarningDismissed = true;
    persist();
    render();
  });

  const executeAttack = (answer = '') => {
    state.combat.answered[question[0]] = answer;
    if (spiritCombat) {
      state.combat.questionIndex += 1;
      state.combat.actionMessage = `👻 Tu espíritu aún combate. Tu respuesta queda registrada.`;
      state.combat.log.push(state.combat.actionMessage);
      playActionSound('attack');
      persist();
      render();
      return;
    }
    const attack = resolveAttack(answer, state, state.player.classId);
    playActionSound('attack');
    const response = attack.skipped
      ? { damage: 0, message: 'El turno se ha perdido.' }
      : bossTurn(state, state.player.classId);
    if (response.damage > 0) playActionSound('boss');
    state.combat.log.push(`${attack.message} ${response.message}`);
    state.combat.actionMessage = `${attack.message} ${response.message}`;
    state.combat.questionIndex += 1;
    if (state.combat.bossHp <= 0) {
      state.combat.victory = state.combat.bossHp <= 0;
      state.player.xp += state.combat.victory ? 25 : 10;
      state.combat.actionMessage = `🪦 ¡Ganaste! ${boss.name} ha sido derrotado.`;
      persist();
      playActionSound('victory');
      render();
    } else {
      if (state.combat.questionIndex >= BOSS_QUESTIONS.length) {
        state.combat.actionMessage += ' Las rondas terminaron, pero el enemigo sigue en pie.';
      }
      persist();
      render();
    }
  };

  if (questionsFinished) {
    $('#basic-action').addEventListener('click', () => executeAttack());
  } else {
    const answerInput = $('#combat-answer');
    const attackButton = $('#attack-button');
    answerInput.addEventListener('input', () => {
      attackButton.disabled = answerInput.value.trim().length === 0;
    });
    attackButton.addEventListener('click', () => {
      const answer = answerInput.value.trim();
      if (answer) executeAttack(answer);
    });
  }
  $('#special-button')?.addEventListener('click', () => {
    useSpecial(state, state.player.classId);
    playActionSound('special');
    state.combat.log.push(`${playerClass().skill}: ${playerClass().effect}`);
    if (state.combat.bossHp <= 0) {
      state.combat.victory = true;
      state.player.xp += 25;
      state.combat.actionMessage = `🪦 ¡Ganaste! ${boss.name} ha sido derrotado.`;
      playActionSound('victory');
    }
    persist();
    render();
  });
  $('#powerup-button')?.addEventListener('click', () => {
    const damage = usePowerup(state, powerup);
    playActionSound('powerup');
    state.combat.log.push(`${powerup.name} inflige ${damage} de daño.`);
    if (state.combat.bossHp <= 0) {
      state.combat.victory = true;
      state.player.xp += 25;
      state.combat.actionMessage = `🪦 ¡Ganaste! ${boss.name} ha sido derrotado.`;
      playActionSound('victory');
    }
    persist();
    render();
  });
  $('#combat-back')?.addEventListener('click', () => {
    playActionSound('select');
    navigate('strengths');
  });
  $('#combat-skip')?.addEventListener('click', () => toast('La animación se ha omitido. La reflexión sigue contando.'));
}

function renderUpgrade() {
  layout(`<div class="screen-head"><div><span class="eyebrow">MAPA DE HABILIDADES · NIVEL 07</span><h2>Elige tu próxima misión</h2><p>${state.combat.victory ? 'El jefe cae, pero el aprendizaje continúa.' : 'El jefe sigue en pie. Ahora sabemos dónde mirar.'}</p></div>${progress(7)}</div>
  <div class="panel"><div class="skill-tree">${Object.entries(SKILL_TREE).map(([branch, skills]) => `<div class="skill-branch"><strong>${branch.toUpperCase()}</strong>${skills.map((skill) => `<button type="button" class="${state.upgrade?.skill === skill ? 'selected' : ''}" data-skill-branch="${branch}" data-skill="${skill}">${skill}</button>`).join('')}</div>`).join('')}</div>
    <div class="question-card"><label for="mission"><strong>¿Qué acción concreta convertiría esta mejora en una misión?</strong><textarea class="note-input" id="mission" maxlength="500" placeholder="Ej.: Realizar un refinamiento técnico antes del planning.">${escapeHtml(state.upgrade?.action || '')}</textarea></label></div>
    <div class="actions"><button class="secondary-button" data-nav="combat" type="button">← Volver al combate</button><button class="primary-button" id="finish-button" type="button">Cerrar retrospectiva →</button></div>
  </div>`);
  document.querySelectorAll('[data-skill]').forEach((button) => button.addEventListener('click', () => { state.upgrade = { branch: button.dataset.skillBranch, skill: button.dataset.skill, action: state.upgrade?.action || '' }; persist(); render(); }));
  $('#mission').addEventListener('input', (event) => { state.upgrade = { ...(state.upgrade || {}), action: event.target.value }; persist(); });
  $('#finish-button').addEventListener('click', () => { if (!state.upgrade?.skill || !state.upgrade.action.trim()) return toast('Elige una mejora y escribe una acción concreta.'); state.player.level = 2; navigate('results'); });
  bindNavigation();
}

function statBar(label, value, displayValue = value) { return `<div class="stat-card"><span class="big">${displayValue}</span><strong>${label}</strong><div class="stat-bar"><span style="width:${Math.min(100, value)}%"></span></div></div>`; }

function renderResults() {
  const resultLabel = state.combat.victory ? 'Victoria épica' : 'Continuará';
  const achievements = state.achievements || [];
  const obstacleCount = state.obstacles.length;
  const metricTotal = 10;
  const clarityPercent = Math.round(obstacleCount / metricTotal * 100);
  const confidencePercent = Math.round(state.strengths.length / metricTotal * 100);
  playMusic('end');
  layout(`<div class="screen-head"><div><span class="eyebrow">SPRINT COMPLETED</span><h2>${resultLabel}</h2><p>La retrospectiva termina con una misión concreta para el siguiente sprint.</p></div>${progress(9)}</div>
  <div class="panel"><div class="avatar-preview">${characterSprite('small', state.player.name)}<div><strong>${escapeHtml(state.player.name)}</strong><br><small class="muted">${escapeHtml(playerClass().name)} · ${escapeHtml(playerClass().title)} · Nivel ${state.player.level}</small></div></div>
    <div class="summary-grid">${statBar('Vida restante', state.combat.playerMaxHp ? state.player.hp / state.combat.playerMaxHp * 100 : 0, `${Math.max(0, state.player.hp)} / ${state.combat.playerMaxHp} HP`)}${statBar('Claridad', clarityPercent, `${clarityPercent}%`)}${statBar('Confianza', confidencePercent, `${confidencePercent}%`)}<div class="stat-card"><span class="big">${state.player.xp}</span><strong>XP obtenida</strong></div><div class="stat-card"><span class="big">${state.combat.bossHp === 0 ? 'KO' : '...'}</span><strong>Jefe</strong></div></div>
    <div class="split"><div><h3>Lo que apareció en el mapa</h3><p><b>Estado:</b> ${emotionLabel(state.emotion) || 'Sin registrar'}</p><p><b>Obstáculos:</b> ${state.obstacles.map(obstacleLabel).join(', ')}</p><p><b>Fortalezas:</b> ${state.strengths.map((id) => POWERUPS[id]?.name || id).join(', ')}</p></div><div><h3>Tu siguiente misión</h3><p><b>${escapeHtml(state.upgrade?.skill)}</b></p><p>${escapeHtml(state.upgrade?.action)}</p></div></div>
    <div class="achievement-list"><h3>Logros desbloqueados (${achievements.length}/${achievementsCatalog.length})</h3>${achievements.length ? achievements.map((achievement) => `<span class="achievement-badge">🏆 ${escapeHtml(achievement)}</span>`).join('') : '<p class="muted">Aún no hay logros desbloqueados.</p>'}</div>
    <div class="actions"><button class="secondary-button" id="json-button" type="button">Descargar JSON</button><button class="secondary-button" id="print-button" type="button">Resumen imprimible</button><button class="primary-button" id="restart-button" type="button">Nueva aventura</button></div>
  </div>
  `);
  $('#json-button').addEventListener('click', () => downloadJson(state));
  $('#print-button').addEventListener('click', () => printableSummary(state));
  $('#restart-button').addEventListener('click', () => { clearState(); state = freshState(); render(); });
  $('#result-files').addEventListener('change', importFiles);
}

async function importFiles(event) {
  const results = [];
  for (const file of [...event.target.files]) {
    try { results.push(JSON.parse(await file.text())); } catch { toast(`No se pudo leer ${file.name}.`); }
  }
  const aggregate = aggregateResults(results);
  $('#import-output').innerHTML = aggregate.count ? `<div class="import-summary"><div class="stat-card"><span class="big">${aggregate.count}</span><strong>Participantes</strong></div><div class="stat-card"><span class="big">${Object.keys(aggregate.obstacles).length}</span><strong>Tipos de obstáculo</strong></div><div class="stat-card"><span class="big">${Object.keys(aggregate.strengths).length}</span><strong>Fortalezas detectadas</strong></div></div><p><b>Emociones:</b> ${aggregate.emotions.join(', ') || 'Sin datos'}<br><b>Obstáculos frecuentes:</b> ${Object.entries(aggregate.obstacles).sort((a, b) => b[1] - a[1]).map(([key, value]) => `${key} (${value})`).join(', ') || 'Sin datos'}<br><b>Mejoras elegidas:</b> ${aggregate.upgrades.join(', ') || 'Sin datos'}</p>` : '';
}

function render() {
  const screens = {
    home: renderHome,
    avatar: renderAvatar, 
    class: renderClass, 
    emotion: renderEmotion, 
    obstacles: renderObstacles, 
    strengths: renderStrengths, 
    combat: renderCombat, 
    upgrade: renderUpgrade, 
    results: renderResults
  };
  (screens[state.screen] || renderHome)();
}

soundToggle.addEventListener('click', () => {
  soundOn = !soundOn;
  setSoundEnabled(soundOn);
  soundToggle.textContent = soundOn ? '🔊' : '🔇';
  soundToggle.setAttribute('aria-label', soundOn ? 'Silenciar sonidos' : 'Activar sonidos');
  if (soundOn) playMusic('start');
  toast(soundOn ? 'Sonidos activados (modo silencioso de demo).' : 'Sonidos silenciados.');
});

// debugAudioButton.addEventListener('click', () => {
//   if (!soundOn) {
//     soundOn = true;
//     setSoundEnabled(true);
//     soundToggle.textContent = '♫';
//     soundToggle.setAttribute('aria-label', 'Silenciar sonidos');
//   }
//   playDebugAudio();
//   toast('DEBUG AUDIO: inicio, logro, ataque y final.');
// });

render();
