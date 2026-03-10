import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/hooks/useAuth";
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { Web3Provider } from '@/hooks/useWeb3';
import { config } from '@/lib/wagmi';
import '@rainbow-me/rainbowkit/styles.css';
import SkipLinks from "@/components/SkipLinks";
import RouteAnnouncer from "@/components/RouteAnnouncer";
import FocusManager from "@/components/FocusManager";
import Index from "./pages/Index";
import League from "./pages/League";
import Trade from "./pages/Trade";
import PlayerProfile from "./pages/PlayerProfile";
import UserProfile from "./pages/UserProfile";
import Portfolio from "./pages/Portfolio";
import Auth from "./pages/Auth";
import FocusDemo from "./pages/FocusDemo";
import MaddenMarketplace from "./pages/MaddenMarketplace";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <Web3Provider>
            <AuthProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <SkipLinks />
                  <RouteAnnouncer />
                  <FocusManager />
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/league" element={<League />} />
                    <Route path="/trade/:playerId" element={<Trade />} />
                    <Route path="/trade" element={<Trade />} />
                    <Route path="/player/:id" element={<PlayerProfile />} />
                    <Route path="/profile" element={<UserProfile />} />
                    <Route path="/portfolio" element={<Portfolio />} />
                    <Route path="/madden" element={<MaddenMarketplace />} />
                    <Route path="/focus-demo" element={<FocusDemo />} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </BrowserRouter>
              </TooltipProvider>
            </AuthProvider>
          </Web3Provider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </ThemeProvider>
);

export default App;
