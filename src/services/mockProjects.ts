import type { Project } from '../types/project';

/**
 * Datos mock de proyectos / terrenos (Nivel 1: Portafolio Global).
 * Almacenados en memoria de la sesión para permitir creación reactiva
 * sin requerir backend activo.
 */
export const MOCK_PROJECTS: Project[] = [
  {
    id: 'p1111111-0000-0000-0000-000000000001',
    slug: 'evaluacion-de-terreno-b-42',
    name: 'Evaluación de Terreno B-42',
    location: 'Santiago, Chile',
    category: 'topografia',
    description:
      'Mapeo de elevación de alta precisión y análisis de estabilidad de laderas en el piedemonte oriental mediante vuelos LIDAR periódicos.',
    thumbnail_url:
      'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=800&q=80',
    analyses_count: 3,
    created_at: '2023-10-24T14:30:00Z',
    relative_time: '24 Oct 2023',
  },
  {
    id: 'p1111111-0000-0000-0000-000000000002',
    slug: 'poligono-industrial-norte',
    name: 'Polígono Industrial Norte',
    location: 'Antofagasta, Chile',
    category: 'catastro',
    description:
      'Levantamiento aerofotogramétrico y fiscalización de límites parcelarios en zona logística y franca portuaria.',
    thumbnail_url:
      'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=800&q=80',
    analyses_count: 3,
    created_at: '2023-11-12T09:15:00Z',
    relative_time: '12 Nov 2023',
  },
  {
    id: 'p1111111-0000-0000-0000-000000000003',
    slug: 'corredor-ecologico-metropolitano',
    name: 'Corredor Ecológico Metropolitano',
    location: 'Medellín, Colombia',
    category: 'medio_ambiente',
    description:
      'Seguimiento multitemporal del dosel arbóreo y conectividad biológica urbana mediante sensores multiespectrales Sentinel y Planet.',
    thumbnail_url:
      'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80',
    analyses_count: 3,
    created_at: '2024-01-18T16:20:00Z',
    relative_time: '18 Ene 2024',
  },
  {
    id: 'p1111111-0000-0000-0000-000000000004',
    slug: 'red-vial-troncal-sur',
    name: 'Red Vial Troncal Sur',
    location: 'Bogotá, Colombia',
    category: 'movilidad',
    description:
      'Monitoreo satelital de aforos de congestión, dinámica vehicular en intersecciones críticas y evolución de pavimentos.',
    thumbnail_url:
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
    analyses_count: 3,
    created_at: '2024-02-05T11:00:00Z',
    relative_time: '05 Feb 2024',
  },
];
