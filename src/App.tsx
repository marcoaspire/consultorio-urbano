import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AnalysisDetailScreen } from './features/comparison/AnalysisDetailScreen';
import { HomeScreen } from './features/gallery/HomeScreen';
import { UploadAnalysisScreen } from './features/upload/UploadAnalysisScreen';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Galería Principal */}
        <Route path="/" element={<HomeScreen />} />

        {/* Carga y Publicación de Nuevo Análisis */}
        <Route path="/nuevo" element={<UploadAnalysisScreen />} />

        {/* Detalle del Análisis / Estudio con Comparador y Visor PDF */}
        <Route path="/analisis/:slug" element={<AnalysisDetailScreen />} />

        {/* Redirección por defecto */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}


export default App;
