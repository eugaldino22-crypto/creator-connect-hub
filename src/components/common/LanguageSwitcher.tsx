import { Globe2 } from "lucide-react";
import { useLocale, LOCALES, setLocale, t, type Locale } from "@/lib/i18n";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function flagForLocale(code: string) {
  const countryByLanguage: Record<string, string> = { ar: "SA", he: "IL" };
  const country = code.split("-")[1] ?? countryByLanguage[code] ?? "US";
  return String.fromCodePoint(
    ...country.toUpperCase().split("").map((char) => 127397 + char.charCodeAt(0)),
  );
}

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const locale = useLocale();
  const current = LOCALES.find((item) => item.code === locale) ?? LOCALES[0];

  if (compact) {
    return (
      <div
        aria-label={t("language", locale)}
        className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.025] px-2.5 py-2"
      >
        {LOCALES.map((item) => {
          const active = item.code === locale;
          return (
            <button
              key={item.code}
              type="button"
              title={item.nativeLabel}
              aria-label={item.nativeLabel}
              aria-pressed={active}
              onClick={() => setLocale(item.code as Locale)}
              className={`flex h-8 min-w-8 items-center justify-center rounded-lg px-1.5 text-base leading-none transition ${
                active ? "bg-white/[0.10] ring-1 ring-white/15" : "opacity-65 hover:bg-white/[0.06] hover:opacity-100"
              }`}
            >
              {flagForLocale(item.code)}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <Select value={locale} onValueChange={(value) => setLocale(value as Locale)}>
      <SelectTrigger
        aria-label={t("language", locale)}
        className="h-10 w-[154px] justify-between rounded-full px-3"
      >
        <span className="flex items-center gap-2">
          <span aria-hidden="true" className="text-base leading-none">
            {flagForLocale(current.code)}
          </span>
          <span className="truncate text-sm">{current.nativeLabel}</span>
        </span>
        <Globe2 className="size-4 shrink-0" />
      </SelectTrigger>
      <SelectContent align="end" sideOffset={8} className="z-[200] max-h-[70vh] min-w-[210px]">
        {LOCALES.map((item) => (
          <SelectItem key={item.code} value={item.code} className="py-2.5">
            <span className="flex items-center gap-3">
              <span aria-hidden="true" className="text-base leading-none">
                {flagForLocale(item.code)}
              </span>
              <span className="truncate">{item.nativeLabel}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
