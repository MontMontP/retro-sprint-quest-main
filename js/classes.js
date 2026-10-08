export const AVATARS = [
  { id: 'ember', role: 'Explorador/a' },
  { id: 'lumen', role: 'Mago/a' },
  { id: 'moss',  role: 'Guardián/a' },
  { id: 'nova', role: 'Piloto' }
];

export const CLASSES = [
  { id: 'dev', name: 'DEV', title: 'Hechicero del Código', icon: 'DEV', skill: 'Hotfix Legendario', effect: 'Elimina 2 puntos de amenaza del jefe.', weakness: 'Cambios inesperados de requisitos.' },
  { id: 'sm', name: 'SCRUM MASTER', title: 'Guardián del Sprint', icon: 'SM', skill: 'Escudo Anti-Reuniones', effect: 'Bloquea el próximo ataque del jefe.', weakness: 'Impedimentos sin resolver.' },
  { id: 'po', name: 'Product Owner', title: 'Oráculo del Backlog', icon: 'PO', skill: 'Prioridad Absoluta', effect: 'Inflige 3 de daño al jefe y ordena el caos.', weakness: 'Cambios de alcance.' },
  { id: 'rem', name: 'REM', title: 'Explorador de Riesgos', icon: 'REM', skill: 'Visión del Futuro', effect: 'Reduce el próximo ataque del jefe a la mitad.', weakness: 'Imprevistos.' },
  { id: 'support', name: 'ÁREA DE APOYO', title: 'Sanador Legendario', icon: 'APOYO', skill: 'Rescate Express', effect: 'Recupera 18 HP.', weakness: 'Solicitudes urgentes.' }
];

export const CHARACTER_DEFAULTS = {
  gender: 'neutral', skin: '#e8a47e', hairColor: '#49332f', shirtColor: '#a32948', pantsColor: '#354b73', hairType: 'short', glasses: false
};

export const CHARACTER_OPTIONS = {
  gender: [['masculino', 'Masculino'], ['femenino', 'Femenino'], ['neutral', 'Neutral']],
  hairColor: [['#49332f', 'Castaño'], ['#171717', 'Negro'], ['#d78942', 'Pelirrojo'], ['#f2c14e', 'Rubio'], ['#8f6bd1', 'Fantasia']],
  shirtColor: [['#eb5e55', 'Coral'], ['#4f7cac', 'Azul'], ['#7bd389', 'Verde'], ['#ffd166', 'Amarillo'], ['#8f6bd1', 'Violeta']],
  pantsColor: [['#354b73', 'Marino'], ['#293241', 'Grafito'], ['#5b7c5b', 'Bosque'], ['#8b5e3c', 'Tierra']],
  hairType: [['short', 'Corto'], ['messy', 'Despeinado'], ['long', 'Largo'], ['ponytail', 'Cola de caballo'], ['bald', 'Pelón']]
};

export const POWERUPS = {
  teamwork: { name: 'Escudo de Colaboración', icon: '◈', damage: 2 },
  communication: { name: 'Hechizo de Claridad', icon: '✦', damage: 2 },
  problem: { name: 'Espada de Soluciones', icon: '⚔', damage: 3 },
  organization: { name: 'Brújula del Foco', icon: '⌖', damage: 2 },
  quality: { name: 'Núcleo de Calidad', icon: '◇', damage: 3 },
  delivery: { name: 'Impulso de Entrega', icon: '➜', damage: 2 },
  support: { name: 'Manto de Apoyo', icon: '+', damage: 2 },
  learning: { name: 'Libro de Experiencia', icon: '▤', damage: 3 },
  other: { name: 'Reliquia del Equipo', icon: '◆', damage: 2 }
};

export const OBSTACLES = {
  planning: ['Planning Golem', 'El peso de las estimaciones'], communication: ['Communication Wisp', 'La señal se perdió'], requirements: ['Requirements Dragon', 'El Caos del Backlog'], technical: ['Legacy Code Monster', 'La deuda despierta'], dependency: ['Dependency Phantom', 'Nadie tiene la llave'], meetings: ['Meeting Zombie', 'La agenda interminable'], time: ['Deadline Hydra', 'Demasiadas cabezas'], none: ['Quiet Meadow', 'Un sprint sin amenazas'], other: ['Unknown Glitch', 'Un misterio por investigar']
};
