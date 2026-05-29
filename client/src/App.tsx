import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancelled from "./pages/PaymentCancelled";
import AdminTestimonials from "./pages/AdminTestimonials";
import InscricaoParticipante from "./pages/InscricaoParticipante";
import InscricaoServo from "./pages/InscricaoServo";
import AdminInscricoes from "./pages/AdminInscricoes";
import AdminWhatsApp from "./pages/AdminWhatsApp";
import AdminLeads from "./pages/AdminLeads";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/pagamento/sucesso"} component={PaymentSuccess} />
      <Route path={"/pagamento/cancelado"} component={PaymentCancelled} />
      <Route path={"/admin/depoimentos"} component={AdminTestimonials} />
      <Route path={"/inscricao/participante"} component={InscricaoParticipante} />
      <Route path={"/inscricao/servo"} component={InscricaoServo} />
      <Route path={"/admin/inscricoes"} component={AdminInscricoes} />
      <Route path={"/admin/whatsapp"} component={AdminWhatsApp} />
      <Route path={"/admin/leads"} component={AdminLeads} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
