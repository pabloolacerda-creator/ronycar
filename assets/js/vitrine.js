// Vitrine pública: carrega os veículos disponíveis, aplica filtros e renderiza a grade.

import { supabase } from './supabase.js';
import { listVeiculos } from './data.js';
import { filterVehicles } from './filters.js';
import { renderCard } from './render.js';

const grade = document.getElementById('grade');
const carregando = document.getElementById('carregando');
const form = document.getElementById('busca');
const filtroAno = document.getElementById('filtro-ano');
const contagem = document.getElementById('contagem');
const limpar = document.getElementById('limpar');
const maisFiltros = form.querySelector('.busca-mais');

let veiculos = [];

function rotulo(n) {
  if (n === 0) return 'Nenhum veículo';
  return n === 1 ? '1 veículo' : `${n} veículos`;
}

function render(lista, filtrado = false) {
  contagem.textContent = filtrado ? `${rotulo(lista.length)} de ${veiculos.length}` : rotulo(lista.length);
  limpar.hidden = !filtrado;
  if (!lista.length) {
    grade.innerHTML = '';
    carregando.textContent = 'Nenhum veículo encontrado com esses filtros.';
    carregando.hidden = false;
    return;
  }
  carregando.hidden = true;
  grade.innerHTML = lista.map(renderCard).join('');
}

function popularAnos(lista) {
  const anos = [...new Set(lista.map((v) => v.ano).filter(Boolean))].sort((a, b) => b - a);
  for (const ano of anos) {
    const opt = document.createElement('option');
    opt.value = ano;
    opt.textContent = ano;
    filtroAno.appendChild(opt);
  }
}

function lerFiltros() {
  const dados = new FormData(form);
  const f = Object.fromEntries(dados.entries());
  return {
    tipo: f.tipo,
    texto: f.texto,
    faixa: f.faixa,
    motorizacao: f.motorizacao,
    ano: f.ano,
    cambio: f.cambio,
  };
}

function temFiltro(f) {
  return Object.values(f).some((v) => String(v ?? '').trim() !== '');
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const f = lerFiltros();
  render(filterVehicles(veiculos, f), temFiltro(f));
  document.getElementById('estoque').scrollIntoView({ block: 'start' });
});

limpar.addEventListener('click', () => {
  form.reset();
  render(veiculos);
});

maisFiltros.addEventListener('click', () => {
  const aberta = form.classList.toggle('aberta');
  maisFiltros.setAttribute('aria-expanded', String(aberta));
  maisFiltros.firstChild.textContent = aberta ? 'Menos filtros ' : 'Mais filtros ';
});

async function iniciar() {
  try {
    veiculos = await listVeiculos(supabase, { onlyDisponivel: true });
    popularAnos(veiculos);
    render(veiculos);
  } catch (err) {
    console.error(err);
    grade.innerHTML = '';
    contagem.textContent = '';
    carregando.textContent = 'Não foi possível carregar os veículos. Atualize a página para tentar de novo.';
    carregando.hidden = false;
  }
}

iniciar();
