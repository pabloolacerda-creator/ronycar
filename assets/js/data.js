// Acesso a dados no Supabase. O client é passado por parâmetro (injetável),
// para os testes usarem um client falso sem rede.

import { sortPhotos } from './photos.js';
import { ordenarFeed } from './destaque.js';

const SELECT = '*, veiculo_fotos(*)';

function normalize(row) {
  return { ...row, fotos: sortPhotos(row.veiculo_fotos ?? row.fotos ?? []) };
}

export async function listVeiculos(client, { onlyDisponivel = true } = {}) {
  let q = client.from('veiculos').select(SELECT).order('created_at', { ascending: false });
  if (onlyDisponivel) q = q.eq('status', 'Disponível');
  const { data, error } = await q;
  if (error) throw error;
  return ordenarFeed((data ?? []).map(normalize));
}

export async function getVeiculo(client, id) {
  // maybeSingle: devolve null (sem erro) quando não há linha — o veículo pode
  // ter sido vendido/removido, e a página mostra "não encontrado" em vez de falhar.
  const { data, error } = await client.from('veiculos').select(SELECT).eq('id', id).maybeSingle();
  if (error) throw error;
  return data ? normalize(data) : null;
}
