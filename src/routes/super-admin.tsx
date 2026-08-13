import { createFileRoute, Link } from "@tanstack/react-router";
import { Settings, Shield, Users, Wallet, CreditCard, FileSearch } from "lucide-react";
import { RoleGate } from "@/components/auth/RoleGate";
import { AppShell } from "@/components/layout/AppShell";

export const Route = createFileRoute("/super-admin")({ component: SuperAdminHome });
const items = [["admins","Administradores",Users],["roles","Papéis e acesso",Shield],["finance","Financeiro global",Wallet],["payments","Pagamentos",CreditCard],["security","Segurança",Shield],["audit","Auditoria",FileSearch],["settings","Configurações",Settings]] as const;
function SuperAdminHome(){return <RoleGate allowed={["super_admin"]}><AppShell title="Super Admin"><div><h2 className="text-2xl font-semibold">Controle global da SECRET</h2><p className="mt-1 text-sm text-muted-foreground">Governança, segurança, finanças e configurações da plataforma.</p></div><div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{items.map(([slug,label,Icon])=><Link key={slug} to="/super-admin/$section" params={{section:slug}} className="surface-card p-5 transition hover:border-primary/40"><Icon className="size-5 text-primary"/><h3 className="mt-4 font-semibold">{label}</h3><p className="mt-1 text-sm text-muted-foreground">Abrir {label.toLowerCase()}.</p></Link>)}</div></AppShell></RoleGate>}
