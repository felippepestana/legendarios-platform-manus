import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { ArrowLeft, Edit, Plus, Star, Trash2, Eye, EyeOff } from "lucide-react";
import { Link } from "wouter";

export default function AdminTestimonials() {
  const { user, loading: authLoading } = useAuth();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const { data: testimonials, isLoading, refetch } = trpc.testimonials.all.useQuery();

  const createMutation = trpc.testimonials.create.useMutation({
    onSuccess: () => {
      toast.success("Depoimento criado com sucesso!");
      refetch();
      setShowCreateDialog(false);
    },
    onError: (err) => toast.error(err.message),
  });

  const updateMutation = trpc.testimonials.update.useMutation({
    onSuccess: () => {
      toast.success("Depoimento atualizado!");
      refetch();
      setEditingId(null);
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = trpc.testimonials.delete.useMutation({
    onSuccess: () => {
      toast.success("Depoimento removido!");
      refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-forge-gold border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center">
        <Card className="bg-white/[0.03] border-white/[0.08] max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-bold text-white mb-2">Acesso Restrito</h2>
            <p className="text-white/60 mb-4">
              Esta página é exclusiva para administradores.
            </p>
            <Link href="/">
              <Button variant="outline" className="border-forge-gold text-forge-gold hover:bg-forge-gold/10">
                Voltar ao Início
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F0F0F] p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="text-white/60 hover:text-white">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">Gerenciar Depoimentos</h1>
              <p className="text-white/50 text-sm">
                {testimonials?.length ?? 0} depoimentos cadastrados
              </p>
            </div>
          </div>

          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-forge-gold hover:bg-forge-gold/90 text-black font-semibold">
                <Plus className="w-4 h-4 mr-2" />
                Novo Depoimento
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#1a1a1a] border-white/[0.1] text-white max-w-lg">
              <DialogHeader>
                <DialogTitle>Criar Depoimento</DialogTitle>
              </DialogHeader>
              <TestimonialForm
                onSubmit={(data) => createMutation.mutate(data)}
                isLoading={createMutation.isPending}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* List */}
        {isLoading ? (
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 rounded-xl bg-white/[0.03] animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4">
            {testimonials?.map((t) => (
              <Card key={t.id} className="bg-white/[0.03] border-white/[0.08] hover:border-white/[0.15] transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-white font-semibold">{t.name}</h3>
                        <span className="text-white/40 text-xs px-2 py-0.5 rounded-full bg-white/[0.05]">
                          {t.city}
                        </span>
                        {t.featured === 1 && (
                          <span className="text-forge-gold text-xs px-2 py-0.5 rounded-full bg-forge-gold/10 flex items-center gap-1">
                            <Eye className="w-3 h-3" /> Destaque
                          </span>
                        )}
                      </div>
                      <p className="text-white/60 text-sm italic line-clamp-2 mb-2">
                        "{t.quote}"
                      </p>
                      <div className="flex items-center gap-4 text-xs text-white/40">
                        <span>{t.event}</span>
                        <span className="flex items-center gap-1">
                          {Array.from({ length: t.rating }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 text-forge-gold fill-forge-gold" />
                          ))}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-white/40 hover:text-forge-gold"
                        onClick={() => {
                          updateMutation.mutate({
                            id: t.id,
                            featured: t.featured === 1 ? 0 : 1,
                          });
                        }}
                        title={t.featured === 1 ? "Remover destaque" : "Destacar"}
                      >
                        {t.featured === 1 ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>

                      <Dialog open={editingId === t.id} onOpenChange={(open) => setEditingId(open ? t.id : null)}>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-white/40 hover:text-white">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-[#1a1a1a] border-white/[0.1] text-white max-w-lg">
                          <DialogHeader>
                            <DialogTitle>Editar Depoimento</DialogTitle>
                          </DialogHeader>
                          <TestimonialForm
                            initialData={{
                              name: t.name,
                              city: t.city,
                              event: t.event,
                              quote: t.quote,
                              rating: t.rating,
                              featured: t.featured,
                            }}
                            onSubmit={(data) => updateMutation.mutate({ id: t.id, ...data })}
                            isLoading={updateMutation.isPending}
                          />
                        </DialogContent>
                      </Dialog>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-white/40 hover:text-red-400"
                        onClick={() => {
                          if (confirm(`Remover depoimento de ${t.name}?`)) {
                            deleteMutation.mutate({ id: t.id });
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {testimonials?.length === 0 && (
              <div className="text-center py-16">
                <p className="text-white/40">Nenhum depoimento cadastrado.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Testimonial Form Component ─────────────────────────
function TestimonialForm({
  initialData,
  onSubmit,
  isLoading,
}: {
  initialData?: {
    name: string;
    city: string;
    event: string;
    quote: string;
    rating: number;
    featured: number;
  };
  onSubmit: (data: {
    name: string;
    city: string;
    event: string;
    quote: string;
    rating: number;
    featured: number;
  }) => void;
  isLoading: boolean;
}) {
  const [form, setForm] = useState({
    name: initialData?.name ?? "",
    city: initialData?.city ?? "Porto Velho/RO",
    event: initialData?.event ?? "TOP Destemidos Pioneiros",
    quote: initialData?.quote ?? "",
    rating: initialData?.rating ?? 5,
    featured: initialData?.featured ?? 1,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-white/70 mb-1">Nome</label>
        <input
          type="text"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.1] text-white placeholder:text-white/30 focus:border-forge-gold/50 outline-none"
          placeholder="Nome do Legendário"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-white/70 mb-1">Cidade</label>
          <input
            type="text"
            required
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            className="w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.1] text-white placeholder:text-white/30 focus:border-forge-gold/50 outline-none"
            placeholder="Porto Velho/RO"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-white/70 mb-1">Evento</label>
          <input
            type="text"
            required
            value={form.event}
            onChange={(e) => setForm({ ...form, event: e.target.value })}
            className="w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.1] text-white placeholder:text-white/30 focus:border-forge-gold/50 outline-none"
            placeholder="TOP 1870 Destemidos Pioneiros"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-white/70 mb-1">Depoimento</label>
        <textarea
          required
          rows={4}
          value={form.quote}
          onChange={(e) => setForm({ ...form, quote: e.target.value })}
          className="w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.1] text-white placeholder:text-white/30 focus:border-forge-gold/50 outline-none resize-none"
          placeholder="O depoimento do Legendário..."
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-white/70 mb-1">Avaliação (1-5)</label>
          <select
            value={form.rating}
            onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
            className="w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.1] text-white focus:border-forge-gold/50 outline-none"
          >
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n} className="bg-[#1a1a1a]">
                {"★".repeat(n)} ({n})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-white/70 mb-1">Visibilidade</label>
          <select
            value={form.featured}
            onChange={(e) => setForm({ ...form, featured: Number(e.target.value) })}
            className="w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.1] text-white focus:border-forge-gold/50 outline-none"
          >
            <option value={1} className="bg-[#1a1a1a]">Destaque (visível)</option>
            <option value={0} className="bg-[#1a1a1a]">Oculto</option>
          </select>
        </div>
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-forge-gold hover:bg-forge-gold/90 text-black font-semibold"
      >
        {isLoading ? "Salvando..." : initialData ? "Atualizar" : "Criar Depoimento"}
      </Button>
    </form>
  );
}
