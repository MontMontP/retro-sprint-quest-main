const SVG_NS = 'http://www.w3.org/2000/svg';

const HAIRSTYLES = {
  short: [[8, 5, 17, 4], [7, 8, 4, 7], [10, 8, 13, 2], [22, 8, 4, 5], [11, 4, 11, 2]],
  messy: [[8, 5, 17, 5], [7, 8, 4, 7], [22, 8, 4, 5], [10, 3, 5, 4], [17, 4, 5, 3], [23, 3, 2, 5], [6, 6, 3, 3], [12, 9, 11, 2]],
  long: [[8, 5, 17, 5], [7, 8, 4, 16], [23, 8, 4, 16], [11, 8, 12, 2], [9, 21, 4, 5], [23, 21, 3, 5]],
  ponytail: [
  [8, 5, 17, 5],
  [7, 8, 4, 8],
  [22, 8, 4, 6],
  [5, 10, 5, 5],
  [4, 13, 3, 10],
  [11, 8, 12, 2]
],
  bald: []
};

function rect(attributes) {
  return `<rect ${Object.entries(attributes).map(([key, value]) => `${key}="${value}"`).join(' ')} />`;
}

export function renderPixelCharacter(appearance, label = '', size = 'normal') {
  return `<div class="pixel-character pixel-character--${size}">
    <svg class="pixel-character__svg" data-pixel-character viewBox="0 0 32 36" role="img" aria-label="${label || 'Personaje pixel art'}">
      <g class="pixel-pants" fill="${appearance.pantsColor}"><rect x="10" y="27" width="5" height="5" /><rect x="18" y="27" width="5" height="5" /></g>
      <g class="pixel-character__body"><rect x="9" y="19" width="15" height="10" fill="#25202a" />
      <rect x="10" y="20" width="13" height="7" class="pixel-shirt" />
      <rect x="8" y="21" width="3" height="6" class="pixel-shirt" />
      <rect x="23" y="21" width="3" height="6" class="pixel-shirt" />
      <rect x="10" y="25" width="13" height="2" fill="#25202a" opacity=".45" /></g>
      <g class="pixel-skin"><rect x="15" y="17" width="5" height="5" />
      <rect x="8" y="25" width="3" height="3" /><rect x="24" y="25" width="3" height="3" /></g>
      <path class="pixel-skin" d="M9 8H24V19H9Z" />
      <rect x="14" y="13" width="2" height="3" fill="#242025" />
      <rect x="20" y="13" width="2" height="3" fill="#242025" />
      <g class="pixel-glasses" style="display:${appearance.glasses ? 'inline' : 'none'}"><rect x="11" y="12" width="6" height="4" fill="none" stroke="#242025" stroke-width="1" /><rect x="19" y="12" width="6" height="4" fill="none" stroke="#242025" stroke-width="1" /><rect x="17" y="13" width="2" height="1" fill="#242025" /></g>
      <g class="pixel-hair-layer"></g>
      <rect x="12" y="24" width="10" height="2" fill="#17151c" opacity=".35" />
    </svg>
    ${label ? `<span class="pixel-character__label">${label}</span>` : ''}
  </div>`;
}

export function updatePixelCharacter(svg, appearance) {
  svg.querySelectorAll('.pixel-skin').forEach((element) => element.setAttribute('fill', appearance.skin));
  svg.querySelectorAll('.pixel-shirt').forEach((element) => element.setAttribute('fill', appearance.shirtColor));
  svg.querySelector('.pixel-pants').setAttribute('fill', appearance.pantsColor);
  const glasses = svg.querySelector('.pixel-glasses');
  glasses.style.display = appearance.glasses ? 'inline' : 'none';

  const hairLayer = svg.querySelector('.pixel-hair-layer');
  hairLayer.replaceChildren();
  (HAIRSTYLES[appearance.hairType] || HAIRSTYLES.short).forEach(([x, y, width, height]) => {
    const hair = document.createElementNS(SVG_NS, 'rect');
    hair.setAttribute('x', x);
    hair.setAttribute('y', y);
    hair.setAttribute('width', width);
    hair.setAttribute('height', height);
    hair.setAttribute('fill', appearance.hairColor);
    hairLayer.appendChild(hair);
  });
}

export function refreshPixelCharacters(root, appearance) {
  root.querySelectorAll('[data-pixel-character]').forEach((svg) => updatePixelCharacter(svg, appearance));
}
