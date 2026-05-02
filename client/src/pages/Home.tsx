/*
 * Design: "Legendários" — Dark Cinematic
 * Palette: Preto (#0F0F0F), Laranjado (#FF4500), Ember (#E63900), Steel (#6B6B6B)
 * Typography: Playfair Display (titles) + DM Sans (body)
 */

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  Flame,
  Shield,
  Mountain,
  Heart,
  Users,
  Bot,
  BarChart3,
  MessageCircle,
  CreditCard,
  Smartphone,
  Mail,
  Target,
  Zap,
  Globe,
  MapPin,
  Calendar,
  ArrowRight,
  CheckCircle2,
  Star,
  Menu,
  X,
  Quote,
  Loader2,
  AlertCircle,
  Droplets,
  HandHeart,
  Timer,
  Sparkles,
} from "lucide-react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

// ─── Image URLs ────────────────────────────────────────────
const IMAGES = {
  hero: "https://d2xsxph8kpxj0f.cloudfront.net/310419663028978368/S84CDFgDSnL8B2KjgsuVBm/hero-legendarios-3cDdiJuASwrFHxWwYkXgCi.webp",
  top: "https://d2xsxph8kpxj0f.cloudfront.net/310419663028978368/S84CDFgDSnL8B2KjgsuVBm/top-event-GvEwZ73U9cg6WzvQJaNVTw.webp",
  rem: "https://d2xsxph8kpxj0f.cloudfront.net/310419663028978368/S84CDFgDSnL8B2KjgsuVBm/rem-event-LD4Q73pVizF3ytPZdJBadh.webp",
  legado: "https://d2xsxph8kpxj0f.cloudfront.net/310419663028978368/S84CDFgDSnL8B2KjgsuVBm/legado-event-ENjwXTy8VddLNVExgTWYsc.webp",
  dashboard: "https://d2xsxph8kpxj0f.cloudfront.net/310419663028978368/S84CDFgDSnL8B2KjgsuVBm/platform-dashboard-3xuwt8HWhH4s2VZLsoC5Em.webp",
};

// ─── Animated counter ──────────────────────────────────────
function Counter({ end, suffix = "", duration = 2000 }: { end: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [inView, end, duration]);

  return (
    <span ref={ref}>
      {count.toLocaleString("pt-BR")}
      {suffix}
    </span>
  );
}

// ─── Fade-in wrapper ───────────────────────────────────────
function FadeIn({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40, filter: "blur(8px)" }}
      animate={inView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Navigation ────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const links = [
    { label: "O Movimento", href: "#movimento" },
    { label: "Eventos", href: "#eventos" },
    { label: "Depoimentos", href: "#depoimentos" },
    { label: "Plataforma", href: "#plataforma" },
    { label: "Inscreva-se", href: "#inscricao" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-[#0F0F0F]/95 backdrop-blur-xl border-b border-white/5 shadow-2xl"
          : "bg-transparent"
      }`}
    >
      <div className="container flex items-center justify-between h-16 md:h-20">
        <a href="#" className="flex items-center gap-2">
          <img
            src="/manus-storage/legendarios-logo-laranja_5596bd58.png"
            alt="Legendários"
            className="h-10 md:h-12 w-auto"
          />
        </a>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-white/70 hover:text-forge-gold transition-colors duration-300"
            >
              {l.label}
            </a>
          ))}
        </div>

        <a
          href="#inscricao"
          className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-forge-gold text-[#0F0F0F] font-semibold text-sm hover:brightness-110 transition-all forge-glow"
        >
          Quero Participar
          <ArrowRight className="w-4 h-4" />
        </a>

        {/* Mobile toggle */}
        <button className="md:hidden text-white" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#0F0F0F]/98 backdrop-blur-xl border-b border-white/5 overflow-hidden"
          >
            <div className="container py-6 flex flex-col gap-4">
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-base font-medium text-white/80 hover:text-forge-gold transition-colors py-2"
                >
                  {l.label}
                </a>
              ))}
              <a
                href="#inscricao"
                onClick={() => setMobileOpen(false)}
                className="mt-2 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-forge-gold text-[#0F0F0F] font-semibold text-sm"
              >
                Quero Participar
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

// ─── Hero Section ──────────────────────────────────────────
function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={IMAGES.hero}
          alt="Legendários na trilha"
          className="w-full h-full object-cover"
        />
        <div className="cinematic-overlay absolute inset-0" />
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#0F0F0F] to-transparent" />
      </div>

      <div className="relative z-10 container text-center px-4 pt-20">
        <FadeIn>
          <p className="text-forge-gold font-semibold tracking-[0.3em] uppercase text-xs md:text-sm mb-6">
            TOP Destemidos Pioneiros — Porto Velho/RO
          </p>
        </FadeIn>

        <FadeIn delay={0.15}>
          <h1
            className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold text-white leading-[0.95] mb-6"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Devolvemos o{" "}
            <span className="text-forge-gradient">Herói</span>
            <br />
            a Cada Família
          </h1>
        </FadeIn>

        <FadeIn delay={0.3}>
          <p className="max-w-2xl mx-auto text-base md:text-lg text-white/70 leading-relaxed mb-10">
            Uma plataforma full service com Inteligência Artificial para gestão completa
            de eventos, marketing digital e transformação de vidas. Do primeiro contato
            ao pós-evento, tudo automatizado.
          </p>
        </FadeIn>

        <FadeIn delay={0.45}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <a
              href="#inscricao"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-forge-gold text-[#0F0F0F] font-bold text-base hover:brightness-110 transition-all forge-glow"
            >
              <Flame className="w-5 h-5" />
              Inscreva-se no TOP Destemidos Pioneiros
            </a>
            <a
              href="#plataforma"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-lg border border-white/20 text-white font-medium text-base hover:bg-white/5 transition-all"
            >
              Conheça a Plataforma
              <ChevronDown className="w-4 h-4" />
            </a>
          </div>
        </FadeIn>

        {/* Stats bar */}
        <FadeIn delay={0.6}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-12 max-w-3xl mx-auto">
            {[
              { value: 189000, suffix: "+", label: "Legendários" },
              { value: 24, suffix: "", label: "Países" },
              { value: 70, suffix: "+", label: "Cidades" },
              { value: 10, suffix: "+", label: "Anos" },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-forge-gold" style={{ fontFamily: "'Playfair Display', serif" }}>
                  <Counter end={s.value} suffix={s.suffix} />
                </div>
                <div className="text-xs md:text-sm text-white/50 mt-1 uppercase tracking-wider">{s.label}</div>
              </div>
            ))}
          </div>
        </FadeIn>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <ChevronDown className="w-6 h-6 text-white/30" />
        </motion.div>
      </div>
    </section>
  );
}

// ─── Countdown Timer ───────────────────────────────
function CountdownTimer({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const target = new Date(targetDate).getTime();
    const update = () => {
      const now = Date.now();
      const diff = Math.max(0, target - now);
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="grid grid-cols-4 gap-3">
      {[
        { value: timeLeft.days, label: "Dias" },
        { value: timeLeft.hours, label: "Horas" },
        { value: timeLeft.minutes, label: "Min" },
        { value: timeLeft.seconds, label: "Seg" },
      ].map((unit, i) => (
        <div key={i} className="text-center p-3 rounded-xl bg-[#0F0F0F]/60 border border-forge-gold/20">
          <div className="text-2xl md:text-3xl font-bold text-forge-gold" style={{ fontFamily: "'Playfair Display', serif" }}>
            {String(unit.value).padStart(2, "0")}
          </div>
          <div className="text-[10px] text-white/40 uppercase tracking-wider mt-1">{unit.label}</div>
        </div>
      ))}
    </div>
  );
}

// ─── About / Movement Section ──────────────────────────
function MovementSection() {
  return (
    <section id="movimento" className="py-24 md:py-32 relative">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <FadeIn>
              <p className="text-forge-gold font-semibold tracking-[0.2em] uppercase text-xs mb-4">
                Desde 2015 — Guatemala
              </p>
              <h2
                className="text-3xl md:text-5xl font-bold text-white leading-tight mb-6"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                O Que é o Movimento{" "}
                <span className="text-forge-gradient">Legendários</span>?
              </h2>
            </FadeIn>

            <FadeIn delay={0.1}>
              <p className="text-white/70 text-base md:text-lg leading-relaxed mb-6">
                Legendários é um movimento cristocêntrico que busca a transformação de homens,
                famílias e comunidades por meio de experiências que levam os homens a encontrar
                a melhor versão de si mesmos e seu novo potencial. Fundado na Guatemala por
                Chepe Putzu, o movimento já impactou mais de 189 mil vidas em 24 países.
                Seus pilares são <strong className="text-forge-gold">Amor, Honra e Unidade (AHU)</strong>,
                e cada Legendário assume os <strong className="text-white">24 Nós</strong> — compromissos
                que guiam sua caminhada como homem de Deus.
              </p>
            </FadeIn>

            <FadeIn delay={0.2}>
              <p className="text-white/70 text-base md:text-lg leading-relaxed mb-8">
                No Brasil, o movimento chegou em 2017 através do Track Vale Europeu em
                Balneário Camboriú/SC, e hoje é o país com o maior número de Legendários
                no mundo, com mais de <strong className="text-white">110.000 homens transformados</strong>.
                O Track "Destemidos Pioneiros" de Porto Velho/RO é uma das sedes mais ativas
                do país, com múltiplos TOPs realizados anualmente na natureza amazônica.
              </p>
            </FadeIn>

            <FadeIn delay={0.3}>
              <div className="flex flex-wrap gap-3">
                {["Amor (A)", "Honra (H)", "Unidade (U)", "24 Nós", "Inquebrantáveis"].map(
                  (tag, i) => (
                    <span
                      key={i}
                      className="px-4 py-2 rounded-full border border-forge-gold/30 text-forge-gold text-sm font-medium bg-forge-gold/5"
                    >
                      {tag}
                    </span>
                  )
                )}
              </div>
            </FadeIn>
          </div>

          <FadeIn delay={0.2}>
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-forge-gold/10 to-transparent rounded-2xl blur-2xl" />
              <div className="relative grid grid-cols-2 gap-4">
                {[
                  { icon: Globe, label: "24 Países", desc: "Presença global" },
                  { icon: Users, label: "189.000+", desc: "Legendários" },
                  { icon: MapPin, label: "110.000+", desc: "No Brasil" },
                  { icon: Flame, label: "10+ Anos", desc: "De transformação" },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="p-6 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-forge-gold/20 transition-all duration-500 group"
                  >
                    <item.icon className="w-8 h-8 text-forge-gold mb-3 group-hover:scale-110 transition-transform" />
                    <div className="text-xl font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                      {item.label}
                    </div>
                    <div className="text-sm text-white/50">{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>

        {/* Ações Humanitárias */}
        <FadeIn delay={0.4}>
          <div className="mt-20">
            <p className="text-forge-gold font-semibold tracking-[0.2em] uppercase text-xs mb-6 text-center">
              Impacto Social
            </p>
            <div className="grid sm:grid-cols-3 gap-6">
              {[
                {
                  icon: Droplets,
                  title: "Águafrica",
                  desc: "100 poços artesianos em Angola e Guiné-Bissau, levando água potável a comunidades inteiras.",
                },
                {
                  icon: HandHeart,
                  title: "Enchentes MG",
                  desc: "800+ voluntários Legendários e 40+ toneladas de doações nas enchentes de Minas Gerais.",
                },
                {
                  icon: Sparkles,
                  title: "Touch Peace",
                  desc: "App gratuito de saúde emocional em parceria com Augusto Cury, alcançando milhões.",
                },
              ].map((action, i) => (
                <div
                  key={i}
                  className="p-6 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-forge-gold/20 transition-all duration-500 group"
                >
                  <action.icon className="w-8 h-8 text-forge-gold mb-3 group-hover:scale-110 transition-transform" />
                  <h4 className="text-lg font-bold text-white mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {action.title}
                  </h4>
                  <p className="text-sm text-white/50 leading-relaxed">{action.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

// ─── Events Section ────────────────────────────────────────
function EventsSection() {
  const events = [
    {
      name: "TOP Destemidos Pioneiros",
      full: "Track Outdoor de Potencial — Porto Velho/RO",
      audience: "Homens",
      duration: "4 dias (72h)",
      image: IMAGES.top,
      description:
        "Uma experiência imersiva de 72 horas na natureza amazônica, onde homens enfrentam desafios físicos, espirituais e emocionais para alcançar seu potencial máximo. O TOP Destemidos Pioneiros é o coração do Movimento Legendários em Porto Velho.",
      icon: Mountain,
      highlight: true,
    },
    {
      name: "REM",
      full: "Reto de Empoderamento Matrimonial",
      audience: "Casais",
      duration: "2 dias",
      image: IMAGES.rem,
      description:
        "Uma jornada de fortalecimento espiritual, emocional e prático do casamento. Casais vivenciam dinâmicas que restauram a comunicação e renovam o compromisso mútuo.",
      icon: Heart,
      highlight: false,
    },
    {
      name: "LEGADO",
      full: "Reto Familiar",
      audience: "Pais e Filhos(as)",
      duration: "Variável",
      image: IMAGES.legado,
      description:
        "Uma experiência que fortalece valores familiares e aprofunda o relacionamento entre pais e filhos, construindo um legado de amor e propósito para as próximas gerações.",
      icon: Shield,
      highlight: false,
    },
  ];

  return (
    <section id="eventos" className="py-24 md:py-32 relative">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-forge-gold/20 to-transparent" />

      <div className="container">
        <FadeIn>
          <div className="text-center mb-16">
            <p className="text-forge-gold font-semibold tracking-[0.2em] uppercase text-xs mb-4">
              Experiências Transformadoras
            </p>
            <h2
              className="text-3xl md:text-5xl font-bold text-white"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Nossos Eventos
            </h2>
          </div>
        </FadeIn>

        <div className="grid md:grid-cols-3 gap-6">
          {events.map((ev, i) => (
            <FadeIn key={ev.name} delay={i * 0.15}>
              <div
                className={`group relative rounded-2xl overflow-hidden border transition-all duration-500 h-full ${
                  ev.highlight
                    ? "border-forge-gold/30 hover:border-forge-gold/60"
                    : "border-white/[0.06] hover:border-white/15"
                }`}
              >
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={ev.image}
                    alt={ev.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F0F] via-[#0F0F0F]/40 to-transparent" />
                  <div className="absolute top-4 left-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        ev.highlight
                          ? "bg-forge-gold text-[#0F0F0F]"
                          : "bg-white/10 text-white/80 backdrop-blur-sm"
                      }`}
                    >
                      {ev.audience}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <ev.icon className="w-5 h-5 text-forge-gold" />
                    <h3
                      className="text-xl font-bold text-white"
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      {ev.name}
                    </h3>
                  </div>
                  <p className="text-forge-gold/80 text-sm font-medium mb-3">{ev.full}</p>
                  <p className="text-white/60 text-sm leading-relaxed mb-4">{ev.description}</p>
                  <div className="flex items-center gap-2 text-white/40 text-xs">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{ev.duration}</span>
                  </div>
                </div>

                {ev.highlight && (
                  <div className="absolute top-0 right-0 w-20 h-20 overflow-hidden">
                    <div className="absolute top-3 -right-6 rotate-45 bg-forge-ember text-white text-[10px] font-bold py-1 px-8 uppercase tracking-wider">
                      Destaque
                    </div>
                  </div>
                )}
              </div>
            </FadeIn>
          ))}
        </div>

        {/* Porto Velho highlight - TOP 1870 */}
        <FadeIn delay={0.3}>
          <div className="mt-16 p-8 md:p-12 rounded-2xl bg-gradient-to-br from-forge-gold/[0.06] to-transparent border border-forge-gold/15">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <p className="text-forge-gold font-semibold tracking-[0.15em] uppercase text-xs mb-3">
                  Próximo Evento
                </p>
                <h3
                  className="text-2xl md:text-3xl font-bold text-white mb-4"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  TOP 1870 — Destemidos Pioneiros
                </h3>
                <p className="text-white/70 leading-relaxed mb-4">
                  De <strong className="text-white">30 de julho a 02 de agosto de 2026</strong>,
                  Porto Velho será palco do TOP 1870. São 72 horas de transformação, desafio
                  e propósito na natureza amazônica. Inscrições abertas.
                </p>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-forge-gold text-sm font-medium">
                    <Calendar className="w-4 h-4" />
                    30/07 a 02/08/2026 (72 horas)
                  </div>
                  <div className="flex items-center gap-2 text-forge-gold text-sm font-medium">
                    <MapPin className="w-4 h-4" />
                    Porto Velho, Rondônia — Brasil
                  </div>
                </div>
              </div>
              <div>
                <CountdownTimer targetDate="2026-07-30T06:00:00-04:00" />
                <div className="grid grid-cols-3 gap-3 mt-6">
                  {[
                    { label: "TOP 1570", date: "Fev/2026", status: "Realizado" },
                    { label: "TOP 1670", date: "Abr/2026", status: "Realizado" },
                    { label: "TOP 1870", date: "Jul/2026", status: "Inscrições Abertas" },
                  ].map((ev, i) => (
                    <div key={i} className={`text-center p-4 rounded-xl border ${ev.status === "Inscrições Abertas" ? "bg-forge-gold/10 border-forge-gold/30" : "bg-white/[0.03] border-white/[0.06]"}`}>
                      <div className="text-lg font-bold text-forge-gold" style={{ fontFamily: "'Playfair Display', serif" }}>
                        {ev.label}
                      </div>
                      <div className="text-xs text-white/50 mt-1">{ev.date}</div>
                      <div className={`text-[10px] mt-1 font-medium ${ev.status === "Inscrições Abertas" ? "text-forge-gold" : "text-white/30"}`}>
                        {ev.status}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

// ─── Testimonials Section (from database) ──────────────────
function TestimonialsSection() {
  const { data: testimonials, isLoading, isError } = trpc.testimonials.featured.useQuery();
  const [activeIndex, setActiveIndex] = useState(0);

  // Auto-rotate testimonials
  useEffect(() => {
    if (!testimonials || testimonials.length === 0) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [testimonials]);

  const displayTestimonials = testimonials ?? [];

  return (
    <section id="depoimentos" className="py-24 md:py-32 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-forge-gold/20 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-forge-gold/[0.02] to-transparent" />

      <div className="container relative z-10">
        <FadeIn>
          <div className="text-center mb-16">
            <p className="text-forge-gold font-semibold tracking-[0.2em] uppercase text-xs mb-4">
              Vidas Transformadas
            </p>
            <h2
              className="text-3xl md:text-5xl font-bold text-white"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Depoimentos de{" "}
              <span className="text-forge-gradient">Legendários</span>
            </h2>
          </div>
        </FadeIn>

        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-forge-gold animate-spin" />
            <span className="ml-3 text-white/50">Carregando depoimentos...</span>
          </div>
        )}

        {/* Error state */}
        {isError && (
          <div className="flex items-center justify-center py-16">
            <AlertCircle className="w-8 h-8 text-forge-ember" />
            <span className="ml-3 text-white/50">Erro ao carregar depoimentos. Tente novamente mais tarde.</span>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !isError && displayTestimonials.length === 0 && (
          <div className="text-center py-16">
            <Quote className="w-12 h-12 text-forge-gold/20 mx-auto mb-4" />
            <p className="text-white/40">Depoimentos em breve.</p>
          </div>
        )}

        {/* Featured testimonial carousel */}
        {!isLoading && !isError && displayTestimonials.length > 0 && (
        <>
        <FadeIn delay={0.15}>
          <div className="max-w-4xl mx-auto mb-16">
            <AnimatePresence mode="wait">
              {displayTestimonials[activeIndex] && (
                <motion.div
                  key={activeIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="text-center"
                >
                  <Quote className="w-12 h-12 text-forge-gold/30 mx-auto mb-6" />
                  <blockquote>
                    <p
                      className="text-xl md:text-3xl font-medium text-white leading-relaxed italic mb-8"
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      "{displayTestimonials[activeIndex].quote}"
                    </p>
                  </blockquote>

                  {/* Avatar + info */}
                  <div className="flex items-center justify-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-forge-gold/20 border-2 border-forge-gold/40 flex items-center justify-center">
                      <span className="text-forge-gold font-bold text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>
                        {displayTestimonials[activeIndex].name.charAt(0)}
                      </span>
                    </div>
                    <div className="text-left">
                      <p className="text-white font-semibold">{displayTestimonials[activeIndex].name}</p>
                      <p className="text-white/50 text-sm">{displayTestimonials[activeIndex].event}</p>
                      <p className="text-forge-gold/70 text-xs">{displayTestimonials[activeIndex].city}</p>
                    </div>
                  </div>

                  {/* Star rating */}
                  <div className="flex items-center justify-center gap-1 mt-4">
                    {Array.from({ length: displayTestimonials[activeIndex].rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-forge-gold fill-forge-gold" />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Dots navigation */}
            <div className="flex items-center justify-center gap-2 mt-8">
              {displayTestimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                    i === activeIndex
                      ? "bg-forge-gold w-8"
                      : "bg-white/20 hover:bg-white/40"
                  }`}
                />
              ))}
            </div>
          </div>
        </FadeIn>

        {/* Grid of smaller testimonials */}
        <div className="grid md:grid-cols-3 gap-6">
          {displayTestimonials.slice(0, 6).map((t, i) => (
            <FadeIn key={t.id || i} delay={i * 0.1}>
              <div className="p-6 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-forge-gold/20 transition-all duration-500 h-full">
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-3.5 h-3.5 text-forge-gold fill-forge-gold" />
                  ))}
                </div>
                <p className="text-white/70 text-sm leading-relaxed italic mb-4">
                  "{t.quote.length > 150 ? t.quote.substring(0, 150) + "..." : t.quote}"
                </p>
                <div className="flex items-center gap-3 mt-auto">
                  <div className="w-10 h-10 rounded-full bg-forge-gold/15 border border-forge-gold/30 flex items-center justify-center">
                    <span className="text-forge-gold font-bold text-sm">{t.name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{t.name}</p>
                    <p className="text-white/40 text-xs">{t.city}</p>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
        </>
        )}
      </div>
    </section>
  );
}

// ─── Platform / Features Section ───────────────────────────
function PlatformSection() {
  const features = [
    {
      icon: Bot,
      title: "Agentes de IA 24/7",
      desc: "Chatbots avançados no WhatsApp e Instagram que respondem dúvidas, qualificam leads e conduzem até o checkout automaticamente.",
    },
    {
      icon: CreditCard,
      title: "Checkout High Ticket",
      desc: "Pix instantâneo, Cartão em até 10x, pagamentos híbridos e recuperação inteligente de carrinho abandonado.",
    },
    {
      icon: Smartphone,
      title: "Credenciamento Mobile",
      desc: "Check-in via QR Code com funcionamento offline, essencial para eventos em áreas remotas na natureza.",
    },
    {
      icon: BarChart3,
      title: "Dashboard Preditivo",
      desc: "Análise em tempo real com IA que prevê taxa de ocupação e sugere ações de marketing para atingir metas.",
    },
    {
      icon: Mail,
      title: "E-mails Generativos",
      desc: "Réguas de relacionamento pré e pós-evento criadas automaticamente por IA, personalizadas por segmento.",
    },
    {
      icon: MessageCircle,
      title: "Recuperação de Vendas",
      desc: "Automação multicanal acionada após abandono do checkout, com gatilhos mentais personalizados pela IA.",
    },
    {
      icon: Target,
      title: "CRM de Eventos",
      desc: "Perfis detalhados rastreando a jornada completa: do primeiro TOP Destemidos Pioneiros ao REM, LEGADO e TOP Master.",
    },
    {
      icon: Zap,
      title: "Split de Pagamentos",
      desc: "Divisão automática de receitas entre sede local, organização nacional e taxas da plataforma.",
    },
  ];

  return (
    <section id="plataforma" className="py-24 md:py-32 relative">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-forge-gold/20 to-transparent" />

      <div className="container">
        <div className="grid lg:grid-cols-2 gap-16 items-start mb-20">
          <div>
            <FadeIn>
              <p className="text-forge-gold font-semibold tracking-[0.2em] uppercase text-xs mb-4">
                Tecnologia + Inteligência Artificial
              </p>
              <h2
                className="text-3xl md:text-5xl font-bold text-white leading-tight mb-6"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Uma Plataforma que{" "}
                <span className="text-forge-gradient">Pensa por Você</span>
              </h2>
            </FadeIn>
            <FadeIn delay={0.1}>
              <p className="text-white/70 text-base md:text-lg leading-relaxed">
                Superamos as limitações de plataformas tradicionais como Ticket and GO e Sympla,
                injetando Inteligência Artificial em cada etapa do funil. Do marketing à gestão
                financeira, cada processo é automatizado para que você foque no que importa:
                transformar vidas.
              </p>
            </FadeIn>
          </div>

          <FadeIn delay={0.2}>
            <div className="relative rounded-2xl overflow-hidden border border-white/[0.06]">
              <img
                src={IMAGES.dashboard}
                alt="Dashboard da plataforma"
                className="w-full h-auto"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F0F]/60 to-transparent" />
            </div>
          </FadeIn>
        </div>

        {/* Features grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f, i) => (
            <FadeIn key={f.title} delay={i * 0.08}>
              <div className="group p-6 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-forge-gold/25 hover:bg-white/[0.04] transition-all duration-500 h-full">
                <div className="w-10 h-10 rounded-lg bg-forge-gold/10 flex items-center justify-center mb-4 group-hover:bg-forge-gold/20 transition-colors">
                  <f.icon className="w-5 h-5 text-forge-gold" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{f.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Comparison Table ──────────────────────────────────────
function ComparisonSection() {
  const rows = [
    { feature: "Foco Principal", ticketgo: "Eventos Gerais", sympla: "Amplo Espectro", ours: "High Ticket + IA" },
    { feature: "Criação de Eventos", ticketgo: "Manual", sympla: "Manual", ours: "Agentic AI" },
    { feature: "Atendimento", ticketgo: "Humano (WhatsApp)", sympla: "Central / E-mail", ours: "IA 24/7" },
    { feature: "Recuperação de Vendas", ticketgo: "Básica", sympla: "Básica", ours: "IA Multicanal" },
    { feature: "CRM e Histórico", ticketgo: "Básico", sympla: "Intermediário", ours: "Jornada Completa" },
    { feature: "Design de Interface", ticketgo: "Padrão", sympla: "Padrão", ours: "Apple Clear" },
    { feature: "Credenciamento Offline", ticketgo: "Não", sympla: "Não", ours: "Sim" },
    { feature: "Dashboard Preditivo", ticketgo: "Não", sympla: "Não", ours: "Sim (IA)" },
  ];

  return (
    <section className="py-24 md:py-32 relative">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-forge-gold/20 to-transparent" />

      <div className="container">
        <FadeIn>
          <div className="text-center mb-16">
            <p className="text-forge-gold font-semibold tracking-[0.2em] uppercase text-xs mb-4">
              Análise Comparativa
            </p>
            <h2
              className="text-3xl md:text-5xl font-bold text-white"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Por Que Somos Diferentes
            </h2>
          </div>
        </FadeIn>

        <FadeIn delay={0.15}>
          <div className="overflow-x-auto rounded-2xl border border-white/[0.06]">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left p-5 text-sm font-semibold text-white/50 uppercase tracking-wider">Funcionalidade</th>
                  <th className="text-center p-5 text-sm font-semibold text-white/50 uppercase tracking-wider">Ticket and GO</th>
                  <th className="text-center p-5 text-sm font-semibold text-white/50 uppercase tracking-wider">Sympla</th>
                  <th className="text-center p-5 text-sm font-semibold text-forge-gold uppercase tracking-wider bg-forge-gold/[0.05]">
                    Nossa Plataforma
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                    <td className="p-5 text-sm font-medium text-white">{row.feature}</td>
                    <td className="p-5 text-center text-sm text-white/50">{row.ticketgo}</td>
                    <td className="p-5 text-center text-sm text-white/50">{row.sympla}</td>
                    <td className="p-5 text-center text-sm font-semibold text-forge-gold bg-forge-gold/[0.03]">
                      <span className="inline-flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        {row.ours}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

// ─── Pricing / Checkout Section ────────────────────────────
function CheckoutSection() {
  const createSession = trpc.checkout.createSession.useMutation();
  const [loadingMethod, setLoadingMethod] = useState<"pix" | "card" | null>(null);

  const handleCheckout = async (paymentMethod: "pix" | "card") => {
    setLoadingMethod(paymentMethod);
    try {
      const result = await createSession.mutateAsync({
        paymentMethod,
        origin: window.location.origin,
      });
      if (result.url) {
        toast.success("Redirecionando para o checkout...");
        window.open(result.url, "_blank");
      } else {
        toast.error("Erro ao criar sessão de pagamento. Tente novamente.");
      }
    } catch (error: any) {
      console.error("Checkout error:", error);
      toast.error(error?.message || "Erro ao processar pagamento. Tente novamente.");
    } finally {
      setLoadingMethod(null);
    }
  };

  return (
    <section id="checkout" className="py-24 md:py-32 relative">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-forge-gold/20 to-transparent" />

      <div className="container">
        <FadeIn>
          <div className="text-center mb-16">
            <p className="text-forge-gold font-semibold tracking-[0.2em] uppercase text-xs mb-4">
              Investimento na Sua Transformação
            </p>
            <h2
              className="text-3xl md:text-5xl font-bold text-white"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              TOP Destemidos Pioneiros — Porto Velho/RO
            </h2>
            <p className="text-white/60 mt-4 max-w-2xl mx-auto">
              Escolha a forma de pagamento que melhor se adapta a você. Vagas limitadas por edição.
            </p>
          </div>
        </FadeIn>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Option 1: Pix */}
          <FadeIn delay={0.1}>
            <div className="relative p-8 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-forge-gold/30 transition-all duration-500">
              <div className="absolute -top-3 left-8">
                <span className="px-4 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-bold uppercase tracking-wider border border-green-500/30">
                  Melhor Preço
                </span>
              </div>
              <div className="mt-4 mb-6">
                <h3 className="text-xl font-bold text-white mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Pagamento via Pix
                </h3>
                <p className="text-white/50 text-sm">Desconto especial para pagamento à vista</p>
              </div>
              <div className="mb-6">
                <span className="text-white/40 text-sm line-through">R$ 1.990,00</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-forge-gold" style={{ fontFamily: "'Playfair Display', serif" }}>
                    R$ 1.790
                  </span>
                  <span className="text-white/50 text-sm">,00</span>
                </div>
                <p className="text-green-400 text-sm font-medium mt-1">Economia de R$ 200,00</p>
              </div>
              <ul className="space-y-3 mb-8">
                {["Confirmação imediata", "Vaga garantida", "Kit do participante incluso", "Alimentação durante o evento"].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-white/60">
                    <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleCheckout("pix")}
                disabled={loadingMethod !== null}
                className="block w-full text-center py-4 rounded-lg bg-green-500/20 border border-green-500/40 text-green-400 font-semibold hover:bg-green-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingMethod === "pix" ? (
                  <><Loader2 className="w-4 h-4 inline mr-2 animate-spin" />Processando...</>
                ) : (
                  "Pagar com Pix"
                )}
              </button>
            </div>
          </FadeIn>

          {/* Option 2: Card */}
          <FadeIn delay={0.2}>
            <div className="relative p-8 rounded-2xl bg-gradient-to-br from-forge-gold/[0.06] to-transparent border border-forge-gold/20 hover:border-forge-gold/40 transition-all duration-500">
              <div className="absolute -top-3 left-8">
                <span className="px-4 py-1 rounded-full bg-forge-gold text-[#0F0F0F] text-xs font-bold uppercase tracking-wider">
                  Mais Popular
                </span>
              </div>
              <div className="mt-4 mb-6">
                <h3 className="text-xl font-bold text-white mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Cartão de Crédito
                </h3>
                <p className="text-white/50 text-sm">Parcele em até 10x sem juros</p>
              </div>
              <div className="mb-6">
                <span className="text-white/40 text-sm">10x de</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-forge-gold" style={{ fontFamily: "'Playfair Display', serif" }}>
                    R$ 199
                  </span>
                  <span className="text-white/50 text-sm">,00</span>
                </div>
                <p className="text-white/40 text-sm mt-1">ou R$ 1.990,00 à vista no cartão</p>
              </div>
              <ul className="space-y-3 mb-8">
                {["Parcelamento sem juros", "Vaga garantida", "Kit do participante incluso", "Alimentação durante o evento"].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-white/60">
                    <CheckCircle2 className="w-4 h-4 text-forge-gold shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleCheckout("card")}
                disabled={loadingMethod !== null}
                className="block w-full text-center py-4 rounded-lg bg-forge-gold text-[#0F0F0F] font-bold hover:brightness-110 transition-all forge-glow disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingMethod === "card" ? (
                  <><Loader2 className="w-4 h-4 inline mr-2 animate-spin" />Processando...</>
                ) : (
                  <><CreditCard className="w-4 h-4 inline mr-2" />Pagar com Cartão</>
                )}
              </button>
            </div>
          </FadeIn>
        </div>

        <FadeIn delay={0.3}>
          <p className="text-center text-white/30 text-xs mt-8 max-w-lg mx-auto">
            Pagamento processado com segurança via Stripe. Ao realizar a inscrição, você concorda com os termos
            de participação do TOP Destemidos Pioneiros e com a Política de Privacidade (LGPD).
          </p>
        </FadeIn>
      </div>
    </section>
  );
}

// ─── Roadmap Section ───────────────────────────────────────
function RoadmapSection() {
  const phases = [
    {
      phase: "Fase 1",
      period: "Meses 1-3",
      title: "MVP — Inscrições e Pagamentos",
      items: [
        "Motor de criação de eventos e landing pages",
        "Integração com gateway de pagamento (Pix e Cartão)",
        "Gestão de lotes e ingressos automatizada",
        "App de credenciamento mobile (versão inicial)",
      ],
    },
    {
      phase: "Fase 2",
      period: "Meses 4-6",
      title: "IA e Automação de Marketing",
      items: [
        "Agentes de IA para WhatsApp e Instagram",
        "Recuperação de carrinho inteligente",
        "Generative AI Email Creation",
        "CRM baseado em eventos",
      ],
    },
    {
      phase: "Fase 3",
      period: "Meses 7-9",
      title: "Gestão Financeira Avançada",
      items: [
        "Dashboard Preditivo com IA",
        "Split de pagamentos automatizado",
        "Antecipação de recebíveis",
        "Otimização para múltiplos eventos simultâneos",
      ],
    },
    {
      phase: "Fase 4",
      period: "Meses 10-12",
      title: "Expansão e Escala",
      items: [
        "Módulos para REM e LEGADO",
        "Programa de afiliados integrado",
        "Refinamento contínuo dos modelos de IA",
        "Expansão para novas sedes internacionais",
      ],
    },
  ];

  return (
    <section id="roadmap" className="py-24 md:py-32 relative">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-forge-gold/20 to-transparent" />

      <div className="container">
        <FadeIn>
          <div className="text-center mb-16">
            <p className="text-forge-gold font-semibold tracking-[0.2em] uppercase text-xs mb-4">
              Plano de Desenvolvimento
            </p>
            <h2
              className="text-3xl md:text-5xl font-bold text-white"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Roadmap de 12 Meses
            </h2>
          </div>
        </FadeIn>

        <div className="relative">
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-forge-gold/40 via-forge-gold/20 to-transparent" />

          <div className="space-y-12 md:space-y-0">
            {phases.map((p, i) => (
              <FadeIn key={p.phase} delay={i * 0.12}>
                <div className={`md:grid md:grid-cols-2 md:gap-12 mb-12 ${i % 2 === 1 ? "md:direction-rtl" : ""}`}>
                  <div className={`${i % 2 === 1 ? "md:col-start-2" : ""}`}>
                    <div className="relative p-8 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-forge-gold/20 transition-all duration-500">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="px-3 py-1 rounded-full bg-forge-gold text-[#0F0F0F] text-xs font-bold uppercase tracking-wider">
                          {p.phase}
                        </span>
                        <span className="text-white/40 text-sm">{p.period}</span>
                      </div>

                      <h3
                        className="text-xl md:text-2xl font-bold text-white mb-4"
                        style={{ fontFamily: "'Playfair Display', serif" }}
                      >
                        {p.title}
                      </h3>

                      <ul className="space-y-3">
                        {p.items.map((item, j) => (
                          <li key={j} className="flex items-start gap-3 text-sm text-white/60">
                            <CheckCircle2 className="w-4 h-4 text-forge-gold mt-0.5 shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>

                      <div className="hidden md:block absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-forge-gold border-4 border-[#0F0F0F] z-10"
                        style={{ [i % 2 === 0 ? "right" : "left"]: "-2.15rem" }}
                      />
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Quote Section ──────────────────────────────────
function QuoteSection() {
  return (
    <section className="py-24 md:py-32 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-forge-gold/20 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-forge-gold/[0.02] to-transparent" />

      <div className="container relative z-10">
        <FadeIn>
          <div className="max-w-4xl mx-auto text-center">
            <Star className="w-10 h-10 text-forge-gold mx-auto mb-8" />
            <blockquote>
              <p
                className="text-2xl md:text-4xl lg:text-5xl font-bold text-white leading-tight italic"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                "Somos homens inquebrantáveis diante do pecado, mas quebrantados diante de Deus."
              </p>
            </blockquote>
            <div className="mt-8 flex items-center justify-center gap-3">
              <div className="w-12 h-px bg-forge-gold/40" />
              <p className="text-forge-gold font-semibold text-sm tracking-wider uppercase">
                Movimento Legendários
              </p>
              <div className="w-12 h-px bg-forge-gold/40" />
            </div>
          </div>
        </FadeIn>

        {/* Manifesto dos 24 Nós */}
        <FadeIn delay={0.2}>
          <div className="mt-20 max-w-3xl mx-auto">
            <div className="p-8 md:p-10 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-center">
              <h3
                className="text-xl md:text-2xl font-bold text-white mb-4"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                O Manifesto dos <span className="text-forge-gold">24 NÓS</span>
              </h3>
              <p className="text-white/60 text-sm md:text-base leading-relaxed mb-6">
                Criado durante o NEST 2025 com líderes de todas as sedes do Brasil,
                o Manifesto dos 24 NÓS representa quem somos, no que acreditamos e como
                vivemos nossa missão. Cada NÓS está fundamentado na Palavra de Deus.
                Cada princípio reflete nossa identidade como homens de verdade com valores
                inabaláveis. Cada compromisso é uma ação que nos une como comunidade,
                deixando um legado para nossa família, igreja e sociedade.
              </p>
              <p className="text-forge-gold font-bold text-lg italic">
                "Este é nosso pacto. Este é nosso legado. AHU!"
              </p>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

// ─── CTA / Inscription Section (connected to API) ─────────
function InscriptionSection() {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", city: "Porto Velho/RO" });
  const [submitted, setSubmitted] = useState(false);

  const createLead = trpc.leads.create.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      toast.success("Inscrição recebida com sucesso!");
      // Abrir WhatsApp automaticamente após cadastro
      const whatsappNumber = "5569999999999"; // Número do atendimento Legendários PVH
      const message = encodeURIComponent(
        `Olá! Sou ${formData.name} e acabei de me inscrever no TOP Destemidos Pioneiros pelo site. Gostaria de mais informações sobre o TOP 1870 (30/07 a 02/08). AHU!`
      );
      setTimeout(() => {
        window.open(`https://wa.me/${whatsappNumber}?text=${message}`, "_blank");
      }, 1500);
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao enviar inscrição. Tente novamente.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createLead.mutate({
      name: formData.name,
      email: formData.email,
      whatsapp: formData.phone,
      city: formData.city,
      event: "TOP Destemidos Pioneiros",
    });
  };

  return (
    <section id="inscricao" className="py-24 md:py-32 relative">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-forge-gold/20 to-transparent" />

      <div className="container">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <FadeIn>
                <p className="text-forge-gold font-semibold tracking-[0.2em] uppercase text-xs mb-4">
                  Sua Jornada Começa Aqui
                </p>
                <h2
                  className="text-3xl md:text-4xl font-bold text-white leading-tight mb-6"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Inscreva-se no{" "}
                  <span className="text-forge-gradient">TOP Destemidos Pioneiros</span>
                </h2>
                <p className="text-white/70 leading-relaxed mb-6">
                  Preencha o formulário e nossa equipe entrará em contato para
                  guiá-lo no processo de inscrição. Vagas limitadas por edição.
                </p>

                <div className="space-y-4">
                  {[
                    { icon: Calendar, text: "TOP 1870 — Destemidos Pioneiros: 30/07 a 02/08 de 2026" },
                    { icon: MapPin, text: "Track Destemidos Pioneiros — Porto Velho/RO" },
                    { icon: CreditCard, text: "Parcelamento em até 10x no cartão" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-white/60 text-sm">
                      <item.icon className="w-4 h-4 text-forge-gold shrink-0" />
                      <span>{item.text}</span>
                    </div>
                  ))}
                </div>
              </FadeIn>
            </div>

            <FadeIn delay={0.2}>
              <div className="p-8 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
                {submitted ? (
                  <div className="text-center py-8">
                    <CheckCircle2 className="w-16 h-16 text-forge-gold mx-auto mb-4" />
                    <h3
                      className="text-2xl font-bold text-white mb-2"
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      Inscrição Recebida!
                    </h3>
                    <p className="text-white/60 text-sm mb-4">
                      Entraremos em contato em breve pelo WhatsApp.
                    </p>
                    <p className="text-white/40 text-xs">
                      Uma conversa no WhatsApp foi aberta automaticamente para você.
                      Caso não tenha aberto, <a href="https://wa.me/5569999999999" target="_blank" rel="noopener" className="text-forge-gold underline">clique aqui</a>.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-2">Nome Completo</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg bg-white/[0.05] border border-white/[0.1] text-white placeholder:text-white/30 focus:border-forge-gold/50 focus:ring-1 focus:ring-forge-gold/30 transition-all outline-none"
                        placeholder="Seu nome"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-2">E-mail</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg bg-white/[0.05] border border-white/[0.1] text-white placeholder:text-white/30 focus:border-forge-gold/50 focus:ring-1 focus:ring-forge-gold/30 transition-all outline-none"
                        placeholder="seu@email.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-2">WhatsApp</label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg bg-white/[0.05] border border-white/[0.1] text-white placeholder:text-white/30 focus:border-forge-gold/50 focus:ring-1 focus:ring-forge-gold/30 transition-all outline-none"
                        placeholder="(69) 99999-9999"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-2">Cidade</label>
                      <select
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg bg-white/[0.05] border border-white/[0.1] text-white focus:border-forge-gold/50 focus:ring-1 focus:ring-forge-gold/30 transition-all outline-none"
                      >
                        <option value="Porto Velho/RO" className="bg-[#1a1a1a]">Porto Velho/RO</option>
                        <option value="Balneário Camboriú/SC" className="bg-[#1a1a1a]">Balneário Camboriú/SC</option>
                        <option value="Curitiba/PR" className="bg-[#1a1a1a]">Curitiba/PR</option>
                        <option value="Belo Horizonte/MG" className="bg-[#1a1a1a]">Belo Horizonte/MG</option>
                        <option value="Outra cidade" className="bg-[#1a1a1a]">Outra cidade</option>
                      </select>
                    </div>

                    <Button
                      type="submit"
                      disabled={createLead.isPending}
                      className="w-full py-6 rounded-lg bg-forge-gold text-[#0F0F0F] font-bold text-base hover:brightness-110 transition-all forge-glow disabled:opacity-50"
                    >
                      {createLead.isPending ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Flame className="w-5 h-5 mr-2" />
                          Quero Ser um Legendário
                        </>
                      )}
                    </Button>

                    {createLead.isError && (
                      <div className="flex items-center gap-2 text-red-400 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        <span>{createLead.error?.message || "Erro ao enviar. Tente novamente."}</span>
                      </div>
                    )}

                    <p className="text-center text-xs text-white/30">
                      Ao enviar, você concorda com nossa Política de Privacidade (LGPD).
                    </p>
                  </form>
                )}
              </div>
            </FadeIn>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Footer ────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="py-12 border-t border-white/[0.06]">
      <div className="container">
        <div className="grid md:grid-cols-3 gap-8 items-center">
          <div className="flex items-center gap-2">
            <img
              src="/manus-storage/legendarios-logo-laranja_5596bd58.png"
              alt="Legendários"
              className="h-8 w-auto"
            />
          </div>

          <div className="text-center">
            <p className="text-sm text-white/40">
              Plataforma Full Service com IA para Gestão de Eventos
            </p>
          </div>

          <div className="md:text-right">
            <div className="flex md:justify-end gap-4">
              <a
                href="https://www.instagram.com/legendariosportovelho/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/40 hover:text-forge-gold transition-colors text-sm"
              >
                Instagram PVH
              </a>
              <a
                href="https://www.instagram.com/legendariosbrasil/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/40 hover:text-forge-gold transition-colors text-sm"
              >
                Instagram Brasil
              </a>
              <a
                href="https://www.loslegendarios.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/40 hover:text-forge-gold transition-colors text-sm"
              >
                Site Global
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-white/[0.04] text-center">
          <p className="text-xs text-white/25">
            TOP Destemidos Pioneiros — Porto Velho/RO. Plataforma Full Service com Inteligência Artificial.
            Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}

// ─── Main Page ─────────────────────────────────────────────
export default function Home() {
  return (
    <div className="min-h-screen bg-[#0F0F0F]">
      <Navbar />
      <HeroSection />
      <MovementSection />
      <EventsSection />
      <TestimonialsSection />
      <PlatformSection />
      <ComparisonSection />
      <CheckoutSection />
      <RoadmapSection />
      <QuoteSection />
      <InscriptionSection />
      <Footer />
    </div>
  );
}
