// Vitrine pública: carrega os veículos disponíveis, aplica filtros e renderiza a grade.

import { supabase } from './supabase.js';
import { listVeiculos } from './data.js';
import { filterVehicles } from './filters.js';
import { renderCard } from './render.js';

const grade = document.getElementById('grade');
const carregando = document.getElementById('carregando');
const form = document.getElementById('busca');
const filtroAno = document.getElementById('filtro-ano');

let veiculos = [];

function render(lista) {
  if (!lista.length) {
    grade.innerHTML = '';
    carregando.textContent = 'Nenhum veículo encontrado.';
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

form.addEventListener('submit', (e) => {
  e.preventDefault();
  render(filterVehicles(veiculos, lerFiltros()));
});

async function iniciar() {
  try {
    veiculos = await listVeiculos(supabase, { onlyDisponivel: true });
    popularAnos(veiculos);
    render(veiculos);
  } catch (err) {
    console.error(err);
    carregando.textContent = 'Não foi possível carregar os veículos. Tente novamente.';
  }
}

iniciar();
