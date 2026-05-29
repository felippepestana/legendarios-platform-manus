import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { ArrowLeft, MessageCircle, CheckCircle2, Clock, XCircle, Send, BarChart3, Users, Shield } from "lucide-react";

export default function AdminWhatsApp() {
  const { data: stats, isLoading } = trpc.registration.whatsappDashboard.useQuery();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center">
        <div className="animate-pulse text-zinc-400">Carregando dashboard...</div>
      </div>
    );
  }

  const statCards = [
    { label: "Total Enviadas", value: stats?.total || 0, icon: Send, color: "text-blue-400" },
    { label: "Entregues", value: stats?.delivered || 0, icon: CheckCircle2, color: "text-green-400" },
    { label: "Lidas", value: stats?.read || 0, icon: MessageCircle, color: "text-cyan-400" },
    { label: "Respondidas", value: stats?.responded || 0, icon: BarChart3, color: "text-purple-400" },
    { label: "Autorizadas", value: stats?.authorized || 0, icon: Shield, color: "text-emerald-400" },
    { label: "Pendentes", value: stats?.pending || 0, icon: Clock, color: "text-yellow-400" },
    { label: "Falhas", value: stats?.failed || 0, icon: XCircle, color: "text-red-400" },
  ];

  const totalResponded = (stats?.responded || 0);
  const totalAuthorized = (stats?.authorized || 0);
  const responseRate = stats?.total ? Math.round((totalResponded / stats.total) * 100) : 0;
  const authorizationRate = totalResponded ? Math.round((totalAuthorized / totalResponded) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-[#FF4500]">Dashboard WhatsApp</h1>
            <p className="text-sm text-zinc-400">Controle de mensagens de autorização</p>
          </div>
          <div className="flex gap-2">
            <Link href="/admin/inscricoes">
              <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-300">
                <Users className="w-4 h-4 mr-1" /> Inscrições
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
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
          {statCards.map((stat) => (
            <Card key={stat.label} className="bg-zinc-900 border-zinc-800">
              <CardContent className="pt-4 pb-4 text-center">
                <stat.icon className={`w-6 h-6 mx-auto mb-2 ${stat.color}`} />
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-zinc-400">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Rates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white text-base">Taxa de Resposta</CardTitle>
              <CardDescription>Percentual de contatos que responderam</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="text-4xl font-bold text-[#FF4500]">{responseRate}%</div>
                <div className="flex-1">
                  <div className="w-full bg-zinc-800 rounded-full h-3">
                    <div className="bg-[#FF4500] h-3 rounded-full transition-all" style={{ width: `${responseRate}%` }} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white text-base">Taxa de Autorização</CardTitle>
              <CardDescription>Percentual de respostas com autorização</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="text-4xl font-bold text-emerald-400">{authorizationRate}%</div>
                <div className="flex-1">
                  <div className="w-full bg-zinc-800 rounded-full h-3">
                    <div className="bg-emerald-400 h-3 rounded-full transition-all" style={{ width: `${authorizationRate}%` }} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Info Card */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white text-base flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-[#FF4500]" /> Como funciona
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-zinc-400">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-bold text-white mb-2">Para Participantes:</h4>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Mensagem enviada para a <strong className="text-zinc-200">mãe</strong> ou responsável</li>
                  <li>Solicita autorização e bênção para participação</li>
                  <li>Aceita resposta por texto ou áudio</li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-white mb-2">Para Servos:</h4>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Mensagem enviada para a <strong className="text-zinc-200">mãe</strong> ou responsável</li>
                  <li>Mensagem enviada para o <strong className="text-zinc-200">líder espiritual</strong></li>
                  <li>Ambas as autorizações são necessárias</li>
                </ul>
              </div>
            </div>

            <div className="p-4 bg-zinc-800 rounded-lg mt-4">
              <h4 className="font-bold text-white mb-2">Configuração necessária:</h4>
              <p className="text-zinc-400">
                Para ativar o envio real de mensagens, configure as variáveis de ambiente:
              </p>
              <ul className="mt-2 space-y-1 font-mono text-xs">
                <li className="text-yellow-400">WHATSAPP_PHONE_NUMBER_ID</li>
                <li className="text-yellow-400">WHATSAPP_ACCESS_TOKEN</li>
                <li className="text-yellow-400">WHATSAPP_VERIFY_TOKEN</li>
              </ul>
              <p className="mt-2 text-zinc-500">
                Obtenha em: Meta Business Manager → WhatsApp → Configurações da API
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
