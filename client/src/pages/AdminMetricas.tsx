import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Shield, Loader2, BarChart3, Users, UserCheck, TrendingUp, MapPin, Calendar, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function AdminMetricas() {
  const { user, loading } = useAuth();

  const leadsQuery = trpc.leads.list.useQuery(undefined, { enabled: !!user && user.role === "admin" });
  const registrationsQuery = trpc.registration.list.useQuery(undefined, { enabled: !!user && user.role === "admin" });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-xl font-bold text-foreground">Acesso Restrito</h1>
          <p className="text-muted-foreground mt-2">Apenas administradores podem acessar esta pagina.</p>
        </div>
      </div>
    );
  }

  const leads = (leadsQuery.data ?? []) as any[];
  const registrations = (registrationsQuery.data ?? []) as any[];

  // Métricas de funil
  const totalLeads = leads.length;
  const leadsContacted = leads.filter((l: any) => l.status === "contacted").length;
  const leadsRegistered = leads.filter((l: any) => l.status === "registered").length;
  const leadsConfirmed = leads.filter((l: any) => l.status === "confirmed").length;

  const totalRegistrations = registrations.length;
  const participantes = registrations.filter((r: any) => r.registrationType === "participante").length;
  const servos = registrations.filter((r: any) => r.registrationType === "servo").length;
  const pendingRegistrations = registrations.filter((r: any) => r.status === "pending").length;
  const approvedRegistrations = registrations.filter((r: any) => r.status === "approved").length;
  const confirmedRegistrations = registrations.filter((r: any) => r.status === "confirmed").length;

  // Distribuição por cidade
  const cityMap: Record<string, number> = {};
  leads.forEach((l: any) => {
    const city = l.city || "Nao informada";
    cityMap[city] = (cityMap[city] || 0) + 1;
  });
  const topCities = Object.entries(cityMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  // Evolução temporal (últimos 30 dias)
  const now = new Date();
  const daysData: { date: string; leads: number; registrations: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const dayLeads = leads.filter((l: any) => {
      const created = new Date(l.createdAt).toISOString().split("T")[0];
      return created === dateStr;
    }).length;
    const dayRegs = registrations.filter((r: any) => {
      const created = new Date(r.createdAt).toISOString().split("T")[0];
      return created === dateStr;
    }).length;
    daysData.push({ date: dateStr, leads: dayLeads, registrations: dayRegs });
  }

  const maxDayValue = Math.max(...daysData.map((d) => d.leads + d.registrations), 1);

  // Taxa de conversão
  const conversionRate = totalLeads > 0 ? ((totalRegistrations / totalLeads) * 100).toFixed(1) : "0";

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <BarChart3 className="w-6 h-6 text-primary" />
            <div>
              <h1 className="text-xl font-bold text-foreground">Metricas do Evento</h1>
              <p className="text-sm text-muted-foreground">Dashboard de conversao e acompanhamento</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* KPIs principais */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Users className="w-4 h-4" />
              <span className="text-xs font-medium uppercase">Total Leads</span>
            </div>
            <p className="text-3xl font-bold text-foreground">{totalLeads}</p>
            <p className="text-xs text-muted-foreground mt-1">Interessados captados</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <UserCheck className="w-4 h-4" />
              <span className="text-xs font-medium uppercase">Inscritos</span>
            </div>
            <p className="text-3xl font-bold text-foreground">{totalRegistrations}</p>
            <p className="text-xs text-muted-foreground mt-1">{participantes} participantes, {servos} servos</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs font-medium uppercase">Conversao</span>
            </div>
            <p className="text-3xl font-bold text-primary">{conversionRate}%</p>
            <p className="text-xs text-muted-foreground mt-1">Leads → Inscritos</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Calendar className="w-4 h-4" />
              <span className="text-xs font-medium uppercase">Confirmados</span>
            </div>
            <p className="text-3xl font-bold text-green-500">{confirmedRegistrations}</p>
            <p className="text-xs text-muted-foreground mt-1">{approvedRegistrations} aprovados, {pendingRegistrations} pendentes</p>
          </div>
        </div>

        {/* Funil de conversão */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Funil de Conversao</h2>
          <div className="space-y-3">
            {[
              { label: "Leads Captados", value: totalLeads, color: "bg-blue-500" },
              { label: "Contatados", value: leadsContacted, color: "bg-cyan-500" },
              { label: "Inscritos (Formulario)", value: totalRegistrations, color: "bg-amber-500" },
              { label: "Aprovados", value: approvedRegistrations, color: "bg-emerald-500" },
              { label: "Confirmados", value: confirmedRegistrations, color: "bg-green-600" },
            ].map((step, i) => {
              const width = totalLeads > 0 ? Math.max((step.value / totalLeads) * 100, 2) : 0;
              return (
                <div key={i} className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground w-44 shrink-0">{step.label}</span>
                  <div className="flex-1 bg-muted rounded-full h-8 overflow-hidden">
                    <div
                      className={`${step.color} h-full rounded-full flex items-center justify-end pr-3 transition-all duration-500`}
                      style={{ width: `${width}%` }}
                    >
                      {width > 10 && <span className="text-xs font-bold text-white">{step.value}</span>}
                    </div>
                  </div>
                  {width <= 10 && <span className="text-sm font-semibold text-foreground w-8">{step.value}</span>}
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Evolução temporal */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Evolucao (Ultimos 30 dias)</h2>
            <div className="flex items-end gap-[2px] h-40">
              {daysData.map((day, i) => {
                const height = maxDayValue > 0 ? ((day.leads + day.registrations) / maxDayValue) * 100 : 0;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center justify-end group relative">
                    <div
                      className="w-full bg-primary/70 rounded-t-sm transition-all hover:bg-primary"
                      style={{ height: `${Math.max(height, 2)}%` }}
                    ></div>
                    <div className="absolute bottom-full mb-1 hidden group-hover:block bg-popover text-popover-foreground text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap z-10">
                      {day.date.slice(5)}: {day.leads}L + {day.registrations}I
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>{daysData[0]?.date.slice(5)}</span>
              <span>{daysData[daysData.length - 1]?.date.slice(5)}</span>
            </div>
            <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-primary/70"></span> Leads + Inscricoes</span>
            </div>
          </div>

          {/* Distribuição por cidade */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" /> Distribuicao por Cidade
            </h2>
            {topCities.length === 0 ? (
              <p className="text-muted-foreground text-sm">Nenhum dado disponivel.</p>
            ) : (
              <div className="space-y-3">
                {topCities.map(([city, count], i) => {
                  const width = totalLeads > 0 ? (count / totalLeads) * 100 : 0;
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-sm text-foreground w-32 truncate shrink-0">{city}</span>
                      <div className="flex-1 bg-muted rounded-full h-5 overflow-hidden">
                        <div
                          className="bg-primary/60 h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(width, 3)}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold text-foreground w-10 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Resumo rápido */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Resumo de Status</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold text-blue-500">{leads.filter((l: any) => l.status === "new").length}</p>
              <p className="text-xs text-muted-foreground mt-1">Leads Novos</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold text-amber-500">{pendingRegistrations}</p>
              <p className="text-xs text-muted-foreground mt-1">Inscricoes Pendentes</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold text-emerald-500">{approvedRegistrations}</p>
              <p className="text-xs text-muted-foreground mt-1">Aprovados</p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{confirmedRegistrations}</p>
              <p className="text-xs text-muted-foreground mt-1">Confirmados</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
