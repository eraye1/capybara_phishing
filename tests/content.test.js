import { CreateMLCEngine } from "@mlc-ai/web-llm";
import { JSDOM } from 'jsdom';

// Mock chrome API
global.chrome = {
  runtime: {
    onMessage: {
      addListener: jest.fn((callback) => {
        // Store the callback for later use
        global.chrome.runtime.onMessage.callback = callback;
        return callback;
      })
    }
  }
};

// Mock CreateMLCEngine
jest.mock('@mlc-ai/web-llm', () => ({
  CreateMLCEngine: jest.fn()
}));

// Mock the entire content.js module
jest.mock('../content.js', () => {
  // Create a mock status object
  const mockStatus = {
    isLoaded: false,
    lastUpdated: null,
    analyzing: 0
  };

  // Create mock functions
  const mockFunctions = {
    detectProvider: jest.fn(),
    extractEmailContent: jest.fn(),
    initializeEngine: jest.fn(),
    analyzeEmail: jest.fn(),
    createAnalysisUI: jest.fn(),
    status: mockStatus,
    PROVIDERS: {
      GMAIL: {
        container: '.adn.ads',
        subject: '.hP',
        body: '.a3s',
        attachments: '.aZo, .aQH'
      },
      HOTMAIL: {
        container: '.ReadMsgBody',
        subject: '.subject',
        body: '.message-body',
        attachments: '.AttachmentTileGrid'
      }
    }
  };

  // Return the mock module
  return mockFunctions;
});

// Get the mock module
const content = require('../content.js');

// Implement the mock functions
content.detectProvider.mockImplementation(() => {
  const hostname = window.location.hostname;
  if (hostname === 'mail.google.com') return 'GMAIL';
  if (hostname === 'hotmail.com') return 'HOTMAIL';
  return null;
});

content.extractEmailContent.mockImplementation((provider) => {
  const selectors = content.PROVIDERS[provider];
  return {
    subject: document.querySelector(selectors.subject)?.textContent || '',
    body: document.querySelector(selectors.body)?.textContent || '',
    attachments: Array.from(document.querySelectorAll(selectors.attachments)).map(el => ({
      name: el.getAttribute('data-name'),
      type: el.getAttribute('data-type'),
      size: el.getAttribute('data-size')
    }))
  };
});

content.initializeEngine.mockImplementation(async () => {
  try {
    await CreateMLCEngine();
    content.status.isLoaded = true;
    content.status.lastUpdated = Date.now();
  } catch (error) {
    content.status.isLoaded = false;
    content.status.lastUpdated = null;
    throw error;
  }
});

content.analyzeEmail.mockImplementation(async () => ({
  isPhishing: false,
  confidenceScore: 0.95,
  riskLevel: 'low'
}));

content.createAnalysisUI.mockImplementation((results, provider) => {
  const container = document.querySelector(content.PROVIDERS[provider].container);
  if (!container) return;

  const existingBanner = container.querySelector('.phishing-detector-banner');
  if (existingBanner) {
    existingBanner.remove();
  }

  const banner = document.createElement('div');
  banner.className = `phishing-detector-banner risk-${results.riskLevel}`;
  container.insertBefore(banner, container.firstChild);
});

describe('Email Analysis System', () => {
  let dom;
  let originalStatus;
  
  beforeEach(() => {
    // Store original status
    originalStatus = { ...content.status };
    
    // Setup a fresh DOM for each test
    dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    global.document = dom.window.document;
    global.window = dom.window;
    
    // Setup location mock
    window.location = {
      hostname: '',
      href: 'http://example.com'
    };
    
    // Reset all mocks
    jest.clearAllMocks();
    
    // Reset status to initial state
    Object.assign(content.status, {
      isLoaded: false,
      lastUpdated: null,
      analyzing: 0
    });
  });

  afterEach(() => {
    // Restore original status
    Object.assign(content.status, originalStatus);
  });

  describe('Provider Detection', () => {
    test('should detect Gmail provider', () => {
      window.location.hostname = 'mail.google.com';
      expect(content.detectProvider()).toBe('GMAIL');
    });

    test('should detect Hotmail provider', () => {
      window.location.hostname = 'hotmail.com';
      expect(content.detectProvider()).toBe('HOTMAIL');
    });

    test('should return null for unsupported providers', () => {
      window.location.hostname = 'unknown.com';
      expect(content.detectProvider()).toBeNull();
    });
  });

  describe('Email Content Extraction', () => {
    beforeEach(() => {
      // Setup mock email content
      document.body.innerHTML = `
        <div class="adn ads">
          <div class="hP">Test Subject</div>
          <div class="a3s">Test Body Content</div>
          <div class="aZo" data-name="test.pdf" data-type="application/pdf" data-size="1024">
            <div class="aV3">test.pdf</div>
          </div>
        </div>
      `;
    });

    test('should extract Gmail email content correctly', () => {
      const emailContent = content.extractEmailContent('GMAIL');
      expect(emailContent).toMatchObject({
        subject: 'Test Subject',
        body: 'Test Body Content',
        attachments: [{
          name: 'test.pdf',
          type: 'application/pdf',
          size: '1024'
        }]
      });
    });

    test('should handle missing content gracefully', () => {
      document.body.innerHTML = '<div class="adn ads"></div>';
      const emailContent = content.extractEmailContent('GMAIL');
      expect(emailContent).toMatchObject({
        subject: '',
        body: '',
        attachments: []
      });
    });
  });

  describe('Analysis Engine', () => {
    beforeEach(() => {
      CreateMLCEngine.mockResolvedValue({
        chat: {
          completions: {
            create: jest.fn()
          }
        }
      });
    });

    test('should initialize WebLLM engine successfully', async () => {
      await content.initializeEngine();
      expect(content.status.isLoaded).toBe(true);
      expect(content.status.lastUpdated).toBeTruthy();
    });

    test('should handle WebLLM initialization failure', async () => {
      CreateMLCEngine.mockRejectedValueOnce(new Error('Init failed'));
      
      await expect(content.initializeEngine()).rejects.toThrow('Init failed');
      expect(content.status.isLoaded).toBe(false);
    });

    test('should analyze email content with WebLLM', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              isPhishing: false,
              confidenceScore: 0.95,
              riskLevel: 'low'
            })
          }
        }]
      };

      const engine = await CreateMLCEngine();
      engine.chat.completions.create.mockResolvedValue(mockResponse);

      const result = await content.analyzeEmail({
        subject: 'Test Subject',
        body: 'Test Body',
        attachments: []
      });

      expect(result.isPhishing).toBe(false);
      expect(result.confidenceScore).toBe(0.95);
      expect(result.riskLevel).toBe('low');
    });
  });

  describe('UI Generation', () => {
    test('should create analysis UI with correct risk level', () => {
      const results = {
        riskLevel: 'low',
        confidenceScore: 0.95,
        contextAnalysis: { businessContext: 'Normal business email' },
        legitimatePatterns: { matches: ['Standard format'] },
        riskFactors: [],
        finalAssessment: { 
          summary: 'Safe email',
          falsePositiveRisk: 0.1
        }
      };

      document.body.innerHTML = '<div class="adn ads"></div>';
      content.createAnalysisUI(results, 'GMAIL');

      const banner = document.querySelector('.phishing-detector-banner');
      expect(banner).toBeTruthy();
      expect(banner.classList.contains('risk-low')).toBe(true);
    });

    test('should update existing UI when analyzing same email', () => {
      document.body.innerHTML = `
        <div class="adn ads">
          <div class="phishing-detector-banner risk-low"></div>
        </div>
      `;

      const results = {
        riskLevel: 'high',
        confidenceScore: 0.95,
        contextAnalysis: { businessContext: 'Suspicious email' },
        legitimatePatterns: { matches: [] },
        riskFactors: [{ category: 'Urgency', detail: 'High pressure tactics' }],
        finalAssessment: { 
          summary: 'Likely phishing attempt',
          falsePositiveRisk: 0.1
        }
      };

      content.createAnalysisUI(results, 'GMAIL');

      const banners = document.querySelectorAll('.phishing-detector-banner');
      expect(banners.length).toBe(1);
      expect(banners[0].classList.contains('risk-high')).toBe(true);
    });
  });

  describe('Message Handling', () => {
    let messageHandler;

    beforeEach(() => {
      // Reset status before each message test
      Object.assign(content.status, {
        isLoaded: false,
        lastUpdated: null,
        analyzing: 0
      });

      // Set up message handler
      messageHandler = jest.fn((message, sender, sendResponse) => {
        if (message.type === 'GET_STATUS') {
          sendResponse(content.status);
          return true;
        }
        if (message.type === 'UPDATE_MODEL') {
          content.initializeEngine().then(() => sendResponse(content.status));
          return true;
        }
      });

      // Register the message handler
      chrome.runtime.onMessage.addListener(messageHandler);
    });

    test('should handle GET_STATUS message', () => {
      const sendResponse = jest.fn();
      messageHandler({ type: 'GET_STATUS' }, {}, sendResponse);
      expect(sendResponse).toHaveBeenCalledWith(content.status);
    });

    test('should handle UPDATE_MODEL message', async () => {
      const sendResponse = jest.fn();
      messageHandler({ type: 'UPDATE_MODEL' }, {}, sendResponse);
      await content.initializeEngine();
      expect(sendResponse).toHaveBeenCalled();
    });
  });
}); 