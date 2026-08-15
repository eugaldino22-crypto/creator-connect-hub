import { useState } from "react";
import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "@tanstack/react-router";
import { UserAvatar } from "@/components/common/UserAvatar";

type Result = {
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
};

export function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const navigate = useNavigate();

  async function search(value: string) {
    setQuery(value);

    if (!value.trim()) {
      setResults([]);
      return;
    }

    const { data } = await supabase
      .from("profiles")
      .select("username,display_name,avatar_url")
      .or(`display_name.ilike.%${value}%,username.ilike.%${value}%`)
      .limit(5);

    setResults((data ?? []) as Result[]);
  }

  return (
    <div className="relative hidden lg:block">
      <div className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2">
        <Search className="size-4 text-muted-foreground" />

        <input
          value={query}
          onChange={(e) => search(e.target.value)}
          placeholder="Buscar criadores, conteúdos..."
          className="w-56 bg-transparent text-xs outline-none placeholder:text-muted-foreground"
        />
      </div>

      {results.length > 0 && (
        <div className="absolute right-0 top-12 z-50 w-72 rounded-2xl border border-white/[0.08] bg-[#10111a] p-2 shadow-xl">
          {results.map((item) => (
            <button
              key={item.username}
              className="flex w-full items-center gap-3 rounded-xl p-2 text-left hover:bg-white/[0.05]"
              onClick={() =>
                item.username &&
                navigate({
                  to: "/c/$username",
                  params: {
                    username: item.username,
                  },
                })
              }
            >
              <UserAvatar name={item.display_name} path={item.avatar_url} className="size-8" />

              <span className="text-sm">{item.display_name ?? item.username}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
