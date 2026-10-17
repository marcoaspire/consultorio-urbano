import { describe, it, expect, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AnalysisCard } from '../components/AnalysisCard';
import type { Analysis } from '../../../types/analysis';

const mockAnalysis: Analysis = {
  id: 'ana-1',
  slug: 'analisis-ndvi-q3',
  title: 'Índice de Vegetación NDVI Q3',
  description: 'Análisis multitemporal satelital.',
  city: 'Madrid, España',
  category_slug: 'medio-ambiente',
  project_id: 'proj-1',
  relative_time: 'Hace 2 días',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  assets: [
    {
      id: 'ast-1',
      analysis_id: 'ana-1',
      asset_type: 'image_before',
      storage_path: 'before.jpg',
      mime_type: 'image/jpeg',
      created_at: '',
    },
    {
      id: 'ast-2',
      analysis_id: 'ana-1',
      asset_type: 'image_after',
      storage_path: 'after.jpg',
      mime_type: 'image/jpeg',
      created_at: '',
    },
  ],
};

describe('AnalysisCard', () => {
  it('debe renderizar la información principal del análisis', () => {
    render(<AnalysisCard analysis={mockAnalysis} onClick={vi.fn()} />);

    expect(screen.getByText('Índice de Vegetación NDVI Q3')).toBeInTheDocument();
    expect(screen.getByText('Madrid, España')).toBeInTheDocument();
    expect(screen.getByText('Hace 2 días')).toBeInTheDocument();
    expect(screen.getByText('2 Tomas')).toBeInTheDocument();
  });

  it('debe mostrar los botones de editar y eliminar para administradores (onEdit y onDelete presentes)', async () => {
    const onEditMock = vi.fn();
    const onDeleteMock = vi.fn();

    render(
      <AnalysisCard
        analysis={mockAnalysis}
        onClick={vi.fn()}
        onEdit={onEditMock}
        onDelete={onDeleteMock}
      />
    );

    const editBtn = screen.getByTitle('Editar análisis');
    const deleteBtn = screen.getByTitle('Eliminar análisis (Soft Delete)');

    expect(editBtn).toBeInTheDocument();
    expect(deleteBtn).toBeInTheDocument();

    const user = userEvent.setup();
    await act(async () => {
      await user.click(editBtn);
    });
    expect(onEditMock).toHaveBeenCalledWith(mockAnalysis);

    await act(async () => {
      await user.click(deleteBtn);
    });
    expect(onDeleteMock).toHaveBeenCalledWith(mockAnalysis);
  });

  it('debe OCULTAR los botones de acción para usuarios lectores o anónimos (onEdit y onDelete ausentes)', () => {
    render(
      <AnalysisCard
        analysis={mockAnalysis}
        onClick={vi.fn()}
        onEdit={undefined}
        onDelete={undefined}
      />
    );

    expect(screen.queryByTitle('Editar análisis')).not.toBeInTheDocument();
    expect(screen.queryByTitle('Eliminar análisis (Soft Delete)')).not.toBeInTheDocument();
  });

  it('debe disparar onClick al pulsar sobre la tarjeta', async () => {
    const onClickMock = vi.fn();

    render(
      <AnalysisCard
        analysis={mockAnalysis}
        onClick={onClickMock}
      />
    );

    const user = userEvent.setup();
    await act(async () => {
      await user.click(screen.getByText('Índice de Vegetación NDVI Q3'));
    });

    expect(onClickMock).toHaveBeenCalledWith(mockAnalysis);
  });
});
