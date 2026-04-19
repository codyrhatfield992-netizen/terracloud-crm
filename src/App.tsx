import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { queryClient } from "@/lib/queryClient";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Leads from "./pages/Leads";
import LeadDetail from "./pages/LeadDetail";
import LeadHunt from "./pages/LeadHunt";
import Properties from "./pages/Properties";
import PropertyDetail from "./pages/PropertyDetail";
import Contacts from "./pages/Contacts";
import ContactDetail from "./pages/ContactDetail";
import Tasks from "./pages/Tasks";
import Meetings from "./pages/Meetings";
import Documents from "./pages/Documents";
import SettingsPage from "./pages/Settings";
import CommandCenter from "./pages/CommandCenter";
import Simulations from "./pages/Simulations";
import SimulationDetail from "./pages/SimulationDetail";
import DealAutopsy from "./pages/DealAutopsy";
import DealAutopsyDetail from "./pages/DealAutopsyDetail";
import Analytics from "./pages/Analytics";
import NotFound from "./pages/NotFound";

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/leads" element={<ProtectedRoute><Leads /></ProtectedRoute>} />
            <Route path="/leads/:id" element={<ProtectedRoute><LeadDetail /></ProtectedRoute>} />
            <Route path="/lead-hunt" element={<ProtectedRoute><LeadHunt /></ProtectedRoute>} />
            <Route path="/properties" element={<ProtectedRoute><Properties /></ProtectedRoute>} />
            <Route path="/properties/:id" element={<ProtectedRoute><PropertyDetail /></ProtectedRoute>} />
            <Route path="/contacts" element={<ProtectedRoute><Contacts /></ProtectedRoute>} />
            <Route path="/contacts/:id" element={<ProtectedRoute><ContactDetail /></ProtectedRoute>} />
            <Route path="/tasks" element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
            <Route path="/meetings" element={<ProtectedRoute><Meetings /></ProtectedRoute>} />
            <Route path="/documents" element={<ProtectedRoute><Documents /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

            {/* XR */}
            <Route path="/command-center" element={<ProtectedRoute><CommandCenter /></ProtectedRoute>} />
            <Route path="/simulations" element={<ProtectedRoute><Simulations /></ProtectedRoute>} />
            <Route path="/simulations/:id" element={<ProtectedRoute><SimulationDetail /></ProtectedRoute>} />
            <Route path="/deal-autopsy" element={<ProtectedRoute><DealAutopsy /></ProtectedRoute>} />
            <Route path="/deal-autopsy/:id" element={<ProtectedRoute><DealAutopsyDetail /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
