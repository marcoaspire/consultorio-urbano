import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SingleImageViewer } from '../components/SingleImageViewer';

vi.mock('react-zoom-pan-pinch', () => ({
  TransformWrapper: ({
    children,
  }: {
    children: (args: {
      zoomIn: () => void;
      zoomOut: () => void;
      resetTransform: () => void;
    }) => React.ReactNode;
  }) => (
    <div data-testid="mock-transform-wrapper">
      {children({
        zoomIn: vi.fn(),
        zoomOut: vi.fn(),
        resetTransform: vi.fn(),
      })}
    </div>
  ),
  TransformComponent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="mock-transform-component">{children}</div>
  ),
}));

describe('SingleImageViewer (Modo Inspección / Zoom Individual)', () => {
  it('debe renderizar la imagen individual con object-contain y src correcto', () => {
    render(
      <SingleImageViewer
        src="https://example.com/satelite-2024.png"
        alt="Ortomosaico 2024"
        label="Inspección 2024"
      />
    );

    const img = screen.getByRole('img', { name: 'Ortomosaico 2024' });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://example.com/satelite-2024.png');
    expect(img).toHaveClass('object-contain');
  });

  it('debe renderizar el badge de etiqueta cuando se provee label', () => {
    render(
      <SingleImageViewer
        src="https://example.com/satelite-2024.png"
        label="Inspección Satelital Detallada"
      />
    );

    expect(screen.getByText('Inspección Satelital Detallada')).toBeInTheDocument();
  });

  it('debe renderizar los botones de control de zoom [+] y [-] y el botón de reset', () => {
    render(
      <SingleImageViewer
        src="https://example.com/satelite-2024.png"
      />
    );

    expect(screen.getByRole('button', { name: 'Acercar imagen' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Alejar imagen' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Restablecer tamaño original' })).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('NO debe renderizar divisores de comparativa antes/después ni elementos slider', () => {
    render(
      <SingleImageViewer
        src="https://example.com/satelite-2024.png"
      />
    );

    expect(screen.queryByText('Histórico (Previa)')).not.toBeInTheDocument();
    expect(screen.queryByText('Actual (Reciente)')).not.toBeInTheDocument();
    expect(screen.queryByRole('slider')).not.toBeInTheDocument();
  });
});
