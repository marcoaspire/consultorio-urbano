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

          {/* Rutas Públicas de Consulta (Navegación libre para cualquier visitante) */}
          <Route path="/" element={<ProjectsPortfolioScreen />} />
          <Route path="/proyectos" element={<ProjectsPortfolioScreen />} />
          <Route path="/proyectos/:projectSlug" element={<HomeScreen />} />
          <Route path="/analisis/:slug" element={<AnalysisDetailScreen />} />

          {/* Rutas Administrativas Protegidas (Exigen usuario con rol 'admin') */}
          <Route
            path="/nuevo"
            element={
              <ProtectedRoute requireAdmin redirectTo="/proyectos">
                <UploadAnalysisScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/subir-analisis"
            element={<Navigate to="/nuevo" replace />}
          />

          {/* Redirección por defecto */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
