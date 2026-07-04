import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  QrCode,
  Users,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
  Search,
  Loader2,
  ArrowLeft,
  Zap,
  UserCheck,
} from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

export default function AdminCheckin() {
  const { user, loading } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: stats, refetch: refetchStats } = trpc.checkin.stats.useQuery(undefined, {
    enabled: !!user,
    refetchInterval: 10000, // Auto-refresh every 10s
  });

  const { data: checkins, refetch: refetchCheckins } = trpc.checkin.list.useQuery(undefined, {
    enabled: !!user,
  });

  const generateBulkMutation = trpc.checkin.generateBulk.useMutation({
    onSuccess: (data) => {
      toast.success(`${data.generated} QR Codes gerados de ${data.total} inscrições confirmadas.`);
      refetchCheckins();
      refetchStats();
    },
    onError: (err) => {
      toast.error(`Erro ao gerar QR Codes: ${err.message}`);
    },
  });

  const manualCheckinMutation = trpc.checkin.manualCheckin.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Check-in manual realizado com sucesso!");
        refetchCheckins();
        refetchStats();
      } else {
        toast.error(data.error || "Erro ao realizar check-in manual.");
      }
    },
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!user) {
    window.location.href = getLoginUrl();
    return null;
  }

  if (user.role !== "admin") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Acesso Restrito</h2>
            <p className="text-muted-foreground">Esta página é exclusiva para administradores.</p>
            <Link href="/">
              <Button variant="outline" className="mt-4">
                <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filteredCheckins = checkins?.filter((c: any) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      c.registrationId?.toString().includes(term) ||
      c.qrCodeToken?.toLowerCase().includes(term) ||
      c.status?.toLowerCase().includes(term)
    );
  }) || [];

  const handleManualCheckin = (registrationId: number) => {
    if (confirm("Confirma o check-in manual deste participante?")) {
      manualCheckinMutation.mutate({ registrationId, notes: "Check-in manual via painel admin" });
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <QrCode className="w-6 h-6 text-orange-500" />
              Controle de Presença
            </h1>
            <p className="text-sm text-muted-foreground">
              TOP 1870 — Destemidos Pioneiros | Atualização em tempo real
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/checkin/validar">
              <Button variant="outline" size="sm">
                <QrCode className="w-4 h-4 mr-2" /> Validar QR Code
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={() => { refetchStats(); refetchCheckins(); }}
            >
              <RefreshCw className="w-4 h-4 mr-2" /> Atualizar
            </Button>
            <Button
              size="sm"
              className="bg-orange-600 hover:bg-orange-700"
              onClick={() => generateBulkMutation.mutate()}
              disabled={generateBulkMutation.isPending}
            >
              {generateBulkMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Zap className="w-4 h-4 mr-2" />
              )}
              Gerar QR Codes em Massa
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-border/50">
            <CardContent className="p-4 text-center">
              <Users className="w-6 h-6 mx-auto text-blue-500 mb-1" />
              <p className="text-2xl font-bold text-foreground">{stats?.total || 0}</p>
              <p className="text-xs text-muted-foreground">Total Registrados</p>
            </CardContent>
          </Card>
          <Card className="border-green-500/30 bg-green-500/5">
            <CardContent className="p-4 text-center">
              <CheckCircle className="w-6 h-6 mx-auto text-green-500 mb-1" />
              <p className="text-2xl font-bold text-green-500">{stats?.checkedIn || 0}</p>
              <p className="text-xs text-muted-foreground">Check-in Realizado</p>
            </CardContent>
          </Card>
          <Card className="border-yellow-500/30 bg-yellow-500/5">
            <CardContent className="p-4 text-center">
              <Clock className="w-6 h-6 mx-auto text-yellow-500 mb-1" />
              <p className="text-2xl font-bold text-yellow-500">{stats?.pending || 0}</p>
              <p className="text-xs text-muted-foreground">Aguardando</p>
            </CardContent>
          </Card>
          <Card className="border-red-500/30 bg-red-500/5">
            <CardContent className="p-4 text-center">
              <XCircle className="w-6 h-6 mx-auto text-red-500 mb-1" />
              <p className="text-2xl font-bold text-red-500">{stats?.cancelled || 0}</p>
              <p className="text-xs text-muted-foreground">Cancelados</p>
            </CardContent>
          </Card>
        </div>

        {/* Progress Bar */}
        {stats && stats.total > 0 && (
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">Progresso do Check-in</span>
                <span className="text-sm text-muted-foreground">
                  {Math.round((stats.checkedIn / stats.total) * 100)}%
                </span>
              </div>
              <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-green-500 rounded-full transition-all duration-500"
                  style={{ width: `${(stats.checkedIn / stats.total) * 100}%` }}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search & List */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Lista de Check-ins</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por ID ou token..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 h-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left py-2 px-3 text-muted-foreground font-medium">ID</th>
                    <th className="text-left py-2 px-3 text-muted-foreground font-medium">Inscrição</th>
                    <th className="text-left py-2 px-3 text-muted-foreground font-medium">Status</th>
                    <th className="text-left py-2 px-3 text-muted-foreground font-medium">Método</th>
                    <th className="text-left py-2 px-3 text-muted-foreground font-medium">Check-in em</th>
                    <th className="text-left py-2 px-3 text-muted-foreground font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCheckins.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-muted-foreground">
                        {checkins?.length === 0
                          ? "Nenhum QR Code gerado ainda. Clique em 'Gerar QR Codes em Massa' para começar."
                          : "Nenhum resultado encontrado."}
                      </td>
                    </tr>
                  ) : (
                    filteredCheckins.map((checkin: any) => (
                      <tr key={checkin.id} className="border-b border-border/30 hover:bg-muted/20">
                        <td className="py-2 px-3 font-mono text-xs">{checkin.id}</td>
                        <td className="py-2 px-3">#{checkin.registrationId}</td>
                        <td className="py-2 px-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                              checkin.status === "checked_in"
                                ? "bg-green-500/20 text-green-400"
                                : checkin.status === "pending"
                                ? "bg-yellow-500/20 text-yellow-400"
                                : "bg-red-500/20 text-red-400"
                            }`}
                          >
                            {checkin.status === "checked_in" && <CheckCircle className="w-3 h-3" />}
                            {checkin.status === "pending" && <Clock className="w-3 h-3" />}
                            {checkin.status === "cancelled" && <XCircle className="w-3 h-3" />}
                            {checkin.status === "checked_in"
                              ? "Presente"
                              : checkin.status === "pending"
                              ? "Aguardando"
                              : "Cancelado"}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-xs text-muted-foreground">
                          {checkin.checkedInMethod === "qr_scan"
                            ? "QR Code"
                            : checkin.checkedInMethod === "manual"
                            ? "Manual"
                            : "—"}
                        </td>
                        <td className="py-2 px-3 text-xs text-muted-foreground">
                          {checkin.checkedInAt
                            ? new Date(checkin.checkedInAt).toLocaleString("pt-BR")
                            : "—"}
                        </td>
                        <td className="py-2 px-3">
                          {checkin.status === "pending" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => handleManualCheckin(checkin.registrationId)}
                              disabled={manualCheckinMutation.isPending}
                            >
                              <UserCheck className="w-3 h-3 mr-1" /> Check-in
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
