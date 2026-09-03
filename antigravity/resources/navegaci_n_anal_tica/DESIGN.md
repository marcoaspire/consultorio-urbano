---
name: Navegación Analítica
colors:
  surface: '#051424'
  surface-dim: '#051424'
  surface-bright: '#2c3a4c'
  surface-container-lowest: '#010f1f'
  surface-container-low: '#0d1c2d'
  surface-container: '#122131'
  surface-container-high: '#1c2b3c'
  surface-container-highest: '#273647'
  on-surface: '#d4e4fa'
  on-surface-variant: '#c6c6cd'
  inverse-surface: '#d4e4fa'
  inverse-on-surface: '#233143'
  outline: '#909097'
  outline-variant: '#45464d'
  surface-tint: '#bec6e0'
  primary: '#bec6e0'
  on-primary: '#283044'
  primary-container: '#0f172a'
  on-primary-container: '#798098'
  inverse-primary: '#565e74'
  secondary: '#ffb690'
  on-secondary: '#552100'
  secondary-container: '#ec6a06'
  on-secondary-container: '#4a1c00'
  tertiary: '#7bd0ff'
  on-tertiary: '#00354a'
  tertiary-container: '#001a27'
  on-tertiary-container: '#008abb'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#ffdbca'
  secondary-fixed-dim: '#ffb690'
  on-secondary-fixed: '#341100'
  on-secondary-fixed-variant: '#783200'
  tertiary-fixed: '#c4e7ff'
  tertiary-fixed-dim: '#7bd0ff'
  on-tertiary-fixed: '#001e2c'
  on-tertiary-fixed-variant: '#004c69'
  background: '#051424'
  on-background: '#d4e4fa'
  surface-variant: '#273647'
typography:
  headline-xl:
    fontFamily: Montserrat
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Montserrat
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Montserrat
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Montserrat
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 8px
  container-margin: 24px
  gutter: 16px
  panel-width: 360px
  touch-target: 44px
---

## Brand & Style
Este sistema de diseño está concebido para una plataforma de análisis de viajes y cartografía técnica que equilibra la precisión de los datos con una experiencia de usuario fluida y moderna. El estilo visual es una evolución del **Minimalismo Corporativo** con toques de **Glassmorphism**, diseñado para proyectar autoridad, claridad y dinamismo tecnológico.

La personalidad de la marca es analítica, segura y visionaria. Está dirigida a profesionales que requieren procesar grandes volúmenes de información geoespacial sin fricciones visuales. La interfaz utiliza capas translúcidas para mantener el contexto del mapa de fondo, asegurando que las herramientas de análisis se sientan como extensiones naturales del lienzo cartográfico.

## Colors
El esquema cromático utiliza una base de **Deep Navy** (#0F172A) y **Slate** para establecer un entorno de trabajo serio y enfocado, ideal para reducir la fatiga visual durante sesiones prolongadas de análisis de datos. 

- **Primario (Navy/Slate):** Define la jerarquía estructural y los fondos de contenedores.
- **Acción Principal (Orange):** El color #F97316 se reserva exclusivamente para marcadores críticos en el mapa y llamadas a la acción (CTAs) de alta prioridad, emulando la energía de un punto de destino.
- **Acción Secundaria/Info (Electric Blue):** El color #38BDF8 se utiliza para elementos de navegación, selecciones activas y visualización de rutas, proporcionando un contraste tecnológico sobre el fondo oscuro.
- **Neutros:** Una escala de grises azulados para tipografía secundaria y bordes sutiles.

## Typography
La tipografía combina la fuerza geométrica de **Montserrat** para encabezados con la legibilidad técnica de **Inter** para el cuerpo de texto y datos.

- **Encabezados:** Deben usar Montserrat con tracking ligeramente reducido para un aspecto más compacto y profesional.
- **Cuerpo y Datos:** Inter se utiliza en pesos Regular y Medium. Para datos numéricos en tablas de análisis, se recomienda el uso de variantes tabulares de Inter para alinear cifras decimales.
- **Etiquetas:** Los labels de micro-datos y categorías en el mapa deben presentarse en mayúsculas con tracking aumentado para mejorar la lectura en tamaños reducidos.

## Layout & Spacing
El sistema utiliza un **modelo de cuadrícula fluida** con paneles laterales fijos para herramientas de análisis.

- **Estructura:** El mapa ocupa el 100% del viewport. Los paneles de control y datos flotan sobre el mapa utilizando márgenes de 24px.
- **Rimo Espacial:** Basado en una unidad de 8px. Los elementos internos de las tarjetas mantienen un padding de 16px (2 unidades).
- **Adaptabilidad:** En dispositivos móviles, los paneles laterales se transforman en "Bottom Sheets" deslizables para maximizar el área visible del mapa. Los objetivos táctiles nunca deben ser inferiores a 44px.

## Elevation & Depth
La profundidad se gestiona mediante capas de **Glassmorphism** y sombras ambientales suaves para separar la interfaz del lienzo cartográfico:

- **Nivel 0 (Mapa):** La base visual.
- **Nivel 1 (Paneles de Herramientas):** Fondo con desenfoque de fondo (backdrop-filter: blur(12px)) y una opacidad del 80% sobre el color Navy. Incluye un borde fino de 1px con opacidad del 10% en blanco para definir el límite.
- **Nivel 2 (Modales y Popovers):** Sombras más difusas (blur 20px, 15% opacidad negra) para indicar interactividad inmediata.
- **Oclusión:** Los elementos interactivos deben permitir ver ligeramente el mapa subyacente para no perder la noción de ubicación espacial.

## Shapes
Se adopta un enfoque de **bordes suavizados pero precisos** (Soft). 

- **Componentes Estándar:** Radio de 4px para botones y campos de entrada, reforzando la naturaleza técnica del software.
- **Contenedores y Tarjetas:** Radio de 8px (LG) para paneles laterales y tarjetas de información, creando una separación clara pero armónica.
- **Elementos de Mapa:** Los pines y marcadores pueden usar formas más orgánicas o circulares para destacar sobre la retícula ortogonal de la interfaz.

## Components
- **Botones:** El botón primario usa el naranja vibrante con texto blanco. Los botones de herramientas en el mapa son cuadrados con efecto de cristal y bordes nítidos.
- **Deslizadores de Comparación (Sliders):** Diseñados con una línea de división central de alta visibilidad para comparar capas de datos históricos vs. actuales sobre el mapa.
- **Tarjetas de Datos:** Fondo translúcido, bordes de 1px en Slate claro, y tipografía Inter en tamaño SM para densidades de datos altas.
- **Campos de Entrada:** Estilo minimalista con fondo oscuro sólido y un borde inferior que se ilumina en Electric Blue al recibir el foco.
- **Visor de Documentos:** Un panel lateral expandible con scroll independiente y controles de zoom integrados, manteniendo la estética de vidrio esmerilado.
- **Chips de Filtrado:** Pequeños indicadores redondeados con bordes definidos que utilizan el azul eléctrico para estados activos.