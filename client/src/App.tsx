import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './features/auth/context/AuthContext';
import { AuthScreen } from './features/auth/AuthScreen';
import { ProtectedRoute } from './features/auth/components/ProtectedRoute';
import { PublicOnlyRoute } from './features/auth/components/PublicOnlyRoute';
import { AnalysisDetailScreen } from './features/comparison/AnalysisDetailScreen';
import { HomeScreen } from './features/gallery/HomeScreen';
import { ProjectsPortfolioScreen } from './features/projects/ProjectsPortfolioScreen';
import { UploadAnalysisScreen } from './features/upload/UploadAnalysisScreen';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rutas Públicas de Autenticación (Solo accesibles si NO está autenticado) */}
          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <AuthScreen initialTab="login" />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/registro"
            element={
              <PublicOnlyRoute>
                <AuthScreen initialTab="register" />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/auth"
            element={
              <PublicOnlyRoute>
                <AuthScreen initialTab="login" />
              </PublicOnlyRoute>
            }
          />

          {/* Rutas Privadas Protegidas (Exigen usuario logueado, redirigen a /login) */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <ProjectsPortfolioScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/proyectos"
            element={
              <ProtectedRoute>
                <ProjectsPortfolioScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/proyectos/:projectSlug"
            element={
              <ProtectedRoute>
                <HomeScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/nuevo"
            element={
              <ProtectedRoute>
                <UploadAnalysisScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analisis/:slug"
            element={
              <ProtectedRoute>
                <AnalysisDetailScreen />
              </ProtectedRoute>
            }
          />

          {/* Redirección por defecto */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
