/**
 * Payment gateway boundary.
 *
 * No gateway is connected yet and no payment is ever simulated. Subscriptions
 * are created with status `pending` and only a real gateway webhook (added in
 * the next step) may promote them to `active` and write transactions.
 */
export const PAYMENTS = {
  configured: false,
  provider: null as string | null,
  currency: "BRL",
  /** Platform commission applied to gross revenue, per creator profile. */
  defaultCommissionRate: 0.1,
};

export type CheckoutIntent = {
  planId: string;
  creatorId: string;
  priceCents: number;
  currency: string;
};

export type CheckoutResult =
  | { status: "gateway_not_configured"; subscriptionId: string }
  | { status: "redirect"; url: string };

/**
 * Single integration point for the future gateway. Today it returns
 * `gateway_not_configured` so the UI can show an honest pending state.
 */
export async function startCheckout(_intent: CheckoutIntent, subscriptionId: string): Promise<CheckoutResult> {
  if (!PAYMENTS.configured) {
    return { status: "gateway_not_configured", subscriptionId };
  }
  throw new Error("Gateway configurado sem implementação de redirecionamento.");
}