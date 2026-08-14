import { ChevronDown } from "lucide-react";
import { useLocale, LOCALES, setLocale, t, type Locale } from "@/lib/i18n";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";

function flagForLocale(code: string) {
  const countryByLanguage: Record<string, string> = { ar: "SA", he: "IL" };
  const country = code.split("-")[1] ?? countryByLanguage[code] ?? "US";
  return String.fromCodePoint(...country.toUpperCase().split("").map((char) => 127397 + char.charCodeAt(0)));
}

export function FooterLanguageSwitcher() {
  const locale = useLocale();
  const current = (LOCALES.find((item) => item.code === locale) ?? LOCALES[0]) as LocaleInfo;

  return (
    <Select value={locale} onValueChange={(value) => setLocale(value as Locale)}>
      <SelectTrigger
        aria-label={t("language", locale)}
        className="h-14 w-[270px] justify-between rounded-full border-white/15 bg-white/[0.035] px-5 shadow-none hover:bg-white/[0.055]"
      >
        <span className="flex items-center gap-4">
          <span aria-hidden="true" className="text-2xl leading-none">{flagForLocale(current.code)}</span>
          <span className="flex items-baseline gap-3 whitespace-nowrap">
            <span className="text-base font-semibold">{current.code.split("-")[0].toUpperCase()}</span>
            <span className="text-base text-muted-foreground">{current.nativeLabel}</span>
          </span>
        </span>
        <ChevronDown className="size-6 shrink-0 text-muted-foreground" />
      </SelectTrigger>
      <SelectContent align="end" sideOffset={8} className="z-[200] max-h-[70vh] min-w-[270px]">
        {LOCALES.map((item) => (
          <SelectItem key={item.code} value={item.code} className="py-3">
            <span className="flex items-center gap-3">
              <span aria-hidden="true" className="text-xl leading-none">{flagForLocale(item.code)}</span>
              <span className="font-semibold">{item.code.split("-")[0].toUpperCase()}</span>
              <span className="text-muted-foreground">{item.nativeLabel}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
