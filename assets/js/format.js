// Formatação pt-BR de preço e quilometragem.

const nf = new Intl.NumberFormat('pt-BR');

export function formatPrice(valor) {
  const n = Number(valor);
  if (!valor || Number.isNaN(n)) return 'Sob consulta';
  return 'R$ ' + nf.format(n);
}

export function formatKm(km) {
  if (km === undefined || km === null || Number.isNaN(Number(km))) return '—';
  return nf.format(Number(km)) + ' km';
}
