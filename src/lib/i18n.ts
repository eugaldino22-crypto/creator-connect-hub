import { useSyncExternalStore } from "react";

export const SUPPORTED_LOCALES = [
  "en-US",
  "pt-BR",
  "es-ES",
  "fr-FR",
  "de-DE",
  "it-IT",
  "nl-NL",
  "pl-PL",
  "tr-TR",
  "ru-RU",
  "uk-UA",
  "ar",
  "he",
  "hi-IN",
  "bn-BD",
  "id-ID",
  "ms-MY",
  "th-TH",
  "vi-VN",
  "ja-JP",
  "ko-KR",
  "zh-CN",
  "zh-TW",
  "fa-IR",
  "sw-KE",
  "fil-PH",
  "ro-RO",
  "cs-CZ",
  "sv-SE",
  "da-DK",
  "nb-NO",
  "fi-FI",
] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];
export type LocaleDirection = "ltr" | "rtl";

export type LocaleInfo = {
  code: Locale;
  label: string;
  nativeLabel: string;
  dir: LocaleDirection;
};

export const LOCALES: readonly LocaleInfo[] = [
  { code: "en-US", label: "English", nativeLabel: "English", dir: "ltr" },
  { code: "pt-BR", label: "Portuguese", nativeLabel: "Português", dir: "ltr" },
  { code: "es-ES", label: "Spanish", nativeLabel: "Español", dir: "ltr" },
  { code: "fr-FR", label: "French", nativeLabel: "Français", dir: "ltr" },
  { code: "de-DE", label: "German", nativeLabel: "Deutsch", dir: "ltr" },
  { code: "it-IT", label: "Italian", nativeLabel: "Italiano", dir: "ltr" },
  { code: "nl-NL", label: "Dutch", nativeLabel: "Nederlands", dir: "ltr" },
  { code: "pl-PL", label: "Polish", nativeLabel: "Polski", dir: "ltr" },
  { code: "tr-TR", label: "Turkish", nativeLabel: "Türkçe", dir: "ltr" },
  { code: "ru-RU", label: "Russian", nativeLabel: "Русский", dir: "ltr" },
  { code: "uk-UA", label: "Ukrainian", nativeLabel: "Українська", dir: "ltr" },
  { code: "ar", label: "Arabic", nativeLabel: "العربية", dir: "rtl" },
  { code: "he", label: "Hebrew", nativeLabel: "עברית", dir: "rtl" },
  { code: "hi-IN", label: "Hindi", nativeLabel: "हिन्दी", dir: "ltr" },
  { code: "bn-BD", label: "Bengali", nativeLabel: "বাংলা", dir: "ltr" },
  { code: "id-ID", label: "Indonesian", nativeLabel: "Bahasa Indonesia", dir: "ltr" },
  { code: "ms-MY", label: "Malay", nativeLabel: "Bahasa Melayu", dir: "ltr" },
  { code: "th-TH", label: "Thai", nativeLabel: "ไทย", dir: "ltr" },
  { code: "vi-VN", label: "Vietnamese", nativeLabel: "Tiếng Việt", dir: "ltr" },
  { code: "ja-JP", label: "Japanese", nativeLabel: "日本語", dir: "ltr" },
  { code: "ko-KR", label: "Korean", nativeLabel: "한국어", dir: "ltr" },
  { code: "zh-CN", label: "Chinese (Simplified)", nativeLabel: "简体中文", dir: "ltr" },
  { code: "zh-TW", label: "Chinese (Traditional)", nativeLabel: "繁體中文", dir: "ltr" },
  { code: "fa-IR", label: "Persian", nativeLabel: "فارسی", dir: "rtl" },
  { code: "sw-KE", label: "Swahili", nativeLabel: "Kiswahili", dir: "ltr" },
  { code: "fil-PH", label: "Filipino", nativeLabel: "Filipino", dir: "ltr" },
  { code: "ro-RO", label: "Romanian", nativeLabel: "Română", dir: "ltr" },
  { code: "cs-CZ", label: "Czech", nativeLabel: "Čeština", dir: "ltr" },
  { code: "sv-SE", label: "Swedish", nativeLabel: "Svenska", dir: "ltr" },
  { code: "da-DK", label: "Danish", nativeLabel: "Dansk", dir: "ltr" },
  { code: "nb-NO", label: "Norwegian", nativeLabel: "Norsk", dir: "ltr" },
  { code: "fi-FI", label: "Finnish", nativeLabel: "Suomi", dir: "ltr" },
] as const;

const STORAGE_KEY = "secret.locale";
const FALLBACK_LOCALE: Locale = "en-US";
let currentLocale: Locale = "pt-BR";
const listeners = new Set<() => void>();

function normalizeLocale(value?: string | null): Locale {
  if (!value) return FALLBACK_LOCALE;
  const exact = SUPPORTED_LOCALES.find((locale) => locale.toLowerCase() === value.toLowerCase());
  if (exact) return exact;
  const language = (value.split("-")[0] ?? "").toLowerCase();
  return (
    SUPPORTED_LOCALES.find((locale) => (locale.split("-")[0] ?? "").toLowerCase() === language) ??
    FALLBACK_LOCALE
  );
}

function detectInitialLocale(): Locale {
  if (typeof window === "undefined") return "pt-BR";
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (saved) return normalizeLocale(saved);
  return normalizeLocale(window.navigator.language);
}

if (typeof window !== "undefined") currentLocale = detectInitialLocale();

const dictionary = {
  "en-US": {
    feed: "Feed",
    explore: "Explore",
    messages: "Messages",
    subscriptions: "Subscriptions",
    studio: "Studio",
    admin: "Admin",
    superAdmin: "Super Admin",
    notifications: "Notifications",
    account: "My account",
    signOut: "Sign out",
    language: "Language",
    loading: "Loading…",
    retry: "Try again",
    notFound: "Page not found",
    backHome: "Back to SECRET",
    error: "We couldn't load this page",
  },
  "pt-BR": {
    feed: "Meu feed",
    explore: "Explorar",
    messages: "Mensagens",
    subscriptions: "Assinaturas",
    studio: "Studio",
    admin: "Administração",
    superAdmin: "Super Admin",
    notifications: "Notificações",
    account: "Minha conta",
    signOut: "Sair",
    language: "Idioma",
    loading: "Carregando…",
    retry: "Tentar novamente",
    notFound: "Página não encontrada",
    backHome: "Voltar para a SECRET",
    error: "Não foi possível carregar esta página",
  },
  "es-ES": {
    feed: "Mi feed",
    explore: "Explorar",
    messages: "Mensajes",
    subscriptions: "Suscripciones",
    studio: "Studio",
    admin: "Administración",
    superAdmin: "Super Admin",
    notifications: "Notificaciones",
    account: "Mi cuenta",
    signOut: "Cerrar sesión",
    language: "Idioma",
    loading: "Cargando…",
    retry: "Intentar de nuevo",
    notFound: "Página no encontrada",
    backHome: "Volver a SECRET",
    error: "No se pudo cargar esta página",
  },
  "fr-FR": {
    feed: "Mon fil",
    explore: "Explorer",
    messages: "Messages",
    subscriptions: "Abonnements",
    studio: "Studio",
    admin: "Administration",
    superAdmin: "Super Admin",
    notifications: "Notifications",
    account: "Mon compte",
    signOut: "Se déconnecter",
    language: "Langue",
    loading: "Chargement…",
    retry: "Réessayer",
    notFound: "Page introuvable",
    backHome: "Retour à SECRET",
    error: "Impossible de charger cette page",
  },
  "de-DE": {
    feed: "Mein Feed",
    explore: "Entdecken",
    messages: "Nachrichten",
    subscriptions: "Abonnements",
    studio: "Studio",
    admin: "Verwaltung",
    superAdmin: "Super Admin",
    notifications: "Benachrichtigungen",
    account: "Mein Konto",
    signOut: "Abmelden",
    language: "Sprache",
    loading: "Laden…",
    retry: "Erneut versuchen",
    notFound: "Seite nicht gefunden",
    backHome: "Zurück zu SECRET",
    error: "Diese Seite konnte nicht geladen werden",
  },
  "it-IT": {
    feed: "Il mio feed",
    explore: "Esplora",
    messages: "Messaggi",
    subscriptions: "Abbonamenti",
    studio: "Studio",
    admin: "Amministrazione",
    superAdmin: "Super Admin",
    notifications: "Notifiche",
    account: "Il mio account",
    signOut: "Esci",
    language: "Lingua",
    loading: "Caricamento…",
    retry: "Riprova",
    notFound: "Pagina non trovata",
    backHome: "Torna a SECRET",
    error: "Impossibile caricare questa pagina",
  },
  "nl-NL": {
    feed: "Mijn feed",
    explore: "Ontdekken",
    messages: "Berichten",
    subscriptions: "Abonnementen",
    studio: "Studio",
    admin: "Beheer",
    superAdmin: "Super Admin",
    notifications: "Meldingen",
    account: "Mijn account",
    signOut: "Uitloggen",
    language: "Taal",
    loading: "Laden…",
    retry: "Opnieuw proberen",
    notFound: "Pagina niet gevonden",
    backHome: "Terug naar SECRET",
    error: "Deze pagina kon niet worden geladen",
  },
  "pl-PL": {
    feed: "Mój kanał",
    explore: "Odkrywaj",
    messages: "Wiadomości",
    subscriptions: "Subskrypcje",
    studio: "Studio",
    admin: "Administracja",
    superAdmin: "Super Admin",
    notifications: "Powiadomienia",
    account: "Moje konto",
    signOut: "Wyloguj się",
    language: "Język",
    loading: "Ładowanie…",
    retry: "Spróbuj ponownie",
    notFound: "Nie znaleziono strony",
    backHome: "Wróć do SECRET",
    error: "Nie udało się załadować strony",
  },
  "tr-TR": {
    feed: "Akışım",
    explore: "Keşfet",
    messages: "Mesajlar",
    subscriptions: "Abonelikler",
    studio: "Studio",
    admin: "Yönetim",
    superAdmin: "Süper Admin",
    notifications: "Bildirimler",
    account: "Hesabım",
    signOut: "Çıkış yap",
    language: "Dil",
    loading: "Yükleniyor…",
    retry: "Tekrar dene",
    notFound: "Sayfa bulunamadı",
    backHome: "SECRET'e dön",
    error: "Bu sayfa yüklenemedi",
  },
  "ru-RU": {
    feed: "Моя лента",
    explore: "Обзор",
    messages: "Сообщения",
    subscriptions: "Подписки",
    studio: "Студия",
    admin: "Администрирование",
    superAdmin: "Супер-админ",
    notifications: "Уведомления",
    account: "Мой аккаунт",
    signOut: "Выйти",
    language: "Язык",
    loading: "Загрузка…",
    retry: "Повторить",
    notFound: "Страница не найдена",
    backHome: "Назад в SECRET",
    error: "Не удалось загрузить страницу",
  },
  "uk-UA": {
    feed: "Моя стрічка",
    explore: "Огляд",
    messages: "Повідомлення",
    subscriptions: "Підписки",
    studio: "Студія",
    admin: "Адміністрування",
    superAdmin: "Супер-адмін",
    notifications: "Сповіщення",
    account: "Мій акаунт",
    signOut: "Вийти",
    language: "Мова",
    loading: "Завантаження…",
    retry: "Спробувати ще раз",
    notFound: "Сторінку не знайдено",
    backHome: "Повернутися до SECRET",
    error: "Не вдалося завантажити сторінку",
  },
  ar: {
    feed: "موجزي",
    explore: "استكشاف",
    messages: "الرسائل",
    subscriptions: "الاشتراكات",
    studio: "الاستوديو",
    admin: "الإدارة",
    superAdmin: "المشرف العام",
    notifications: "الإشعارات",
    account: "حسابي",
    signOut: "تسجيل الخروج",
    language: "اللغة",
    loading: "جارٍ التحميل…",
    retry: "حاول مرة أخرى",
    notFound: "الصفحة غير موجودة",
    backHome: "العودة إلى SECRET",
    error: "تعذر تحميل هذه الصفحة",
  },
  he: {
    feed: "הפיד שלי",
    explore: "גילוי",
    messages: "הודעות",
    subscriptions: "מינויים",
    studio: "סטודיו",
    admin: "ניהול",
    superAdmin: "מנהל-על",
    notifications: "התראות",
    account: "החשבון שלי",
    signOut: "התנתק",
    language: "שפה",
    loading: "טוען…",
    retry: "נסה שוב",
    notFound: "הדף לא נמצא",
    backHome: "חזרה ל-SECRET",
    error: "לא ניתן לטעון את הדף",
  },
  "ja-JP": {
    feed: "フィード",
    explore: "探索",
    messages: "メッセージ",
    subscriptions: "サブスクリプション",
    studio: "スタジオ",
    admin: "管理",
    superAdmin: "スーパー管理者",
    notifications: "通知",
    account: "マイアカウント",
    signOut: "ログアウト",
    language: "言語",
    loading: "読み込み中…",
    retry: "再試行",
    notFound: "ページが見つかりません",
    backHome: "SECRETに戻る",
    error: "ページを読み込めませんでした",
  },
  "ko-KR": {
    feed: "내 피드",
    explore: "탐색",
    messages: "메시지",
    subscriptions: "구독",
    studio: "스튜디오",
    admin: "관리",
    superAdmin: "슈퍼 관리자",
    notifications: "알림",
    account: "내 계정",
    signOut: "로그아웃",
    language: "언어",
    loading: "로드 중…",
    retry: "다시 시도",
    notFound: "페이지를 찾을 수 없습니다",
    backHome: "SECRET으로 돌아가기",
    error: "페이지를 불러올 수 없습니다",
  },
  "zh-CN": {
    feed: "我的动态",
    explore: "探索",
    messages: "消息",
    subscriptions: "订阅",
    studio: "创作者工作室",
    admin: "管理",
    superAdmin: "超级管理员",
    notifications: "通知",
    account: "我的账户",
    signOut: "退出登录",
    language: "语言",
    loading: "加载中…",
    retry: "重试",
    notFound: "页面不存在",
    backHome: "返回 SECRET",
    error: "无法加载此页面",
  },
  "zh-TW": {
    feed: "我的動態",
    explore: "探索",
    messages: "訊息",
    subscriptions: "訂閱",
    studio: "創作者工作室",
    admin: "管理",
    superAdmin: "超級管理員",
    notifications: "通知",
    account: "我的帳戶",
    signOut: "登出",
    language: "語言",
    loading: "載入中…",
    retry: "重試",
    notFound: "找不到頁面",
    backHome: "返回 SECRET",
    error: "無法載入此頁面",
  },
} as const;

type TranslationKey = keyof (typeof dictionary)["en-US"];

export function getLocaleInfo(locale: Locale = getLocale()): LocaleInfo {
  return (LOCALES.find((item) => item.code === locale) ?? LOCALES[0]) as LocaleInfo;
}

export function getLocale(): Locale {
  return currentLocale;
}

export function setLocale(locale: Locale) {
  currentLocale = normalizeLocale(locale);
  if (typeof window !== "undefined") window.localStorage.setItem(STORAGE_KEY, currentLocale);
  listeners.forEach((listener) => listener());
}

export function useLocale(): Locale {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => currentLocale,
    () => "pt-BR" as Locale,
  );
}

export function t(key: TranslationKey, locale: Locale = getLocale()) {
  const selected = dictionary[locale as keyof typeof dictionary] as
    Partial<Record<TranslationKey, string>> | undefined;
  return selected?.[key] ?? dictionary["en-US"][key];
}

export function formatCurrency(value: number, currency = "USD", locale = getLocale()) {
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(value);
}

export function formatNumber(value: number, locale = getLocale()) {
  return new Intl.NumberFormat(locale).format(value);
}

export function formatDate(
  value: Date | string | number,
  locale = getLocale(),
  options: Intl.DateTimeFormatOptions = {},
) {
  return new Intl.DateTimeFormat(locale, options).format(new Date(value));
}

export function applyLocaleToDocument(locale = getLocale()) {
  if (typeof document === "undefined") return;
  const info = getLocaleInfo(locale);
  document.documentElement.lang = info.code;
  document.documentElement.dir = info.dir;
  document.documentElement.dataset["locale"] = info.code;
}
