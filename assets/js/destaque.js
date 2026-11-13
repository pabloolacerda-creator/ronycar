// Posição no feed (1º, 2º, 3º). Funções puras, testadas em tests/destaque.test.js.

export const POSICOES = [1, 2, 3];

// Destaques primeiro (1º, 2º, 3º); o resto mantém a ordem recebida (mais novo primeiro).
export function ordenarFeed(lista) {
  const destaques = lista
    .filter((v) => POSICOES.includes(v.destaque))
    .sort((a, b) => a.destaque - b.destaque);
  const resto = lista.filter((v) => !POSICOES.includes(v.destaque));
  return [...destaques, ...resto];
}

// Coloca `id` na posição `nova` (1–3, ou null = Normal) e devolve as mudanças
// [{ id, destaque }]. Quem ocupava o lugar desce um degrau, em cascata, até
// achar um lugar vago; quem passa do 3º volta para Normal. Tirar alguém do
// destaque não faz os outros subirem.
export function reposicionar(lista, id, nova) {
  const mudancas = [{ id, destaque: nova }];
  if (!POSICOES.includes(nova)) return mudancas;

  // Lugares ocupados pelos outros (o próprio libera o lugar antigo).
  const slots = {};
  for (const v of lista) {
    if (v.id !== id && POSICOES.includes(v.destaque)) slots[v.destaque] = v.id;
  }

  let empurrado = slots[nova];
  let pos = nova;
  while (empurrado) {
    pos += 1;
    const proximo = slots[pos];
    mudancas.push({ id: empurrado, destaque: POSICOES.includes(pos) ? pos : null });
    if (!POSICOES.includes(pos)) break;
    empurrado = proximo;
  }
  return mudancas;
}
