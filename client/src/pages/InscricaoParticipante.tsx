import { useState, useMemo, useCallback } from "react";
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
import { ArrowLeft, ArrowRight, CheckCircle2, User, Heart, Phone, Church, ClipboardCheck, Loader2, AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { maskCPF, maskPhone, maskCEP, isValidCPF, isValidPhone, isValidCEP, isValidEmail, unmask } from "@/lib/masks";
import { cn } from "@/lib/utils";
import { useCepLookup } from "@/hooks/useCepLookup";

const STEPS = [
  { id: 1, title: "Dados Pessoais", description: "Informações básicas" },
  { id: 2, title: "Saúde", description: "Informações médicas" },
  { id: 3, title: "Emergência", description: "Contatos de emergência" },
  { id: 4, title: "Igreja", description: "Informações eclesiásticas" },
  { id: 5, title: "Confirmação", description: "Revisão e envio" },
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

interface PersonalData {
  fullName: string;
  cpf: string;
  rg: string;
  birthDate: string;
  maritalStatus: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  profession: string;
  shirtSize: string;
}

interface MedicalData {
  bloodType: string;
  hasAllergy: boolean;
  allergyDetails: string;
  hasMedication: boolean;
  medicationDetails: string;
  hasChronicDisease: boolean;
  chronicDiseaseDetails: string;
  hasPhysicalRestriction: boolean;
  physicalRestrictionDetails: string;
  hasFoodRestriction: boolean;
  foodRestrictionDetails: string;
  healthInsurance: string;
  healthObservations: string;
}

interface EmergencyContactData {
  name: string;
  relationship: string;
  relationshipOther: string;
  phone: string;
  whatsapp: string;
  email: string;
  city: string;
  isAuthorizationContact: boolean;
  isPrimaryContact: boolean;
}

interface ChurchData {
  churchId: number | null;
  churchName: string;
  denomination: string;
  memberSince: string;
  ministryRole: string;
  baptized: boolean;
  baptizedHolySpirit: boolean;
  newChurch: boolean;
}

// Validated Input component with mask support
function ValidatedInput({
  value, onChange, mask, validate, label, required, placeholder, errorMessage, type = "text", className, maxLength
}: {
  value: string;
  onChange: (val: string) => void;
  mask?: (v: string) => string;
  validate?: (v: string) => boolean;
  label: string;
  required?: boolean;
  placeholder?: string;
  errorMessage?: string;
  type?: string;
  className?: string;
  maxLength?: number;
}) {
  const [touched, setTouched] = useState(false);
  const displayValue = mask ? mask(value) : value;
  const isValid = !validate || !value || validate(value);
  const showError = touched && required && !value ? true : (touched && value && !isValid);

  return (
    <div className={className}>
      <Label className="text-sm text-zinc-300">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </Label>
      <div className="relative mt-1">
        <Input
          type={type}
          value={displayValue}
          onChange={(e) => onChange(mask ? unmask(e.target.value) : e.target.value)}
          onBlur={() => setTouched(true)}
          placeholder={placeholder}
          maxLength={maxLength}
          className={cn(
            "bg-zinc-800 border-zinc-700 text-white transition-all duration-200",
            showError && "border-red-500/70 focus-visible:ring-red-500/20",
            touched && value && isValid && "border-green-500/50"
          )}
        />
        {touched && value && isValid && (
          <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
        )}
        {showError && (
          <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
        )}
      </div>
      {showError && (
        <p className="text-xs text-red-400 mt-1 animate-in fade-in slide-in-from-top-1 duration-200">
          {!value && required ? "Campo obrigatório" : (errorMessage || "Campo inválido")}
        </p>
      )}
    </div>
  );
}

export default function InscricaoParticipante() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [slideDirection, setSlideDirection] = useState<"left" | "right">("right");
  const [isAnimating, setIsAnimating] = useState(false);
  const cepLookup = useCepLookup();

  // Form data
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

  // tRPC mutations
  const createRegistration = trpc.registration.create.useMutation();
  const { data: churchesList } = trpc.registration.listChurches.useQuery();

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await createRegistration.mutateAsync({
        type: "participante",
        personal: { ...personal, cpf: unmask(personal.cpf), phone: unmask(personal.phone), whatsapp: unmask(personal.whatsapp), zipCode: unmask(personal.zipCode) },
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
          phone: unmask(c.phone),
          whatsapp: unmask(c.whatsapp),
          isAuthorizationContact: c.isAuthorizationContact ? 1 : 0,
          isPrimaryContact: c.isPrimaryContact ? 1 : 0,
        })),
        church: {
          ...church,
          churchId: church.churchId || undefined,
          baptized: church.baptized ? 1 : 0,
          baptizedHolySpirit: church.baptizedHolySpirit ? 1 : 0,
        },
      });
      setIsSubmitted(true);
      toast.success("Inscrição enviada com sucesso!");
    } catch (error: any) {
      toast.error(error.message || "Erro ao enviar inscrição. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const canAdvance = useMemo(() => {
    switch (currentStep) {
      case 0:
        return personal.fullName && personal.cpf && isValidCPF(personal.cpf) &&
          personal.birthDate && personal.maritalStatus &&
          personal.phone && isValidPhone(personal.phone) &&
          personal.whatsapp && isValidPhone(personal.whatsapp) &&
          personal.email && isValidEmail(personal.email) &&
          personal.address && personal.neighborhood &&
          personal.city && personal.state && personal.zipCode && isValidCEP(personal.zipCode) &&
          personal.shirtSize;
      case 1:
        return medical.bloodType;
      case 2:
        return emergencyContacts[0]?.name && emergencyContacts[0]?.relationship &&
          emergencyContacts[0]?.phone && isValidPhone(emergencyContacts[0]?.phone) &&
          emergencyContacts[0]?.whatsapp && isValidPhone(emergencyContacts[0]?.whatsapp);
      case 3:
        return church.denomination || church.churchName;
      case 4:
        return true;
      default:
        return false;
    }
  }, [currentStep, personal, medical, emergencyContacts, church]);

  const goToStep = useCallback((targetStep: number) => {
    if (isAnimating) return;
    setSlideDirection(targetStep > currentStep ? "right" : "left");
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentStep(targetStep);
      setIsAnimating(false);
    }, 150);
  }, [currentStep, isAnimating]);

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
        <Card className="max-w-lg w-full bg-zinc-900 border-zinc-800 animate-in fade-in zoom-in-95 duration-500">
          <CardContent className="pt-8 text-center">
            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 animate-in zoom-in duration-700">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Inscrição Enviada!</h2>
            <p className="text-zinc-400 mb-6">
              Sua inscrição no TOP 1870 — Destemidos Pioneiros foi recebida com sucesso.
              Em breve, entraremos em contato pelo WhatsApp para confirmar os próximos passos.
            </p>
            <p className="text-sm text-zinc-500 mb-6">
              Uma mensagem de autorização será enviada ao seu contato de emergência indicado.
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
            <p className="text-sm text-zinc-400">Inscrição de Participante</p>
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
          onStepClick={(step) => { if (step < currentStep) goToStep(step); }}
        />
      </div>

      {/* Form Content with animation */}
      <main className="container max-w-3xl mx-auto px-4 pb-12">
        <div
          className={cn(
            "transition-all duration-300 ease-in-out",
            isAnimating && slideDirection === "right" && "opacity-0 translate-x-8",
            isAnimating && slideDirection === "left" && "opacity-0 -translate-x-8",
            !isAnimating && "opacity-100 translate-x-0"
          )}
        >
          {/* Step 1: Dados Pessoais */}
          {currentStep === 0 && (
            <Card className="bg-zinc-900 border-zinc-800 animate-in fade-in duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <User className="w-5 h-5 text-[#FF4500]" /> Dados Pessoais
                </CardTitle>
                <CardDescription>Preencha seus dados pessoais conforme documento de identidade.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ValidatedInput
                    className="md:col-span-2"
                    label="Nome Completo"
                    required
                    value={personal.fullName}
                    onChange={(v) => setPersonal({ ...personal, fullName: v })}
                    placeholder="Nome conforme documento"
                    validate={(v) => v.length >= 3}
                    errorMessage="Nome deve ter pelo menos 3 caracteres"
                  />
                  <ValidatedInput
                    label="CPF"
                    required
                    value={personal.cpf}
                    onChange={(v) => setPersonal({ ...personal, cpf: v })}
                    mask={maskCPF}
                    validate={isValidCPF}
                    placeholder="000.000.000-00"
                    errorMessage="CPF inválido"
                  />
                  <ValidatedInput
                    label="RG"
                    value={personal.rg}
                    onChange={(v) => setPersonal({ ...personal, rg: v })}
                    placeholder="0000000 SSP/RO"
                  />
                  <div>
                    <Label className="text-sm text-zinc-300">Data de Nascimento<span className="text-red-400 ml-0.5">*</span></Label>
                    <Input type="date" value={personal.birthDate} onChange={(e) => setPersonal({ ...personal, birthDate: e.target.value })} className="mt-1 bg-zinc-800 border-zinc-700 text-white" />
                  </div>
                  <div>
                    <Label className="text-sm text-zinc-300">Estado Civil<span className="text-red-400 ml-0.5">*</span></Label>
                    <Select value={personal.maritalStatus} onValueChange={(v) => setPersonal({ ...personal, maritalStatus: v })}>
                      <SelectTrigger className="mt-1 bg-zinc-800 border-zinc-700"><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        {MARITAL_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <ValidatedInput
                    label="Telefone Celular"
                    required
                    value={personal.phone}
                    onChange={(v) => setPersonal({ ...personal, phone: v })}
                    mask={maskPhone}
                    validate={isValidPhone}
                    placeholder="(69) 99999-9999"
                    errorMessage="Telefone inválido (DDD + 9 dígitos)"
                  />
                  <ValidatedInput
                    label="WhatsApp"
                    required
                    value={personal.whatsapp}
                    onChange={(v) => setPersonal({ ...personal, whatsapp: v })}
                    mask={maskPhone}
                    validate={isValidPhone}
                    placeholder="(69) 99999-9999"
                    errorMessage="WhatsApp inválido (DDD + 9 dígitos)"
                  />
                  <ValidatedInput
                    className="md:col-span-2"
                    label="E-mail"
                    required
                    type="email"
                    value={personal.email}
                    onChange={(v) => setPersonal({ ...personal, email: v })}
                    validate={isValidEmail}
                    placeholder="seu@email.com"
                    errorMessage="E-mail inválido"
                  />
                  <ValidatedInput
                    className="md:col-span-2"
                    label="Endereço Completo"
                    required
                    value={personal.address}
                    onChange={(v) => setPersonal({ ...personal, address: v })}
                    placeholder="Rua, número, complemento"
                  />
                  <ValidatedInput
                    label="Bairro"
                    required
                    value={personal.neighborhood}
                    onChange={(v) => setPersonal({ ...personal, neighborhood: v })}
                    placeholder="Bairro"
                  />
                  <ValidatedInput
                    label="Cidade"
                    required
                    value={personal.city}
                    onChange={(v) => setPersonal({ ...personal, city: v })}
                    placeholder="Porto Velho"
                  />
                  <ValidatedInput
                    label="UF"
                    required
                    value={personal.state}
                    onChange={(v) => setPersonal({ ...personal, state: v.toUpperCase() })}
                    placeholder="RO"
                    maxLength={2}
                    validate={(v) => v.length === 2}
                    errorMessage="UF deve ter 2 letras"
                  />
                  <div className="relative">
                    <ValidatedInput
                      label="CEP"
                      required
                      value={personal.zipCode}
                      onChange={async (v) => {
                        setPersonal({ ...personal, zipCode: v });
                        const digits = v.replace(/\D/g, "");
                        if (digits.length === 8) {
                          const result = await cepLookup.lookup(v);
                          if (result) {
                            setPersonal(prev => ({
                              ...prev,
                              zipCode: v,
                              address: result.logradouro || prev.address,
                              neighborhood: result.bairro || prev.neighborhood,
                              city: result.localidade || prev.city,
                              state: result.uf || prev.state,
                            }));
                            toast.success("Endereço preenchido automaticamente!");
                          }
                        }
                      }}
                      mask={maskCEP}
                      validate={isValidCEP}
                      placeholder="76800-000"
                      errorMessage="CEP inválido (8 dígitos)"
                    />
                    {cepLookup.loading && (
                      <div className="absolute right-3 top-8">
                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      </div>
                    )}
                    {cepLookup.error && (
                      <p className="text-xs text-amber-400 mt-1">{cepLookup.error}</p>
                    )}
                  </div>
                  <ValidatedInput
                    label="Profissão"
                    value={personal.profession}
                    onChange={(v) => setPersonal({ ...personal, profession: v })}
                    placeholder="Sua profissão"
                  />
                  <div>
                    <Label className="text-sm text-zinc-300">Tamanho da Camiseta<span className="text-red-400 ml-0.5">*</span></Label>
                    <Select value={personal.shirtSize} onValueChange={(v) => setPersonal({ ...personal, shirtSize: v })}>
                      <SelectTrigger className="mt-1 bg-zinc-800 border-zinc-700"><SelectValue placeholder="Selecione" /></SelectTrigger>
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
            <Card className="bg-zinc-900 border-zinc-800 animate-in fade-in duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Heart className="w-5 h-5 text-[#FF4500]" /> Informações Médicas
                </CardTitle>
                <CardDescription>Dados importantes para sua segurança durante o evento.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-sm text-zinc-300">Tipo Sanguíneo<span className="text-red-400 ml-0.5">*</span></Label>
                  <Select value={medical.bloodType} onValueChange={(v) => setMedical({ ...medical, bloodType: v })}>
                    <SelectTrigger className="mt-1 bg-zinc-800 border-zinc-700"><SelectValue placeholder="Selecione" /></SelectTrigger>
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
                  {medical.hasAllergy && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                      <Textarea value={medical.allergyDetails} onChange={(e) => setMedical({ ...medical, allergyDetails: e.target.value })} placeholder="Descreva suas alergias (medicamentos, alimentos, etc.)" className="bg-zinc-800 border-zinc-700" />
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
                    <Label className="cursor-pointer">Usa medicação contínua?</Label>
                    <Switch checked={medical.hasMedication} onCheckedChange={(v) => setMedical({ ...medical, hasMedication: v })} />
                  </div>
                  {medical.hasMedication && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                      <Textarea value={medical.medicationDetails} onChange={(e) => setMedical({ ...medical, medicationDetails: e.target.value })} placeholder="Liste os medicamentos que utiliza" className="bg-zinc-800 border-zinc-700" />
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
                    <Label className="cursor-pointer">Possui doença crônica?</Label>
                    <Switch checked={medical.hasChronicDisease} onCheckedChange={(v) => setMedical({ ...medical, hasChronicDisease: v })} />
                  </div>
                  {medical.hasChronicDisease && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                      <Textarea value={medical.chronicDiseaseDetails} onChange={(e) => setMedical({ ...medical, chronicDiseaseDetails: e.target.value })} placeholder="Descreva a doença e tratamento" className="bg-zinc-800 border-zinc-700" />
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
                    <Label className="cursor-pointer">Restrição física para atividades?</Label>
                    <Switch checked={medical.hasPhysicalRestriction} onCheckedChange={(v) => setMedical({ ...medical, hasPhysicalRestriction: v })} />
                  </div>
                  {medical.hasPhysicalRestriction && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                      <Textarea value={medical.physicalRestrictionDetails} onChange={(e) => setMedical({ ...medical, physicalRestrictionDetails: e.target.value })} placeholder="Descreva a restrição (ex: não pode correr, problema no joelho)" className="bg-zinc-800 border-zinc-700" />
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
                    <Label className="cursor-pointer">Restrição alimentar?</Label>
                    <Switch checked={medical.hasFoodRestriction} onCheckedChange={(v) => setMedical({ ...medical, hasFoodRestriction: v })} />
                  </div>
                  {medical.hasFoodRestriction && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                      <Textarea value={medical.foodRestrictionDetails} onChange={(e) => setMedical({ ...medical, foodRestrictionDetails: e.target.value })} placeholder="Descreva (ex: vegetariano, intolerância a lactose, celíaco)" className="bg-zinc-800 border-zinc-700" />
                    </div>
                  )}
                </div>

                <ValidatedInput
                  label="Plano de Saúde (nome e número do cartão)"
                  value={medical.healthInsurance}
                  onChange={(v) => setMedical({ ...medical, healthInsurance: v })}
                  placeholder="Ex: Unimed 0000000000"
                />

                <div>
                  <Label className="text-sm text-zinc-300">Observações adicionais de saúde</Label>
                  <Textarea value={medical.healthObservations} onChange={(e) => setMedical({ ...medical, healthObservations: e.target.value })} placeholder="Qualquer informação relevante para a equipe médica" className="mt-1 bg-zinc-800 border-zinc-700" />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Contato de Emergência */}
          {currentStep === 2 && (
            <Card className="bg-zinc-900 border-zinc-800 animate-in fade-in duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Phone className="w-5 h-5 text-[#FF4500]" /> Contato de Emergência
                </CardTitle>
                <CardDescription>
                  Informe pelo menos um contato de emergência. Para participantes casados, a esposa é o contato de autorização.
                  Para solteiros, a mãe ou responsável.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {emergencyContacts.map((contact, index) => (
                  <div key={index} className="p-4 border border-zinc-700 rounded-lg space-y-4 animate-in fade-in duration-200">
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
                      <ValidatedInput
                        className="md:col-span-2"
                        label="Nome Completo"
                        required
                        value={contact.name}
                        onChange={(v) => updateEmergencyContact(index, "name", v)}
                        placeholder="Nome do contato"
                      />
                      <div>
                        <Label className="text-sm text-zinc-300">Vínculo<span className="text-red-400 ml-0.5">*</span></Label>
                        <Select value={contact.relationship} onValueChange={(v) => updateEmergencyContact(index, "relationship", v)}>
                          <SelectTrigger className="mt-1 bg-zinc-800 border-zinc-700"><SelectValue placeholder="Selecione o vínculo" /></SelectTrigger>
                          <SelectContent>
                            {RELATIONSHIP_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      {contact.relationship === "outro" && (
                        <ValidatedInput
                          label="Especifique o vínculo"
                          value={contact.relationshipOther}
                          onChange={(v) => updateEmergencyContact(index, "relationshipOther", v)}
                          placeholder="Ex: padrinho, amigo"
                        />
                      )}
                      <ValidatedInput
                        label="Telefone"
                        required
                        value={contact.phone}
                        onChange={(v) => updateEmergencyContact(index, "phone", v)}
                        mask={maskPhone}
                        validate={isValidPhone}
                        placeholder="(69) 99999-9999"
                        errorMessage="Telefone inválido"
                      />
                      <ValidatedInput
                        label="WhatsApp"
                        required
                        value={contact.whatsapp}
                        onChange={(v) => updateEmergencyContact(index, "whatsapp", v)}
                        mask={maskPhone}
                        validate={isValidPhone}
                        placeholder="(69) 99999-9999"
                        errorMessage="WhatsApp inválido"
                      />
                      <ValidatedInput
                        label="E-mail"
                        value={contact.email}
                        onChange={(v) => updateEmergencyContact(index, "email", v)}
                        validate={contact.email ? isValidEmail : undefined}
                        placeholder="email@exemplo.com"
                        errorMessage="E-mail inválido"
                      />
                      <ValidatedInput
                        label="Cidade"
                        value={contact.city}
                        onChange={(v) => updateEmergencyContact(index, "city", v)}
                        placeholder="Cidade/UF"
                      />
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

          {/* Step 4: Informações Eclesiásticas */}
          {currentStep === 3 && (
            <Card className="bg-zinc-900 border-zinc-800 animate-in fade-in duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Church className="w-5 h-5 text-[#FF4500]" /> Informações Eclesiásticas
                </CardTitle>
                <CardDescription>Dados sobre sua vida espiritual e comunidade.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-sm text-zinc-300">Igreja<span className="text-red-400 ml-0.5">*</span></Label>
                  {!church.newChurch ? (
                    <div className="space-y-2 mt-1">
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
                    <div className="space-y-4 p-4 border border-zinc-700 rounded-lg mt-1 animate-in fade-in slide-in-from-top-2 duration-200">
                      <p className="text-sm text-zinc-400">Cadastrar nova igreja:</p>
                      <ValidatedInput
                        label="Nome da Igreja"
                        required
                        value={church.churchName}
                        onChange={(v) => setChurch({ ...church, churchName: v })}
                        placeholder="Nome da igreja"
                      />
                      <div>
                        <Label className="text-sm text-zinc-300">Denominação<span className="text-red-400 ml-0.5">*</span></Label>
                        <Select value={church.denomination} onValueChange={(v) => setChurch({ ...church, denomination: v })}>
                          <SelectTrigger className="mt-1 bg-zinc-800 border-zinc-700"><SelectValue placeholder="Denominação" /></SelectTrigger>
                          <SelectContent>
                            {DENOMINATIONS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button variant="link" className="text-zinc-400 p-0 h-auto text-sm" onClick={() => setChurch({ ...church, newChurch: false, churchName: "", denomination: "" })}>
                        ← Voltar para seleção
                      </Button>
                    </div>
                  )}
                </div>

                {!church.newChurch && !church.churchId && (
                  <div>
                    <Label className="text-sm text-zinc-300">Denominação/Segmento<span className="text-red-400 ml-0.5">*</span></Label>
                    <Select value={church.denomination} onValueChange={(v) => setChurch({ ...church, denomination: v })}>
                      <SelectTrigger className="mt-1 bg-zinc-800 border-zinc-700"><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        {DENOMINATIONS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ValidatedInput
                    label="Membro desde"
                    value={church.memberSince}
                    onChange={(v) => setChurch({ ...church, memberSince: v })}
                    placeholder="MM/AAAA"
                  />
                  <ValidatedInput
                    label="Função na igreja"
                    value={church.ministryRole}
                    onChange={(v) => setChurch({ ...church, ministryRole: v })}
                    placeholder="Ex: líder de louvor, diácono"
                  />
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
              </CardContent>
            </Card>
          )}

          {/* Step 5: Confirmação */}
          {currentStep === 4 && (
            <Card className="bg-zinc-900 border-zinc-800 animate-in fade-in duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <ClipboardCheck className="w-5 h-5 text-[#FF4500]" /> Revisão e Confirmação
                </CardTitle>
                <CardDescription>Revise seus dados antes de enviar a inscrição.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-zinc-800 rounded-lg">
                  <h4 className="text-sm font-bold text-[#FF4500] mb-2">Dados Pessoais</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-zinc-400">Nome:</span><span className="text-white">{personal.fullName}</span>
                    <span className="text-zinc-400">CPF:</span><span className="text-white">{maskCPF(personal.cpf)}</span>
                    <span className="text-zinc-400">Nascimento:</span><span className="text-white">{personal.birthDate}</span>
                    <span className="text-zinc-400">Estado Civil:</span><span className="text-white">{MARITAL_OPTIONS.find(o => o.value === personal.maritalStatus)?.label || personal.maritalStatus}</span>
                    <span className="text-zinc-400">WhatsApp:</span><span className="text-white">{maskPhone(personal.whatsapp)}</span>
                    <span className="text-zinc-400">E-mail:</span><span className="text-white">{personal.email}</span>
                    <span className="text-zinc-400">Cidade:</span><span className="text-white">{personal.city}/{personal.state}</span>
                    <span className="text-zinc-400">CEP:</span><span className="text-white">{maskCEP(personal.zipCode)}</span>
                    <span className="text-zinc-400">Camiseta:</span><span className="text-white">{personal.shirtSize}</span>
                  </div>
                </div>

                <div className="p-4 bg-zinc-800 rounded-lg">
                  <h4 className="text-sm font-bold text-[#FF4500] mb-2">Saúde</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-zinc-400">Tipo Sanguíneo:</span><span className="text-white">{medical.bloodType}</span>
                    <span className="text-zinc-400">Alergias:</span><span className="text-white">{medical.hasAllergy ? medical.allergyDetails : "Não"}</span>
                    <span className="text-zinc-400">Medicação:</span><span className="text-white">{medical.hasMedication ? medical.medicationDetails : "Não"}</span>
                    <span className="text-zinc-400">Restrição física:</span><span className="text-white">{medical.hasPhysicalRestriction ? medical.physicalRestrictionDetails : "Não"}</span>
                    <span className="text-zinc-400">Restrição alimentar:</span><span className="text-white">{medical.hasFoodRestriction ? medical.foodRestrictionDetails : "Não"}</span>
                  </div>
                </div>

                <div className="p-4 bg-zinc-800 rounded-lg">
                  <h4 className="text-sm font-bold text-[#FF4500] mb-2">Contato de Emergência</h4>
                  {emergencyContacts.map((c, i) => (
                    <div key={i} className="grid grid-cols-2 gap-2 text-sm mb-2">
                      <span className="text-zinc-400">Nome:</span><span className="text-white">{c.name}</span>
                      <span className="text-zinc-400">Vínculo:</span><span className="text-white">{RELATIONSHIP_OPTIONS.find(o => o.value === c.relationship)?.label || c.relationship}</span>
                      <span className="text-zinc-400">WhatsApp:</span><span className="text-white">{maskPhone(c.whatsapp)}</span>
                      <span className="text-zinc-400">Autorização:</span><span className="text-white">{c.isAuthorizationContact ? "Sim ✓" : "Não"}</span>
                    </div>
                  ))}
                </div>

                <div className="p-4 bg-zinc-800 rounded-lg">
                  <h4 className="text-sm font-bold text-[#FF4500] mb-2">Igreja</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-zinc-400">Igreja:</span><span className="text-white">{church.churchName || "Selecionada do cadastro"}</span>
                    <span className="text-zinc-400">Denominação:</span><span className="text-white">{church.denomination}</span>
                    <span className="text-zinc-400">Batizado:</span><span className="text-white">{church.baptized ? "Sim" : "Não"}</span>
                    <span className="text-zinc-400">Batizado E.S.:</span><span className="text-white">{church.baptizedHolySpirit ? "Sim" : "Não"}</span>
                  </div>
                </div>

                <div className="p-4 bg-[#FF4500]/10 border border-[#FF4500]/30 rounded-lg">
                  <p className="text-sm text-zinc-300">
                    Ao enviar esta inscrição, você confirma que todas as informações são verdadeiras e autoriza o envio de mensagem
                    de confirmação ao seu contato de emergência indicado. Seus dados serão utilizados exclusivamente para fins
                    de organização do TOP 1870 — Destemidos Pioneiros.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-6">
          <Button
            variant="outline"
            onClick={() => goToStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0 || isAnimating}
            className="border-zinc-700 text-zinc-300"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Anterior
          </Button>

          {currentStep < STEPS.length - 1 ? (
            <Button
              onClick={() => goToStep(currentStep + 1)}
              disabled={!canAdvance || isAnimating}
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
