// Mock fetch globally
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () =>
      Promise.resolve({
        choices: [
          {
            message: {
              content: JSON.stringify({
                isPhishing: false,
                confidenceScore: 0.95,
                riskLevel: 'low',
              }),
            },
          },
        ],
      }),
  })
);

// Mock MutationObserver
global.MutationObserver = class {
  constructor(callback) {
    this.callback = callback;
  }
  disconnect() {}
  observe(element, _initObject) {
    // Simulate an immediate mutation
    this.callback([
      {
        type: 'childList',
        target: element,
      },
    ]);
  }
};

// Add TextEncoder/TextDecoder
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock timing functions
jest.useFakeTimers();

// Mock window.location before any tests run
delete window.location;
window.location = {
  hostname: '',
  href: 'http://example.com',
  assign: jest.fn(),
  reload: jest.fn(),
  replace: jest.fn(),
};

Object.defineProperty(window.location, 'hostname', {
  writable: true,
  value: '',
});

// Mock Chrome API
global.chrome = {
  runtime: {
    onMessage: {
      addListener: jest.fn((listener) => {
        chrome.runtime.onMessage.callback = listener;
      }),
      callback: null,
    },
    sendMessage: jest.fn((_message, _callback) => {
      // Mock implementation
    }),
  },
};

// Mock WebLLM
jest.mock('@mlc-ai/web-llm', () => ({
  CreateMLCEngine: jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn(),
      },
    },
  })),
}));

// Mock DOM methods
global.document.querySelector = jest.fn();
global.document.createElement = jest.fn();
