# Buenas Prácticas para la Plataforma de Análisis Geoespacial en React + Vitejs

Este documento reúne las mejores prácticas de arquitectura, rendimiento, experiencia de usuario (UX) y modelado de datos para el desarrollo de la plataforma técnica utilizando React, Vite, Tailwind CSS y Supabase.
## 1. Arquitectura Frontend y Organización del Código

* **Entorno SPA Estricto (No SSR/Next.js):** Todo el desarrollo se ejecuta en el navegador sobre React con Vite. Queda estrictamente prohibido el uso de APIs o patrones de servidor de Next.js (`app/`, `next.config.ts`, Server Components, `next/image`, `next/font`, directivas `'use client'`).
* **Estructura Modular Feature-First:** Organizar el código bajo `src/features/` agrupando por dominio funcional (`features/gallery`, `features/comparison`, `features/upload`, `features/auth`).
  * Cada módulo contiene sus componentes específicos, hooks y tipos locales.
  * Los componentes comunes y reutilizables se ubican en `src/components/ui/`.
* **Capa de Servicios Desacoplada:** Prohibido realizar llamadas directas a Supabase o endpoints desde componentes visuales. Centralizar la lógica en `src/services/analyses.service.ts` y consumirla mediante *custom hooks* (`useAnalyses`, `useUploadAnalysis`).
* **Tipado Estricto con TypeScript:** Todo modelo, respuesta y estado debe estar explícitamente tipado en `src/types/`. No utilizar `any`.
* **Variables de Entorno:** Configurar exclusivamente variables públicas en Vite con el prefijo `VITE_` (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).

---

## 2. Experiencia de Usuario (UX) y Navegación

* **Jerarquía de Navegación Única (Top Navbar):**
  * La navegación principal se gestiona exclusivamente desde una barra horizontal superior fija (`TopNavBar`).
  * Contenido del Navbar: Título/Logotipo a la izquierda, barra de búsqueda contextual, botón de acción principal `+ Nuevo Análisis` y avatar/acceso a la derecha.
  * **Prohibido:** Implementar barras laterales fijas (`sidebar`) o barras inferiores flotantes en móvil (`mobile-bottom-nav`).
* **Diseño Responsivo y Contenedor Centrado:**
  * Envolver las pantallas en un contenedor seguro con márgenes automáticos: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`.
  * La cuadrícula de la galería debe adaptarse progresivamente: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6`.
* **Filtrado y Búsqueda Ágiles en Cliente:**
  * Dado el volumen inicial de datos (~10-15 análisis), el filtrado por categoría y la búsqueda por texto deben resolverse instantáneamente en memoria en el cliente mediante `useMemo`, sin paginaciones de servidor innecesarias.
* **Componente de Comparación Visual (Slider Antes/Después):**
  * El visor de detalle debe priorizar la interacción táctil (`touchstart`/`touchmove`) y de ratón (`mousedown`/`mousemove`).
  * No incluir controles redundantes de mapas interactivos (zoom `+`/`-` o selectores GIS) sobre imágenes estáticas; mantener el foco en la comparación deslizante de alta fidelidad.

---

## 3. Rendimiento y Manejo de Multimedia Pesada

* **Integridad de Imágenes de Alta Resolución:**
  * Las imágenes satelitales y ortomosaicos deben servirse en su resolución original sin compresión destructiva en la vista de detalle.
  * En la galería (`HomeScreen`), utilizar miniaturas optimizadas para evitar saturar el ancho de banda y la memoria del navegador.
* **Carga Diferida (Lazy Loading) y Code Splitting:**
  * Implementar `loading="lazy"` y `decoding="async"` en todas las tarjetas de la galería.
  * Cargar el visor de PDF y las librerías del comparador mediante `React.lazy()` y `Suspense` para mantener el bundle inicial liviano.
* **Prevención de Layout Shifts (CLS):** Utilizar *skeleton loaders* estructurados en las tarjetas mientras se resuelven las imágenes o los datos mock.

---

## 4. Seguridad y Gestión de Archivos

* **Protección de Credenciales:**
  * Utilizar únicamente la clave anónima (`anon key`) en el frontend.
  * Jamás exponer ni utilizar la `service_role key` de Supabase en el código cliente.
* **Seguridad en Supabase (RLS):**
  * Toda tabla creada en PostgreSQL debe contar con Row Level Security habilitado (`ENABLE ROW LEVEL SECURITY`).
  * Restringir mutaciones (`INSERT`, `UPDATE`, `DELETE`) estrictamente a usuarios autenticados (`auth.uid() = user_id`).
* **Validación de Archivos en Storage:**
  * Validar tamaño y tipo MIME tanto en el formulario de subida como en las políticas del bucket (`image/png`, `image/jpeg`, `image/tiff`, `application/pdf`).

---

## 5. Modelado de Datos (PostgreSQL Agnóstico)

* **Separación de Entidades:**
  * Mantener una tabla principal `analyses` para la metadata descriptiva y relacional.
  * Utilizar una tabla dependiente `analysis_assets` para almacenar las rutas relativas (`storage_path`), tipos de archivo (`image_before`, `image_after`, `pdf_report`) y metadatos complementarios en formato `JSONB`.
* **Compatibilidad Estándar:**
  * Emplear tipos de datos estándar de PostgreSQL (`UUID`, `TIMESTAMPTZ`, `TEXT`, `JSONB`) para garantizar que el esquema pueda migrarse a cualquier otro proveedor (AWS RDS, Neon, PostgreSQL propio) sin bloqueo de proveedor (*no vendor lock-in*).