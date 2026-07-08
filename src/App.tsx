import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import { PageTransition } from "@/components/layout/PageTransition";
import { ScrollProgress } from "@/components/layout/ScrollProgress";
import { CookieBanner } from "@/components/layout/CookieBanner";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

// Pages
import { Home } from "@/pages/Home";
import { RD } from "@/pages/RD";
import { Strategy } from "@/pages/Strategy";
import { Training } from "@/pages/Training";
import { TrainingRegister } from "@/pages/TrainingRegister";
import { Development } from "@/pages/Development";
import { Staffing } from "@/pages/Staffing";
import { Resources } from "@/pages/Resources";
import { About } from "@/pages/About";
import { Careers } from "@/pages/Careers";
import { Contact } from "@/pages/Contact";
import { Privacy } from "@/pages/Privacy";
import { Disclaimer } from "@/pages/Disclaimer";
import { Terms } from "@/pages/Terms";

// Articles
import { Article1 } from "@/pages/resources/Article1";
import { Article2 } from "@/pages/resources/Article2";
import { Article3 } from "@/pages/resources/Article3";
import { Article4 } from "@/pages/resources/Article4";
import { Article5 } from "@/pages/resources/Article5";
import { Article6 } from "@/pages/resources/Article6";

const queryClient = new QueryClient();

function AppRouter() {
  return (
    <PageTransition>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/rd" component={RD} />
        <Route path="/strategy" component={Strategy} />
        <Route path="/training/register" component={TrainingRegister} />
        <Route path="/training" component={Training} />
        <Route path="/development" component={Development} />
        <Route path="/staffing" component={Staffing} />
        
        <Route path="/resources" component={Resources} />
        <Route path="/resources/why-ai-strategies-fail" component={Article1} />
        <Route path="/resources/ai-readiness-scorecard" component={Article2} />
        <Route path="/resources/agentic-vs-automation" component={Article3} />
        <Route path="/resources/workforce-compliance-talent" component={Article4} />
        <Route path="/resources/llm-production-survival" component={Article5} />
        <Route path="/resources/responsible-ai" component={Article6} />

        <Route path="/about" component={About} />
        <Route path="/careers" component={Careers} />
        <Route path="/contact" component={Contact} />
        
        <Route path="/privacy" component={Privacy} />
        <Route path="/disclaimer" component={Disclaimer} />
        <Route path="/terms" component={Terms} />
        
        <Route component={NotFound} />
      </Switch>
    </PageTransition>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <ScrollToTop />
          <ScrollProgress />
          <Navbar />
          <main className="min-h-screen">
            <AppRouter />
          </main>
          <Footer />
          <CookieBanner />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
