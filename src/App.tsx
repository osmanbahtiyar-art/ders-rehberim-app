import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";
import VerifyMobile from "./pages/VerifyMobile";
import TwoFactorAuth from "./pages/TwoFactorAuth";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import HomePage from "./pages/HomePage";
import SearchPage from "./pages/SearchPage";
import TeacherProfile from "./pages/TeacherProfile";
import AskQuestion from "./pages/AskQuestion";
import MyLessons from "./pages/MyLessons";
import Messages from "./pages/Messages";
import Profile from "./pages/Profile";
import SolveQuestions from "./pages/SolveQuestions";
import FavoriteTeachers from "./pages/FavoriteTeachers";
import Coupons from "./pages/Coupons";
import Settings from "./pages/Settings";
import Reviews from "./pages/Reviews";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/verify-mobile" element={<VerifyMobile />} />
            <Route path="/2fa" element={<TwoFactorAuth />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
            <Route path="/search" element={<ProtectedRoute><SearchPage /></ProtectedRoute>} />
            <Route path="/teacher/:id" element={<ProtectedRoute><TeacherProfile /></ProtectedRoute>} />
            <Route path="/ask-question" element={<ProtectedRoute><AskQuestion /></ProtectedRoute>} />
            <Route path="/solve-questions" element={<ProtectedRoute><SolveQuestions /></ProtectedRoute>} />
            <Route path="/my-lessons" element={<ProtectedRoute><MyLessons /></ProtectedRoute>} />
            <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/favorites" element={<ProtectedRoute><FavoriteTeachers /></ProtectedRoute>} />
            <Route path="/coupons" element={<ProtectedRoute><Coupons /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/reviews" element={<ProtectedRoute><Reviews /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
