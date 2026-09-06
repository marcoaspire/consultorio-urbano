import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './features/auth/context/AuthContext';
import { AuthScreen } from './features/auth/AuthScreen';
import { AnalysisDetailScreen } from './features/comparison/AnalysisDetailScreen';
import { HomeScreen } from './features/gallery/HomeScreen';
import { ProjectsPortfolioScreen } from './features/projects/ProjectsPortfolioScreen';
import { UploadAnalysisScreen } from './features/upload/UploadAnalysisScreen';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Nivel 1: Portafolio Global de Proyectos / Terrenos */}
          <Route path="/" element={<ProjectsPortfolioScreen />} />

          {/* Nivel 2: Índice de Análisis del Proyecto */}
          <Route path="/proyectos/:projectSlug" element={<HomeScreen />} />

          {/* Autenticación: Login y Registro */}
          <Route path="/login" element={<AuthScreen initialTab="login" />} />
          <Route path="/registro" element={<AuthScreen initialTab="register" />} />
          <Route path="/auth" element={<AuthScreen initialTab="login" />} />

          {/* Formulario de Carga y Publicación de Nuevo Análisis */}
          <Route path="/nuevo" element={<UploadAnalysisScreen />} />

          {/* Nivel 3: Detalle del Análisis / Estudio con Comparador y Visor PDF */}
          <Route path="/analisis/:slug" element={<AnalysisDetailScreen />} />

          {/* Redirección por defecto al Portafolio Global */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
