import { Globe2 } from "lucide-react";
import { useLocale, LOCALES, setLocale, t, type Locale } from "@/lib/i18n";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const locale = useLocale();

  return (
    <Select value={locale} onValueChange={(value) => setLocale(value as Locale)}>
      <SelectTrigger
        aria-label={t("language", locale)}
        className={compact ? "h-9 w-10 justify-center px-0" : "h-9 w-[170px]"}
      >
        <Globe2 className="size-4 shrink-0" />
        <SelectValue className={compact ? "sr-only" : undefined} />
      </SelectTrigger>
      <SelectContent align="end" className="max-h-[70vh]">
        {LOCALES.map((item) => (
          <SelectItem key={item.code} value={item.code}>
            {item.nativeLabel}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
