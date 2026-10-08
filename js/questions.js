export const EMOTIONS = [
  { id: 'excellent', label: 'Excelente', icon: '☀', tone: 'upbeat' }, { id: 'good', label: 'Bien', icon: '✦', tone: 'good' }, { id: 'regular', label: 'Regular', icon: '◐', tone: 'steady' }, { id: 'bad', label: 'Mal', icon: '◒', tone: 'low' }, { id: 'very-bad', label: 'Muy mal', icon: '☾', tone: 'low' }
];
export const EMOTION_FOLLOWUPS = [
  { id: 'energy', label: '¿Cómo fue tu nivel de energía?', options: ['100%', '75%', '50%', '25%', '0%'] },
  { id: 'motivation', label: '¿Qué tan motivado te sentiste?', options: ['Muy motivado', 'Motivado', 'Variable', 'Desconectado'] }
];
export const OBSTACLE_OPTIONS = [
  ['planning', 'Planificación'], ['communication', 'Comunicación'], ['requirements', 'Cambios de requisitos'], ['technical', 'Bloqueos técnicos'], ['dependency', 'Dependencias externas'], ['meetings', 'Exceso de reuniones'], ['time', 'Falta de tiempo'], ['other', 'Otro']
];
export const STRENGTH_OPTIONS = [
  ['teamwork', 'Trabajo en equipo'], ['communication', 'Comunicación'], ['problem', 'Resolución de problemas'], ['organization', 'Organización'], ['quality', 'Calidad técnica'], ['delivery', 'Entregas'], ['support', 'Apoyo entre compañeros'], ['learning', 'Aprendizaje'], ['other', 'Otro']
];
export const BOSS_QUESTIONS = [
  ['improve', '1. ¿Qué podría haber mejorado durante el sprint?', 'Cada aprendizaje debilita al jefe.'],
  ['stop', '2. ¿Qué deberíamos dejar de hacer?', 'Poner límites también es avanzar.'],
  ['continue', '3.¿Qué deberíamos seguir haciendo?', 'Reconocer lo que funciona da energía.'],
  ['action', '4. ¿Qué acción concreta propondrías para el siguiente sprint?', 'Una misión clara abre el siguiente nivel.']
];
export const SKILL_TREE = {
  'Comunicación': ['Comunicación','Claridad en requisitos', 'Mejor coordinación', 'Feedback temprano'],
  'Planeación': ['Refinamiento', 'Estimaciones', 'Priorización'],
  'Calidad técnica': ['Testing', 'Revisiones', 'Automatización'],
  'Colaboración': ['Apoyo entre compañeros', 'Resolución de bloqueos', 'Compartir conocimiento']
};
