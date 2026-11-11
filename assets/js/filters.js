// Filtros da vitrine e faixas de preço.

export function priceRangeToBounds(range) {
  switch (range) {
    case 'ate-50k':   return { min: 0, max: 50000 };
    case '50-100k':   return { min: 50000, max: 100000 };
    case '100-200k':  return { min: 100000, max: 200000 };
    case '200k-mais': return { min: 200000, max: Infinity };
    default:          return null;
  }
}

function norm(s) {
  return (s ?? '').toString().toLowerCase().trim();
}

export function matchesFilters(veiculo, filtros = {}) {
  const { tipo, texto, faixa, motorizacao, ano, cambio } = filtros;

  if (tipo && veiculo.tipo !== tipo) return false;
  if (cambio && veiculo.cambio !== cambio) return false;
  if (ano && Number(veiculo.ano) !== Number(ano)) return false;
  if (texto && !norm(veiculo.titulo).includes(norm(texto))) return false;
  if (motorizacao && !norm(veiculo.motorizacao).includes(norm(motorizacao))) return false;

  if (faixa) {
    const b = priceRangeToBounds(faixa);
    if (b) {
      const p = Number(veiculo.preco);
      if (Number.isNaN(p) || p < b.min || p > b.max) return false;
    }
  }

  return true;
}

export function filterVehicles(lista, filtros = {}) {
  return lista.filter((v) => matchesFilters(v, filtros));
}
