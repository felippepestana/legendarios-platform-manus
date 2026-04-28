/*
 * Design: "Forja Épica" — Dark Cinematic
 * Palette: Obsidian (#0C0C0E), Gold Forge (#C8963E), Ember Red (#B8372B), Steel (#8A8A8A)
 * Typography: Playfair Display (titles) + DM Sans (body)
 * Images: Real photos from TOP 1670 - Destemidos Pioneiros - Porto Velho/RO
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
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
  Camera,
  Play,
} from "lucide-react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

// ─── Real Photos from TOP 1670 - Destemidos Pioneiros ─────
const REAL_PHOTOS = {
  hero: "/manus-storage/top-grupo-oficial_25ea356c.jpeg",
  grupoInclusao: "/manus-storage/top-grupo-inclusao_416ecd95.jpeg",
  atividadeLider: "/manus-storage/top-atividade-lider_a967eb28.jpeg",
  emocionalAbraco: "/manus-storage/top-emocional-abraco_8224bfcd.jpeg",
  trilhaCaminhada: "/manus-storage/top-trilha-caminhada_de2a936b.jpg",
  trilhaBandeiras: "/manus-storage/top-trilha-bandeiras_2b2f548c.jpg",
  grupoPerfilados: "/manus-storage/top-grupo-perfilados_6aa6ffaf.jpeg",
  oracaoReflexao: "/manus-storage/top-oracao-reflexao_d2afb068.jpeg",
  rioCelebracao: "/manus-storage/top-rio-celebracao_fd9d1cdd.jpg",
  rioSuperacao: "/manus-storage/top-rio-superacao_02cfc8f8.jpg",
  rioEmocao: "/manus-storage/top-rio-emocao_7629d0bc.jpg",
  rioVibrante: "/manus-storage/top-rio-vibrante_32b16765.jpeg",
  abracoRio: "/manus-storage/top-abraco-rio_d5e1ced9.jpg",
  rioPunhos: "/manus-storage/top-rio-punhos_e52654e1.jpg",
  trilhaMorro: "/manus-storage/top-trilha-morro_81e63d2f.jpeg",
};

// AI-generated images (kept for non-photo sections)
const AI_IMAGES = {
  dashboard: "https://d2xsxph8kpxj0f.cloudfront.net/310419663028978368/S84CDFgDSnL8B2KjgsuVBm/platform-dashboard-3xuwt8HWhH4s2VZLsoC5Em.webp",
};

// Carousel image sets
const HERO_CAROUSEL = [
  { src: REAL_PHOTOS.hero, alt: "Grupo oficial TOP 1670 - Destemidos Pioneiros" },
  { src: REAL_PHOTOS.rioSuperacao, alt: "Desafio no rio - superação e garra" },
  { src: REAL_PHOTOS.trilhaBandeiras, alt: "Trilha com bandeiras - caminhada épica" },
  { src: REAL_PHOTOS.oracaoReflexao, alt: "Momento de oração e reflexão" },
];

const GALLERY_IMAGES = [
  { src: REAL_PHOTOS.hero, alt: "Foto oficial do grupo", category: "Grupo" },
  { src: REAL_PHOTOS.grupoInclusao, alt: "Inclusão e fraternidade", category: "Grupo" },
  { src: REAL_PHOTOS.atividadeLider, alt: "Líder motivando o grupo", category: "Atividade" },
  { src: REAL_PHOTOS.emocionalAbraco, alt: "Abraço de companheirismo", category: "Emoção" },
  { src: REAL_PHOTOS.trilhaCaminhada, alt: "Caminhada na trilha", category: "Trilha" },
  { src: REAL_PHOTOS.trilhaBandeiras, alt: "Trilha com bandeiras", category: "Trilha" },
  { src: REAL_PHOTOS.grupoPerfilados, alt: "Legendários perfilados", category: "Grupo" },
  { src: REAL_PHOTOS.oracaoReflexao, alt: "Oração e reflexão", category: "Emoção" },
  { src: REAL_PHOTOS.rioCelebracao, alt: "Celebração no rio", category: "Desafio" },
  { src: REAL_PHOTOS.rioSuperacao, alt: "Superação no rio", category: "Desafio" },
  { src: REAL_PHOTOS.rioEmocao, alt: "Emoção intensa no rio", category: "Desafio" },
  { src: REAL_PHOTOS.rioVibrante, alt: "Comemoração vibrante", category: "Desafio" },
  { src: REAL_PHOTOS.abracoRio, alt: "Abraço emocionado no rio", category: "Emoção" },
  { src: REAL_PHOTOS.rioPunhos, alt: "Punhos erguidos - vitória", category: "Desafio" },
  { src: REAL_PHOTOS.trilhaMorro, alt: "Trilha no morro", category: "Trilha" },
];

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

// ─── Image Carousel Component ──────────────────────────────
function ImageCarousel({ images, autoPlay = true, interval = 5000, className = "" }: {
  images: { src: string; alt: string }[];
  autoPlay?: boolean;
  interval?: number;
  className?: string;
}) {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  useEffect(() => {
    if (!autoPlay) return;
    const timer = setInterval(next, interval);
    return () => clearInterval(timer);
  }, [autoPlay, interval, next]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <AnimatePresence mode="wait">
        <motion.img
          key={current}
          src={images[current].src}
          alt={images[current].alt}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.8 }}
          className="w-full h-full object-cover"
        />
      </AnimatePresence>

      {/* Navigation arrows */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white/80 hover:text-white hover:bg-black/60 transition-all z-10"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white/80 hover:text-white hover:bg-black/60 transition-all z-10"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === current ? "bg-forge-gold w-6" : "bg-white/40 w-2 hover:bg-white/60"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Infinite Scrolling Banner ─────────────────────────────
function InfiniteScrollBanner({ images, speed = 30, direction = "left" }: {
  images: { src: string; alt: string }[];
  speed?: number;
  direction?: "left" | "right";
}) {
  return (
    <div className="overflow-hidden relative">
      <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-[#0C0C0E] to-transparent z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[#0C0C0E] to-transparent z-10" />
      <motion.div
        className="flex gap-4"
        animate={{ x: direction === "left" ? [0, -50 * images.length * 16] : [-50 * images.length * 16, 0] }}
        transition={{ duration: speed * images.length, repeat: Infinity, ease: "linear" }}
      >
        {[...images, ...images, ...images].map((img, i) => (
          <div key={i} className="shrink-0 w-72 h-48 rounded-xl overflow-hidden border border-white/[0.06]">
            <img src={img.src} alt={img.alt} className="w-full h-full object-cover hover:scale-110 transition-transform duration-700" />
          </div>
        ))}
      </motion.div>
    </div>
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
    { label: "Galeria", href: "#galeria" },
    { label: "Eventos", href: "#eventos" },
    { label: "Depoimentos", href: "#depoimentos" },
    { label: "Plataforma", href: "#plataforma" },
    { label: "Inscreva-se", href: "#inscricao" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-[#0C0C0E]/95 backdrop-blur-xl border-b border-white/5 shadow-2xl"
          : "bg-transparent"
      }`}
    >
      <div className="container flex items-center justify-between h-16 md:h-20">
        <a href="#" className="flex items-center gap-2">
          <Flame className="w-7 h-7 text-forge-gold" />
          <span className="text-xl font-bold tracking-wide text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
            LEGENDÁRIOS
          </span>
        </a>

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
          className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-forge-gold text-[#0C0C0E] font-semibold text-sm hover:brightness-110 transition-all forge-glow"
        >
          Quero Participar
          <ArrowRight className="w-4 h-4" />
        </a>

        <button className="md:hidden text-white" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#0C0C0E]/98 backdrop-blur-xl border-b border-white/5 overflow-hidden"
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
                className="mt-2 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-forge-gold text-[#0C0C0E] font-semibold text-sm"
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

// ─── Hero Section with Real Photo Carousel ─────────────────
function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background carousel */}
      <div className="absolute inset-0">
        <ImageCarousel images={HERO_CAROUSEL} interval={6000} className="w-full h-full" />
        <div className="cinematic-overlay absolute inset-0" />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#0C0C0E] to-transparent" />
      </div>

      <div className="relative z-10 container text-center px-4 pt-20">
        <FadeIn>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-forge-gold/10 border border-forge-gold/20 mb-6">
            <Camera className="w-4 h-4 text-forge-gold" />
            <span className="text-forge-gold font-semibold text-xs tracking-wider uppercase">
              Fotos Reais — TOP 1670 — Abril 2026
            </span>
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <p className="text-forge-gold font-semibold tracking-[0.3em] uppercase text-xs md:text-sm mb-6">
            TOP Destemidos Pioneiros — Porto Velho/RO
          </p>
        </FadeIn>

        <FadeIn delay={0.2}>
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

        <FadeIn delay={0.35}>
          <p className="max-w-2xl mx-auto text-base md:text-lg text-white/70 leading-relaxed mb-10">
            Uma plataforma full service com Inteligência Artificial para gestão completa
            de eventos, marketing digital e transformação de vidas. Do primeiro contato
            ao pós-evento, tudo automatizado.
          </p>
        </FadeIn>

        <FadeIn delay={0.5}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <a
              href="#inscricao"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-forge-gold text-[#0C0C0E] font-bold text-base hover:brightness-110 transition-all forge-glow"
            >
              <Flame className="w-5 h-5" />
              Inscreva-se no TOP Destemidos Pioneiros
            </a>
            <a
              href="#galeria"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-lg border border-white/20 text-white font-medium text-base hover:bg-white/5 transition-all"
            >
              <Play className="w-4 h-4" />
              Ver Galeria de Fotos
            </a>
          </div>
        </FadeIn>

        {/* Stats bar */}
        <FadeIn delay={0.65}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-12 max-w-3xl mx-auto">
            {[
              { value: 197000, suffix: "+", label: "Legendários" },
              { value: 26, suffix: "", label: "Países" },
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
        <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
          <ChevronDown className="w-6 h-6 text-white/30" />
        </motion.div>
      </div>
    </section>
  );
}

// ─── Infinite Scroll Photo Banner ──────────────────────────
function PhotoBannerSection() {
  const topRow = GALLERY_IMAGES.slice(0, 8);
  const bottomRow = GALLERY_IMAGES.slice(7, 15);

  return (
    <section className="py-6 relative overflow-hidden">
      <div className="space-y-4">
        <InfiniteScrollBanner images={topRow} speed={40} direction="left" />
        <InfiniteScrollBanner images={bottomRow} speed={35} direction="right" />
      </div>
    </section>
  );
}

// ─── About / Movement Section ──────────────────────────────
function MovementSection() {
  return (
    <section id="movimento" className="py-24 md:py-32 relative">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-forge-gold/20 to-transparent" />

      <div className="container">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <FadeIn>
              <p className="text-forge-gold font-semibold tracking-[0.2em] uppercase text-xs mb-4">
                Nascido na Guatemala em 2015
              </p>
              <h2
                className="text-3xl md:text-5xl font-bold text-white leading-tight mb-6"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                O Movimento que{" "}
                <span className="text-forge-gradient">Transforma</span>
                <br />
                Homens em Líderes
              </h2>
            </FadeIn>

            <FadeIn delay={0.1}>
              <p className="text-white/70 text-base md:text-lg leading-relaxed mb-8">
                Fundado por Chepe Putzu, o Movimento Legendários é uma comunidade global de homens
                comprometidos com a transformação pessoal, familiar e espiritual. Presente em 26 países,
                com mais de 197 mil membros, o movimento utiliza experiências imersivas na natureza
                para despertar o herói que existe em cada homem.
              </p>
            </FadeIn>

            <FadeIn delay={0.2}>
              <div className="grid grid-cols-3 gap-6">
                {[
                  { icon: Globe, label: "26 Países", desc: "Presença global" },
                  { icon: Users, label: "197K+", desc: "Legendários" },
                  { icon: Shield, label: "10+ Anos", desc: "De história" },
                ].map((item, i) => (
                  <div key={i} className="text-center p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    <item.icon className="w-6 h-6 text-forge-gold mx-auto mb-2" />
                    <div className="text-lg font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                      {item.label}
                    </div>
                    <div className="text-xs text-white/40">{item.desc}</div>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>

          {/* Real photo from the event */}
          <FadeIn delay={0.15}>
            <div className="relative">
              <div className="rounded-2xl overflow-hidden border border-white/[0.06]">
                <img
                  src={REAL_PHOTOS.grupoPerfilados}
                  alt="Legendários perfilados no TOP 1670"
                  className="w-full h-auto"
                />
              </div>
              {/* Floating card */}
              <div className="absolute -bottom-6 -left-6 md:-left-12 p-4 rounded-xl bg-[#0C0C0E]/90 backdrop-blur-xl border border-forge-gold/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-forge-gold/20 flex items-center justify-center">
                    <Mountain className="w-5 h-5 text-forge-gold" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">Brasil</p>
                    <p className="text-forge-gold text-xs">+10.000 Legendários</p>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

// ─── Photo Gallery Section ─────────────────────────────────
function GallerySection() {
  const [filter, setFilter] = useState("Todos");
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const categories = ["Todos", "Grupo", "Trilha", "Desafio", "Emoção", "Atividade"];

  const filtered = filter === "Todos"
    ? GALLERY_IMAGES
    : GALLERY_IMAGES.filter((img) => img.category === filter);

  return (
    <section id="galeria" className="py-24 md:py-32 relative">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-forge-gold/20 to-transparent" />

      <div className="container">
        <FadeIn>
          <div className="text-center mb-12">
            <p className="text-forge-gold font-semibold tracking-[0.2em] uppercase text-xs mb-4">
              TOP 1670 — Abril 2026
            </p>
            <h2
              className="text-3xl md:text-5xl font-bold text-white mb-4"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Galeria{" "}
              <span className="text-forge-gradient">Destemidos Pioneiros</span>
            </h2>
            <p className="text-white/60 max-w-2xl mx-auto">
              Fotos reais do TOP 1670 em Porto Velho/RO. Momentos de superação, fraternidade e transformação na Amazônia.
            </p>
          </div>
        </FadeIn>

        {/* Filter tabs */}
        <FadeIn delay={0.1}>
          <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  filter === cat
                    ? "bg-forge-gold text-[#0C0C0E]"
                    : "bg-white/[0.05] text-white/60 hover:bg-white/[0.1] hover:text-white border border-white/[0.06]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </FadeIn>

        {/* Photo grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((img, i) => (
              <motion.div
                key={img.src}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, delay: i * 0.03 }}
                className={`group relative rounded-xl overflow-hidden cursor-pointer border border-white/[0.06] hover:border-forge-gold/30 transition-all duration-500 ${
                  i === 0 ? "col-span-2 row-span-2" : ""
                }`}
                onClick={() => setSelectedImage(GALLERY_IMAGES.indexOf(img))}
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  className={`w-full object-cover group-hover:scale-110 transition-transform duration-700 ${
                    i === 0 ? "h-full min-h-[300px] md:min-h-[400px]" : "h-48 md:h-56"
                  }`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                  <p className="text-white text-xs font-medium">{img.alt}</p>
                  <p className="text-forge-gold text-[10px] uppercase tracking-wider">{img.category}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Lightbox */}
        <AnimatePresence>
          {selectedImage !== null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4"
              onClick={() => setSelectedImage(null)}
            >
              <button
                className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all"
                onClick={() => setSelectedImage(null)}
              >
                <X className="w-5 h-5" />
              </button>
              <button
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImage((prev) => (prev! - 1 + GALLERY_IMAGES.length) % GALLERY_IMAGES.length);
                }}
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImage((prev) => (prev! + 1) % GALLERY_IMAGES.length);
                }}
              >
                <ChevronRight className="w-6 h-6" />
              </button>
              <motion.img
                key={selectedImage}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                src={GALLERY_IMAGES[selectedImage].src}
                alt={GALLERY_IMAGES[selectedImage].alt}
                className="max-w-full max-h-[85vh] object-contain rounded-xl"
                onClick={(e) => e.stopPropagation()}
              />
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center">
                <p className="text-white font-medium">{GALLERY_IMAGES[selectedImage].alt}</p>
                <p className="text-forge-gold text-sm">{selectedImage + 1} / {GALLERY_IMAGES.length}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

// ─── Events Section ────────────────────────────────────────
function EventsSection() {
  const events = [
    {
      title: "TOP Destemidos Pioneiros",
      subtitle: "Toca o Potencial",
      desc: "Experiência imersiva de 3-4 dias na natureza. Trilhas, desafios físicos e emocionais que revelam o verdadeiro potencial masculino. O ponto de partida da jornada Legendária.",
      icon: Mountain,
      image: REAL_PHOTOS.trilhaCaminhada,
      badge: "Evento Principal",
    },
    {
      title: "REM",
      subtitle: "Reto Extremo de Montaña",
      desc: "Desafio extremo de montanha para Legendários que já completaram o TOP. Uma prova de resistência física e mental que eleva o compromisso ao próximo nível.",
      icon: Shield,
      image: REAL_PHOTOS.rioEmocao,
      badge: "Avançado",
    },
    {
      title: "LEGADO",
      subtitle: "O Legado que Deixamos",
      desc: "Experiência entre pais e filhos (7-13 anos) que fortalece o vínculo familiar e transmite valores de coragem, integridade e fé para a próxima geração.",
      icon: Heart,
      image: REAL_PHOTOS.emocionalAbraco,
      badge: "Família",
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

        <div className="grid md:grid-cols-3 gap-8">
          {events.map((ev, i) => (
            <FadeIn key={ev.title} delay={i * 0.12}>
              <div className="group relative rounded-2xl overflow-hidden border border-white/[0.06] hover:border-forge-gold/20 transition-all duration-500 h-full">
                {/* Image */}
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={ev.image}
                    alt={ev.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0C0C0E] via-[#0C0C0E]/30 to-transparent" />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 rounded-full bg-forge-gold/20 backdrop-blur-sm text-forge-gold text-xs font-bold uppercase tracking-wider border border-forge-gold/30">
                      {ev.badge}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-forge-gold/10 flex items-center justify-center">
                      <ev.icon className="w-5 h-5 text-forge-gold" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                        {ev.title}
                      </h3>
                      <p className="text-forge-gold/70 text-xs">{ev.subtitle}</p>
                    </div>
                  </div>
                  <p className="text-white/60 text-sm leading-relaxed">{ev.desc}</p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>

        {/* Porto Velho Highlight */}
        <FadeIn delay={0.4}>
          <div className="mt-16 relative rounded-2xl overflow-hidden border border-forge-gold/20 bg-gradient-to-r from-forge-gold/[0.05] to-transparent">
            <div className="grid md:grid-cols-2 gap-0">
              <div className="relative h-64 md:h-auto overflow-hidden">
                <img
                  src={REAL_PHOTOS.atividadeLider}
                  alt="Líder motivando participantes no TOP 1670"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0C0C0E]/80 md:block hidden" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0C0C0E]/80 to-transparent md:hidden" />
              </div>
              <div className="p-8 md:p-12 flex flex-col justify-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forge-gold/10 border border-forge-gold/20 w-fit mb-4">
                  <MapPin className="w-3.5 h-3.5 text-forge-gold" />
                  <span className="text-forge-gold text-xs font-semibold uppercase tracking-wider">Destaque</span>
                </div>
                <h3
                  className="text-2xl md:text-3xl font-bold text-white mb-4"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  TOP Destemidos Pioneiros — Porto Velho/RO
                </h3>
                <p className="text-white/70 leading-relaxed mb-4">
                  Porto Velho/RO é uma das sedes mais ativas do Brasil, com múltiplos eventos
                  anuais. O Track "Destemidos Pioneiros" já transformou centenas de homens na
                  região amazônica, provando que a coragem não conhece fronteiras geográficas.
                </p>
                <div className="flex items-center gap-2 text-forge-gold text-sm font-medium mb-6">
                  <MapPin className="w-4 h-4" />
                  Porto Velho, Rondônia — Brasil
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: "TOP 1570", date: "Fev/2026" },
                    { label: "TOP 1670", date: "Abr/2026" },
                    { label: "TOP 1870", date: "Jul/2026" },
                  ].map((ev, i) => (
                    <div key={i} className="text-center p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                      <div className="text-lg font-bold text-forge-gold" style={{ fontFamily: "'Playfair Display', serif" }}>
                        {ev.label}
                      </div>
                      <div className="text-xs text-white/50 mt-1">{ev.date}</div>
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
      {/* Background image with overlay */}
      <div className="absolute inset-0">
        <img src={REAL_PHOTOS.abracoRio} alt="" className="w-full h-full object-cover opacity-[0.06]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0C0C0E] via-[#0C0C0E]/95 to-[#0C0C0E]" />
      </div>

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

        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-forge-gold animate-spin" />
            <span className="ml-3 text-white/50">Carregando depoimentos...</span>
          </div>
        )}

        {isError && (
          <div className="flex items-center justify-center py-16">
            <AlertCircle className="w-8 h-8 text-forge-ember" />
            <span className="ml-3 text-white/50">Erro ao carregar depoimentos. Tente novamente mais tarde.</span>
          </div>
        )}

        {!isLoading && !isError && displayTestimonials.length === 0 && (
          <div className="text-center py-16">
            <Quote className="w-12 h-12 text-forge-gold/20 mx-auto mb-4" />
            <p className="text-white/40">Depoimentos em breve.</p>
          </div>
        )}

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
                      <div className="flex items-center justify-center gap-1 mt-4">
                        {Array.from({ length: displayTestimonials[activeIndex].rating }).map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-forge-gold fill-forge-gold" />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="flex items-center justify-center gap-2 mt-8">
                  {displayTestimonials.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveIndex(i)}
                      className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                        i === activeIndex ? "bg-forge-gold w-8" : "bg-white/20 hover:bg-white/40"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </FadeIn>

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
    { icon: Bot, title: "Agentes de IA 24/7", desc: "Chatbots avançados no WhatsApp e Instagram que respondem dúvidas, qualificam leads e conduzem até o checkout automaticamente." },
    { icon: CreditCard, title: "Checkout High Ticket", desc: "Pix instantâneo, Cartão em até 10x, pagamentos híbridos e recuperação inteligente de carrinho abandonado." },
    { icon: Smartphone, title: "Credenciamento Mobile", desc: "Check-in via QR Code com funcionamento offline, essencial para eventos em áreas remotas na natureza." },
    { icon: BarChart3, title: "Dashboard Preditivo", desc: "Análise em tempo real com IA que prevê taxa de ocupação e sugere ações de marketing para atingir metas." },
    { icon: Mail, title: "E-mails Generativos", desc: "Réguas de relacionamento pré e pós-evento criadas automaticamente por IA, personalizadas por segmento." },
    { icon: MessageCircle, title: "Recuperação de Vendas", desc: "Automação multicanal acionada após abandono do checkout, com gatilhos mentais personalizados pela IA." },
    { icon: Target, title: "CRM de Eventos", desc: "Perfis detalhados rastreando a jornada completa: do primeiro TOP Destemidos Pioneiros ao REM, LEGADO e TOP Master." },
    { icon: Zap, title: "Split de Pagamentos", desc: "Divisão automática de receitas entre sede local, organização nacional e taxas da plataforma." },
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
              <img src={AI_IMAGES.dashboard} alt="Dashboard da plataforma" className="w-full h-auto" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0C0C0E]/60 to-transparent" />
            </div>
          </FadeIn>
        </div>

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
            <p className="text-forge-gold font-semibold tracking-[0.2em] uppercase text-xs mb-4">Análise Comparativa</p>
            <h2 className="text-3xl md:text-5xl font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
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
                  <th className="text-center p-5 text-sm font-semibold text-forge-gold uppercase tracking-wider bg-forge-gold/[0.05]">Nossa Plataforma</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                    <td className="p-5 text-sm font-medium text-white">{row.feature}</td>
                    <td className="p-5 text-center text-sm text-white/50">{row.ticketgo}</td>
                    <td className="p-5 text-center text-sm text-white/50">{row.sympla}</td>
                    <td className="p-5 text-center text-sm font-semibold text-forge-gold bg-forge-gold/[0.03]">
                      <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" />{row.ours}</span>
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
      const result = await createSession.mutateAsync({ paymentMethod, origin: window.location.origin });
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
      {/* Background image */}
      <div className="absolute inset-0">
        <img src={REAL_PHOTOS.rioPunhos} alt="" className="w-full h-full object-cover opacity-[0.04]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0C0C0E] via-[#0C0C0E]/97 to-[#0C0C0E]" />
      </div>

      <div className="container relative z-10">
        <FadeIn>
          <div className="text-center mb-16">
            <p className="text-forge-gold font-semibold tracking-[0.2em] uppercase text-xs mb-4">Investimento na Sua Transformação</p>
            <h2 className="text-3xl md:text-5xl font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
              TOP Destemidos Pioneiros — Porto Velho/RO
            </h2>
            <p className="text-white/60 mt-4 max-w-2xl mx-auto">Escolha a forma de pagamento que melhor se adapta a você. Vagas limitadas por edição.</p>
          </div>
        </FadeIn>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <FadeIn delay={0.1}>
            <div className="relative p-8 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-forge-gold/30 transition-all duration-500">
              <div className="absolute -top-3 left-8">
                <span className="px-4 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-bold uppercase tracking-wider border border-green-500/30">Melhor Preço</span>
              </div>
              <div className="mt-4 mb-6">
                <h3 className="text-xl font-bold text-white mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>Pagamento via Pix</h3>
                <p className="text-white/50 text-sm">Desconto especial para pagamento à vista</p>
              </div>
              <div className="mb-6">
                <span className="text-white/40 text-sm line-through">R$ 1.990,00</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-forge-gold" style={{ fontFamily: "'Playfair Display', serif" }}>R$ 1.790</span>
                  <span className="text-white/50 text-sm">,00</span>
                </div>
                <p className="text-green-400 text-sm font-medium mt-1">Economia de R$ 200,00</p>
              </div>
              <ul className="space-y-3 mb-8">
                {["Confirmação imediata", "Vaga garantida", "Kit do participante incluso", "Alimentação durante o evento"].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-white/60">
                    <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" /><span>{item}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleCheckout("pix")}
                disabled={loadingMethod !== null}
                className="block w-full text-center py-4 rounded-lg bg-green-500/20 border border-green-500/40 text-green-400 font-semibold hover:bg-green-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingMethod === "pix" ? <><Loader2 className="w-4 h-4 inline mr-2 animate-spin" />Processando...</> : "Pagar com Pix"}
              </button>
            </div>
          </FadeIn>

          <FadeIn delay={0.2}>
            <div className="relative p-8 rounded-2xl bg-gradient-to-br from-forge-gold/[0.06] to-transparent border border-forge-gold/20 hover:border-forge-gold/40 transition-all duration-500">
              <div className="absolute -top-3 left-8">
                <span className="px-4 py-1 rounded-full bg-forge-gold text-[#0C0C0E] text-xs font-bold uppercase tracking-wider">Mais Popular</span>
              </div>
              <div className="mt-4 mb-6">
                <h3 className="text-xl font-bold text-white mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>Cartão de Crédito</h3>
                <p className="text-white/50 text-sm">Parcele em até 10x sem juros</p>
              </div>
              <div className="mb-6">
                <span className="text-white/40 text-sm">10x de</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-forge-gold" style={{ fontFamily: "'Playfair Display', serif" }}>R$ 199</span>
                  <span className="text-white/50 text-sm">,00</span>
                </div>
                <p className="text-white/40 text-sm mt-1">ou R$ 1.990,00 à vista no cartão</p>
              </div>
              <ul className="space-y-3 mb-8">
                {["Parcelamento sem juros", "Vaga garantida", "Kit do participante incluso", "Alimentação durante o evento"].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-white/60">
                    <CheckCircle2 className="w-4 h-4 text-forge-gold shrink-0" /><span>{item}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleCheckout("card")}
                disabled={loadingMethod !== null}
                className="block w-full text-center py-4 rounded-lg bg-forge-gold text-[#0C0C0E] font-bold hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingMethod === "card" ? <><Loader2 className="w-4 h-4 inline mr-2 animate-spin" />Processando...</> : <><CreditCard className="w-4 h-4 inline mr-2" />Pagar com Cartão</>}
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
    { phase: "Fase 1", period: "Meses 1-3", title: "MVP — Inscrições e Pagamentos", items: ["Motor de criação de eventos e landing pages", "Integração com gateway de pagamento (Pix e Cartão)", "Gestão de lotes e ingressos automatizada", "App de credenciamento mobile (versão inicial)"] },
    { phase: "Fase 2", period: "Meses 4-6", title: "IA e Automação de Marketing", items: ["Agentes de IA para WhatsApp e Instagram", "Recuperação de carrinho inteligente", "Generative AI Email Creation", "CRM baseado em eventos"] },
    { phase: "Fase 3", period: "Meses 7-9", title: "Gestão Financeira Avançada", items: ["Dashboard Preditivo com IA", "Split de pagamentos automatizado", "Antecipação de recebíveis", "Otimização para múltiplos eventos simultâneos"] },
    { phase: "Fase 4", period: "Meses 10-12", title: "Expansão e Escala", items: ["Módulos para REM e LEGADO", "Programa de afiliados integrado", "Refinamento contínuo dos modelos de IA", "Expansão para novas sedes internacionais"] },
  ];

  return (
    <section id="roadmap" className="py-24 md:py-32 relative">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-forge-gold/20 to-transparent" />
      <div className="container">
        <FadeIn>
          <div className="text-center mb-16">
            <p className="text-forge-gold font-semibold tracking-[0.2em] uppercase text-xs mb-4">Plano de Desenvolvimento</p>
            <h2 className="text-3xl md:text-5xl font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>Roadmap de 12 Meses</h2>
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
                        <span className="px-3 py-1 rounded-full bg-forge-gold text-[#0C0C0E] text-xs font-bold uppercase tracking-wider">{p.phase}</span>
                        <span className="text-white/40 text-sm">{p.period}</span>
                      </div>
                      <h3 className="text-xl md:text-2xl font-bold text-white mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>{p.title}</h3>
                      <ul className="space-y-3">
                        {p.items.map((item, j) => (
                          <li key={j} className="flex items-start gap-3 text-sm text-white/60">
                            <CheckCircle2 className="w-4 h-4 text-forge-gold mt-0.5 shrink-0" /><span>{item}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="hidden md:block absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-forge-gold border-4 border-[#0C0C0E] z-10" style={{ [i % 2 === 0 ? "right" : "left"]: "-2.15rem" }} />
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

// ─── Quote Section ─────────────────────────────────────────
function QuoteSection() {
  return (
    <section className="py-24 md:py-32 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-forge-gold/20 to-transparent" />
      <div className="absolute inset-0">
        <img src={REAL_PHOTOS.oracaoReflexao} alt="" className="w-full h-full object-cover opacity-[0.08]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0C0C0E] via-[#0C0C0E]/95 to-[#0C0C0E]" />
      </div>
      <div className="container relative z-10">
        <FadeIn>
          <div className="max-w-4xl mx-auto text-center">
            <Star className="w-10 h-10 text-forge-gold mx-auto mb-8" />
            <blockquote>
              <p className="text-2xl md:text-4xl lg:text-5xl font-bold text-white leading-tight italic" style={{ fontFamily: "'Playfair Display', serif" }}>
                "Somos homens inquebrantáveis diante do pecado, mas quebrantados diante de Deus."
              </p>
            </blockquote>
            <div className="mt-8 flex items-center justify-center gap-3">
              <div className="w-12 h-px bg-forge-gold/40" />
              <p className="text-forge-gold font-semibold text-sm tracking-wider uppercase">Movimento Legendários</p>
              <div className="w-12 h-px bg-forge-gold/40" />
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

// ─── CTA / Inscription Section ─────────────────────────────
function InscriptionSection() {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", city: "Porto Velho/RO" });
  const [submitted, setSubmitted] = useState(false);

  const createLead = trpc.leads.create.useMutation({
    onSuccess: () => { setSubmitted(true); toast.success("Inscrição recebida com sucesso!"); },
    onError: (error) => { toast.error(error.message || "Erro ao enviar inscrição. Tente novamente."); },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createLead.mutate({ name: formData.name, email: formData.email, whatsapp: formData.phone, city: formData.city, event: "TOP Destemidos Pioneiros" });
  };

  return (
    <section id="inscricao" className="py-24 md:py-32 relative">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-forge-gold/20 to-transparent" />
      <div className="container">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <FadeIn>
                <p className="text-forge-gold font-semibold tracking-[0.2em] uppercase text-xs mb-4">Sua Jornada Começa Aqui</p>
                <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Inscreva-se no{" "}<span className="text-forge-gradient">TOP Destemidos Pioneiros</span>
                </h2>
                <p className="text-white/70 leading-relaxed mb-6">
                  Preencha o formulário e nossa equipe entrará em contato para guiá-lo no processo de inscrição. Vagas limitadas por edição.
                </p>
                <div className="space-y-4">
                  {[
                    { icon: Calendar, text: "Próximo TOP Destemidos Pioneiros: 30/07 a 02/08 de 2026" },
                    { icon: MapPin, text: "Track Destemidos Pioneiros — Porto Velho/RO" },
                    { icon: CreditCard, text: "Parcelamento em até 10x no cartão" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-white/60 text-sm">
                      <item.icon className="w-4 h-4 text-forge-gold shrink-0" /><span>{item.text}</span>
                    </div>
                  ))}
                </div>
                {/* Small photo strip */}
                <div className="flex gap-2 mt-8">
                  {[REAL_PHOTOS.rioCelebracao, REAL_PHOTOS.trilhaMorro, REAL_PHOTOS.rioVibrante].map((src, i) => (
                    <div key={i} className="w-20 h-14 rounded-lg overflow-hidden border border-white/[0.06]">
                      <img src={src} alt="" className="w-full h-full object-cover" />
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
                    <h3 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>Inscrição Recebida!</h3>
                    <p className="text-white/60 text-sm">Entraremos em contato em breve pelo WhatsApp.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-2">Nome Completo</label>
                      <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg bg-white/[0.05] border border-white/[0.1] text-white placeholder:text-white/30 focus:border-forge-gold/50 focus:ring-1 focus:ring-forge-gold/30 transition-all outline-none" placeholder="Seu nome" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-2">E-mail</label>
                      <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg bg-white/[0.05] border border-white/[0.1] text-white placeholder:text-white/30 focus:border-forge-gold/50 focus:ring-1 focus:ring-forge-gold/30 transition-all outline-none" placeholder="seu@email.com" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-2">WhatsApp</label>
                      <input type="tel" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg bg-white/[0.05] border border-white/[0.1] text-white placeholder:text-white/30 focus:border-forge-gold/50 focus:ring-1 focus:ring-forge-gold/30 transition-all outline-none" placeholder="(69) 99999-9999" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-2">Cidade</label>
                      <select value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg bg-white/[0.05] border border-white/[0.1] text-white focus:border-forge-gold/50 focus:ring-1 focus:ring-forge-gold/30 transition-all outline-none">
                        <option value="Porto Velho/RO" className="bg-[#1a1a1a]">Porto Velho/RO</option>
                        <option value="Balneário Camboriú/SC" className="bg-[#1a1a1a]">Balneário Camboriú/SC</option>
                        <option value="Curitiba/PR" className="bg-[#1a1a1a]">Curitiba/PR</option>
                        <option value="Belo Horizonte/MG" className="bg-[#1a1a1a]">Belo Horizonte/MG</option>
                        <option value="Outra cidade" className="bg-[#1a1a1a]">Outra cidade</option>
                      </select>
                    </div>
                    <Button type="submit" disabled={createLead.isPending}
                      className="w-full py-6 rounded-lg bg-forge-gold text-[#0C0C0E] font-bold text-base hover:brightness-110 transition-all forge-glow disabled:opacity-50">
                      {createLead.isPending ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Enviando...</> : <><Flame className="w-5 h-5 mr-2" />Quero Ser um Legendário</>}
                    </Button>
                    {createLead.isError && (
                      <div className="flex items-center gap-2 text-red-400 text-sm">
                        <AlertCircle className="w-4 h-4" /><span>{createLead.error?.message || "Erro ao enviar. Tente novamente."}</span>
                      </div>
                    )}
                    <p className="text-center text-xs text-white/30">Ao enviar, você concorda com nossa Política de Privacidade (LGPD).</p>
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
            <Flame className="w-5 h-5 text-forge-gold" />
            <span className="text-lg font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>LEGENDÁRIOS</span>
          </div>
          <div className="text-center">
            <p className="text-sm text-white/40">Plataforma Full Service com IA para Gestão de Eventos</p>
          </div>
          <div className="md:text-right">
            <div className="flex md:justify-end gap-4">
              <a href="https://www.instagram.com/legendariosportovelho/" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-forge-gold transition-colors text-sm">Instagram PVH</a>
              <a href="https://www.instagram.com/legendariosbrasil/" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-forge-gold transition-colors text-sm">Instagram Brasil</a>
              <a href="https://www.loslegendarios.org/" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-forge-gold transition-colors text-sm">Site Global</a>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-white/[0.04] text-center">
          <p className="text-xs text-white/25">TOP Destemidos Pioneiros — Porto Velho/RO. Plataforma Full Service com Inteligência Artificial. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}

// ─── Main Page ─────────────────────────────────────────────
export default function Home() {
  return (
    <div className="min-h-screen bg-[#0C0C0E]">
      <Navbar />
      <HeroSection />
      <PhotoBannerSection />
      <MovementSection />
      <GallerySection />
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
