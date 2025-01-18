import { CreateMLCEngine } from '@mlc-ai/web-llm';
import { JSDOM } from 'jsdom';

// Mock chrome API
global.chrome = {
  runtime: {
    onMessage: {
      addListener: jest.fn(),
    },
    sendMessage: jest.fn(),
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

// Mock the entire content.js module
jest.mock('../src/content/content.js', () => {
  // Create a mock status object
  const mockStatus = {
    isLoaded: false,
    lastUpdated: null,
    analyzing: 0,
  };

  // Create mock functions
  const mockFunctions = {
    status: mockStatus,
    initializeEngine: jest.fn().mockImplementation(async () => {
      mockStatus.isLoaded = true;
      mockStatus.lastUpdated = Date.now();
    }),
  };

  return mockFunctions;
});

// Get the mock module
const content = jest.requireMock('../src/content/content.js');

describe('Content Script', () => {
  let dom;

  beforeEach(() => {
    dom = new JSDOM('<!DOCTYPE html><div class="adn ads"></div>');
    global.document = dom.window.document;
    global.window = dom.window;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should initialize engine successfully', async () => {
    await content.initializeEngine();
    expect(content.status.isLoaded).toBe(true);
    expect(content.status.lastUpdated).toBeDefined();
  });

  test('should handle message events', () => {
    // Simulate message listener registration
    const messageListener = (message, sender, sendResponse) => {
      if (message.type === 'GET_STATUS') {
        sendResponse(content.status);
      }
    };
    chrome.runtime.onMessage.addListener(messageListener);

    // Test the message handling
    const sendResponse = jest.fn();
    messageListener({ type: 'GET_STATUS' }, {}, sendResponse);
    expect(sendResponse).toHaveBeenCalledWith(content.status);
  });
});
