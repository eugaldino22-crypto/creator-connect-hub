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
  const countryByLanguage: Record<string, string> = {
    ar: "SA",
    he: "IL",
  };
  const country = code.split("-")[1] ?? countryByLanguage[code] ?? "US";
  return String.fromCodePoint(...country.toUpperCase().split("").map((char) => 127397 + char.charCodeAt(0)));
}

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const locale = useLocale();
  const current = LOCALES.find((item) => item.code === locale) ?? LOCALES[0];

  return (
    <Select value={locale} onValueChange={(value) => setLocale(value as Locale)}>
      <SelectTrigger
        aria-label={t("language", locale)}
        className={compact ? "h-9 w-11 justify-center rounded-full px-0" : "h-10 w-[154px] justify-between rounded-full px-3"}
      >
        <span className="flex items-center gap-2">
          <span aria-hidden="true" className="text-base leading-none">{flagForLocale(current.code)}</span>
          {!compact ? <span className="truncate text-sm">{current.nativeLabel}</span> : <span className="sr-only">{current.nativeLabel}</span>}
        </span>
        {compact ? <Globe2 className="sr-only" /> : null}
      </SelectTrigger>
      <SelectContent align="end" sideOffset={8} className="max-h-[70vh] min-w-[210px]">
        {LOCALES.map((item) => (
          <SelectItem key={item.code} value={item.code} className="py-2.5">
            <span className="flex items-center gap-3">
              <span aria-hidden="true" className="text-base leading-none">{flagForLocale(item.code)}</span>
              <span className="truncate">{item.nativeLabel}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
