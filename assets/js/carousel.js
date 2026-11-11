// Navegação circular do carrossel (índices). Dá a volta nas pontas.

export function nextIndex(i, total) {
  if (!total || total <= 0) return 0;
  return (i + 1) % total;
}

export function prevIndex(i, total) {
  if (!total || total <= 0) return 0;
  return (i - 1 + total) % total;
}
