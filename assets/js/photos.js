// Ordenação de fotos de um veículo. A de menor `ordem` é a capa.

export function sortPhotos(fotos) {
  return (fotos ?? []).slice().sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0));
}

export function coverPhoto(fotos) {
  const ordenadas = sortPhotos(fotos);
  return ordenadas.length ? ordenadas[0] : null;
}
