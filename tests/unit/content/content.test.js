import { initializeEngine, analyzeEmail, status } from '../../../src/content/content';
import { CreateMLCEngine } from "@mlc-ai/web-llm";

jest.mock('@mlc-ai/web-llm');

describe('Content Script Core', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    status.isLoaded = false;
    status.lastUpdated = null;
    status.analyzing = 0;
    global.fetch = jest.fn();
  });

  describe('Engine Initialization', () => {
    test('should initialize OpenAI provider', async () => {
      await initializeEngine();
      expect(status.isLoaded).toBe(true);
      expect(status.lastUpdated).toBeTruthy();
    });

    test('should handle WebLLM initialization', async () => {
      CreateMLCEngine.mockResolvedValue({
        chat: {
          completions: {
            create: jest.fn()
          }
        }
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
      });
    });

    test('should analyze email content', async () => {
      const emailData = {
        subject: 'Test Subject',
        body: 'Test Body',
        attachments: []
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
        attachments: []
      };

      const result = await analyzeEmail(emailData);
      expect(result.riskLevel).toBe('unknown');
      expect(result.confidenceScore).toBe(0);
    });
  });

  describe('Message Handling', () => {
    let messageHandler;
    let sendResponse;

    beforeEach(() => {
      sendResponse = jest.fn();
      messageHandler = chrome.runtime.onMessage.callback;
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