import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

if (!HTMLCanvasElement.prototype.getContext) {
  HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
    canvas: document.createElement('canvas'),
    createLinearGradient: () => ({ addColorStop: () => {} }),
    fillRect: () => {},
    clearRect: () => {},
    drawImage: () => {},
    getImageData: () => ({ data: [] }),
    putImageData: () => {},
    createImageData: () => [],
    setTransform: () => {},
    resetTransform: () => {},
    scale: () => {},
    rotate: () => {},
    translate: () => {},
    transform: () => {},
    save: () => {},
    restore: () => {},
    beginPath: () => {},
    moveTo: () => {},
    lineTo: () => {},
    closePath: () => {},
    stroke: () => {},
    strokeRect: () => {},
    strokeText: () => {},
    fill: () => {},
    fillText: () => {},
    measureText: () => ({ width: 0 }),
  }));
}
