import { CheckCircle2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "wouter";

export default function PaymentSuccess() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "#0F0F0F" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-lg"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-20 h-20 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center mx-auto mb-8"
        >
          <CheckCircle2 className="w-10 h-10 text-green-400" />
        </motion.div>

        <h1
          className="text-3xl md:text-4xl font-bold text-white mb-4"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Pagamento Confirmado!
        </h1>

        <p className="text-white/60 text-lg mb-2">
          Sua inscrição no <strong className="text-[#FF4500]">TOP Destemidos Pioneiros</strong> foi
          realizada com sucesso.
        </p>

        <p className="text-white/40 text-sm mb-8">
          Você receberá um e-mail com os detalhes da sua inscrição e as próximas instruções.
          Bem-vindo à jornada de transformação!
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#FF4500] text-[#0F0F0F] font-bold hover:brightness-110 transition-all"
          >
            Voltar ao Início
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <p className="text-white/20 text-xs mt-12">
          Dúvidas? Entre em contato pelo WhatsApp ou e-mail informados no site.
        </p>
      </motion.div>
    </div>
  );
}
