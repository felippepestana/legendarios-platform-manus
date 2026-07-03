import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Settings, Save, RefreshCw, Eye, EyeOff, Shield, MessageSquare, Calendar, Globe, Loader2, Database } from "lucide-react";

type SettingItem = { id: number; category: string; key: string; value: string | null; label: string; description: string | null; fieldType: string; isEncrypted: number; isRequired: number; sortOrder: number };

const CATEGORY_META: Record<string, { label: string; icon: React.ReactNode; description: string }> = {
  whatsapp: { label: "WhatsApp Business", icon: <MessageSquare className="w-5 h-5" />, description: "Credenciais da API do WhatsApp Business para envio de mensagens" },
  evento: { label: "Evento", icon: <Calendar className="w-5 h-5" />, description: "Configuracoes do proximo TOP (nome, datas, local, vagas)" },
  mensagens: { label: "Templates de Mensagens", icon: <MessageSquare className="w-5 h-5" />, description: "Templates editaveis para mensagens de autorizacao e confirmacao" },
  geral: { label: "Geral", icon: <Globe className="w-5 h-5" />, description: "Configuracoes gerais da plataforma (contato, redes sociais)" },
};

function SettingField({ setting, onSave }: { setting: SettingItem; onSave: (id: number, value: string | null) => void }) {
  const [value, setValue] = useState(setting.value ?? "");
  const [showPassword, setShowPassword] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const handleChange = (newValue: string) => {
    setValue(newValue);
    setIsDirty(newValue !== (setting.value ?? ""));
  };

  const handleSave = () => {
    onSave(setting.id, value || null);
    setIsDirty(false);
  };

  return (
    <div className="border border-border rounded-lg p-4 bg-card">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <label className="font-medium text-sm text-foreground">{setting.label}</label>
            {setting.isRequired === 1 && <span className="text-xs text-red-500 font-medium">Obrigatorio</span>}
            {setting.isEncrypted === 1 && <Shield className="w-3.5 h-3.5 text-amber-500" />}
          </div>
          {setting.description && (
            <p className="text-xs text-muted-foreground mb-3">{setting.description}</p>
          )}
          {setting.fieldType === "textarea" ? (
            <Textarea
              value={value}
              onChange={(e) => handleChange(e.target.value)}
              placeholder={`Insira ${setting.label.toLowerCase()}...`}
              rows={4}
              className="text-sm font-mono"
            />
          ) : setting.fieldType === "password" ? (
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={value}
                onChange={(e) => handleChange(e.target.value)}
                placeholder={`Insira ${setting.label.toLowerCase()}...`}
                className="pr-10 text-sm font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          ) : (
            <Input
              type={setting.fieldType === "number" ? "number" : setting.fieldType === "date" ? "date" : "text"}
              value={value}
              onChange={(e) => handleChange(e.target.value)}
              placeholder={`Insira ${setting.label.toLowerCase()}...`}
              className="text-sm"
            />
          )}
        </div>
        {isDirty && (
          <Button size="sm" onClick={handleSave} className="mt-6 shrink-0">
            <Save className="w-4 h-4 mr-1" /> Salvar
          </Button>
        )}
      </div>
      {setting.value && !isDirty && (
        <div className="mt-2 flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-green-500"></span>
          <span className="text-xs text-green-600">Configurado</span>
        </div>
      )}
      {!setting.value && !isDirty && (
        <div className="mt-2 flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          <span className="text-xs text-amber-600">Nao configurado</span>
        </div>
      )}
    </div>
  );
}

export default function AdminConfiguracoes() {
  const { user, loading } = useAuth();
  const [activeCategory, setActiveCategory] = useState("whatsapp");

  const settingsQuery = trpc.settings.getAll.useQuery(undefined, { enabled: !!user && user.role === "admin" });
  const updateMutation = trpc.settings.updateValue.useMutation({
    onSuccess: () => {
      toast.success("Configuracao salva com sucesso");
      settingsQuery.refetch();
    },
    onError: (err) => {
      toast.error(`Erro ao salvar: ${err.message}`);
    },
  });
  const seedMutation = trpc.settings.seed.useMutation({
    onSuccess: (data) => {
      toast.success(`${data.count} campos de configuracao criados com sucesso`);
      settingsQuery.refetch();
    },
    onError: (err) => {
      toast.error(`Erro ao inicializar: ${err.message}`);
    },
  });

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

  const settings = (settingsQuery.data ?? []) as SettingItem[];
  const categories = Array.from(new Set(settings.map((s) => s.category)));
  const filteredSettings = settings.filter((s) => s.category === activeCategory);

  const handleSave = (id: number, value: string | null) => {
    updateMutation.mutate({ id, value });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Settings className="w-6 h-6 text-primary" />
            <div>
              <h1 className="text-xl font-bold text-foreground">Configuracoes</h1>
              <p className="text-sm text-muted-foreground">Gerencie credenciais, templates e parametros do sistema</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => settingsQuery.refetch()}>
              <RefreshCw className="w-4 h-4 mr-1" /> Atualizar
            </Button>
            {settings.length === 0 && (
              <Button size="sm" onClick={() => seedMutation.mutate()} disabled={seedMutation.isPending}>
                <Database className="w-4 h-4 mr-1" />
                {seedMutation.isPending ? "Inicializando..." : "Inicializar Configuracoes"}
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {settings.length === 0 ? (
          <div className="text-center py-16">
            <Database className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-lg font-semibold text-foreground mb-2">Nenhuma configuracao encontrada</h2>
            <p className="text-muted-foreground mb-6">Clique em &quot;Inicializar Configuracoes&quot; para criar os campos padrao do sistema.</p>
            <Button onClick={() => seedMutation.mutate()} disabled={seedMutation.isPending}>
              <Database className="w-4 h-4 mr-2" />
              {seedMutation.isPending ? "Inicializando..." : "Inicializar Configuracoes"}
            </Button>
          </div>
        ) : (
          <div className="flex gap-6">
            <nav className="w-64 shrink-0">
              <div className="sticky top-24 space-y-1">
                {categories.map((cat) => {
                  const meta = CATEGORY_META[cat] || { label: cat, icon: <Settings className="w-5 h-5" />, description: "" };
                  const catSettings = settings.filter((s) => s.category === cat);
                  const configured = catSettings.filter((s) => s.value).length;
                  return (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                        activeCategory === cat
                          ? "bg-primary/10 border border-primary/30 text-primary"
                          : "hover:bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {meta.icon}
                        <span className="font-medium text-sm">{meta.label}</span>
                      </div>
                      <div className="mt-1 text-xs opacity-70">
                        {configured}/{catSettings.length} configurados
                      </div>
                    </button>
                  );
                })}
              </div>
            </nav>

            <main className="flex-1 min-w-0">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-foreground">
                  {CATEGORY_META[activeCategory]?.label || activeCategory}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {CATEGORY_META[activeCategory]?.description || ""}
                </p>
              </div>
              <div className="space-y-4">
                {filteredSettings.map((setting) => (
                  <SettingField key={setting.id} setting={setting} onSave={handleSave} />
                ))}
              </div>
              {filteredSettings.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <p>Nenhuma configuracao nesta categoria.</p>
                </div>
              )}
            </main>
          </div>
        )}
      </div>
    </div>
  );
}
