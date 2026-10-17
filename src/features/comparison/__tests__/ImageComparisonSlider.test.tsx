import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ImageComparisonSlider } from '../components/ImageComparisonSlider';

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

describe('ImageComparisonSlider (Modo 2 Imágenes vs Modo 1 Imagen)', () => {
  it('debe renderizar el comparador interactivo con etiquetas Antes y Después cuando hay 2 imágenes', () => {
    render(
      <ImageComparisonSlider
        beforeImage="https://example.com/2021.png"
        afterImage="https://example.com/2023.png"
        beforeLabel="2021 Histórico"
        afterLabel="2023 Actual"
      />
    );

    expect(screen.getByText('2021 Histórico')).toBeInTheDocument();
    expect(screen.getByText('2023 Actual')).toBeInTheDocument();

    const images = screen.getAllByRole('img');
    expect(images.length).toBe(2);
    expect(images[0]).toHaveAttribute('src', 'https://example.com/2023.png');
    expect(images[1]).toHaveAttribute('src', 'https://example.com/2021.png');
  });

  it('debe conmutar automáticamente a Modo Inspección (1 Imagen) si solo se pasa una imagen', () => {
    render(
      <ImageComparisonSlider
        beforeImage="https://example.com/solitaria.png"
        afterImage={null}
      />
    );

    const images = screen.getAllByRole('img');
    expect(images.length).toBe(1);
    expect(images[0]).toHaveAttribute('src', 'https://example.com/solitaria.png');
    expect(screen.queryByText('Actual (Reciente)')).not.toBeInTheDocument();
  });

  it('debe mostrar estado vacío cuando no se proporciona ninguna imagen', () => {
    render(
      <ImageComparisonSlider
        beforeImage={null}
        afterImage={null}
        singleImage={null}
      />
    );

    expect(screen.getByText('Sin imagen satelital disponible')).toBeInTheDocument();
  });
});
