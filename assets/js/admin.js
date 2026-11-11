// Painel da loja: lista do estoque + formulário de cadastro/edição com
// upload múltiplo, reordenação de fotos e compressão no cliente.

import { supabase } from './supabase.js';
import { initAdminAuth } from './auth.js';
import { listVeiculos } from './data.js';
import { coverPhoto } from './photos.js';
import { formatPrice } from './format.js';

const TIPOS = ['Carro', 'Caminhão', 'Máquina', 'Moto'];
const CAMBIOS = ['Automático', 'Manual', 'Não se aplica'];
const COMBUSTIVEIS = ['Flex', 'Gasolina', 'Diesel', 'Elétrico', 'GNV', 'Não se aplica'];

let veiculos = [];
let editandoId = null;
let fotosState = []; // { isNew, blob?, url?, path?, previewUrl }
let removidas = []; // storage paths a apagar no salvar

const listaEl = document.getElementById('lista');
const formBox = document.getElementById('form-veiculo');
const formTitulo = document.getElementById('form-titulo');

// ---------- utilidades ----------

function pathDaUrl(url) {
  const partes = String(url).split('/fotos/');
  return partes.length > 1 ? partes[1] : null;
}

async function comprimir(file) {
  const bitmap = await createImageBitmap(file);
  const max = 1600;
  let { width, height } = bitmap;
  if (width > max || height > max) {
    const r = Math.min(max / width, max / height);
    width = Math.round(width * r);
    height = Math.round(height * r);
  }
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  canvas.getContext('2d').drawImage(bitmap, 0, 0, width, height);
  return await new Promise((res) => canvas.toBlob(res, 'image/jpeg', 0.8));
}

async function enviarFoto(veiculoId, blob) {
  const nome = `${veiculoId}/${crypto.randomUUID()}.jpg`;
  const { error } = await supabase.storage.from('fotos').upload(nome, blob, { contentType: 'image/jpeg' });
  if (error) throw error;
  const { data } = supabase.storage.from('fotos').getPublicUrl(nome);
  return { url: data.publicUrl, path: nome };
}

// ---------- lista ----------

async function carregarLista() {
  veiculos = await listVeiculos(supabase, { onlyDisponivel: false });
  document.getElementById('estoque-titulo').textContent = `Estoque — ${veiculos.length} veículo(s)`;
  listaEl.innerHTML = veiculos.map(itemHtml).join('') || '<p class="vazio">Nenhum veículo cadastrado.</p>';
}

function itemHtml(v) {
  const capa = coverPhoto(v.fotos);
  const foto = capa ? `<img class="item-foto" src="${capa.url}" alt="">` : '<div class="item-foto"></div>';
  const vendido = v.status === 'Vendido';
  return `<div class="item" data-id="${v.id}">
    ${foto}
    <div>
      <div class="item-nome">${v.titulo}</div>
      <div class="item-meta">${[v.ano, formatPrice(v.preco)].filter(Boolean).join(' · ')}
        <span class="st ${vendido ? 'st-off' : 'st-on'}">${v.status}</span></div>
    </div>
    <div class="item-acoes">
      <button data-acao="editar">Editar</button>
      <button data-acao="vendido">${vendido ? 'Disponível' : 'Vendido'}</button>
      <button data-acao="remover">Remover</button>
    </div>
  </div>`;
}

listaEl.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-acao]');
  if (!btn) return;
  const id = btn.closest('.item').dataset.id;
  const v = veiculos.find((x) => x.id === id);
  if (btn.dataset.acao === 'editar') editar(v);
  else if (btn.dataset.acao === 'vendido') alternarVendido(v);
  else if (btn.dataset.acao === 'remover') remover(v);
});

async function alternarVendido(v) {
  const novo = v.status === 'Vendido' ? 'Disponível' : 'Vendido';
  const { error } = await supabase.from('veiculos').update({ status: novo, updated_at: new Date().toISOString() }).eq('id', v.id);
  if (error) return alert('Erro ao atualizar status.');
  await carregarLista();
}

async function remover(v) {
  if (!confirm(`Remover "${v.titulo}"? Esta ação não pode ser desfeita.`)) return;
  const paths = (v.fotos || []).map((ft) => pathDaUrl(ft.url)).filter(Boolean);
  if (paths.length) await supabase.storage.from('fotos').remove(paths);
  const { error } = await supabase.from('veiculos').delete().eq('id', v.id); // cascade apaga veiculo_fotos
  if (error) return alert('Erro ao remover.');
  if (editandoId === v.id) limparForm();
  await carregarLista();
}

// ---------- formulário ----------

function opcoes(lista, atual) {
  return lista.map((o) => `<option${o === atual ? ' selected' : ''}>${o}</option>`).join('');
}

function construirForm(v = {}) {
  formBox.innerHTML = `
  <form id="form-v" class="form-veiculo">
    <label>Fotos
      <div id="dropzone" class="upload-area">+ Clique para adicionar fotos (pode selecionar várias)</div>
      <input id="file-input" type="file" accept="image/*" multiple hidden>
    </label>
    <div id="previews" class="upload-previews"></div>
    <div class="progresso" hidden><span></span></div>

    <label>Tipo<select name="tipo" required><option value="">Selecione</option>${opcoes(TIPOS, v.tipo)}</select></label>
    <label>Veículo (marca e modelo)<input name="titulo" required value="${v.titulo ?? ''}"></label>
    <div class="form-linha">
      <label>Ano<input name="ano" type="number" value="${v.ano ?? ''}"></label>
      <label>Preço (R$)<input name="preco" type="number" step="100" value="${v.preco ?? ''}"></label>
    </div>
    <div class="form-linha">
      <label>KM<input name="km" type="number" value="${v.km ?? ''}"></label>
      <label>Câmbio<select name="cambio"><option value="">—</option>${opcoes(CAMBIOS, v.cambio)}</select></label>
    </div>
    <div class="form-linha">
      <label>Combustível<select name="combustivel"><option value="">—</option>${opcoes(COMBUSTIVEIS, v.combustivel)}</select></label>
      <label>Cor<input name="cor" value="${v.cor ?? ''}"></label>
    </div>
    <label>Motorização<input name="motorizacao" value="${v.motorizacao ?? ''}"></label>
    <label>Descrição<textarea name="descricao" rows="3">${v.descricao ?? ''}</textarea></label>
    <label>Status<select name="status">${opcoes(['Disponível', 'Vendido'], v.status || 'Disponível')}</select></label>
    <button class="btn" type="submit">Salvar e publicar</button>
  </form>`;

  const input = document.getElementById('file-input');
  document.getElementById('dropzone').addEventListener('click', () => input.click());
  input.addEventListener('change', aoEscolherFotos);
  document.getElementById('form-v').addEventListener('submit', salvar);
  renderPreviews();
}

async function aoEscolherFotos(e) {
  const files = [...e.target.files];
  e.target.value = '';
  for (const file of files) {
    const blob = await comprimir(file);
    fotosState.push({ isNew: true, blob, previewUrl: URL.createObjectURL(blob) });
  }
  renderPreviews();
}

function renderPreviews() {
  const box = document.getElementById('previews');
  if (!box) return;
  box.innerHTML = fotosState
    .map((ft, i) => `<div class="mini${i === 0 ? ' capa' : ''}" data-i="${i}">
      <img src="${ft.previewUrl || ft.url}" alt="">
      <button type="button" class="rm" data-rm="${i}">✕</button>
      <div class="mini-mov">
        <button type="button" data-mov="${i}:-1" aria-label="Mover para a esquerda">◀</button>
        <button type="button" data-mov="${i}:1" aria-label="Mover para a direita">▶</button>
      </div>
    </div>`)
    .join('');

  box.querySelectorAll('[data-rm]').forEach((b) => b.addEventListener('click', () => removerFoto(Number(b.dataset.rm))));
  box.querySelectorAll('[data-mov]').forEach((b) => b.addEventListener('click', () => {
    const [i, d] = b.dataset.mov.split(':').map(Number);
    moverFoto(i, d);
  }));
}

function removerFoto(i) {
  const ft = fotosState[i];
  if (!ft.isNew && ft.path) removidas.push(ft.path);
  fotosState.splice(i, 1);
  renderPreviews();
}

function moverFoto(i, dir) {
  const j = i + dir;
  if (j < 0 || j >= fotosState.length) return;
  [fotosState[i], fotosState[j]] = [fotosState[j], fotosState[i]];
  renderPreviews();
}

function editar(v) {
  editandoId = v.id;
  formTitulo.textContent = `Editar: ${v.titulo}`;
  fotosState = (v.fotos || []).map((ft) => ({ isNew: false, url: ft.url, path: pathDaUrl(ft.url), previewUrl: ft.url }));
  removidas = [];
  construirForm(v);
  formBox.scrollIntoView({ behavior: 'smooth' });
}

function limparForm() {
  editandoId = null;
  fotosState = [];
  removidas = [];
  formTitulo.textContent = 'Novo veículo';
  construirForm({});
}

async function salvar(e) {
  e.preventDefault();
  const f = Object.fromEntries(new FormData(e.target).entries());
  const payload = {
    tipo: f.tipo,
    titulo: f.titulo,
    ano: f.ano ? Number(f.ano) : null,
    preco: f.preco ? Number(f.preco) : null,
    km: f.km ? Number(f.km) : null,
    cambio: f.cambio || null,
    combustivel: f.combustivel || null,
    motorizacao: f.motorizacao || null,
    cor: f.cor || null,
    descricao: f.descricao || null,
    status: f.status || 'Disponível',
    updated_at: new Date().toISOString(),
  };

  const btn = e.target.querySelector('button[type="submit"]');
  btn.disabled = true;
  btn.textContent = 'Salvando…';
  try {
    let id = editandoId;
    if (id) {
      const { error } = await supabase.from('veiculos').update(payload).eq('id', id);
      if (error) throw error;
    } else {
      const { data, error } = await supabase.from('veiculos').insert(payload).select('id').single();
      if (error) throw error;
      id = data.id;
    }

    for (const ft of fotosState) {
      if (ft.isNew) {
        const r = await enviarFoto(id, ft.blob);
        ft.url = r.url;
        ft.path = r.path;
        ft.isNew = false;
      }
    }

    await supabase.from('veiculo_fotos').delete().eq('veiculo_id', id);
    if (fotosState.length) {
      const rows = fotosState.map((ft, i) => ({ veiculo_id: id, url: ft.url, ordem: i }));
      const { error } = await supabase.from('veiculo_fotos').insert(rows);
      if (error) throw error;
    }

    if (removidas.length) {
      await supabase.storage.from('fotos').remove(removidas);
      removidas = [];
    }

    limparForm();
    await carregarLista();
    alert('Veículo salvo e publicado!');
  } catch (err) {
    console.error(err);
    alert('Erro ao salvar: ' + (err.message || err));
    btn.disabled = false;
    btn.textContent = 'Salvar e publicar';
  }
}

// ---------- início ----------

function start() {
  limparForm();
  carregarLista().catch((err) => {
    console.error(err);
    listaEl.innerHTML = '<p class="vazio">Erro ao carregar o estoque.</p>';
  });
}

document.getElementById('novo').addEventListener('click', limparForm);
initAdminAuth({ onSignedIn: start });
