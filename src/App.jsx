import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import Layout from '@/components/Layout';
import Dashboard from '@/pages/Dashboard';
import Library from '@/pages/Library';
import MaterialDetail from '@/pages/MaterialDetail';
import QuizRunner from '@/pages/QuizRunner';
import Flashcards from '@/pages/Flashcards';
import VoiceQA from '@/pages/VoiceQA';
import Analytics from '@/pages/Analytics';
import Login from '@/pages/Login';
import ResetPassword from '@/pages/ResetPassword';
import ExamPrep from '@/pages/ExamPrep';
import LandingPage from '@/pages/LandingPage';

const Spinner = () => (
  <div className="fixed inset-0 flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
  </div>
);

// Only logged-in users can access wrapped routes — otherwise show landing page
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoadingAuth } = useAuth();
  if (isLoadingAuth) return <Spinner />;
  return isAuthenticated ? children : <Navigate to="/" replace />;
};

const AppRoutes = () => {
  const { isAuthenticated, isLoadingAuth } = useAuth();
  if (isLoadingAuth) return <Spinner />;

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Protected app routes */}
      <Route path="/dashboard" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
      </Route>
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="library" element={<Library />} />
        <Route path="material/:id" element={<MaterialDetail />} />
        <Route path="quiz/:id" element={<QuizRunner />} />
        <Route path="flashcards" element={<Flashcards />} />
        <Route path="voice-qa" element={<VoiceQA />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="exam-prep" element={<ExamPrep />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default function App() {
  return (
    <QueryClientProvider client={queryClientInstance}>
      <AuthProvider>
        <Router>
          <AppRoutes />
          <Toaster />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}
