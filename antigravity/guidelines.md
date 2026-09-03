# Prioridades

1. Integridad y calidad de imagen sin compresión
    - Asegurar que el pipeline de almacenamiento (Object Storage) sirva los archivos binarios en su resolución y calidad original (sin algoritmos de compresión destructiva que degraden el detalle cartográfico/satelital).

P2. Componente de comparación visual fluida (Slider Antes/Después)
    - Desarrollar un comparador interactivo robusto, responsivo y sin desfase para contrastar las dos tomas de alta resolución dentro de la vista de detalle de cada estudio.

P3. Flujo de gestión y carga de contenido directo
    - Implementar el formulario de subida optimizado (Título, Descripción, Imagen Antes, Imagen Después y PDF) con soporte para archivos pesados e indicadores claros de progreso durante la carga.

P4. Consulta, lectura y filtrado (Galería + Visor PDF)
    - Desplegar la galería principal centrada con buscador rápido por metadatos (ciudad, tipo, fecha) e integrar un lector de PDF embebido con controles básicos (paginación y descarga).

P5. Control de acceso simple y costo cero de infraestructura
    - Mantener la plataforma protegida mediante autenticación básica (login/registro) y desacoplada en una arquitectura serverless/SPA que garantice $0 USD de costo operativo mensual bajo la cuota de uso del cliente.