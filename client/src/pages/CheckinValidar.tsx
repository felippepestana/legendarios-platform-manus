import { useEffect, useRef, useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Camera,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RotateCcw,
  User,
  Phone,
  MapPin,
  Church,
  Loader2,
  QrCode,
  Keyboard,
} from "lucide-react";

type ValidationResult = {
  success: boolean;
  error: string | null;
  participantName?: string;
  participantPhone?: string;
  participantCity?: string;
  participantChurch?: string;
  registrationType?: string;
  checkedInAt?: string;
};

export default function CheckinValidar() {
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<"camera" | "manual">("camera");
  const [scanning, setScanning] = useState(false);
  const [manualToken, setManualToken] = useState("");
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [processing, setProcessing] = useState(false);
  const scannerRef = useRef<any>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);

  const validateMutation = trpc.checkin.validate.useMutation();

  useEffect(() => {
    if (!user && !loading) {
      window.location.href = getLoginUrl();
    }
  }, [user, loading]);

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  const startScanner = async () => {
    try {
      setScanning(true);
      setResult(null);

      const { Html5Qrcode } = await import("html5-qrcode");

      if (scannerRef.current) {
        await scannerRef.current.stop();
      }

      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 280, height: 280 },
          aspectRatio: 1,
        },
        async (decodedText: string) => {
          // QR Code detected
          await handleQRResult(decodedText);
          await scanner.stop();
          setScanning(false);
        },
        () => {
          // Scan failure - ignore, keep scanning
        }
      );
    } catch (err) {
      console.error("Scanner error:", err);
      setScanning(false);
      setResult({
        success: false,
        error: "Não foi possível acessar a câmera. Verifique as permissões ou use o modo manual.",
      });
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
      } catch {
        // ignore
      }
      scannerRef.current = null;
    }
    setScanning(false);
  };

  const handleQRResult = async (decodedText: string) => {
    setProcessing(true);
    try {
      let token: string;
      try {
        const parsed = JSON.parse(decodedText);
        if (parsed.type !== "legendarios_checkin" || !parsed.token) {
          setResult({ success: false, error: "QR Code inválido. Este não é um código de check-in do evento." });
          setProcessing(false);
          return;
        }
        token = parsed.token;
      } catch {
        // If not JSON, try as raw token
        token = decodedText;
      }

      const response = await validateMutation.mutateAsync({ token });
      
      if (response.success && response.registration) {
        const reg = response.registration as any;
        setResult({
          success: true,
          error: null,
          participantName: reg.fullName,
          participantPhone: reg.phone,
          participantCity: reg.city,
          participantChurch: reg.churchName,
          registrationType: reg.type === "participant" ? "Participante" : "Servo",
          checkedInAt: new Date().toLocaleTimeString("pt-BR"),
        });
      } else {
        setResult({
          success: false,
          error: response.error || "Erro desconhecido na validação.",
        });
      }
    } catch (err: any) {
      setResult({
        success: false,
        error: err.message || "Erro ao processar o QR Code.",
      });
    }
    setProcessing(false);
  };

  const handleManualSubmit = async () => {
    if (!manualToken.trim()) return;
    await handleQRResult(JSON.stringify({ token: manualToken.trim(), type: "legendarios_checkin" }));
  };

  const resetScanner = () => {
    setResult(null);
    setManualToken("");
    if (mode === "camera") {
      startScanner();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 to-zinc-900 p-4">
      <div className="max-w-lg mx-auto space-y-4">
        {/* Header */}
        <div className="text-center pt-4 pb-2">
          <h1 className="text-2xl font-bold text-foreground flex items-center justify-center gap-2">
            <QrCode className="w-6 h-6 text-orange-500" />
            Check-in do Evento
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            TOP 1870 — Destemidos Pioneiros
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex gap-2 justify-center">
          <Button
            variant={mode === "camera" ? "default" : "outline"}
            size="sm"
            onClick={() => { setMode("camera"); stopScanner(); setResult(null); }}
            className={mode === "camera" ? "bg-orange-600 hover:bg-orange-700" : ""}
          >
            <Camera className="w-4 h-4 mr-2" /> Câmera
          </Button>
          <Button
            variant={mode === "manual" ? "default" : "outline"}
            size="sm"
            onClick={() => { setMode("manual"); stopScanner(); setResult(null); }}
            className={mode === "manual" ? "bg-orange-600 hover:bg-orange-700" : ""}
          >
            <Keyboard className="w-4 h-4 mr-2" /> Manual
          </Button>
        </div>

        {/* Scanner / Manual Input */}
        {!result && (
          <Card className="border-border/50 bg-card/80 backdrop-blur overflow-hidden">
            <CardContent className="p-4">
              {mode === "camera" ? (
                <div className="space-y-4">
                  <div
                    ref={videoContainerRef}
                    id="qr-reader"
                    className="w-full aspect-square rounded-lg overflow-hidden bg-black/50"
                  />
                  {!scanning ? (
                    <Button
                      onClick={startScanner}
                      className="w-full bg-orange-600 hover:bg-orange-700"
                    >
                      <Camera className="w-4 h-4 mr-2" /> Iniciar Câmera
                    </Button>
                  ) : (
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Procurando QR Code...
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Digite o token do QR Code manualmente:
                  </p>
                  <Input
                    value={manualToken}
                    onChange={(e) => setManualToken(e.target.value)}
                    placeholder="Cole o token aqui..."
                    className="font-mono text-sm"
                  />
                  <Button
                    onClick={handleManualSubmit}
                    disabled={!manualToken.trim() || processing}
                    className="w-full bg-orange-600 hover:bg-orange-700"
                  >
                    {processing ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4 mr-2" />
                    )}
                    Validar Check-in
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Processing */}
        {processing && (
          <Card className="border-orange-500/30 bg-orange-500/5">
            <CardContent className="p-6 flex flex-col items-center gap-3">
              <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
              <p className="text-foreground font-medium">Validando check-in...</p>
            </CardContent>
          </Card>
        )}

        {/* Result */}
        {result && !processing && (
          <Card
            className={`border-2 ${
              result.success
                ? "border-green-500/50 bg-green-500/5"
                : "border-red-500/50 bg-red-500/5"
            }`}
          >
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                {result.success ? (
                  <>
                    <CheckCircle className="w-6 h-6 text-green-500" />
                    <span className="text-green-500">Check-in Realizado!</span>
                  </>
                ) : result.error?.includes("já realizou") ? (
                  <>
                    <AlertTriangle className="w-6 h-6 text-yellow-500" />
                    <span className="text-yellow-500">Já Registrado</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-6 h-6 text-red-500" />
                    <span className="text-red-500">Erro na Validação</span>
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {result.success ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-foreground">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{result.participantName}</span>
                    <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded">
                      {result.registrationType}
                    </span>
                  </div>
                  {result.participantPhone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      {result.participantPhone}
                    </div>
                  )}
                  {result.participantCity && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      {result.participantCity}
                    </div>
                  )}
                  {result.participantChurch && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Church className="w-4 h-4" />
                      {result.participantChurch}
                    </div>
                  )}
                  <div className="text-xs text-green-400 mt-2">
                    Check-in às {result.checkedInAt}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">{result.error}</p>
              )}

              <Button
                onClick={resetScanner}
                variant="outline"
                className="w-full mt-4"
              >
                <RotateCcw className="w-4 h-4 mr-2" /> Escanear Outro
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Stats Summary (bottom) */}
        <div className="text-center text-xs text-muted-foreground pt-4">
          <p>Operador: {user.name || user.email}</p>
        </div>
      </div>
    </div>
  );
}
