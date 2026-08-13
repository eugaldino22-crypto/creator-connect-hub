import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ShieldCheck, Save } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { LoadingBlock, EmptyBlock } from "@/components/common/StateBlocks";

export function SuperAdminSettingsPanel(){
 const client=useQueryClient(); const [message,setMessage]=useState(""); const [rateInput,setRateInput]=useState<string|null>(null);
 const q=useQuery({queryKey:["super-admin-settings"],queryFn:async()=>{const {data,error}=await supabase.from("platform_settings").select("key,value,description,updated_at").order("key");if(error)throw error;return data??[];}});
 if(q.isLoading)return <LoadingBlock/>; if(q.error)return <EmptyBlock title="Configurações indisponíveis" description="Verifique se a migration do Super Admin foi aplicada."/>;
 const get=(key:string,fallback:any)=>q.data?.find((x:any)=>x.key===key)?.value??fallback;
 async function save(key:string,value:any){setMessage("");const {error}=await supabase.rpc("update_platform_setting",{_key:key,_value:value});if(error){setMessage(error.message);return;}setMessage("Configuração salva.");client.invalidateQueries({queryKey:["super-admin-settings"]});}
 const storedRate=Number(get("commission_rate",0.15))*100; const rate=rateInput??String(storedRate); const registrations=Boolean(get("registrations_enabled",true)); const currencies=get("supported_currencies",[]); const regions=get("supported_regions",[]);
 return <div className="space-y-5"><div className="flex items-center gap-3"><div className="rounded-xl bg-primary/10 p-2"><ShieldCheck className="size-5 text-primary"/></div><div><h2 className="text-xl font-semibold">Configurações globais</h2><p className="text-sm text-muted-foreground">Somente Super Admin pode alterar estes parâmetros.</p></div></div>
 <div className="surface-card p-5"><h3 className="font-semibold">Monetização</h3><p className="mt-1 text-xs text-muted-foreground">Percentual retido pela SECRET.</p><div className="mt-4 flex max-w-sm gap-2"><Input type="number" min="0" max="100" step="0.1" value={rate} onChange={e=>setRateInput(e.target.value)}/><Button onClick={()=>{const n=Number(rate);if(n>=0&&n<=100)save("commission_rate",n/100)}}><Save className="mr-2 size-4"/>Salvar</Button></div></div>
 <div className="surface-card flex items-center justify-between gap-4 p-5"><div><h3 className="font-semibold">Novos cadastros</h3><p className="text-xs text-muted-foreground">Controla globalmente a abertura de novas contas.</p></div><Switch checked={registrations} onCheckedChange={v=>save("registrations_enabled",v)}/></div>
 <div className="grid gap-5 lg:grid-cols-2"><div className="surface-card p-5"><h3 className="font-semibold">Moedas suportadas</h3><p className="mt-1 text-xs text-muted-foreground">Lista inicial configurada no banco.</p><div className="mt-4 flex flex-wrap gap-2">{currencies.map((c:string)=><span key={c} className="rounded-full bg-secondary px-3 py-1 text-xs">{c}</span>)}</div></div><div className="surface-card p-5"><h3 className="font-semibold">Países / regiões</h3><p className="mt-1 text-xs text-muted-foreground">Códigos habilitados inicialmente.</p><div className="mt-4 flex flex-wrap gap-2">{regions.map((r:string)=><span key={r} className="rounded-full bg-secondary px-3 py-1 text-xs">{r}</span>)}</div></div></div>{message&&<p className="text-sm text-muted-foreground">{message}</p>}</div>;
}
