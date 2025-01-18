// Mock fetch globally
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({
      choices: [{
        message: {
          content: JSON.stringify({
            isPhishing: false,
            confidenceScore: 0.95,
            riskLevel: 'low'
          })
        }
      }]
    })
  })
);

// Mock MutationObserver
global.MutationObserver = class {
  constructor(callback) {
    this.callback = callback;
  }
  disconnect() {}
  observe(element, initObject) {
    // Simulate an immediate mutation
    this.callback([{
      type: 'childList',
      target: element
    }]);
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
  replace: jest.fn()
};

// Mock chrome API
global.chrome = {
  runtime: {
    onMessage: {
      addListener: jest.fn((callback) => {
        global.chrome.runtime.onMessage.callback = callback;
        return callback;
      })
    }
  }
}; 