import { useEffect, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, Users, CreditCard, MessageCircle, Loader2, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function Admin() {
  const { user, loading: authLoading } = useAuth();
  const [, navigate] = useLocation();

  // Redirect if not admin
  useEffect(() => {
    if (!authLoading && user?.role !== "admin") {
      navigate("/");
    }
  }, [user, authLoading, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0C0C0E] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-forge-gold" />
      </div>
    );
  }

  if (user?.role !== "admin") {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0C0C0E] text-white">
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
            Painel Administrativo
          </h1>
          <p className="text-white/60">Gestão de leads, depoimentos, pagamentos e métricas</p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="bg-white/5 border border-white/10">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-forge-gold data-[state=active]:text-[#0C0C0E]">
              <BarChart3 className="w-4 h-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="leads" className="data-[state=active]:bg-forge-gold data-[state=active]:text-[#0C0C0E]">
              <Users className="w-4 h-4 mr-2" />
              Leads
            </TabsTrigger>
            <TabsTrigger value="testimonials" className="data-[state=active]:bg-forge-gold data-[state=active]:text-[#0C0C0E]">
              <MessageCircle className="w-4 h-4 mr-2" />
              Depoimentos
            </TabsTrigger>
            <TabsTrigger value="orders" className="data-[state=active]:bg-forge-gold data-[state=active]:text-[#0C0C0E]">
              <CreditCard className="w-4 h-4 mr-2" />
              Pagamentos
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="mt-8">
            <DashboardTab />
          </TabsContent>

          {/* Leads Tab */}
          <TabsContent value="leads" className="mt-8">
            <LeadsTab />
          </TabsContent>

          {/* Testimonials Tab */}
          <TabsContent value="testimonials" className="mt-8">
            <TestimonialsTab />
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="mt-8">
            <OrdersTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// ─── Dashboard Tab ────────────────────────────────────────
function DashboardTab() {
  const { data: metrics, isLoading } = trpc.admin.metrics.useQuery();

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-forge-gold" /></div>;
  }

  const totalRevenueBRL = (metrics?.totalRevenueCents ?? 0) / 100;

  return (
    <div className="grid md:grid-cols-4 gap-4">
      <Card className="bg-white/5 border-white/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-white/70">Total de Leads</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-forge-gold">{metrics?.totalLeads ?? 0}</div>
          <p className="text-xs text-white/50 mt-1">Inscrições registradas</p>
        </CardContent>
      </Card>

      <Card className="bg-white/5 border-white/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-white/70">Pagamentos Confirmados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-emerald-400">{metrics?.totalOrders ?? 0}</div>
          <p className="text-xs text-white/50 mt-1">Transações bem-sucedidas</p>
        </CardContent>
      </Card>

      <Card className="bg-white/5 border-white/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-white/70">Receita Total</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-forge-gold">R$ {totalRevenueBRL.toLocaleString("pt-BR")}</div>
          <p className="text-xs text-white/50 mt-1">Faturamento acumulado</p>
        </CardContent>
      </Card>

      <Card className="bg-white/5 border-white/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-white/70">Taxa de Conversão</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-blue-400">
            {metrics?.totalLeads ? ((metrics.totalOrders / metrics.totalLeads) * 100).toFixed(1) : 0}%
          </div>
          <p className="text-xs text-white/50 mt-1">Leads → Pagamentos</p>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Leads Tab ────────────────────────────────────────────
function LeadsTab() {
  const [filters, setFilters] = useState({ city: "", event: "", status: "" });
  const { data: leads, isLoading } = trpc.admin.leads.useQuery(filters);
  const updateStatus = trpc.admin.updateLeadStatus.useMutation();

  const handleStatusChange = async (leadId: number, newStatus: string) => {
    try {
      await updateStatus.mutateAsync({ id: leadId, status: newStatus as 'new' | 'contacted' | 'registered' | 'confirmed' });
      toast.success("Status atualizado");
    } catch (e) {
      toast.error("Erro ao atualizar");
    }
  };

  const statusColors = {
    new: "bg-blue-500/20 text-blue-300",
    contacted: "bg-yellow-500/20 text-yellow-300",
    registered: "bg-purple-500/20 text-purple-300",
    confirmed: "bg-emerald-500/20 text-emerald-300",
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="grid md:grid-cols-3 gap-3">
        <Input
          placeholder="Filtrar por cidade..."
          value={filters.city}
          onChange={(e) => setFilters({ ...filters, city: e.target.value })}
          className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
        />
        <Select value={filters.event} onValueChange={(v) => setFilters({ ...filters, event: v })}>
          <SelectTrigger className="bg-white/5 border-white/10 text-white">
            <SelectValue placeholder="Filtrar por evento" />
          </SelectTrigger>
          <SelectContent className="bg-[#0C0C0E] border-white/10">
            <SelectItem value="">Todos os eventos</SelectItem>
            <SelectItem value="TOP Destemidos Pioneiros">TOP Destemidos Pioneiros</SelectItem>
            <SelectItem value="REM">REM</SelectItem>
            <SelectItem value="LEGADO">LEGADO</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filters.status} onValueChange={(v) => setFilters({ ...filters, status: v })}>
          <SelectTrigger className="bg-white/5 border-white/10 text-white">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent className="bg-[#0C0C0E] border-white/10">
            <SelectItem value="">Todos os status</SelectItem>
            <SelectItem value="new">Novo</SelectItem>
            <SelectItem value="contacted">Contatado</SelectItem>
            <SelectItem value="registered">Registrado</SelectItem>
            <SelectItem value="confirmed">Confirmado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card className="bg-white/5 border-white/10 overflow-hidden">
        <Table>
          <TableHeader className="bg-white/5">
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="text-white/70">Nome</TableHead>
              <TableHead className="text-white/70">E-mail</TableHead>
              <TableHead className="text-white/70">Cidade</TableHead>
              <TableHead className="text-white/70">Evento</TableHead>
              <TableHead className="text-white/70">Status</TableHead>
              <TableHead className="text-white/70">Ação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto text-forge-gold" />
                </TableCell>
              </TableRow>
            ) : leads?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-white/50">
                  Nenhum lead encontrado
                </TableCell>
              </TableRow>
            ) : (
              leads?.map((lead) => (
                <TableRow key={lead.id} className="border-white/5 hover:bg-white/5">
                  <TableCell className="text-white">{lead.name}</TableCell>
                  <TableCell className="text-white/70 text-sm">{lead.email}</TableCell>
                  <TableCell className="text-white/70">{lead.city}</TableCell>
                  <TableCell className="text-white/70 text-sm">{lead.event}</TableCell>
                  <TableCell>
                    <Badge className={`${statusColors[lead.status as keyof typeof statusColors]}`}>
                      {lead.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Select value={lead.status} onValueChange={(v) => handleStatusChange(lead.id, v)}>
                      <SelectTrigger className="w-32 bg-white/5 border-white/10 text-white text-xs h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0C0C0E] border-white/10">
                        <SelectItem value="new">Novo</SelectItem>
                        <SelectItem value="contacted">Contatado</SelectItem>
                        <SelectItem value="registered">Registrado</SelectItem>
                        <SelectItem value="confirmed">Confirmado</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

// ─── Testimonials Tab ─────────────────────────────────────
function TestimonialsTab() {
  const { data: testimonials, isLoading } = trpc.admin.testimonials.useQuery();
  const deleteTestimonial = trpc.testimonials.delete.useMutation();

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja deletar este depoimento?")) return;
    try {
      await deleteTestimonial.mutateAsync({ id });
      toast.success("Depoimento deletado");
    } catch (e) {
      toast.error("Erro ao deletar");
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {isLoading ? (
        <div className="col-span-2 flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-forge-gold" />
        </div>
      ) : testimonials?.length === 0 ? (
        <div className="col-span-2 text-center py-12 text-white/50">
          Nenhum depoimento registrado
        </div>
      ) : (
        testimonials?.map((t) => (
          <Card key={t.id} className="bg-white/5 border-white/10">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-white">{t.name}</CardTitle>
                  <CardDescription className="text-white/50">{t.city} • {t.event}</CardDescription>
                </div>
                {t.featured === 1 && <Badge className="bg-forge-gold/20 text-forge-gold">Destaque</Badge>}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-white/70 italic">"{t.quote}"</p>
              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className={`w-4 h-4 rounded-full ${i < (t.rating ?? 5) ? "bg-forge-gold" : "bg-white/20"}`} />
                  ))}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(t.id)}
                  className="text-red-400 border-red-400/30 hover:bg-red-400/10"
                >
                  Deletar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}

// ─── Orders Tab ───────────────────────────────────────────
function OrdersTab() {
  const { data: orders, isLoading } = trpc.admin.orders.useQuery();

  const statusColors = {
    pending: "bg-yellow-500/20 text-yellow-300",
    paid: "bg-emerald-500/20 text-emerald-300",
    failed: "bg-red-500/20 text-red-300",
    refunded: "bg-blue-500/20 text-blue-300",
  };

  const statusIcons = {
    pending: <Clock className="w-4 h-4" />,
    paid: <CheckCircle2 className="w-4 h-4" />,
    failed: <AlertCircle className="w-4 h-4" />,
    refunded: <AlertCircle className="w-4 h-4" />,
  };

  return (
    <Card className="bg-white/5 border-white/10 overflow-hidden">
      <Table>
        <TableHeader className="bg-white/5">
          <TableRow className="border-white/10 hover:bg-transparent">
            <TableHead className="text-white/70">ID Sessão</TableHead>
            <TableHead className="text-white/70">Cliente</TableHead>
            <TableHead className="text-white/70">Valor</TableHead>
            <TableHead className="text-white/70">Método</TableHead>
            <TableHead className="text-white/70">Status</TableHead>
            <TableHead className="text-white/70">Data</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8">
                <Loader2 className="w-5 h-5 animate-spin mx-auto text-forge-gold" />
              </TableCell>
            </TableRow>
          ) : orders?.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-white/50">
                Nenhum pagamento registrado
              </TableCell>
            </TableRow>
          ) : (
            orders?.map((order) => (
              <TableRow key={order.id} className="border-white/5 hover:bg-white/5">
                <TableCell className="text-white/70 text-xs font-mono">{order.stripeSessionId.slice(0, 12)}...</TableCell>
                <TableCell className="text-white">{order.customerName || "—"}</TableCell>
                <TableCell className="text-forge-gold font-semibold">R$ {(order.amountCents / 100).toLocaleString("pt-BR")}</TableCell>
                <TableCell className="text-white/70">
                  <Badge className="bg-white/10">{order.paymentMethod.toUpperCase()}</Badge>
                </TableCell>
                <TableCell>
                  <Badge className={statusColors[order.status as keyof typeof statusColors]}>
                    <span className="mr-1">{statusIcons[order.status as keyof typeof statusIcons]}</span>
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-white/50 text-sm">
                  {new Date(order.createdAt).toLocaleDateString("pt-BR")}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Card>
  );
}
