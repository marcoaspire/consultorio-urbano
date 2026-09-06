import type { Analysis } from '../types/analysis';

/**
 * Datos mock de análisis geoespaciales.
 * Simulan el resultado relacional de 'analyses' y 'analysis_assets'.
 * Cada análisis incluye colección de 1 a N imágenes (Histórica/Antes y Actual/Después)
 * y un resumen técnico para el panel de reporte PDF.
 */
export const MOCK_ANALYSES: Analysis[] = [
  {
    id: 'f81d4fae-7dec-11d0-a765-00a0c91e6bf7',
    slug: 'evaluacion-de-terreno-b-42',
    project_slug: 'evaluacion-de-terreno-b-42',
    title: 'Evaluación de Terreno B-42',
    description:
      'Mapeo de elevación y análisis de riesgo de deslizamientos en la periferia oriental de Santiago de Chile utilizando datos LIDAR recientes. Las discrepancias observadas entre los conjuntos de datos indican una erosión significativa en el sector noroccidental.',
    city: 'Santiago',
    quadrant: 'Cuadrante Norte',
    category: 'topografia',
    created_at: '2023-10-24T14:30:00Z',
    updated_at: '2023-10-24T16:00:00Z',
    relative_time: '24 Oct 2023',
    thumbnail_url:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCvyDFwVRAP-osJLpTwmGT2qaIXc-jqyZDX-L8yyOPFcAeMmJEs8CytBz42mlBH5bX6NGx_NmA1phHodAqTyteT7rgP_3a2lWA_4FZAe1hSypI2Z_Q-7WTc0vQP4Ipdcc1DYAGeIenZJwz9GaAmb92uTNZRfPuQgotWsIYMFE9jNiT3xIS478FrxC8KZ8ua-oK88tBFJenCnPHj5wzNIHA44I3NnMCIsTXaMVS_4yXqZPnjhdegZwA',
    assets: [
      {
        id: 'a1111111-0000-0000-0000-000000000004',
        analysis_id: 'f81d4fae-7dec-11d0-a765-00a0c91e6bf7',
        asset_type: 'image_before',
        storage_path:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuC_Xr9xcqXF2AGfEOET5XuXzZZTi1ieceqfvA4pCaDwj45KurkwQ0Qu8GvhwChTIHzy4s5oqbnAen30xIbFEx-eJxAa_7Uf7RNzYM3DckecQhkovthvmAdCZf7HCtPrR_hDAH8nqvQEvQUhdLN29T3peLNA4qmXtwoBjqa4Cc0karigNNG4Pw435xuOaQU9ZNywbgSOHErd2ben8sj1YVRk4JHl6VrCkmvo26UA7AGxpe2y5kdxzfE',
        mime_type: 'image/jpeg',
        metadata: {
          label: 'Histórico (2020)',
          year: '2020',
          sensor: 'LIDAR-Airborne',
          vertical_accuracy: '0.05m',
        },
        created_at: '2020-10-15T10:00:00Z',
      },
      {
        id: 'a1111111-0000-0000-0000-000000000005',
        analysis_id: 'f81d4fae-7dec-11d0-a765-00a0c91e6bf7',
        asset_type: 'image_after',
        storage_path:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuCvyDFwVRAP-osJLpTwmGT2qaIXc-jqyZDX-L8yyOPFcAeMmJEs8CytBz42mlBH5bX6NGx_NmA1phHodAqTyteT7rgP_3a2lWA_4FZAe1hSypI2Z_Q-7WTc0vQP4Ipdcc1DYAGeIenZJwz9GaAmb92uTNZRfPuQgotWsIYMFE9jNiT3xIS478FrxC8KZ8ua-oK88tBFJenCnPHj5wzNIHA44I3NnMCIsTXaMVS_4yXqZPnjhdegZwA',
        mime_type: 'image/jpeg',
        metadata: {
          label: 'Actual (2023)',
          year: '2023',
          sensor: 'High-Res Optical Satellite',
          resolution: '0.3m/px',
        },
        created_at: '2023-10-24T14:30:00Z',
      },
      {
        id: 'a1111111-0000-0000-0000-000000000006',
        analysis_id: 'f81d4fae-7dec-11d0-a765-00a0c91e6bf7',
        asset_type: 'pdf_report',
        storage_path: 'analyses/santiago/Reporte_Topografico.pdf',
        mime_type: 'application/pdf',
        metadata: { pages: 12, author: 'Unidad de Cartografía Técnica' },
        created_at: '2023-10-24T15:00:00Z',
      },
    ],
    technical_summary: {
      pdf_filename: 'Reporte_Topografico.pdf',
      pdf_total_pages: 12,
      tags: ['Alta Prioridad', 'Sector Noroeste'],
      metrics: [
        { label: 'Variación media', value: '-1.2m' },
        { label: 'Área afectada', value: '4.5 hectáreas' },
        { label: 'Riesgo estructural', value: 'Moderado' },
      ],
      executive_summary:
        'Las discrepancias observadas entre los conjuntos de datos de 2020 y 2023 indican una erosión significativa en el sector noroccidental. El volumen estimado de desplazamiento de material supera los parámetros operativos estándar.',
      pages: [
        {
          pageNumber: 1,
          title: 'Análisis de Elevación',
          content:
            'Las discrepancias observadas entre los conjuntos de datos de 2020 y 2023 indican una erosión significativa en el sector noroccidental. El volumen estimado de desplazamiento de material supera los parámetros operativos estándar.',
          tags: ['Alta Prioridad', 'Sector Noroeste'],
          metrics: [
            { label: 'Variación media', value: '-1.2m' },
            { label: 'Área afectada', value: '4.5 hectáreas' },
            { label: 'Riesgo estructural', value: 'Moderado' },
          ],
        },
        {
          pageNumber: 2,
          title: 'Metodología y Nube de Puntos LIDAR',
          content:
            'Se procesaron 450 millones de pulsos láser con densidad promedio de 18 pts/m². El ajuste geodésico se referenció a la estación SIRGAS local con error RMS vertical de 0.042m.',
          tags: ['Control Geodésico', 'LIDAR'],
          metrics: [
            { label: 'Densidad de puntos', value: '18 pts/m²' },
            { label: 'Error RMS', value: '±0.042m' },
            { label: 'Puntos clasificados', value: '99.4%' },
          ],
        },
        {
          pageNumber: 3,
          title: 'Zonificación de Riesgo y Recomendaciones',
          content:
            'Se sugiere la instalación de prismas de monitoreo geotécnico continuo en las pendientes superiores al 35% y restricción temporal de movimientos de tierra en el flanco oeste.',
          tags: ['Medidas Preventivas', 'Geotecnia'],
          metrics: [
            { label: 'Pendiente crítica', value: '> 35%' },
            { label: 'Prismas recomendados', value: '8 unidades' },
            { label: 'Plazo de intervención', value: '15 días' },
          ],
        },
      ],
    },
  },
  {
    id: 'f81d4fae-7dec-11d0-a765-00a0c91e6bf6',
    slug: 'analisis-de-flujo-urbano-madrid',
    project_slug: 'red-vial-troncal-sur',
    title: 'Análisis de Flujo Urbano - Madrid',
    description:
      'Estudio detallado de los patrones de movimiento peatonal y vehicular en el centro de Madrid durante el último trimestre. Identificación de cuellos de botella en horas punta.',
    city: 'Madrid',
    quadrant: 'Distrito Centro',
    category: 'movilidad',
    created_at: '2026-09-01T10:00:00Z',
    updated_at: '2026-09-01T12:00:00Z',
    relative_time: 'Hace 2 días',
    thumbnail_url:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDlO7PsPQt_fBkQaemU9o6m0cYby-E-R_6eVAulx89yuyKlIwzd2SyfgXFJSbTy8xZ-zW67Ne4dtP1JlvyddI-Z_FXy7eEDNO6ruoCF2w8Px2svC5jxQbcsfeZfOA5GLlpIUyAvGg74Jv6h_0i4pk56dlMl_VX5tL9s491P3lxwr9d8shlNWqpzyuQS7m6tm5VW1rxNTU2vzCSr6Qjn5Zr2zu9UQ2aPGb_Dtvg6ygjbXcpvLVBsFrU',
    assets: [
      {
        id: 'a1111111-0000-0000-0000-000000000001',
        analysis_id: 'f81d4fae-7dec-11d0-a765-00a0c91e6bf6',
        asset_type: 'image_before',
        storage_path:
          'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=1200&q=80',
        mime_type: 'image/jpeg',
        metadata: {
          label: 'Flujo Base (2024)',
          year: '2024',
          resolution: '0.3m/px',
        },
        created_at: '2024-06-01T10:00:00Z',
      },
      {
        id: 'a1111111-0000-0000-0000-000000000002',
        analysis_id: 'f81d4fae-7dec-11d0-a765-00a0c91e6bf6',
        asset_type: 'image_after',
        storage_path:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuDlO7PsPQt_fBkQaemU9o6m0cYby-E-R_6eVAulx89yuyKlIwzd2SyfgXFJSbTy8xZ-zW67Ne4dtP1JlvyddI-Z_FXy7eEDNO6ruoCF2w8Px2svC5jxQbcsfeZfOA5GLlpIUyAvGg74Jv6h_0i4pk56dlMl_VX5tL9s491P3lxwr9d8shlNWqpzyuQS7m6tm5VW1rxNTU2vzCSr6Qjn5Zr2zu9UQ2aPGb_Dtvg6ygjbXcpvLVBsFrU',
        mime_type: 'image/jpeg',
        metadata: {
          label: 'Flujo Actual (2026)',
          year: '2026',
          resolution: '0.3m/px',
        },
        created_at: '2026-09-01T10:00:00Z',
      },
    ],
    technical_summary: {
      pdf_filename: 'Reporte_Flujo_Madrid_Q3.pdf',
      pdf_total_pages: 14,
      tags: ['Movilidad Crítica', 'Gran Vía - Sol'],
      metrics: [
        { label: 'Flujo promedio', value: '42,000 veh/día' },
        { label: 'Reducción de velocidad', value: '-22%' },
        { label: 'Intensidad peatonal', value: 'Muy Alta' },
      ],
      executive_summary:
        'Concentración de flujo vehicular superior al 85% de capacidad de vía en ejes Gran Vía y Alcalá entre las 18:00 y las 20:30 horas.',
    },
  },
  {
    id: 'f81d4fae-7dec-11d0-a765-00a0c91e6bf8',
    slug: 'densidad-poblacional-cdmx',
    project_slug: 'red-vial-troncal-sur',
    title: 'Densidad Poblacional - CDMX',
    description:
      'Visualización de la distribución demográfica en las delegaciones centrales de la Ciudad de México para optimización de rutas de transporte público.',
    city: 'CDMX',
    quadrant: 'Alcaldía Cuauhtémoc',
    category: 'demografia',
    created_at: '2026-08-20T09:15:00Z',
    updated_at: '2026-08-20T11:00:00Z',
    relative_time: 'Hace 2 semanas',
    thumbnail_url:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDgnaRkCBiVWC19_E-5U5kd7sNss1IvLYyeJx0eQy7gU869f1mYHkOwvyMa-H26R-hQ2H3Q6P1YM0_LCNRtaarwjFK85dpc--T26EqF8n0lRHQ6Pj-gIEUeZqJ2JMW9FBKq6jlpPw0l0fUaMmDQ8KvgtZhGlisyFQpXxFyT5z_YQudLFHvyjTrA2JLRW9kLab0aUw2Or3OUs_fqbyOEe2_uB3aJ8WLQSYvUO1je3nPkKSSOVCqJ-UE',
    assets: [
      {
        id: 'a1111111-0000-0000-0000-000000000008',
        analysis_id: 'f81d4fae-7dec-11d0-a765-00a0c91e6bf8',
        asset_type: 'image_before',
        storage_path:
          'https://images.unsplash.com/photo-1512813195386-6cf811ad3542?auto=format&fit=crop&w=1200&q=80',
        mime_type: 'image/jpeg',
        metadata: { label: 'Censo 2020', year: '2020' },
        created_at: '2020-08-20T09:15:00Z',
      },
      {
        id: 'a1111111-0000-0000-0000-000000000009',
        analysis_id: 'f81d4fae-7dec-11d0-a765-00a0c91e6bf8',
        asset_type: 'image_after',
        storage_path:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuDgnaRkCBiVWC19_E-5U5kd7sNss1IvLYyeJx0eQy7gU869f1mYHkOwvyMa-H26R-hQ2H3Q6P1YM0_LCNRtaarwjFK85dpc--T26EqF8n0lRHQ6Pj-gIEUeZqJ2JMW9FBKq6jlpPw0l0fUaMmDQ8KvgtZhGlisyFQpXxFyT5z_YQudLFHvyjTrA2JLRW9kLab0aUw2Or3OUs_fqbyOEe2_uB3aJ8WLQSYvUO1je3nPkKSSOVCqJ-UE',
        mime_type: 'image/jpeg',
        metadata: { label: 'Estimación 2026', year: '2026' },
        created_at: '2026-08-20T09:15:00Z',
      },
    ],
    technical_summary: {
      pdf_filename: 'Reporte_Demografia_CDMX.pdf',
      pdf_total_pages: 18,
      tags: ['Densidad Alta', 'Intermodalidad'],
      metrics: [
        { label: 'Densidad max', value: '16,400 hab/km²' },
        { label: 'Población flotante', value: '+35%' },
      ],
    },
  },
  {
    id: 'f81d4fae-7dec-11d0-a765-00a0c91e6bf9',
    slug: 'indice-de-vegetacion-bogota',
    project_slug: 'corredor-ecologico-metropolitano',
    title: 'Índice de Vegetación y Cobertura - Bogotá',
    description:
      'Monitoreo multitemporal del índice NDVI en los Cerros Orientales y la Sabana de Bogotá para identificar presiones urbanísticas sobre áreas protegidas.',
    city: 'Bogotá',
    quadrant: 'Cerros Orientales',
    category: 'medio_ambiente',
    created_at: '2026-08-18T18:00:00Z',
    updated_at: '2026-08-18T18:00:00Z',
    relative_time: 'Hace 2 semanas',
    thumbnail_url:
      'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=800&q=80',
    assets: [
      {
        id: 'a1111111-0000-0000-0000-000000000010',
        analysis_id: 'f81d4fae-7dec-11d0-a765-00a0c91e6bf9',
        asset_type: 'image_before',
        storage_path:
          'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=1200&q=80',
        mime_type: 'image/jpeg',
        metadata: { label: 'NDVI 2021', year: '2021' },
        created_at: '2021-08-18T18:00:00Z',
      },
      {
        id: 'a1111111-0000-0000-0000-000000000011',
        analysis_id: 'f81d4fae-7dec-11d0-a765-00a0c91e6bf9',
        asset_type: 'image_after',
        storage_path:
          'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=1200&q=80',
        mime_type: 'image/jpeg',
        metadata: { label: 'NDVI 2026', year: '2026' },
        created_at: '2026-08-18T18:00:00Z',
      },
    ],
  },
  {
    id: 'f81d4fae-7dec-11d0-a765-00a0c91e6bfa',
    slug: 'catastro-y-expansion-urbana-valencia',
    project_slug: 'poligono-industrial-norte',
    title: 'Catastro y Expansión Urbana - Valencia',
    description:
      'Análisis ortofotogramétrico de parcelas industriales y residenciales en la huerta sur de Valencia. Identificación de cambios morfológicos post-infraestructuras.',
    city: 'Valencia',
    quadrant: 'Sector Huerta Sur',
    category: 'catastro',
    created_at: '2026-08-15T08:00:00Z',
    updated_at: '2026-08-15T12:00:00Z',
    relative_time: 'Hace 3 semanas',
    thumbnail_url:
      'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&w=800&q=80',
    assets: [
      {
        id: 'a1111111-0000-0000-0000-000000000012',
        analysis_id: 'f81d4fae-7dec-11d0-a765-00a0c91e6bfa',
        asset_type: 'image_before',
        storage_path:
          'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&w=1200&q=80',
        mime_type: 'image/jpeg',
        metadata: { label: 'Parcelario 2018', year: '2018' },
        created_at: '2018-08-15T08:00:00Z',
      },
      {
        id: 'a1111111-0000-0000-0000-000000000013',
        analysis_id: 'f81d4fae-7dec-11d0-a765-00a0c91e6bfa',
        asset_type: 'image_after',
        storage_path:
          'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?auto=format&fit=crop&w=1200&q=80',
        mime_type: 'image/jpeg',
        metadata: { label: 'Parcelario 2026', year: '2026' },
        created_at: '2026-08-15T08:00:00Z',
      },
    ],
  },
  {
    id: 'f81d4fae-7dec-11d0-a765-00a0c91e6bfb',
    slug: 'red-de-micro-movilidad-buenos-aires',
    project_slug: 'red-vial-troncal-sur',
    title: 'Red de Micro-Movilidad y Ciclovías - Buenos Aires',
    description:
      'Mapeo de accesibilidad ciclista y puntos nodales de intermodalidad en Palermo, Recoleta y Microcentro con datos de sensores IoT.',
    city: 'Buenos Aires',
    quadrant: 'Eje Palermo-Recoleta',
    category: 'movilidad',
    created_at: '2026-08-12T11:20:00Z',
    updated_at: '2026-08-12T11:20:00Z',
    relative_time: 'Hace 3 semanas',
    thumbnail_url:
      'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?auto=format&fit=crop&w=800&q=80',
    assets: [
      {
        id: 'a1111111-0000-0000-0000-000000000014',
        analysis_id: 'f81d4fae-7dec-11d0-a765-00a0c91e6bfb',
        asset_type: 'image_before',
        storage_path:
          'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?auto=format&fit=crop&w=1200&q=80',
        mime_type: 'image/jpeg',
        metadata: { label: 'Trazado 2022', year: '2022' },
        created_at: '2022-08-12T11:20:00Z',
      },
      {
        id: 'a1111111-0000-0000-0000-000000000015',
        analysis_id: 'f81d4fae-7dec-11d0-a765-00a0c91e6bfb',
        asset_type: 'image_after',
        storage_path:
          'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1200&q=80',
        mime_type: 'image/jpeg',
        metadata: { label: 'Trazado 2026', year: '2026' },
        created_at: '2026-08-12T11:20:00Z',
      },
    ],
  },
  {
    id: 'f81d4fae-7dec-11d0-a765-00a0c91e6bfc',
    slug: 'vulnerabilidad-geologica-lima',
    project_slug: 'evaluacion-de-terreno-b-42',
    title: 'Vulnerabilidad Geológica y Sismo - Lima',
    description:
      'Modelado de respuesta de suelo y pendientes críticas en los distritos de Villa María del Triunfo y San Juan de Lurigancho.',
    city: 'Lima',
    quadrant: 'Cono Sur',
    category: 'topografia',
    created_at: '2026-08-08T15:00:00Z',
    updated_at: '2026-08-08T15:00:00Z',
    relative_time: 'Hace 4 semanas',
    thumbnail_url:
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
    assets: [],
  },
  {
    id: 'f81d4fae-7dec-11d0-a765-00a0c91e6bfd',
    slug: 'densidad-y-gentrificacion-barcelona',
    project_slug: 'poligono-industrial-norte',
    title: 'Densidad y Gentrificación - Barcelona',
    description:
      'Evolución del parque habitacional y concentración de licencias turísticas en Ciutat Vella y Eixample con cruce catastral 2020-2025.',
    city: 'Barcelona',
    quadrant: 'Ciutat Vella',
    category: 'demografia',
    created_at: '2026-08-02T09:40:00Z',
    updated_at: '2026-08-02T10:00:00Z',
    relative_time: 'Hace 1 mes',
    thumbnail_url:
      'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=800&q=80',
    assets: [],
  },
  {
    id: 'f81d4fae-7dec-11d0-a765-00a0c91e6bfe',
    slug: 'corredores-verdes-medellin',
    project_slug: 'corredor-ecologico-metropolitano',
    title: 'Corredores Verdes y Temperatura Urbana - Medellín',
    description:
      'Medición satelital de islas de calor superficiales (LST) antes y después de la implementación de corredores biológicos urbanos.',
    city: 'Medellín',
    quadrant: 'Valle de Aburrá',
    category: 'medio_ambiente',
    created_at: '2026-07-28T16:00:00Z',
    updated_at: '2026-07-28T16:00:00Z',
    relative_time: 'Hace 1 mes',
    thumbnail_url:
      'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80',
    assets: [],
  },
  {
    id: 'f81d4fae-7dec-11d0-a765-00a0c91e6bff',
    slug: 'levantamiento-catastral-sevilla',
    project_slug: 'poligono-industrial-norte',
    title: 'Levantamiento Catastral Ribereño - Sevilla',
    description:
      'Inspección ortofotográfica de márgenes del Guadalquivir para delimitación de dominio público hidráulico y zonas inundables.',
    city: 'Sevilla',
    quadrant: 'Ribera Sur',
    category: 'catastro',
    created_at: '2026-07-20T11:00:00Z',
    updated_at: '2026-07-20T11:00:00Z',
    relative_time: 'Hace 1 mes',
    thumbnail_url:
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    assets: [],
  },
  {
    id: 'f81d4fae-7dec-11d0-a765-00a0c91e6c00',
    slug: 'tiempos-transmilenio-bogota',
    project_slug: 'red-vial-troncal-sur',
    title: 'Tiempos de Desplazamiento Transmilenio - Bogotá',
    description:
      'Estudio de velocidad promedio de carriles exclusivos BRT en horas punta y análisis de transbordo en portales principales.',
    city: 'Bogotá',
    quadrant: 'Troncal Caracas',
    category: 'movilidad',
    created_at: '2026-07-15T08:15:00Z',
    updated_at: '2026-07-15T08:15:00Z',
    relative_time: 'Hace 2 meses',
    thumbnail_url:
      'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
    assets: [],
  },
  {
    id: 'f81d4fae-7dec-11d0-a765-00a0c91e6c01',
    slug: 'cuencas-hidrograficas-santiago',
    project_slug: 'evaluacion-de-terreno-b-42',
    title: 'Análisis de Cuencas Hidrográficas - Santiago',
    description:
      'Mapeo morfométrico de las microcuencas del Río Mapocho y cálculo de escorrentía superficial en episodios pluviométricos extremos.',
    city: 'Santiago',
    quadrant: 'Precordillera',
    category: 'topografia',
    created_at: '2026-07-10T14:00:00Z',
    updated_at: '2026-07-10T14:00:00Z',
    relative_time: 'Hace 2 meses',
    thumbnail_url:
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
    assets: [],
  },
  {
    id: 'f81d4fae-7dec-11d0-a765-00a0c91e6c02',
    slug: 'crecimiento-mancha-urbana-monterrey',
    project_slug: 'poligono-industrial-norte',
    title: 'Crecimiento de Mancha Urbana - Monterrey',
    description:
      'Cartografía comparativa de la expansión perimetral 2015-2025 sobre áreas de valor ambiental y serranías circundantes.',
    city: 'Monterrey',
    quadrant: 'Zona Poniente',
    category: 'catastro',
    created_at: '2026-06-25T10:00:00Z',
    updated_at: '2026-06-25T10:00:00Z',
    relative_time: 'Hace 2 meses',
    thumbnail_url:
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
    assets: [],
  },
  {
    id: 'f81d4fae-7dec-11d0-a765-00a0c91e6c03',
    slug: 'envejecimiento-demografico-madrid',
    project_slug: 'evaluacion-de-terreno-b-42',
    title: 'Envejecimiento Demográfico y Servicios - Madrid',
    description:
      'Índice de accesibilidad peatonal a centros de salud y farmacias para población mayor de 65 años en distritos periurbanos.',
    city: 'Madrid',
    quadrant: 'Distrito Latina',
    category: 'demografia',
    created_at: '2026-06-18T13:45:00Z',
    updated_at: '2026-06-18T13:45:00Z',
    relative_time: 'Hace 3 meses',
    thumbnail_url:
      'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80',
    assets: [],
  },
  {
    id: 'f81d4fae-7dec-11d0-a765-00a0c91e6c04',
    slug: 'calidad-del-aire-cdmx',
    project_slug: 'corredor-ecologico-metropolitano',
    title: 'Monitoreo de Calidad del Aire - CDMX',
    description:
      'Correlación entre concentraciones de PM2.5 y patrones de viento procedentes de la zona industrial norte del Valle de México.',
    city: 'CDMX',
    quadrant: 'Valle Norte',
    category: 'medio_ambiente',
    created_at: '2026-06-05T09:30:00Z',
    updated_at: '2026-06-05T09:30:00Z',
    relative_time: 'Hace 3 meses',
    thumbnail_url:
      'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
    assets: [],
  },
  {
    id: 'f81d4fae-7dec-11d0-a765-00a0c91e6c05',
    slug: 'aforos-peatonales-superilles-barcelona',
    project_slug: 'red-vial-troncal-sur',
    title: 'Aforos Peatonales en Superilles - Barcelona',
    description:
      'Evaluación de pacificación del tráfico rodado y aumento del espacio público activo en el distrito de Sant Antoni.',
    city: 'Barcelona',
    quadrant: 'Eixample Esquerra',
    category: 'movilidad',
    created_at: '2026-05-30T17:00:00Z',
    updated_at: '2026-05-30T17:00:00Z',
    relative_time: 'Hace 3 meses',
    thumbnail_url:
      'https://images.unsplash.com/photo-1509824227185-9c5a01ceba0d?auto=format&fit=crop&w=800&q=80',
    assets: [],
  },
];
