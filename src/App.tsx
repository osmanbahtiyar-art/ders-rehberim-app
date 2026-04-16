import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import AdminRoute from "./components/AdminRoute";

// Public pages
import Landing from "./pages/Landing";
import StudentApplication from "./pages/StudentApplication";
import TeacherApplication from "./pages/TeacherApplication";
import ApplicationSuccess from "./pages/ApplicationSuccess";
import NotFound from "./pages/NotFound";

// Admin pages
import AdminLogin from "./pages/admin/AdminLogin";
import AdminPanel from "./pages/admin/AdminPanel";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* ── Public ── */}
            <Route path="/" element={<Landing />} />
            <Route path="/ogrenci-basvuru" element={<StudentApplication />} />
            <Route path="/ogretmen-basvuru" element={<TeacherApplication />} />
            <Route path="/basvuru-basarili" element={<ApplicationSuccess />} />

            {/* ── Admin (gizli URL) ── */}
            <Route path="/yonetim" element={<AdminLogin />} />
            <Route path="/yonetim/panel" element={<AdminRoute><AdminPanel /></AdminRoute>} />

            {/* ── 404 ── */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
