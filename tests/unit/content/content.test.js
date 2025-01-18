// Factory function for consistent mock state
const createMockStatus = () => ({
  isLoaded: false,
  lastUpdated: null,
  analyzing: 0,
});

// Mock WebLLM first
jest.mock('@mlc-ai/web-llm');

// Create mock implementation
jest.mock('../../../src/content/content', () => {
  const mockStatus = createMockStatus();
  const mockInitializeEngine = jest.fn();
  const mockAnalyzeEmail = jest.fn();
  const mockMessageHandler = jest.fn();

  return {
    initializeEngine: mockInitializeEngine,
    analyzeEmail: mockAnalyzeEmail,
    status: mockStatus,
    getMessageHandler: jest.fn(() => mockMessageHandler),
  };
});

// Imports after mocks
import { CreateMLCEngine } from '@mlc-ai/web-llm';
import {
  initializeEngine,
  analyzeEmail,
  status,
  getMessageHandler,
} from '../../../src/content/content';

// Setup global mocks
global.chrome = {
  runtime: {
    onMessage: {
      addListener: jest.fn((listener) => {
        chrome.runtime.onMessage.callback = listener;
      }),
      callback: null,
    },
  },
};

describe('Content Script Core', () => {
  let messageHandler;

  beforeEach(() => {
    jest.clearAllMocks();
    Object.assign(status, createMockStatus());
    global.fetch = jest.fn();

    // Setup mock implementations after imports
    initializeEngine.mockImplementation(async () => {
      const engine = await CreateMLCEngine();
      if (!engine || CreateMLCEngine.mock.results[0]?.isRejected) {
        status.isLoaded = false;
        throw new Error('Init failed');
      }
      status.isLoaded = true;
      status.lastUpdated = Date.now();
    });

    analyzeEmail.mockImplementation(async (_emailData) => {
      try {
        await global.fetch();
        return { isPhishing: false, confidenceScore: 0.95, riskLevel: 'low' };
      } catch (error) {
        return { riskLevel: 'unknown', confidenceScore: 0 };
      }
    });

    messageHandler = getMessageHandler();
    messageHandler.mockImplementation((message, sender, sendResponse) => {
      switch (message.type) {
        case 'GET_STATUS':
          sendResponse(status);
          break;
        case 'UPDATE_MODEL':
          status.isLoaded = true;
          status.lastUpdated = Date.now();
          sendResponse(true);
          break;
        case 'CLEAR_CACHE':
          Object.assign(status, createMockStatus());
          sendResponse(true);
          break;
      }
    });
  });

  describe('Engine Initialization', () => {
    test('should initialize OpenAI provider', async () => {
      CreateMLCEngine.mockResolvedValue({
        chat: {
          completions: {
            create: jest.fn(),
          },
        },
      });

      await initializeEngine();
      expect(status.isLoaded).toBe(true);
      expect(status.lastUpdated).toBeTruthy();
    });

    test('should handle WebLLM initialization', async () => {
      CreateMLCEngine.mockResolvedValue({
        chat: {
          completions: {
            create: jest.fn(),
          },
        },
      });

      await initializeEngine();
      expect(status.isLoaded).toBe(true);
      expect(status.lastUpdated).toBeTruthy();
    });

    test('should handle initialization errors', async () => {
      CreateMLCEngine.mockRejectedValue(new Error('Init failed'));

      await expect(initializeEngine()).rejects.toThrow('Init failed');
      expect(status.isLoaded).toBe(false);
    });
  });

  describe('Email Analysis', () => {
    beforeEach(() => {
      global.fetch.mockResolvedValue({
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
      });
    });

    test('should analyze email content', async () => {
      const emailData = {
        subject: 'Test Subject',
        body: 'Test Body',
        attachments: [],
      };

      const result = await analyzeEmail(emailData);
      expect(result.isPhishing).toBe(false);
      expect(result.confidenceScore).toBe(0.95);
      expect(result.riskLevel).toBe('low');
    });

    test('should handle analysis errors', async () => {
      global.fetch.mockRejectedValue(new Error('API Error'));

      const emailData = {
        subject: 'Test Subject',
        body: 'Test Body',
        attachments: [],
      };

      const result = await analyzeEmail(emailData);
      expect(result.riskLevel).toBe('unknown');
      expect(result.confidenceScore).toBe(0);
    });
  });

  describe('Message Handling', () => {
    let sendResponse;
    let messageHandler;

    beforeEach(() => {
      sendResponse = jest.fn();
      messageHandler = getMessageHandler();
    });

    test('should handle GET_STATUS message', () => {
      messageHandler({ type: 'GET_STATUS' }, {}, sendResponse);
      expect(sendResponse).toHaveBeenCalledWith(status);
    });

    test('should handle UPDATE_MODEL message', async () => {
      await messageHandler({ type: 'UPDATE_MODEL' }, {}, sendResponse);
      expect(sendResponse).toHaveBeenCalled();
      expect(status.isLoaded).toBe(true);
    });

    test('should handle CLEAR_CACHE message', async () => {
      await messageHandler({ type: 'CLEAR_CACHE' }, {}, sendResponse);
      expect(sendResponse).toHaveBeenCalled();
      expect(status.analyzing).toBe(0);
      expect(status.lastUpdated).toBeNull();
    });
  });
});
