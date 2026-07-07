import { render, screen } from '@testing-library/react';
import App from './App';

beforeAll(() => {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
  });
  window.IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  window.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  // jsdom has no canvas: 2D contexts become no-op proxies, WebGL is unavailable.
  HTMLCanvasElement.prototype.getContext = function getContext(type) {
    if (type !== '2d') return null;
    return new Proxy(
      {},
      {
        get: (target, prop) => {
          if (prop === 'createLinearGradient') return () => ({ addColorStop: () => {} });
          return () => {};
        },
        set: () => true,
      }
    );
  };
});

test('renders the descent', () => {
  render(<App />);
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Shintaro/i);
  expect(screen.getAllByText(/Triton-3/i).length).toBeGreaterThan(0);
});
