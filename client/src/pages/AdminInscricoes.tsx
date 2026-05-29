import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Link } from "wouter";
import { ArrowLeft, Users, Shield, CheckCircle2, XCircle, Clock, MessageCircle, Eye } from "lucide-react";

export default function AdminInscricoes() {
  const [filter, setFilter] = useState<"all" | "participante" | "servo">("all");
  const { data: registrations, isLoading, refetch } = trpc.registration.list.useQuery(
    filter === "all" ? undefined : { type: filter }
  );
  const updateStatus = trpc.registration.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Status atualizado!");
      refetch();
    },
  });

  const statusColors: Record<string, string> = {
    draft: "text-zinc-400 bg-zinc-800",
    submitted: "text-yellow-400 bg-yellow-400/10",
    approved: "text-green-400 bg-green-400/10",
    rejected: "text-red-400 bg-red-400/10",
  };

  const statusLabels: Record<string, string> = {
    draft: "Rascunho",
    submitted: "Enviada",
    approved: "Aprovada",
    rejected: "Rejeitada",
  };

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-[#FF4500]">Inscrições</h1>
            <p className="text-sm text-zinc-400">Gerenciar participantes e servos</p>
          </div>
          <div className="flex gap-2">
            <Link href="/admin/whatsapp">
              <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-300">
                <MessageCircle className="w-4 h-4 mr-1" /> WhatsApp
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-300">
                <ArrowLeft className="w-4 h-4 mr-1" /> Início
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container max-w-6xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <Select value={filter} onValueChange={(v: any) => setFilter(v)}>
            <SelectTrigger className="w-48 bg-zinc-800 border-zinc-700">
              <SelectValue placeholder="Filtrar por tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="participante">Participantes</SelectItem>
              <SelectItem value="servo">Servos</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-zinc-400">
            {registrations?.length || 0} inscrições encontradas
          </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="pt-4 pb-4 text-center">
              <Users className="w-6 h-6 mx-auto mb-1 text-blue-400" />
              <p className="text-xl font-bold">{registrations?.filter((r: any) => r.type === "participante").length || 0}</p>
              <p className="text-xs text-zinc-400">Participantes</p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="pt-4 pb-4 text-center">
              <Shield className="w-6 h-6 mx-auto mb-1 text-purple-400" />
              <p className="text-xl font-bold">{registrations?.filter((r: any) => r.type === "servo").length || 0}</p>
              <p className="text-xs text-zinc-400">Servos</p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="pt-4 pb-4 text-center">
              <CheckCircle2 className="w-6 h-6 mx-auto mb-1 text-green-400" />
              <p className="text-xl font-bold">{registrations?.filter((r: any) => r.status === "approved").length || 0}</p>
              <p className="text-xs text-zinc-400">Aprovadas</p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="pt-4 pb-4 text-center">
              <Clock className="w-6 h-6 mx-auto mb-1 text-yellow-400" />
              <p className="text-xl font-bold">{registrations?.filter((r: any) => r.status === "submitted").length || 0}</p>
              <p className="text-xs text-zinc-400">Pendentes</p>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="text-center py-12 text-zinc-400">Carregando inscrições...</div>
        ) : !registrations?.length ? (
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="py-12 text-center">
              <Users className="w-12 h-12 mx-auto mb-4 text-zinc-600" />
              <p className="text-zinc-400">Nenhuma inscrição encontrada.</p>
              <p className="text-sm text-zinc-500 mt-1">As inscrições aparecerão aqui quando os formulários forem preenchidos.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {registrations.map((reg: any) => (
              <Card key={reg.id} className="bg-zinc-900 border-zinc-800">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${reg.type === "servo" ? "bg-purple-500/10" : "bg-blue-500/10"}`}>
                        {reg.type === "servo" ? (
                          <Shield className="w-5 h-5 text-purple-400" />
                        ) : (
                          <Users className="w-5 h-5 text-blue-400" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium text-white">{reg.fullName}</h4>
                        <p className="text-sm text-zinc-400">
                          {reg.city}/{reg.state} • {reg.whatsapp} • {reg.type === "servo" ? "Servo" : "Participante"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[reg.status]}`}>
                        {statusLabels[reg.status]}
                      </span>
                      <div className="flex gap-1">
                        {reg.status === "submitted" && (
                          <>
                            <Button size="sm" variant="ghost" className="text-green-400 hover:text-green-300"
                              onClick={() => updateStatus.mutate({ id: reg.id, status: "approved" })}>
                              <CheckCircle2 className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300"
                              onClick={() => updateStatus.mutate({ id: reg.id, status: "rejected" })}>
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
