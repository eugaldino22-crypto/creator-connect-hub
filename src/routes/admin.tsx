import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck, Users, UserCheck, FileText, Flag, CreditCard, Wallet } from "lucide-react";
import { RoleGate } from "@/components/auth/RoleGate";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { EmptyBlock } from "@/components/common/StateBlocks";

export const Route = createFileRoute("/admin")({ component: AdminHome });

const items = [
  ["users","Usuários",Users],["creators","Criadores",UserCheck],["posts","Publicações",FileText],["reports","Denúncias",Flag],["transactions","Transações",CreditCard],["payouts","Saques",Wallet],
] as const;

function AdminHome(){return <RoleGate allowed={["admin","super_admin"]}><AppShell title="Administração"><div className="flex items-start justify-between gap-4"><div><h2 className="text-2xl font-semibold">Central operacional</h2><p className="mt-1 text-sm text-muted-foreground">Moderação, suporte e operações da SECRET.</p></div><ShieldCheck className="size-7 text-primary"/></div><div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{items.map(([slug,label,Icon])=><Link key={slug} to="/admin/$section" params={{section:slug}} className="surface-card p-5 transition hover:border-primary/40"><Icon className="size-5 text-primary"/><h3 className="mt-4 font-semibold">{label}</h3><p className="mt-1 text-sm text-muted-foreground">Gerenciar {label.toLowerCase()}.</p></Link>)}</div><div className="mt-7"><EmptyBlock title="Dados operacionais" description="Os indicadores e tabelas serão carregados diretamente do banco, sem métricas simuladas." action={<Button asChild variant="secondary"><Link to="/super-admin">Ver Super Admin</Link></Button>}/></div></AppShell></RoleGate>}
