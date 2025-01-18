import { CreateMLCEngine } from '@mlc-ai/web-llm';
import { detectProvider, extractEmailContent, PROVIDERS } from './providers';
import { createAnalysisUI, showLoadingState } from './ui';
import { CONFIG } from '../../config';

let engine;
let status = {
  isLoaded: false,
  lastUpdated: null,
  analyzing: 0,
  provider: null,
  stage: 'idle',
  progress: 0,
  message: '',
  error: null,
};

// Configuration toggle
const AI_CONFIG = {
  provider: CONFIG.provider || 'openai', // Use config value or default to 'openai'
  openai: {
    apiKey: CONFIG.OPENAI_API_KEY,
    model: CONFIG.model || 'gpt-4',
    backupModel: CONFIG.backupModel || 'gpt-3.5-turbo',
    maxRetries: 3,
    timeout: 60000,
  },
  webllm: {
    model: CONFIG.model || 'SmolLM2-360M-Instruct-q4f16_1-MLC',
  },
};

// Initialize WebLLM engine
async function initializeEngine() {
  status.provider = AI_CONFIG.provider;
  status.stage = 'initializing';
  status.message = 'Starting initialization...';
  updatePopup();

  if (AI_CONFIG.provider === 'webllm') {
    try {
      if (!CreateMLCEngine) {
        status.error = 'WebLLM library not loaded properly';
        status.stage = 'error';
        updatePopup();
        throw new Error(status.error);
      }

      status.message = 'Creating engine instance...';
      updatePopup();

      engine = await CreateMLCEngine(AI_CONFIG.webllm.model, {
        initProgressCallback: (progress) => {
          status.progress = Math.round(progress * 100);
          status.message = `Loading model: ${status.progress}%`;
          updatePopup();
        },
        logger: {
          info: (msg) => {
            status.message = msg;
            updatePopup();
          },
          warn: (msg) => {
            status.message = `Warning: ${msg}`;
            updatePopup();
          },
          error: (msg) => {
            status.error = msg;
            status.stage = 'error';
            updatePopup();
          },
        },
      });

      if (!engine) {
        status.error = 'Failed to create WebLLM engine';
        status.stage = 'error';
        updatePopup();
        throw new Error(status.error);
      }

      status.isLoaded = true;
      status.lastUpdated = Date.now();
      status.stage = 'ready';
      status.message = 'Engine ready';
      status.error = null;
      updatePopup();
    } catch (error) {
      status.error = error.message;
      status.stage = 'error';
      status.isLoaded = false;
      updatePopup();
      throw error;
    }
  } else if (AI_CONFIG.provider === 'openai') {
    status.isLoaded = true;
    status.lastUpdated = Date.now();
    status.stage = 'ready';
    status.message = 'OpenAI mode ready';
    status.error = null;
    updatePopup();
    return;
  }
}

// Helper function to update popup
function updatePopup() {
  chrome.runtime.sendMessage({
    type: 'STATUS_UPDATE',
    status: {
      ...status,
      timestamp: Date.now(),
    },
  });
}

// Extract email data for analysis
async function extractEmailData() {
  const provider = detectProvider();
  if (!provider) {
    throw new Error('No supported email provider detected');
  }
  return extractEmailContent(provider);
}

// Main observer to detect when emails are opened
const observer = new MutationObserver(async (mutations) => {
  const provider = detectProvider();
  if (!provider) return;

  for (const mutation of mutations) {
    const emailContainer = mutation.target.querySelector(PROVIDERS[provider].container);
    if (emailContainer && !emailContainer.dataset.analyzed) {
      emailContainer.dataset.analyzed = 'true';

      try {
        const emailData = await extractEmailData();
        const loadingBanner = showLoadingState(provider, PROVIDERS);

        // Show loading state while analyzing
        status.analyzing++;
        createAnalysisUI({ riskLevel: 'analyzing' }, provider, PROVIDERS, status);

        const results = await analyzeEmail(emailData);
        createAnalysisUI(results, provider, PROVIDERS, status);

        status.analyzing--;
        if (loadingBanner) {
          loadingBanner.remove();
        }
      } catch (error) {
        console.error('Error analyzing email:', error);
        status.error = error.message;
        createAnalysisUI(
          {
            riskLevel: 'error',
            finalAssessment: { summary: 'Error analyzing email: ' + error.message },
          },
          provider,
          PROVIDERS,
          status
        );
      }
    }
  }
});

// Start observing
observer.observe(document.body, {
  childList: true,
  subtree: true,
});

// Initialize when content script loads
initializeEngine();

// Remove message handling since we removed the buttons

// Analyze email content using WebLLM
async function analyzeEmail(emailData) {
  if (!status.isLoaded) {
    try {
      await initializeEngine();
    } catch (initError) {
      return {
        isPhishing: false,
        confidenceScore: 0,
        riskLevel: 'unknown',
        riskFactors: [
          {
            category: 'Error',
            detail: 'Failed to initialize WebLLM engine: ' + initError.message,
            severity: 0,
            falsePositiveRisk: 1,
          },
        ],
        // ... rest of the error response structure ...
      };
    }
  }

  if (!status.isLoaded) {
    throw new Error('WebLLM engine failed to initialize');
  }

  // Simplified prompt for WebLLM mode
  const webllmPrompt = `Analyze this email for phishing risks. Keep it simple.

Email Subject: ${emailData.subject}
Email Body: ${emailData.body}
Attachments: ${emailData.attachments.map((a) => `${a.name} (${a.type})`).join(', ') || 'None'}

Look for:
1. Urgency or threats
2. Requests for sensitive information
3. Suspicious links or attachments
4. Poor grammar or formatting
5. Mismatched sender info

Respond with a JSON object containing:
{
  "isPhishing": true/false,
  "confidenceScore": 0-1 number,
  "riskLevel": "low"/"medium"/"high",
  "legitimatePatterns": {
    "matches": ["list", "of", "good", "patterns"],
    "confidence": 0-1 number
  },
  "riskFactors": [
    {
      "category": "what type of risk",
      "detail": "explanation",
      "severity": 0-1 number,
      "falsePositiveRisk": 0-1 number
    }
  ],
  "contextAnalysis": {
    "businessContext": "brief explanation",
    "workflowValidity": true/false,
    "timingAppropriate": true/false
  },
  "attachmentRisk": {
    "level": "low"/"medium"/"high",
    "details": "brief explanation",
    "legitimateUseCase": "valid reason or null"
  },
  "finalAssessment": {
    "summary": "one line summary",
    "confidenceInAssessment": 0-1 number,
    "falsePositiveRisk": 0-1 number
  }
}`;

  // Full prompt for OpenAI mode
  const openaiPrompt = `You are an expert email security system. Analyze this email carefully, considering both phishing indicators AND legitimate business patterns.
  
  CONTEXT ANALYSIS:
  1. Business Communication Patterns:
  - Expected business hours communication
  - Standard corporate email formats
  - Normal business workflows
  - Typical meeting requests/calendar invites
  - Regular business document sharing
  - Internal company communications
  
  2. Legitimate Scenarios:
  - Password reset AFTER user request
  - IT system maintenance notices
  - HR/Benefits enrollment periods
  - Regular invoice/billing cycles
  - Standard meeting scheduling
  - Document collaboration requests
  
  3. Risk Indicators (weighted by context):
  - Sender legitimacy and history
  - Communication tone and urgency
  - Credential/information requests
  - Link/attachment patterns
  - Language and formatting
  - Business context alignment
  
  Email Subject: ${emailData.subject}
  Email Body: ${emailData.body}
  Attachments: ${emailData.attachments.map((a) => `${a.name} (${a.type})`).join(', ') || 'None'}
  
  First, determine if this matches known legitimate patterns:
  1. Is this a standard business communication?
  2. Does it follow expected workflows?
  3. Is the timing and context appropriate?
  4. Are any requests reasonable for the context?
  
  Then analyze for risk factors, considering the legitimate context.
  
  Provide a JSON response with the following structure:
  {
    "isPhishing": boolean,
    "confidenceScore": number (0.00 to 1.00),
    "riskLevel": "low" | "medium" | "high",
    "legitimatePatterns": {
      "matches": string[],
      "confidence": number (0.00 to 1.00)
    },
    "riskFactors": [
      {
        "category": string,
        "detail": string,
        "severity": number (0.00 to 1.00),
        "falsePositiveRisk": number (0.00 to 1.00)
      }
    ],
    "contextAnalysis": {
      "businessContext": string,
      "workflowValidity": boolean,
      "timingAppropriate": boolean
    },
    "attachmentRisk": {
      "level": "low" | "medium" | "high",
      "details": string,
      "legitimateUseCase": string | null
    },
    "finalAssessment": {
      "summary": string,
      "confidenceInAssessment": number (0.00 to 1.00),
      "falsePositiveRisk": number (0.00 to 1.00)
    }
  }
  
  IMPORTANT:
  - Consider business context heavily
  - Look for legitimate patterns first
  - Weight false positive risks
  - Account for normal business operations
  - Consider industry-standard practices
  - Evaluate timing and workflow context
  - Assess reasonableness of requests`;

  try {
    let response;
    if (AI_CONFIG.provider === 'webllm') {
      console.debug('[WebLLM] Starting analysis with model:', AI_CONFIG.webllm.model);
      console.debug('[WebLLM] Email data length:', emailData.body.length);
      console.info('[WebLLM] WebLLM prompt:', webllmPrompt);
      response = await Promise.race([
        engine.chat.completions.create({
          messages: [
            {
              role: 'system',
              content:
                'You are a simple email security checker. Keep responses brief and numbers to 2 decimal places.',
            },
            { role: 'user', content: webllmPrompt },
          ],
          temperature: 0.1,
          max_tokens: 1000, // Reduced for simpler responses
          response_format: { type: 'json_object' },
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Chat completion timed out after 30s')), 60000)
        ),
      ]);

      console.debug('[WebLLM] Raw response:', response);
    } else if (AI_CONFIG.provider === 'openai') {
      response = await analyzeEmailWithOpenAI(openaiPrompt);
    }

    let parsedResponse;
    const content = response.choices[0].message.content;
    console.debug('[WebLLM] Response content:', content);

    // Sanitize the response before parsing
    const sanitizedContent = content.replace(/(\d+\.\d{2})\d+/g, '$1');
    console.info('[WebLLM] Sanitized content:', sanitizedContent);

    try {
      parsedResponse = JSON.parse(sanitizedContent);
      console.info('[WebLLM] Parsed response:', parsedResponse);
    } catch (parseError) {
      console.error('[WebLLM] Failed to parse response:', parseError);
      throw new Error(`Failed to parse WebLLM response: ${parseError.message}`);
    }

    // Validate and fix confidence score
    if (typeof parsedResponse.confidenceScore === 'number') {
      if (isNaN(parsedResponse.confidenceScore)) {
        console.warn('[WebLLM] Confidence score is NaN, defaulting to 0');
        parsedResponse.confidenceScore = 0;
      } else {
        parsedResponse.confidenceScore = Math.min(
          1,
          Math.max(0, Number(parsedResponse.confidenceScore.toFixed(2)))
        );
        console.debug('[WebLLM] Normalized confidence score:', parsedResponse.confidenceScore);
      }
    } else {
      console.warn('[WebLLM] Confidence score is not a number:', parsedResponse.confidenceScore);
      parsedResponse.confidenceScore = 0;
    }

    status.analyzing++;
    return parsedResponse;
  } catch (error) {
    console.error('[WebLLM] Analysis error:', error);
    return {
      isPhishing: false,
      confidenceScore: 0,
      riskLevel: 'unknown',
      legitimatePatterns: {
        matches: [],
        confidence: 0,
      },
      riskFactors: [
        {
          category: 'Error',
          detail: `Analysis error: ${error.message.substring(0, 100)}`,
          severity: 0,
          falsePositiveRisk: 1,
        },
      ],
      contextAnalysis: {
        businessContext: 'Unable to analyze context due to error',
        workflowValidity: false,
        timingAppropriate: false,
      },
      attachmentRisk: {
        level: 'unknown',
        details: 'Unable to analyze attachments due to error',
        legitimateUseCase: null,
      },
      finalAssessment: {
        summary: 'Analysis failed due to technical error',
        confidenceInAssessment: 0,
        falsePositiveRisk: 1,
      },
    };
  }
}

async function analyzeEmailWithOpenAI(prompt) {
  const openaiConfig = AI_CONFIG.openai;

  try {
    const response = await Promise.race([
      fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openaiConfig.apiKey}`,
          'OpenAI-Beta': 'assistants=v1', // Enable latest features
        },
        body: JSON.stringify({
          model: openaiConfig.model,
          messages: [
            {
              role: 'system',
              content:
                'You are a cybersecurity expert. Always format numbers with maximum 2 decimal places.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.1,
          max_tokens: 3000,
          response_format: { type: 'json_object' },
          seed: 123, // For consistent outputs
          top_p: 0.95,
          frequency_penalty: 0,
          presence_penalty: 0,
        }),
      }).then((res) => {
        if (!res.ok) {
          return res.json().then((err) => {
            throw new Error(`OpenAI API Error: ${err.error?.message || 'Unknown error'}`);
          });
        }
        return res.json();
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('OpenAI request timed out')), openaiConfig.timeout)
      ),
    ]);

    return response;
  } catch (error) {
    // If it's a rate limit error or model overload, try backup model
    if (error.message.includes('rate_limit') || error.message.includes('overloaded')) {
      const backupResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openaiConfig.apiKey}`,
          'OpenAI-Beta': 'assistants=v1',
        },
        body: JSON.stringify({
          model: openaiConfig.backupModel,
          messages: [
            {
              role: 'system',
              content:
                'You are a cybersecurity expert. Always format numbers with maximum 2 decimal places.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.1,
          max_tokens: 3000,
          response_format: { type: 'json_object' },
        }),
      }).then((res) => res.json());

      return backupResponse;
    }

    throw error;
  }
}
