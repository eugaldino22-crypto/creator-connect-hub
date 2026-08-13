import { createFileRoute, Link } from "@tanstack/react-router";
import { BarChart3, FilePlus2, Settings, Users, WalletCards } from "lucide-react";
import { RoleGate } from "@/components/auth/RoleGate";
import { AppShell } from "@/components/layout/AppShell";

export const Route = createFileRoute("/studio")({ component: StudioHome });
const items = [["posts","Publicações",BarChart3],["new","Nova publicação",FilePlus2],["plans","Planos",WalletCards],["subscribers","Assinantes",Users],["finance","Financeiro",WalletCards],["settings","Configurações",Settings]] as const;
function StudioHome(){return <RoleGate allowed={["creator"]}><AppShell title="Studio"><div><h2 className="text-2xl font-semibold">Seu Studio</h2><p className="mt-1 text-sm text-muted-foreground">Publique, cresça e acompanhe sua comunidade.</p></div><div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{items.map(([slug,label,Icon])=><Link key={slug} to="/studio/$section" params={{section:slug}} className="surface-card p-5 hover:border-primary/40"><Icon className="size-5 text-primary"/><h3 className="mt-4 font-semibold">{label}</h3><p className="mt-1 text-sm text-muted-foreground">Abrir {label.toLowerCase()}.</p></Link>)}</div></AppShell></RoleGate>}
