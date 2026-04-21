import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index.tsx";
import Leads from "./pages/Leads.tsx";
import Projects from "./pages/Projects.tsx";
import Clients from "./pages/Clients.tsx";
import Sales from "./pages/Sales.tsx";
import Operations from "./pages/Operations.tsx";
import Financials from "./pages/Financials.tsx";
import Documents from "./pages/Documents.tsx";
import Reports from "./pages/Reports.tsx";
import Users from "./pages/Users.tsx";
import Activity from "./pages/Activity.tsx";
import Roles from "./pages/Roles.tsx";
import Settings from "./pages/Settings.tsx";
import Trash from "./pages/Trash.tsx";
import Login from "./pages/Login.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/leads" element={<ProtectedRoute module="leads"><Leads /></ProtectedRoute>} />
            <Route path="/projects" element={<ProtectedRoute module="projects"><Projects /></ProtectedRoute>} />
            <Route path="/clients" element={<ProtectedRoute module="clients"><Clients /></ProtectedRoute>} />
            <Route path="/sales" element={<ProtectedRoute module="sales"><Sales /></ProtectedRoute>} />
            <Route path="/operations" element={<ProtectedRoute module="operations"><Operations /></ProtectedRoute>} />
            <Route path="/financials" element={<ProtectedRoute module="financials"><Financials /></ProtectedRoute>} />
            <Route path="/documents" element={<ProtectedRoute module="documents"><Documents /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute module="reports"><Reports /></ProtectedRoute>} />
            <Route path="/users" element={<ProtectedRoute module="users"><Users /></ProtectedRoute>} />
            <Route path="/activity" element={<ProtectedRoute><Activity /></ProtectedRoute>} />
            <Route path="/roles" element={<ProtectedRoute><Roles /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/trash" element={<ProtectedRoute><Trash /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
