/**
 * Mock data used ONLY in development QA mode, and only when the real query
 * returns nothing. Real data always wins; nothing here reaches production.
 */
import { QA_ENABLED } from "@/lib/qa-preview";

export const MOCK_CREATOR_ID = "qa-mock-creator";

export function mockCreatorProfile(username: string) {
  if (!QA_ENABLED) return null;

  return {
    id: MOCK_CREATOR_ID,
    username: username || "criadora.demo",
    display_name: "Helena Marques",
    bio: "Aulas, bastidores e experiências ao vivo para a comunidade.",
    avatar_url: null,
    cover_url: null,
    creator_profiles: [
      {
        headline: "Educação criativa e mentorias ao vivo",
        category: "Educação",
        about:
          "Publico aulas semanais, bastidores de projetos e faço encontros ao vivo com quem assina. Conteúdo original, feito para quem quer evoluir de verdade.",
        is_verified: true,
        subscription_plans: [
          {
            id: "qa-mock-plan",
            name: "Comunidade",
            description: "Acesso a todas as publicações exclusivas, lives e chat direto.",
            price_cents: 2990,
            currency: "USD",
            is_active: true,
          },
        ],
      },
    ],
  };
}

export function mockCreatorPosts() {
  if (!QA_ENABLED) return [];
  const now = Date.now();

  return [
    {
      id: "qa-mock-post-1",
      creator_id: MOCK_CREATOR_ID,
      title: "Bastidores do novo projeto",
      body: "Mostrei todo o processo de criação desta semana — do rascunho ao resultado final.",
      visibility: "public",
      like_count: 128,
      comment_count: 14,
      created_at: new Date(now - 1000 * 60 * 60 * 6).toISOString(),
    },
    {
      id: "qa-mock-post-2",
      creator_id: MOCK_CREATOR_ID,
      title: "Aula exclusiva: composição avançada",
      body: "Vídeo completo de 42 minutos disponível para assinantes da comunidade.",
      visibility: "subscribers",
      like_count: 342,
      comment_count: 57,
      created_at: new Date(now - 1000 * 60 * 60 * 30).toISOString(),
    },
    {
      id: "qa-mock-post-3",
      creator_id: MOCK_CREATOR_ID,
      title: "Encontro ao vivo na quinta",
      body: "Reservei uma hora para responder perguntas da comunidade.",
      visibility: "subscribers",
      like_count: 91,
      comment_count: 8,
      created_at: new Date(now - 1000 * 60 * 60 * 72).toISOString(),
    },
  ];
}
