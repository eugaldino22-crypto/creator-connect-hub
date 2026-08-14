import { useEffect, useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/use-session";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

type NotificationItem = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  is_read: boolean;
  created_at: string;
};

export function NotificationBell() {
  const { data: current } = useCurrentUser();
  const client = useQueryClient();
  const [open, setOpen] = useState(false);
  const uid = current?.user.id;

  const q = useQuery({
    queryKey: ["notifications", uid],
    enabled: Boolean(uid),
    queryFn: async (): Promise<NotificationItem[]> => {
      const { data, error } = await supabase
        .from("notifications")
        .select("id,type,title,body,link,is_read,created_at")
        .eq("user_id", uid!)
        .order("created_at", { ascending: false })
        .limit(30);

      if (error) throw error;

      return (data ?? []) as unknown as NotificationItem[];
    },
  });

  useEffect(() => {
    if (!uid) return;

    const channel = supabase
      .channel(`notifications:${uid}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${uid}`,
        },
        () => {
          void client.invalidateQueries({
            queryKey: ["notifications", uid],
          });
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [uid, client]);

  const unread = q.data?.filter((notification) => !notification.is_read).length ?? 0;

  async function markRead(id: string) {
    await supabase.from("notifications").update({ is_read: true }).eq("id", id).eq("user_id", uid!);

    await client.invalidateQueries({
      queryKey: ["notifications", uid],
    });
  }

  async function markAll() {
    if (!uid) return;

    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", uid)
      .eq("is_read", false);

    await client.invalidateQueries({
      queryKey: ["notifications", uid],
    });
  }

  if (!uid) return null;

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        aria-label="Notificações"
        onClick={() => setOpen((value) => !value)}
        className="relative"
      >
        <Bell className="size-5" />

        {unread > 0 ? (
          <span className="absolute right-1 top-1 flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold leading-4 text-primary-foreground">
            {unread > 99 ? "99+" : unread}
          </span>
        ) : null}
      </Button>

      {open ? (
        <div className="absolute right-0 top-11 z-50 w-[min(92vw,380px)] overflow-hidden rounded-2xl border border-border bg-popover shadow-xl">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div>
              <p className="font-semibold">Notificações</p>

              <p className="text-xs text-muted-foreground">
                {unread ? `${unread} não lida${unread === 1 ? "" : "s"}` : "Tudo lido"}
              </p>
            </div>

            {unread ? (
              <Button variant="ghost" size="sm" onClick={() => void markAll()} className="gap-1">
                <CheckCheck className="size-4" />
                Ler todas
              </Button>
            ) : null}
          </div>

          <div className="max-h-[min(70vh,440px)] overflow-y-auto">
            {q.data?.length ? (
              q.data.slice(0, 12).map((notification) => (
                <Link
                  key={notification.id}
                  to={notification.link?.startsWith("/") ? notification.link : "/notifications"}
                  onClick={() => {
                    void markRead(notification.id);
                    setOpen(false);
                  }}
                  className={cn(
                    "block border-b border-border px-4 py-3 hover:bg-muted/60",
                    !notification.is_read && "bg-primary/5",
                  )}
                >
                  <div className="flex gap-3">
                    <span
                      className={cn(
                        "mt-1 size-2 shrink-0 rounded-full",
                        notification.is_read ? "bg-muted" : "bg-primary",
                      )}
                    />

                    <div className="min-w-0">
                      <p className="text-sm font-medium">{notification.title}</p>

                      {notification.body ? (
                        <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                          {notification.body}
                        </p>
                      ) : null}

                      <p className="mt-1 text-[10px] text-muted-foreground">
                        {new Date(notification.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="px-4 py-10 text-center text-sm text-muted-foreground">
                Nenhuma notificação.
              </div>
            )}
          </div>

          <div className="border-t border-border p-2">
            <Button asChild variant="ghost" className="w-full" onClick={() => setOpen(false)}>
              <Link to="/feed">Ver todas</Link>
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
