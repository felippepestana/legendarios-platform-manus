import { useState, useMemo } from "react";
import { FormStepper } from "@/components/FormStepper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, CheckCircle2, User, Heart, Phone, Church, Shield, ClipboardCheck, Loader2 } from "lucide-react";
import { Link } from "wouter";

const STEPS = [
  { id: 1, title: "Dados Pessoais", description: "Informações básicas" },
  { id: 2, title: "Saúde", description: "Informações médicas" },
  { id: 3, title: "Emergência", description: "Contatos de emergência" },
  { id: 4, title: "Igreja", description: "Informações eclesiásticas" },
  { id: 5, title: "Serviço", description: "Experiência e função" },
  { id: 6, title: "Confirmação", description: "Revisão e envio" },
];

const MARITAL_OPTIONS = [
  { value: "solteiro", label: "Solteiro" },
  { value: "casado", label: "Casado" },
  { value: "divorciado", label: "Divorciado" },
  { value: "viuvo", label: "Viúvo" },
  { value: "uniao_estavel", label: "União Estável" },
];

const SHIRT_SIZES = ["PP", "P", "M", "G", "GG", "XG", "XXG"];
const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "nao_sei"];

const RELATIONSHIP_OPTIONS = [
  { value: "esposa", label: "Esposa" },
  { value: "mae", label: "Mãe" },
  { value: "pai", label: "Pai" },
  { value: "irmao", label: "Irmão" },
  { value: "irma", label: "Irmã" },
  { value: "filho", label: "Filho(a)" },
  { value: "filha", label: "Filha" },
  { value: "tio", label: "Tio(a)" },
  { value: "tia", label: "Tia" },
  { value: "avo", label: "Avô/Avó" },
  { value: "outro", label: "Outro" },
];

const DENOMINATIONS = [
  "Assembleia de Deus", "Batista", "Presbiteriana", "Metodista", "Católica",
  "Adventista", "Quadrangular", "Sara Nossa Terra", "Bola de Neve",
  "Comunidade", "Maranata", "Internacional da Graça", "Outra",
];

const LEADER_TITLES = [
  { value: "Pastor", label: "Pastor" },
  { value: "Apostolo", label: "Apóstolo" },
  { value: "Bispo", label: "Bispo" },
  { value: "Presbitero", label: "Presbítero" },
  { value: "Discipulador", label: "Discipulador" },
  { value: "Lider", label: "Líder" },
  { value: "Padre", label: "Padre" },
  { value: "Outro", label: "Outro" },
];

const SERVANT_ROLES = [
  "Cozinha", "Louvor", "Intercessão", "Logística", "Som/Mídia",
  "Segurança", "Limpeza", "Recepção", "Apoio Geral", "Coordenação",
  "Transporte", "Decoração", "Outro",
];

interface PersonalData {
  fullName: string; cpf: string; rg: string; birthDate: string;
  maritalStatus: string; phone: string; whatsapp: string; email: string;
  address: string; neighborhood: string; city: string; state: string;
  zipCode: string; profession: string; shirtSize: string;
}

interface MedicalData {
  bloodType: string; hasAllergy: boolean; allergyDetails: string;
  hasMedication: boolean; medicationDetails: string;
  hasChronicDisease: boolean; chronicDiseaseDetails: string;
  hasPhysicalRestriction: boolean; physicalRestrictionDetails: string;
  hasFoodRestriction: boolean; foodRestrictionDetails: string;
  healthInsurance: string; healthObservations: string;
}

interface EmergencyContactData {
  name: string; relationship: string; relationshipOther: string;
  phone: string; whatsapp: string; email: string; city: string;
  isAuthorizationContact: boolean; isPrimaryContact: boolean;
}

interface ChurchData {
  churchId: number | null; churchName: string; denomination: string;
  memberSince: string; ministryRole: string; baptized: boolean;
  baptizedHolySpirit: boolean; newChurch: boolean;
}

interface LeaderData {
  spiritualLeaderId: number | null;
  newLeader: boolean;
  title: string; name: string; phone: string; whatsapp: string; email: string;
}

interface ServantData {
  servantRole: string; previousTops: number; legendaryNumber: string;
}

export default function InscricaoServo() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [personal, setPersonal] = useState<PersonalData>({
    fullName: "", cpf: "", rg: "", birthDate: "", maritalStatus: "",
    phone: "", whatsapp: "", email: "", address: "", neighborhood: "",
    city: "Porto Velho", state: "RO", zipCode: "", profession: "", shirtSize: "",
  });

  const [medical, setMedical] = useState<MedicalData>({
    bloodType: "", hasAllergy: false, allergyDetails: "",
    hasMedication: false, medicationDetails: "",
    hasChronicDisease: false, chronicDiseaseDetails: "",
    hasPhysicalRestriction: false, physicalRestrictionDetails: "",
    hasFoodRestriction: false, foodRestrictionDetails: "",
    healthInsurance: "", healthObservations: "",
  });

  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContactData[]>([
    { name: "", relationship: "", relationshipOther: "", phone: "", whatsapp: "", email: "", city: "", isAuthorizationContact: true, isPrimaryContact: true },
  ]);

  const [church, setChurch] = useState<ChurchData>({
    churchId: null, churchName: "", denomination: "", memberSince: "",
    ministryRole: "", baptized: false, baptizedHolySpirit: false, newChurch: false,
  });

  const [leader, setLeader] = useState<LeaderData>({
    spiritualLeaderId: null, newLeader: false,
    title: "", name: "", phone: "", whatsapp: "", email: "",
  });

  const [servant, setServant] = useState<ServantData>({
    servantRole: "", previousTops: 0, legendaryNumber: "",
  });

  const createRegistration = trpc.registration.create.useMutation();
  const { data: churchesList } = trpc.registration.listChurches.useQuery();
  const { data: leadersList } = trpc.registration.listSpiritualLeaders.useQuery();

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await createRegistration.mutateAsync({
        type: "servo",
        personal,
        medical: {
          ...medical,
          hasAllergy: medical.hasAllergy ? 1 : 0,
          hasMedication: medical.hasMedication ? 1 : 0,
          hasChronicDisease: medical.hasChronicDisease ? 1 : 0,
          hasPhysicalRestriction: medical.hasPhysicalRestriction ? 1 : 0,
          hasFoodRestriction: medical.hasFoodRestriction ? 1 : 0,
        },
        emergencyContacts: emergencyContacts.map(c => ({
          ...c,
          isAuthorizationContact: c.isAuthorizationContact ? 1 : 0,
          isPrimaryContact: c.isPrimaryContact ? 1 : 0,
        })),
        church: {
          ...church,
          churchId: church.churchId || undefined,
          baptized: church.baptized ? 1 : 0,
          baptizedHolySpirit: church.baptizedHolySpirit ? 1 : 0,
        },
        servant: {
          servantRole: servant.servantRole,
          previousTops: servant.previousTops,
          legendaryNumber: servant.legendaryNumber,
          spiritualLeaderId: leader.spiritualLeaderId || undefined,
          newLeader: leader.newLeader ? {
            title: leader.title,
            name: leader.name,
            phone: leader.phone,
            whatsapp: leader.whatsapp,
            email: leader.email,
          } : undefined,
        },
      });
      setIsSubmitted(true);
      toast.success("Inscrição de servo enviada com sucesso!");
    } catch (error: any) {
      toast.error(error.message || "Erro ao enviar inscrição. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const canAdvance = useMemo(() => {
    switch (currentStep) {
      case 0:
        return personal.fullName && personal.cpf && personal.birthDate &&
          personal.maritalStatus && personal.phone && personal.whatsapp &&
          personal.email && personal.address && personal.neighborhood &&
          personal.city && personal.state && personal.zipCode && personal.shirtSize;
      case 1:
        return medical.bloodType;
      case 2:
        return emergencyContacts[0]?.name && emergencyContacts[0]?.relationship &&
          emergencyContacts[0]?.phone && emergencyContacts[0]?.whatsapp;
      case 3:
        return (church.denomination || church.churchName) &&
          (leader.spiritualLeaderId || (leader.newLeader && leader.name && leader.whatsapp));
      case 4:
        return servant.servantRole;
      case 5:
        return true;
      default:
        return false;
    }
  }, [currentStep, personal, medical, emergencyContacts, church, leader, servant]);

  const addEmergencyContact = () => {
    setEmergencyContacts([...emergencyContacts, {
      name: "", relationship: "", relationshipOther: "", phone: "",
      whatsapp: "", email: "", city: "", isAuthorizationContact: false, isPrimaryContact: false,
    }]);
  };

  const updateEmergencyContact = (index: number, field: keyof EmergencyContactData, value: any) => {
    const updated = [...emergencyContacts];
    updated[index] = { ...updated[index], [field]: value };
    setEmergencyContacts(updated);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center p-4">
        <Card className="max-w-lg w-full bg-zinc-900 border-zinc-800">
          <CardContent className="pt-8 text-center">
            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Inscrição de Servo Enviada!</h2>
            <p className="text-zinc-400 mb-6">
              Sua inscrição para servir no TOP 1870 — Destemidos Pioneiros foi recebida com sucesso.
              Uma mensagem de autorização será enviada ao seu contato familiar e ao seu líder espiritual.
            </p>
            <p className="text-sm text-zinc-500 mb-6">
              Aguarde a confirmação de ambos para que sua inscrição seja aprovada.
            </p>
            <Link href="/">
              <Button className="bg-[#FF4500] hover:bg-[#E63900]">
                Voltar ao Início
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-[#FF4500]">TOP 1870 — Destemidos Pioneiros</h1>
            <p className="text-sm text-zinc-400">Inscrição de Servo</p>
          </div>
          <Link href="/">
            <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-300">
              <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
            </Button>
          </Link>
        </div>
      </header>

      {/* Stepper */}
      <div className="container max-w-5xl mx-auto px-4 py-6">
        <FormStepper
          steps={STEPS}
          currentStep={currentStep}
          onStepClick={(step) => { if (step < currentStep) setCurrentStep(step); }}
        />
      </div>

      {/* Form Content */}
      <main className="container max-w-3xl mx-auto px-4 pb-12">
        {/* Step 1: Dados Pessoais */}
        {currentStep === 0 && (
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <User className="w-5 h-5 text-[#FF4500]" /> Dados Pessoais
              </CardTitle>
              <CardDescription>Preencha seus dados pessoais conforme documento de identidade.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label>Nome Completo *</Label>
                  <Input value={personal.fullName} onChange={(e) => setPersonal({ ...personal, fullName: e.target.value })} placeholder="Nome conforme documento" className="bg-zinc-800 border-zinc-700" />
                </div>
                <div>
                  <Label>CPF *</Label>
                  <Input value={personal.cpf} onChange={(e) => setPersonal({ ...personal, cpf: e.target.value })} placeholder="000.000.000-00" className="bg-zinc-800 border-zinc-700" />
                </div>
                <div>
                  <Label>RG</Label>
                  <Input value={personal.rg} onChange={(e) => setPersonal({ ...personal, rg: e.target.value })} placeholder="0000000 SSP/RO" className="bg-zinc-800 border-zinc-700" />
                </div>
                <div>
                  <Label>Data de Nascimento *</Label>
                  <Input type="date" value={personal.birthDate} onChange={(e) => setPersonal({ ...personal, birthDate: e.target.value })} className="bg-zinc-800 border-zinc-700" />
                </div>
                <div>
                  <Label>Estado Civil *</Label>
                  <Select value={personal.maritalStatus} onValueChange={(v) => setPersonal({ ...personal, maritalStatus: v })}>
                    <SelectTrigger className="bg-zinc-800 border-zinc-700"><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {MARITAL_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Telefone Celular *</Label>
                  <Input value={personal.phone} onChange={(e) => setPersonal({ ...personal, phone: e.target.value })} placeholder="(69) 99999-9999" className="bg-zinc-800 border-zinc-700" />
                </div>
                <div>
                  <Label>WhatsApp *</Label>
                  <Input value={personal.whatsapp} onChange={(e) => setPersonal({ ...personal, whatsapp: e.target.value })} placeholder="(69) 99999-9999" className="bg-zinc-800 border-zinc-700" />
                </div>
                <div className="md:col-span-2">
                  <Label>E-mail *</Label>
                  <Input type="email" value={personal.email} onChange={(e) => setPersonal({ ...personal, email: e.target.value })} placeholder="seu@email.com" className="bg-zinc-800 border-zinc-700" />
                </div>
                <div className="md:col-span-2">
                  <Label>Endereço Completo *</Label>
                  <Input value={personal.address} onChange={(e) => setPersonal({ ...personal, address: e.target.value })} placeholder="Rua, número, complemento" className="bg-zinc-800 border-zinc-700" />
                </div>
                <div>
                  <Label>Bairro *</Label>
                  <Input value={personal.neighborhood} onChange={(e) => setPersonal({ ...personal, neighborhood: e.target.value })} placeholder="Bairro" className="bg-zinc-800 border-zinc-700" />
                </div>
                <div>
                  <Label>Cidade *</Label>
                  <Input value={personal.city} onChange={(e) => setPersonal({ ...personal, city: e.target.value })} placeholder="Porto Velho" className="bg-zinc-800 border-zinc-700" />
                </div>
                <div>
                  <Label>UF *</Label>
                  <Input value={personal.state} onChange={(e) => setPersonal({ ...personal, state: e.target.value })} placeholder="RO" maxLength={2} className="bg-zinc-800 border-zinc-700" />
                </div>
                <div>
                  <Label>CEP *</Label>
                  <Input value={personal.zipCode} onChange={(e) => setPersonal({ ...personal, zipCode: e.target.value })} placeholder="76800-000" className="bg-zinc-800 border-zinc-700" />
                </div>
                <div>
                  <Label>Profissão</Label>
                  <Input value={personal.profession} onChange={(e) => setPersonal({ ...personal, profession: e.target.value })} placeholder="Sua profissão" className="bg-zinc-800 border-zinc-700" />
                </div>
                <div>
                  <Label>Tamanho da Camiseta *</Label>
                  <Select value={personal.shirtSize} onValueChange={(v) => setPersonal({ ...personal, shirtSize: v })}>
                    <SelectTrigger className="bg-zinc-800 border-zinc-700"><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {SHIRT_SIZES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Informações Médicas */}
        {currentStep === 1 && (
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Heart className="w-5 h-5 text-[#FF4500]" /> Informações Médicas
              </CardTitle>
              <CardDescription>Dados importantes para sua segurança durante o evento.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Tipo Sanguíneo *</Label>
                <Select value={medical.bloodType} onValueChange={(v) => setMedical({ ...medical, bloodType: v })}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700"><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {BLOOD_TYPES.map(t => <SelectItem key={t} value={t}>{t === "nao_sei" ? "Não sei" : t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
                  <Label className="cursor-pointer">Possui alguma alergia?</Label>
                  <Switch checked={medical.hasAllergy} onCheckedChange={(v) => setMedical({ ...medical, hasAllergy: v })} />
                </div>
                {medical.hasAllergy && <Textarea value={medical.allergyDetails} onChange={(e) => setMedical({ ...medical, allergyDetails: e.target.value })} placeholder="Descreva suas alergias" className="bg-zinc-800 border-zinc-700" />}
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
                  <Label className="cursor-pointer">Usa medicação contínua?</Label>
                  <Switch checked={medical.hasMedication} onCheckedChange={(v) => setMedical({ ...medical, hasMedication: v })} />
                </div>
                {medical.hasMedication && <Textarea value={medical.medicationDetails} onChange={(e) => setMedical({ ...medical, medicationDetails: e.target.value })} placeholder="Liste os medicamentos" className="bg-zinc-800 border-zinc-700" />}
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
                  <Label className="cursor-pointer">Possui doença crônica?</Label>
                  <Switch checked={medical.hasChronicDisease} onCheckedChange={(v) => setMedical({ ...medical, hasChronicDisease: v })} />
                </div>
                {medical.hasChronicDisease && <Textarea value={medical.chronicDiseaseDetails} onChange={(e) => setMedical({ ...medical, chronicDiseaseDetails: e.target.value })} placeholder="Descreva a doença e tratamento" className="bg-zinc-800 border-zinc-700" />}
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
                  <Label className="cursor-pointer">Restrição física para atividades?</Label>
                  <Switch checked={medical.hasPhysicalRestriction} onCheckedChange={(v) => setMedical({ ...medical, hasPhysicalRestriction: v })} />
                </div>
                {medical.hasPhysicalRestriction && <Textarea value={medical.physicalRestrictionDetails} onChange={(e) => setMedical({ ...medical, physicalRestrictionDetails: e.target.value })} placeholder="Descreva a restrição" className="bg-zinc-800 border-zinc-700" />}
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
                  <Label className="cursor-pointer">Restrição alimentar?</Label>
                  <Switch checked={medical.hasFoodRestriction} onCheckedChange={(v) => setMedical({ ...medical, hasFoodRestriction: v })} />
                </div>
                {medical.hasFoodRestriction && <Textarea value={medical.foodRestrictionDetails} onChange={(e) => setMedical({ ...medical, foodRestrictionDetails: e.target.value })} placeholder="Descreva a restrição alimentar" className="bg-zinc-800 border-zinc-700" />}
              </div>
              <div>
                <Label>Plano de Saúde</Label>
                <Input value={medical.healthInsurance} onChange={(e) => setMedical({ ...medical, healthInsurance: e.target.value })} placeholder="Ex: Unimed 0000000000" className="bg-zinc-800 border-zinc-700" />
              </div>
              <div>
                <Label>Observações de saúde</Label>
                <Textarea value={medical.healthObservations} onChange={(e) => setMedical({ ...medical, healthObservations: e.target.value })} placeholder="Informações relevantes para a equipe médica" className="bg-zinc-800 border-zinc-700" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Contato de Emergência */}
        {currentStep === 2 && (
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Phone className="w-5 h-5 text-[#FF4500]" /> Contato de Emergência
              </CardTitle>
              <CardDescription>
                Para servos, a mensagem de autorização será enviada ao familiar E ao líder espiritual.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {emergencyContacts.map((contact, index) => (
                <div key={index} className="p-4 border border-zinc-700 rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-zinc-300">Contato {index + 1}</h4>
                    {index > 0 && (
                      <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300"
                        onClick={() => setEmergencyContacts(emergencyContacts.filter((_, i) => i !== index))}>
                        Remover
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Label>Nome Completo *</Label>
                      <Input value={contact.name} onChange={(e) => updateEmergencyContact(index, "name", e.target.value)} placeholder="Nome do contato" className="bg-zinc-800 border-zinc-700" />
                    </div>
                    <div>
                      <Label>Vínculo *</Label>
                      <Select value={contact.relationship} onValueChange={(v) => updateEmergencyContact(index, "relationship", v)}>
                        <SelectTrigger className="bg-zinc-800 border-zinc-700"><SelectValue placeholder="Selecione o vínculo" /></SelectTrigger>
                        <SelectContent>
                          {RELATIONSHIP_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    {contact.relationship === "outro" && (
                      <div>
                        <Label>Especifique o vínculo</Label>
                        <Input value={contact.relationshipOther} onChange={(e) => updateEmergencyContact(index, "relationshipOther", e.target.value)} placeholder="Ex: padrinho" className="bg-zinc-800 border-zinc-700" />
                      </div>
                    )}
                    <div>
                      <Label>Telefone *</Label>
                      <Input value={contact.phone} onChange={(e) => updateEmergencyContact(index, "phone", e.target.value)} placeholder="(69) 99999-9999" className="bg-zinc-800 border-zinc-700" />
                    </div>
                    <div>
                      <Label>WhatsApp *</Label>
                      <Input value={contact.whatsapp} onChange={(e) => updateEmergencyContact(index, "whatsapp", e.target.value)} placeholder="(69) 99999-9999" className="bg-zinc-800 border-zinc-700" />
                    </div>
                    <div>
                      <Label>E-mail</Label>
                      <Input value={contact.email} onChange={(e) => updateEmergencyContact(index, "email", e.target.value)} placeholder="email@exemplo.com" className="bg-zinc-800 border-zinc-700" />
                    </div>
                    <div>
                      <Label>Cidade</Label>
                      <Input value={contact.city} onChange={(e) => updateEmergencyContact(index, "city", e.target.value)} placeholder="Cidade/UF" className="bg-zinc-800 border-zinc-700" />
                    </div>
                  </div>
                  <div className="flex items-center gap-6 pt-2">
                    <div className="flex items-center gap-2">
                      <Switch checked={contact.isAuthorizationContact} onCheckedChange={(v) => updateEmergencyContact(index, "isAuthorizationContact", v)} />
                      <Label className="text-xs text-zinc-400">Receberá mensagem de autorização</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch checked={contact.isPrimaryContact} onCheckedChange={(v) => updateEmergencyContact(index, "isPrimaryContact", v)} />
                      <Label className="text-xs text-zinc-400">Contato principal</Label>
                    </div>
                  </div>
                </div>
              ))}
              <Button variant="outline" onClick={addEmergencyContact} className="w-full border-dashed border-zinc-700 text-zinc-400">
                + Adicionar outro contato
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Informações Eclesiásticas + Líder Espiritual */}
        {currentStep === 3 && (
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Church className="w-5 h-5 text-[#FF4500]" /> Igreja e Líder Espiritual
              </CardTitle>
              <CardDescription>
                Como servo, é obrigatório informar seu líder espiritual. Ele receberá uma mensagem de autorização.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Church selection */}
              <div>
                <Label>Igreja *</Label>
                {!church.newChurch ? (
                  <div className="space-y-2">
                    <Select value={church.churchId?.toString() || ""} onValueChange={(v) => {
                      const selected = churchesList?.find((c: any) => c.id.toString() === v);
                      setChurch({ ...church, churchId: parseInt(v), churchName: selected?.name || "", denomination: selected?.denomination || "" });
                    }}>
                      <SelectTrigger className="bg-zinc-800 border-zinc-700"><SelectValue placeholder="Selecione sua igreja" /></SelectTrigger>
                      <SelectContent>
                        {churchesList?.map((c: any) => (
                          <SelectItem key={c.id} value={c.id.toString()}>{c.name} ({c.denomination})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button variant="link" className="text-[#FF4500] p-0 h-auto text-sm" onClick={() => setChurch({ ...church, newChurch: true, churchId: null })}>
                      Minha igreja não está na lista — cadastrar nova
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4 p-4 border border-zinc-700 rounded-lg">
                    <p className="text-sm text-zinc-400">Cadastrar nova igreja:</p>
                    <Input value={church.churchName} onChange={(e) => setChurch({ ...church, churchName: e.target.value })} placeholder="Nome da igreja" className="bg-zinc-800 border-zinc-700" />
                    <Select value={church.denomination} onValueChange={(v) => setChurch({ ...church, denomination: v })}>
                      <SelectTrigger className="bg-zinc-800 border-zinc-700"><SelectValue placeholder="Denominação" /></SelectTrigger>
                      <SelectContent>
                        {DENOMINATIONS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Button variant="link" className="text-zinc-400 p-0 h-auto text-sm" onClick={() => setChurch({ ...church, newChurch: false, churchName: "", denomination: "" })}>
                      ← Voltar para seleção
                    </Button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Membro desde</Label>
                  <Input value={church.memberSince} onChange={(e) => setChurch({ ...church, memberSince: e.target.value })} placeholder="MM/AAAA" className="bg-zinc-800 border-zinc-700" />
                </div>
                <div>
                  <Label>Função na igreja</Label>
                  <Input value={church.ministryRole} onChange={(e) => setChurch({ ...church, ministryRole: e.target.value })} placeholder="Ex: líder de louvor, diácono" className="bg-zinc-800 border-zinc-700" />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
                  <Label className="cursor-pointer">Batizado nas águas?</Label>
                  <Switch checked={church.baptized} onCheckedChange={(v) => setChurch({ ...church, baptized: v })} />
                </div>
                <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
                  <Label className="cursor-pointer">Batizado no Espírito Santo?</Label>
                  <Switch checked={church.baptizedHolySpirit} onCheckedChange={(v) => setChurch({ ...church, baptizedHolySpirit: v })} />
                </div>
              </div>

              {/* Spiritual Leader - OBRIGATÓRIO para servo */}
              <div className="border-t border-zinc-700 pt-6">
                <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-[#FF4500]" /> Líder Espiritual (obrigatório)
                </h4>
                <p className="text-sm text-zinc-400 mb-4">
                  Seu líder espiritual receberá uma mensagem solicitando autorização para sua participação como servo.
                </p>

                {!leader.newLeader ? (
                  <div className="space-y-2">
                    <Select value={leader.spiritualLeaderId?.toString() || ""} onValueChange={(v) => setLeader({ ...leader, spiritualLeaderId: parseInt(v) })}>
                      <SelectTrigger className="bg-zinc-800 border-zinc-700"><SelectValue placeholder="Selecione seu líder espiritual" /></SelectTrigger>
                      <SelectContent>
                        {leadersList?.map((l: any) => (
                          <SelectItem key={l.id} value={l.id.toString()}>{l.title} {l.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button variant="link" className="text-[#FF4500] p-0 h-auto text-sm" onClick={() => setLeader({ ...leader, newLeader: true, spiritualLeaderId: null })}>
                      Meu líder não está na lista — cadastrar novo
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4 p-4 border border-zinc-700 rounded-lg">
                    <p className="text-sm text-zinc-400">Cadastrar novo líder espiritual:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Título *</Label>
                        <Select value={leader.title} onValueChange={(v) => setLeader({ ...leader, title: v })}>
                          <SelectTrigger className="bg-zinc-800 border-zinc-700"><SelectValue placeholder="Título" /></SelectTrigger>
                          <SelectContent>
                            {LEADER_TITLES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Nome Completo *</Label>
                        <Input value={leader.name} onChange={(e) => setLeader({ ...leader, name: e.target.value })} placeholder="Nome do líder" className="bg-zinc-800 border-zinc-700" />
                      </div>
                      <div>
                        <Label>Telefone *</Label>
                        <Input value={leader.phone} onChange={(e) => setLeader({ ...leader, phone: e.target.value })} placeholder="(69) 99999-9999" className="bg-zinc-800 border-zinc-700" />
                      </div>
                      <div>
                        <Label>WhatsApp *</Label>
                        <Input value={leader.whatsapp} onChange={(e) => setLeader({ ...leader, whatsapp: e.target.value })} placeholder="(69) 99999-9999" className="bg-zinc-800 border-zinc-700" />
                      </div>
                      <div className="md:col-span-2">
                        <Label>E-mail</Label>
                        <Input value={leader.email} onChange={(e) => setLeader({ ...leader, email: e.target.value })} placeholder="email@exemplo.com" className="bg-zinc-800 border-zinc-700" />
                      </div>
                    </div>
                    <Button variant="link" className="text-zinc-400 p-0 h-auto text-sm" onClick={() => setLeader({ ...leader, newLeader: false, title: "", name: "", phone: "", whatsapp: "", email: "" })}>
                      ← Voltar para seleção
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 5: Experiência de Serviço */}
        {currentStep === 4 && (
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Shield className="w-5 h-5 text-[#FF4500]" /> Experiência de Serviço
              </CardTitle>
              <CardDescription>Informações sobre sua experiência e função desejada no TOP.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Função desejada no TOP *</Label>
                <Select value={servant.servantRole} onValueChange={(v) => setServant({ ...servant, servantRole: v })}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700"><SelectValue placeholder="Selecione a área de serviço" /></SelectTrigger>
                  <SelectContent>
                    {SERVANT_ROLES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Quantos TOPs já serviu?</Label>
                <Input type="number" min={0} value={servant.previousTops} onChange={(e) => setServant({ ...servant, previousTops: parseInt(e.target.value) || 0 })} className="bg-zinc-800 border-zinc-700" />
              </div>

              <div>
                <Label>Número de Legendário (se já participou como participante)</Label>
                <Input value={servant.legendaryNumber} onChange={(e) => setServant({ ...servant, legendaryNumber: e.target.value })} placeholder="Ex: 1670-042" className="bg-zinc-800 border-zinc-700" />
              </div>

              <div className="p-4 bg-zinc-800 rounded-lg">
                <p className="text-sm text-zinc-400">
                  A equipe de coordenação entrará em contato para confirmar sua área de serviço.
                  Caso haja necessidade, você poderá ser realocado para outra função conforme a demanda do evento.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 6: Confirmação */}
        {currentStep === 5 && (
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <ClipboardCheck className="w-5 h-5 text-[#FF4500]" /> Revisão e Confirmação
              </CardTitle>
              <CardDescription>Revise seus dados antes de enviar a inscrição de servo.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-zinc-800 rounded-lg">
                <h4 className="text-sm font-bold text-[#FF4500] mb-2">Dados Pessoais</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-zinc-400">Nome:</span><span className="text-white">{personal.fullName}</span>
                  <span className="text-zinc-400">CPF:</span><span className="text-white">{personal.cpf}</span>
                  <span className="text-zinc-400">WhatsApp:</span><span className="text-white">{personal.whatsapp}</span>
                  <span className="text-zinc-400">Cidade:</span><span className="text-white">{personal.city}/{personal.state}</span>
                </div>
              </div>

              <div className="p-4 bg-zinc-800 rounded-lg">
                <h4 className="text-sm font-bold text-[#FF4500] mb-2">Saúde</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-zinc-400">Tipo Sanguíneo:</span><span className="text-white">{medical.bloodType}</span>
                  <span className="text-zinc-400">Alergias:</span><span className="text-white">{medical.hasAllergy ? medical.allergyDetails : "Não"}</span>
                </div>
              </div>

              <div className="p-4 bg-zinc-800 rounded-lg">
                <h4 className="text-sm font-bold text-[#FF4500] mb-2">Contato de Emergência</h4>
                {emergencyContacts.map((c, i) => (
                  <div key={i} className="grid grid-cols-2 gap-2 text-sm mb-2">
                    <span className="text-zinc-400">Nome:</span><span className="text-white">{c.name} ({c.relationship})</span>
                    <span className="text-zinc-400">WhatsApp:</span><span className="text-white">{c.whatsapp}</span>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-zinc-800 rounded-lg">
                <h4 className="text-sm font-bold text-[#FF4500] mb-2">Igreja e Líder</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-zinc-400">Igreja:</span><span className="text-white">{church.churchName || "Selecionada"}</span>
                  <span className="text-zinc-400">Líder:</span><span className="text-white">{leader.newLeader ? `${leader.title} ${leader.name}` : "Selecionado"}</span>
                </div>
              </div>

              <div className="p-4 bg-zinc-800 rounded-lg">
                <h4 className="text-sm font-bold text-[#FF4500] mb-2">Serviço</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-zinc-400">Função:</span><span className="text-white">{servant.servantRole}</span>
                  <span className="text-zinc-400">TOPs servidos:</span><span className="text-white">{servant.previousTops}</span>
                  <span className="text-zinc-400">N° Legendário:</span><span className="text-white">{servant.legendaryNumber || "N/A"}</span>
                </div>
              </div>

              <div className="p-4 bg-[#FF4500]/10 border border-[#FF4500]/30 rounded-lg">
                <p className="text-sm text-zinc-300">
                  Ao enviar esta inscrição, você confirma que todas as informações são verdadeiras e autoriza o envio de mensagem
                  de autorização ao seu contato familiar E ao seu líder espiritual. Ambas as autorizações são necessárias para
                  confirmação da sua participação como servo no TOP 1870 — Destemidos Pioneiros.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-6">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="border-zinc-700 text-zinc-300"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Anterior
          </Button>

          {currentStep < STEPS.length - 1 ? (
            <Button
              onClick={() => setCurrentStep(currentStep + 1)}
              disabled={!canAdvance}
              className="bg-[#FF4500] hover:bg-[#E63900] disabled:opacity-50"
            >
              Próximo <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Enviando...</>
              ) : (
                <><CheckCircle2 className="w-4 h-4 mr-2" /> Enviar Inscrição</>
              )}
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}
