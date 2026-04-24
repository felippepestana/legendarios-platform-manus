/**
 * Stripe Products & Prices for TOP Destemidos Pioneiros
 * 
 * Centralized product definitions for checkout sessions.
 */

export const PRODUCTS = {
  TOP_PIX: {
    name: "TOP Destemidos Pioneiros — Porto Velho/RO (Pix)",
    description: "Inscrição no TOP Destemidos Pioneiros com desconto Pix. Inclui: Kit do participante, alimentação durante o evento, 72h de experiência transformadora.",
    amountCents: 179000, // R$ 1.790,00
    currency: "brl",
    paymentMethod: "pix" as const,
  },
  TOP_CARD: {
    name: "TOP Destemidos Pioneiros — Porto Velho/RO (Cartão)",
    description: "Inscrição no TOP Destemidos Pioneiros parcelado no cartão. Inclui: Kit do participante, alimentação durante o evento, 72h de experiência transformadora.",
    amountCents: 199000, // R$ 1.990,00 (10x R$ 199,00)
    currency: "brl",
    paymentMethod: "card" as const,
  },
} as const;

export type ProductKey = keyof typeof PRODUCTS;
