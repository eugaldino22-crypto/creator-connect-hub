/** Provider-agnostic payment boundary for SECRET. */
export const PAYMENTS = {
  configured: false,
  provider: "NOWPayments" as string | null,
  defaultCurrency: "USD",
  defaultCommissionRate: 0.15,
  methods: ["card", "bank_transfer", "crypto"] as const,
};

export type CheckoutIntent = {
  planId: string;
  creatorId: string;
  priceCents: number;
  currency: string;
  paymentMethod?: "card" | "bank_transfer" | "crypto";
};

export type CheckoutResult =
  | { status: "gateway_not_configured"; subscriptionId: string }
  | { status: "redirect"; url: string };

export async function startCheckout(
  _intent: CheckoutIntent,
  subscriptionId: string,
): Promise<CheckoutResult> {
  if (!PAYMENTS.configured) return { status: "gateway_not_configured", subscriptionId };
  throw new Error("Payment provider credentials are not configured.");
}
