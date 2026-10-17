import { describe, it, expect, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProjectCard } from '../components/ProjectCard';
import type { Project } from '../../../types/project';

const mockProject: Project = {
  id: 'proj-1',
  slug: 'parque-central',
  name: 'Parque Central',
  description: 'Estudio de vegetación y suelo.',
  location: 'Santiago, Chile',
  category_slug: 'medio-ambiente',
  thumbnail_url: 'https://example.com/thumb.jpg',
  analyses_count: 3,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

describe('ProjectCard', () => {
  it('debe renderizar el título, ubicación y categoría del proyecto', () => {
    render(
      <ProjectCard
        project={mockProject}
        onSelect={vi.fn()}
      />
    );

    expect(screen.getByText('Parque Central')).toBeInTheDocument();
    expect(screen.getByText('Santiago, Chile')).toBeInTheDocument();
    expect(screen.getByText('3 análisis')).toBeInTheDocument();
  });

  it('debe renderizar los botones de editar y eliminar cuando se pasan callbacks (Modo Admin)', async () => {
    const onEditMock = vi.fn();
    const onDeleteMock = vi.fn();

    render(
      <ProjectCard
        project={mockProject}
        onSelect={vi.fn()}
        onEdit={onEditMock}
        onDelete={onDeleteMock}
      />
    );

    const editBtn = screen.getByTitle('Editar proyecto');
    const deleteBtn = screen.getByTitle('Eliminar proyecto (Soft Delete)');

    expect(editBtn).toBeInTheDocument();
    expect(deleteBtn).toBeInTheDocument();

    const user = userEvent.setup();
    await act(async () => {
      await user.click(editBtn);
    });
    expect(onEditMock).toHaveBeenCalledWith(mockProject);

    await act(async () => {
      await user.click(deleteBtn);
    });
    expect(onDeleteMock).toHaveBeenCalledWith(mockProject);
  });

  it('debe OCULTAR totalmente los botones de editar y eliminar para un usuario lector o anónimo (onEdit y onDelete undefined)', () => {
    render(
      <ProjectCard
        project={mockProject}
        onSelect={vi.fn()}
        onEdit={undefined}
        onDelete={undefined}
      />
    );

    expect(screen.queryByTitle('Editar proyecto')).not.toBeInTheDocument();
    expect(screen.queryByTitle('Eliminar proyecto (Soft Delete)')).not.toBeInTheDocument();
  });

  it('debe invocar onSelect al hacer clic en la tarjeta', async () => {
    const onSelectMock = vi.fn();

    render(
      <ProjectCard
        project={mockProject}
        onSelect={onSelectMock}
      />
    );

    const user = userEvent.setup();
    await act(async () => {
      await user.click(screen.getByText('Parque Central'));
    });

    expect(onSelectMock).toHaveBeenCalledWith('parque-central');
  });
});
