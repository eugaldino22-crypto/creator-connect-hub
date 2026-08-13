export const BRAND = {
  name: "SECRET",
  tagline: "A global subscription platform for creators",
  description:
    "SECRET helps creators build communities, publish content, offer subscriptions and grow recurring revenue worldwide.",
} as const;

export const CREATOR_CATEGORIES = [
  "Education",
  "Music",
  "Art & Illustration",
  "Photography",
  "Fitness & Wellness",
  "Business",
  "Technology",
  "Food",
  "Podcast",
  "Other",
] as const;

export function formatCents(cents: number, currency = "USD", locale = "en-US") {
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format((cents ?? 0) / 100);
}

export function initials(name?: string | null) {
  if (!name) return "SE";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
