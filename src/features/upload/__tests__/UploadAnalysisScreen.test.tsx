import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { UploadAnalysisScreen } from '../UploadAnalysisScreen';
import { analysesService } from '../../../services/analyses.service';
import { categoriesService } from '../../../services/categories.service';
import * as useAuthHook from '../../auth/hooks/useAuth';

vi.mock('../../../services/analyses.service');
vi.mock('../../../services/categories.service');
vi.mock('../../auth/hooks/useAuth');

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('UploadAnalysisScreen (Validación de Formularios e Imágenes)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(useAuthHook, 'useAuth').mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: {
        id: 'usr-admin',
        firstname: 'Admin',
        lastname: '',
        email: 'admin@test.com',
        role: 'admin',
        created_at: '',
        updated_at: '',
      },
      session: {} as never,
      role: 'admin',
      isAdmin: true,
      isViewer: false,
      login: vi.fn(),
      loginWithMicrosoft: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refreshProfile: vi.fn(),
    });

    vi.mocked(categoriesService.getCategories).mockResolvedValue([
      { name: 'Catastro', slug: 'catastro', scope: 'analysis' },
    ]);
  });

  it('debe bloquear el envío y mostrar error si no se ha seleccionado ninguna imagen', async () => {
    render(
      <MemoryRouter>
        <UploadAnalysisScreen />
      </MemoryRouter>
    );

    expect(await screen.findByDisplayValue('Catastro')).toBeInTheDocument();

    const user = userEvent.setup();

    const titleInput = screen.getByLabelText(/Título del Análisis/i);
    const cityInput = screen.getByLabelText(/Ciudad \/ Región/i);
    const descInput = screen.getByLabelText(/Descripción Técnica/i);

    await act(async () => {
      await user.type(titleInput, 'Estudio Territorial 2024');
      await user.type(cityInput, 'Quito, Ecuador');
      await user.type(descInput, 'Metodología satelital multiespectral aplicada.');
    });

    const submitBtn = screen.getByRole('button', { name: /Publicar Análisis/i });
    await act(async () => {
      await user.click(submitBtn);
    });

    expect(analysesService.createAnalysis).not.toHaveBeenCalled();
    expect(
      screen.getByText(
        'Debes subir al menos una imagen ("Imagen Histórica" o "Imagen Actual") para publicar el análisis.'
      )
    ).toBeInTheDocument();
  });

  it('debe permitir la publicación exitosa cuando se sube al menos una imagen', async () => {
    vi.mocked(analysesService.createAnalysis).mockResolvedValueOnce({
      id: 'new-ana-1',
      slug: 'estudio-territorial-2024',
      title: 'Estudio Territorial 2024',
      description: 'Metodología satelital.',
      city: 'Quito, Ecuador',
      category_slug: 'catastro',
      project_id: 'proj-1',
      project_slug: 'proyecto-quito',
      created_at: '',
      updated_at: '',
    });

    const { container } = render(
      <MemoryRouter>
        <UploadAnalysisScreen />
      </MemoryRouter>
    );

    expect(await screen.findByDisplayValue('Catastro')).toBeInTheDocument();

    const user = userEvent.setup();

    await act(async () => {
      await user.type(screen.getByLabelText(/Título del Análisis/i), 'Estudio Territorial 2024');
      await user.type(screen.getByLabelText(/Ciudad \/ Región/i), 'Quito, Ecuador');
      await user.type(screen.getByLabelText(/Descripción Técnica/i), 'Metodología satelital multiespectral aplicada.');
    });

    const fileInputs = container.querySelectorAll('input[type="file"]') as NodeListOf<HTMLInputElement>;
    expect(fileInputs.length).toBeGreaterThan(0);

    const fakeImageFile = new File(['fake-content'], 'satelite_historico.png', {
      type: 'image/png',
    });

    await act(async () => {
      await user.upload(fileInputs[0], fakeImageFile);
    });

    const submitBtn = screen.getByRole('button', { name: /Publicar Análisis/i });
    await act(async () => {
      await user.click(submitBtn);
    });

    expect(analysesService.createAnalysis).toHaveBeenCalledTimes(1);
    expect(
      screen.getByText(/¡Análisis "Estudio Territorial 2024" publicado con éxito!/i)
    ).toBeInTheDocument();
  });
});
