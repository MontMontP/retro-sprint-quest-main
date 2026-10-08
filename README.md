# Sprint Quest RPG

Sprint Quest RPG es una retrospectiva individual con formato de aventura RPG. Funciona como sitio estatico: no tiene backend, no envia respuestas a ningun servicio y guarda el progreso unicamente en `localStorage`.

## Ejecutar localmente

Requiere Python 3 o Node.js. Desde la raiz del repositorio:

```bash
python3 -m http.server 8000
```

Abre [http://localhost:8000](http://localhost:8000). Tambien puedes usar cualquier servidor estatico equivalente; no abras `index.html` directamente porque los modulos ES6 requieren HTTP.

## Flujo incluido

- Creacion de aventurero, avatar y cinco clases equilibradas.
- Estado emocional, obstaculos y fortalezas con contexto opcional.
- Power-ups, jefe final y combate determinista por turnos.
- Habilidad especial de un uso por clase.
- Arbol de mejoras y mision concreta para el siguiente sprint.
- Guardado automatico, reanudacion y reinicio.
- Descarga JSON, resumen imprimible y vista de facilitador para importar varios JSON sin rankings ni nombres.
- Diseno responsive, teclado, animaciones cortas y `prefers-reduced-motion`.

## Estructura

- `index.html`: shell semantico.
- `css/`: estilo principal, personajes y animaciones.
- `js/classes.js`: avatares, clases, power-ups y enemigos.
- `js/questions.js`: preguntas y arbol de habilidades.
- `js/gameState.js`: estado y persistencia.
- `js/combat.js`: reglas deterministas del combate.
- `js/results.js`: esquema de exportacion, descarga y agregacion.
- `js/app.js`: navegacion y renderizado de pantallas.

## Personalizacion

Edita `js/questions.js` para cambiar preguntas y opciones. Edita `js/classes.js` para anadir clases, avatares, power-ups o tipos de jefe. La apariencia del personaje se controla desde `CHARACTER_DEFAULTS` y `CHARACTER_OPTIONS`; el dibujo 2D se compone en `characterSprite()` dentro de `js/app.js` y sus piezas visuales viven en `css/characters.css`. Los nuevos recursos deben usar rutas relativas para conservar la compatibilidad con GitHub Pages.

## GitHub Pages

Sube el repositorio a GitHub y activa **Settings -> Pages -> Deploy from a branch**, seleccionando `main` y `/ (root)`. El proyecto no necesita build, secretos ni variables de entorno.

## Exportacion e importacion

En la pantalla final, `Descargar JSON` produce un resultado con `schema: sprint-quest-result` y `version: 1`. La vista de facilitador permite seleccionar varios de esos archivos y presenta unicamente recuentos y tendencias agregadas.
