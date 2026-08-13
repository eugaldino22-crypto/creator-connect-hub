export const BRAND = {
  name: "Corella",
  tagline: "A plataforma de assinaturas para criadores independentes",
  description:
    "Corella é a plataforma onde educadores, músicos, artistas e especialistas publicam conteúdo, criam planos de assinatura e constroem uma comunidade paga com identidade própria.",
} as const;

export const CREATOR_CATEGORIES = [
  "Educação",
  "Música",
  "Arte e Ilustração",
  "Fotografia",
  "Fitness e Bem-estar",
  "Negócios",
  "Tecnologia",
  "Culinária",
  "Podcast",
  "Outros",
] as const;

export function formatCents(cents: number, currency = "BRL") {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency }).format((cents ?? 0) / 100);
}

export function initials(name?: string | null) {
  if (!name) return "CO";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}