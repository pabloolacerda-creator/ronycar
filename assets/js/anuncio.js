// Página do anúncio: carrega um veículo, monta o carrossel e o botão de WhatsApp.

import { supabase } from './supabase.js';
import { getVeiculo } from './data.js';
import { renderSpecs, renderCarousel } from './render.js';
import { nextIndex, prevIndex } from './carousel.js';
import { buildWhatsappUrl } from './whatsapp.js';
import { formatPrice } from './format.js';

const erro = document.getElementById('erro');
const conteudo = document.getElementById('conteudo');

function mostrarErro(msg) {
  erro.textContent = msg;
  erro.hidden = false;
}

function montarCarrossel(veiculo) {
  const box = document.getElementById('carrossel');
  box.innerHTML = renderCarousel(veiculo.fotos);

  const slidesEl = box.querySelector('.slides');
  if (!slidesEl) return; // sem fotos (placeholder)

  const total = Number(box.querySelector('.carrossel').dataset.total) || 0;
  const atualEl = box.querySelector('.atual');
  const bolinhas = [...box.querySelectorAll('.bolinha')];
  let atual = 0;

  function marcar(i) {
    atual = i;
    if (atualEl) atualEl.textContent = String(i + 1);
    bolinhas.forEach((b, j) => b.classList.toggle('ativa', j === i));
  }

  function irPara(i) {
    marcar(i);
    slidesEl.scrollTo({ left: slidesEl.clientWidth * i, behavior: 'smooth' });
  }

  box.querySelector('.seta-next').addEventListener('click', () => irPara(nextIndex(atual, total)));
  box.querySelector('.seta-prev').addEventListener('click', () => irPara(prevIndex(atual, total)));
  bolinhas.forEach((b, i) => b.addEventListener('click', () => irPara(i)));

  // Swipe nativo (scroll) atualiza o contador.
  let t;
  slidesEl.addEventListener('scroll', () => {
    clearTimeout(t);
    t = setTimeout(() => {
      const i = Math.round(slidesEl.scrollLeft / slidesEl.clientWidth);
      if (i !== atual) marcar(i);
    }, 80);
  });
}

function preencher(veiculo) {
  document.title = `${veiculo.titulo} — Ronycar Automóveis`;
  montarCarrossel(veiculo);

  const status = document.getElementById('status');
  const vendido = veiculo.status === 'Vendido';
  status.textContent = vendido ? '● Vendido' : '● Disponível';
  status.classList.add(vendido ? 'badge-off' : 'badge-on');

  document.getElementById('titulo').textContent = veiculo.titulo;
  document.getElementById('subtitulo').textContent = [veiculo.tipo, 'Várzea Grande/MT'].filter(Boolean).join(' · ');
  document.getElementById('preco').textContent = formatPrice(veiculo.preco);
  document.getElementById('specs').innerHTML = renderSpecs(veiculo);
  document.getElementById('descricao').textContent = veiculo.descricao || 'Entre em contato para mais informações.';
  document.getElementById('wpp').href = buildWhatsappUrl(veiculo);

  conteudo.hidden = false;
}

async function iniciar() {
  const id = new URLSearchParams(location.search).get('id');
  if (!id) return mostrarErro('Veículo não informado.');
  try {
    const veiculo = await getVeiculo(supabase, id);
    if (!veiculo) return mostrarErro('Veículo não encontrado. Ele pode ter sido vendido.');
    preencher(veiculo);
  } catch (err) {
    console.error(err);
    mostrarErro('Não foi possível carregar o veículo. Tente novamente.');
  }
}

iniciar();
