// Montagem de HTML (strings) para card, especificações e carrossel.
// Funções puras — recebem um veículo/fotos e devolvem markup.

import { formatPrice, formatKm } from './format.js';
import { coverPhoto, sortPhotos } from './photos.js';

const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ESCAPES[c]);
}

function vazio(v) {
  return v === null || v === undefined || v === '' || v === 'Não se aplica';
}

export function renderCard(veiculo) {
  const capa = coverPhoto(veiculo.fotos);
  const foto = capa
    ? `<img class="card-foto" src="${esc(capa.url)}" alt="${esc(veiculo.titulo)}" loading="lazy">`
    : `<div class="card-foto placeholder">sem foto</div>`;

  const meta = [veiculo.ano, vazio(veiculo.km) ? null : formatKm(veiculo.km), veiculo.combustivel]
    .filter((x) => !vazio(x))
    .map(esc)
    .join(' · ');

  return `<a class="card" href="veiculo.html?id=${encodeURIComponent(veiculo.id)}">
  ${foto}
  <div class="card-corpo">
    <h3 class="card-titulo">${esc(veiculo.titulo)}</h3>
    <p class="card-meta">${meta}</p>
    <p class="card-preco">${formatPrice(veiculo.preco)}</p>
  </div>
</a>`;
}

export function renderSpecs(veiculo) {
  const linhas = [
    ['Ano', veiculo.ano],
    ['Quilometragem', vazio(veiculo.km) ? null : formatKm(veiculo.km)],
    ['Câmbio', veiculo.cambio],
    ['Combustível', veiculo.combustivel],
    ['Motorização', veiculo.motorizacao],
    ['Cor', veiculo.cor],
  ].filter(([, v]) => !vazio(v));

  return linhas
    .map(([k, v]) => `<div class="spec"><span class="spec-k">${esc(k)}</span><span class="spec-v">${esc(v)}</span></div>`)
    .join('');
}

export function renderCarousel(fotos) {
  const ordenadas = sortPhotos(fotos);
  if (!ordenadas.length) {
    return `<div class="carrossel"><div class="placeholder">sem foto</div></div>`;
  }

  const slides = ordenadas
    .map((f, i) => `<img class="slide" data-i="${i}" src="${esc(f.url)}" alt="" loading="lazy">`)
    .join('');
  const bolinhas = ordenadas
    .map((_, i) => `<span class="bolinha${i === 0 ? ' ativa' : ''}" data-i="${i}"></span>`)
    .join('');

  return `<div class="carrossel" data-total="${ordenadas.length}">
  <div class="slides">${slides}</div>
  <button class="seta seta-prev" type="button" aria-label="Foto anterior">‹</button>
  <button class="seta seta-next" type="button" aria-label="Próxima foto">›</button>
  <div class="contador"><span class="atual">1</span> / ${ordenadas.length}</div>
  <div class="bolinhas">${bolinhas}</div>
</div>`;
}
