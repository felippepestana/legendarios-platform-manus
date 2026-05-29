import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Link } from "wouter";
import { ArrowLeft, Download, Search, Users, UserCheck, UserPlus, Phone, Mail, MapPin, Filter, RefreshCw } from "lucide-react";

const STATUS_OPTIONS = [
  { value: "all", label: "Todos" },
  { value: "new", label: "Novo" },
  { value: "contacted", label: "Contatado" },
  { value: "registered", label: "Inscrito" },
  { value: "confirmed", label: "Confirmado" },
];

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  contacted: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  registered: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  confirmed: "bg-green-500/20 text-green-400 border-green-500/30",
};

const STATUS_LABELS: Record<string, string> = {
  new: "Novo",
  contacted: "Contatado",
  registered: "Inscrito",
  confirmed: "Confirmado",
};

const PAGE_SIZE = 10;

export default function AdminLeads() {
  const { user, loading: authLoading } = useAuth();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [cityFilter, setCityFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const queryInput = {
    ...(statusFilter !== "all" ? { status: statusFilter as any } : {}),
    ...(cityFilter ? { city: cityFilter } : {}),
    ...(searchQuery ? { search: searchQuery } : {}),
  };

  const { data: leads, isLoading, refetch } = trpc.leads.list.useQuery(
    Object.keys(queryInput).length > 0 ? queryInput : undefined
  );

  const updateStatus = trpc.leads.updateStatus.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Status atualizado!");
    },
    onError: (err) => toast.error(err.message),
  });

  const { data: csvData, refetch: fetchCsv } = trpc.leads.exportCsv.useQuery(
    Object.keys(queryInput).length > 0 ? queryInput : undefined,
    { enabled: false }
  );

  const handleExportCsv = async () => {
    const result = await fetchCsv();
    if (result.data?.csv) {
      const blob = new Blob([result.data.csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `leads_${new Date().toISOString().split("T")[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success(`${result.data.count} leads exportados!`);
    }
  };

  const handleStatusChange = (leadId: number, newStatus: string) => {
    updateStatus.mutate({ id: leadId, status: newStatus as any });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[#FF4500] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-zinc-900 border-zinc-800">
          <CardContent className="pt-8 text-center">
            <h2 className="text-xl font-bold text-white mb-2">Acesso Restrito</h2>
            <p className="text-zinc-400 mb-4">Apenas administradores podem acessar esta página.</p>
            <Link href="/">
              <Button variant="outline">Voltar ao Início</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Stats
  const totalLeads = leads?.length || 0;
  const newLeads = leads?.filter((l: any) => l.status === "new").length || 0;
  const contactedLeads = leads?.filter((l: any) => l.status === "contacted").length || 0;
  const confirmedLeads = leads?.filter((l: any) => l.status === "confirmed").length || 0;

  // Pagination
  const totalPages = Math.ceil(totalLeads / PAGE_SIZE);
  const paginatedLeads = leads?.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE) || [];

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white">
      {/* Header */}
      <div className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold">Gestão de Leads</h1>
                <p className="text-sm text-zinc-400">TOP Destemidos Pioneiros — Porto Velho/RO</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => refetch()} className="text-zinc-400">
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Button
                onClick={handleExportCsv}
                className="bg-[#FF4500] hover:bg-[#E63900] text-white"
                size="sm"
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar CSV
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Users className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{totalLeads}</p>
                  <p className="text-xs text-zinc-400">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-500/10">
                  <UserPlus className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{newLeads}</p>
                  <p className="text-xs text-zinc-400">Novos</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <Phone className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{contactedLeads}</p>
                  <p className="text-xs text-zinc-400">Contatados</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <UserCheck className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{confirmedLeads}</p>
                  <p className="text-xs text-zinc-400">Confirmados</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-zinc-900 border-zinc-800 mb-6">
          <CardContent className="pt-4 pb-4">
            <div className="flex flex-col md:flex-row gap-3 items-end">
              <div className="flex-1">
                <label className="text-xs text-zinc-400 mb-1 block">Buscar por nome</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <Input
                    placeholder="Buscar lead..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
              </div>
              <div className="w-full md:w-48">
                <label className="text-xs text-zinc-400 mb-1 block">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full md:w-48">
                <label className="text-xs text-zinc-400 mb-1 block">Cidade</label>
                <Input
                  placeholder="Filtrar cidade..."
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Leads Table */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <Filter className="w-5 h-5 text-[#FF4500]" />
              Leads ({leads?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin w-8 h-8 border-2 border-[#FF4500] border-t-transparent rounded-full" />
              </div>
            ) : !leads || leads.length === 0 ? (
              <div className="text-center py-12 text-zinc-400">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Nenhum lead encontrado</p>
                <p className="text-sm text-zinc-500 mt-1">Ajuste os filtros ou aguarde novos cadastros</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800 text-zinc-400">
                      <th className="text-left py-3 px-2 font-medium">Nome</th>
                      <th className="text-left py-3 px-2 font-medium hidden md:table-cell">E-mail</th>
                      <th className="text-left py-3 px-2 font-medium">WhatsApp</th>
                      <th className="text-left py-3 px-2 font-medium hidden md:table-cell">Cidade</th>
                      <th className="text-left py-3 px-2 font-medium">Status</th>
                      <th className="text-left py-3 px-2 font-medium hidden lg:table-cell">Data</th>
                      <th className="text-left py-3 px-2 font-medium">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedLeads.map((lead: any) => (
                      <tr key={lead.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                        <td className="py-3 px-2">
                          <div className="font-medium text-white">{lead.name}</div>
                          <div className="text-xs text-zinc-500 md:hidden">{lead.email}</div>
                        </td>
                        <td className="py-3 px-2 hidden md:table-cell">
                          <a href={`mailto:${lead.email}`} className="text-zinc-300 hover:text-[#FF4500] transition-colors flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {lead.email}
                          </a>
                        </td>
                        <td className="py-3 px-2">
                          <a
                            href={`https://wa.me/55${lead.whatsapp.replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-400 hover:text-green-300 transition-colors flex items-center gap-1"
                          >
                            <Phone className="w-3 h-3" />
                            {lead.whatsapp}
                          </a>
                        </td>
                        <td className="py-3 px-2 hidden md:table-cell">
                          <span className="flex items-center gap-1 text-zinc-300">
                            <MapPin className="w-3 h-3" />
                            {lead.city}
                          </span>
                        </td>
                        <td className="py-3 px-2">
                          <Badge className={`text-xs ${STATUS_COLORS[lead.status] || ""}`}>
                            {STATUS_LABELS[lead.status] || lead.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-2 hidden lg:table-cell text-zinc-400 text-xs">
                          {new Date(lead.createdAt).toLocaleDateString("pt-BR")}
                        </td>
                        <td className="py-3 px-2">
                          <Select
                            value={lead.status}
                            onValueChange={(val) => handleStatusChange(lead.id, val)}
                          >
                            <SelectTrigger className="h-7 text-xs bg-zinc-800 border-zinc-700 w-28">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="new">Novo</SelectItem>
                              <SelectItem value="contacted">Contatado</SelectItem>
                              <SelectItem value="registered">Inscrito</SelectItem>
                              <SelectItem value="confirmed">Confirmado</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-zinc-800">
                <p className="text-sm text-zinc-400">
                  Mostrando {((currentPage - 1) * PAGE_SIZE) + 1}-{Math.min(currentPage * PAGE_SIZE, totalLeads)} de {totalLeads}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="border-zinc-700 text-zinc-300 disabled:opacity-50"
                  >
                    Anterior
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <Button
                      key={page}
                      variant={page === currentPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className={page === currentPage ? "bg-[#FF4500] hover:bg-[#E63900]" : "border-zinc-700 text-zinc-300"}
                    >
                      {page}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="border-zinc-700 text-zinc-300 disabled:opacity-50"
                  >
                    Próximo
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
