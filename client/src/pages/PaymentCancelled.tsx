import { X, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "wouter";

export default function PaymentCancelled() {
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
          className="w-20 h-20 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center mx-auto mb-8"
        >
          <X className="w-10 h-10 text-red-400" />
        </motion.div>

        <h1
          className="text-3xl md:text-4xl font-bold text-white mb-4"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Pagamento Cancelado
        </h1>

        <p className="text-white/60 text-lg mb-2">
          Sua inscrição no <strong className="text-[#FF4500]">TOP Destemidos Pioneiros</strong> não
          foi concluída.
        </p>

        <p className="text-white/40 text-sm mb-8">
          Não se preocupe, nenhuma cobrança foi realizada. Você pode tentar novamente quando quiser.
          As vagas são limitadas por edição.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#FF4500] text-[#0F0F0F] font-bold hover:brightness-110 transition-all"
          >
            Tentar Novamente
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
