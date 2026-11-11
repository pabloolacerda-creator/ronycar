// Monta a mensagem e o link de WhatsApp a partir de um veículo.

import { WHATSAPP } from './config.js';
import { formatPrice } from './format.js';

export function buildMessage(veiculo) {
  const ano = veiculo.ano ? ` (${veiculo.ano})` : '';
  return `Olá! Tenho interesse no ${veiculo.titulo}${ano} — ${formatPrice(veiculo.preco)}. Está disponível?`;
}

export function buildWhatsappUrl(veiculo, phone = WHATSAPP) {
  return `https://wa.me/${phone}?text=${encodeURIComponent(buildMessage(veiculo))}`;
}
