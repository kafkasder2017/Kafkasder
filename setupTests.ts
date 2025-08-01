import '@testing-library/jest-dom';

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
    this.root = null;
    this.rootMargin = '';
    this.thresholds = [];
  }

  root: Element | null;
  rootMargin: string;
  thresholds: number[];

  disconnect() {}
  observe(element: Element) {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
  unobserve(element: Element) {}
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Note: window.location mocking removed due to JSDOM restrictions
// Individual tests can mock location if needed
