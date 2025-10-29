import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { I18nProvider } from "./contexts/I18nContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { MainLayout } from "./components/layouts/MainLayout";

// Auth Pages
import LoginPage from "./pages/auth/Login";
import RegisterPage from "./pages/auth/Register";
import VerifyOtpPage from "./pages/auth/VerifyOtp";

// Dashboard Pages
import AgentDashboard from "./pages/dashboard/AgentDashboard";
import CustomerDashboard from "./pages/dashboard/CustomerDashboard";
import AdminDashboard from "./pages/dashboard/AdminDashboard";

// Other Pages
import LandingPage from "./pages/Landing";
import PlaceholderPage from "./pages/Placeholder";
import NewPolicyPage from "./pages/policies/NewPolicy";
import RequestPayoutPage from "./pages/payments/RequestPayout";
import PoliciesPage from "./pages/policies/PoliciesPage";
import KycPage from "./pages/agents/Kyc";
import UnauthorizedPage from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";
import { useAuth } from "./contexts/AuthContext";

const queryClient = new QueryClient();

// Dashboard Router Component
const DashboardRouter = () => {
  const { user } = useAuth();

  if (user?.role === 'agent') {
    return <AgentDashboard />;
  } else if (user?.role === 'customer') {
    return <CustomerDashboard />;
  } else if (user?.role === 'admin') {
    return <AdminDashboard />;
  }

  return <Navigate to="/login" replace />;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify-otp" element={<VerifyOtpPage />} />

      {/* Auth Required Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <MainLayout>
              <DashboardRouter />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Agent Routes */}
      <Route
        path="/agents/kyc"
        element={
          <ProtectedRoute requiredRoles={['agent', 'admin']}>
            <MainLayout>
              <KycPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/policies/new"
        element={
          <ProtectedRoute requiredRoles={['agent', 'customer']}>
            <MainLayout>
              <NewPolicyPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Dashboard Policies (Agents/Admin only) */}
      <Route
        path="/dashboard/policies"
        element={
          <ProtectedRoute requiredRoles={['agent', 'admin']}>
            <MainLayout>
              <PoliciesPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Dashboard New Policy (Agents/Admin only) */}
      <Route
        path="/dashboard/new-policy"
        element={
          <ProtectedRoute requiredRoles={['agent', 'admin']}>
            <MainLayout>
              <NewPolicyPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/policies/*"
        element={
          <ProtectedRoute requiredRoles={['agent', 'customer']}>
            <MainLayout>
              <PlaceholderPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/payments"
        element={
          <ProtectedRoute requiredRoles={['agent', 'customer']}>
            <MainLayout>
              <RequestPayoutPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />


      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <MainLayout>
              <PlaceholderPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <MainLayout>
              <PlaceholderPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/reports"
        element={
          <ProtectedRoute requiredRoles={['admin']}>
            <MainLayout>
              <PlaceholderPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/agents/*"
        element={
          <ProtectedRoute requiredRoles={['admin']}>
            <MainLayout>
              <PlaceholderPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/*"
        element={
          <ProtectedRoute requiredRoles={['admin']}>
            <MainLayout>
              <PlaceholderPage />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* Error Routes */}
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <ThemeProvider>
    <I18nProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
              <AppRoutes />
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </I18nProvider>
  </ThemeProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
