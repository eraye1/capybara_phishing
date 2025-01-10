import { CreateMLCEngine } from "@mlc-ai/web-llm";

let engine;
let status = {
  isLoaded: false,
  lastUpdated: null,
  analyzing: 0
};

// Configuration toggle
const AI_CONFIG = {
  provider: 'openai', // 'webllm' or 'openai'
  openai: {
    apiKey: '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', // Add your OpenAI API key here
    model: 'gpt-4o', // Latest GPT-4 model
    backupModel: 'gpt-4o-mini',
    maxRetries: 3,
    timeout: 30000
  }
};

// Initialize WebLLM engine
async function initializeEngine() {
    console.log('Initializing WebLLM engine');
    if (AI_CONFIG.provider === 'webllm') {
        try {
            console.log('About to create MLCEngine');
            engine = await CreateMLCEngine(
            "Llama-3.1-8B-Instruct-q4f32_1-MLC",
            {
                initProgressCallback: (progress) => {
                console.log("Model loading progress:", JSON.stringify(progress));
                }
            }
            );
            console.log('MLCEngine created successfully');
            status.isLoaded = true;
            status.lastUpdated = Date.now();
        } catch (error) {
            console.error("Failed to initialize WebLLM:", error.message, error.stack);
            status.isLoaded = false;
        }
    } else if (AI_CONFIG.provider === 'openai') {
        console.log('OpenAI provider selected'); 
        status.isLoaded = true;
        status.lastUpdated = Date.now();
        return;
    }
}

// Email provider specific selectors
const PROVIDERS = {
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
};

// Detect email provider
function detectProvider() {
  const hostname = window.location.hostname;
  if (hostname.includes('mail.google.com')) return 'GMAIL';
  if (hostname.includes('hotmail.com')) return 'HOTMAIL';
  return null;
}

// Extract email content
function extractEmailContent(provider) {
  const selectors = PROVIDERS[provider];
  console.log('Looking for selectors:', selectors);
  
  const subject = document.querySelector(selectors.subject)?.textContent || '';
  const body = document.querySelector(selectors.body)?.textContent || '';
  
  // Debug attachment detection
  const attachmentElements = document.querySelectorAll(selectors.attachments);
  console.log('Found attachment elements:', attachmentElements.length);
  
  // Try different Gmail attachment selectors
  const attachmentSelectors = [
    '.aZo',                    // Download attachment button
    '.aQH',                    // Attachment container
    '.aSH',                    // Inline attachment
    '.aV3',                    // Attachment name
    'div[role="region"][aria-label*="Attachment"]', // Accessibility selector
    '.aZI'                     // Attachment preview
  ];
  
  // Log all potential attachment elements
  attachmentSelectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    console.log(`Selector ${selector}:`, elements.length);
  });
  
  // Safely extract attachment information
  const attachmentInfo = [];
  attachmentElements.forEach(element => {
    try {
      console.log('Processing attachment element:', element);
      
      // Try multiple ways to get attachment info
      const name = element.getAttribute('data-name') || 
                   element.title || 
                   element.getAttribute('aria-label') ||
                   element.querySelector('.aV3')?.textContent ||
                   '';
                   
      const type = element.getAttribute('data-type') || 
                   element.getAttribute('data-mime-type') ||
                   element.querySelector('.aZL')?.textContent ||
                   '';
                   
      const size = element.getAttribute('data-size') || 
                   element.querySelector('.aZM')?.textContent ||
                   '';
      
      console.log('Found attachment:', { name, type, size });
      
      // Filter out empty or invalid entries
      if (name || type) {
        attachmentInfo.push({ name, type, size });
      }
    } catch (error) {
      console.warn('Error processing attachment:', error);
    }
  });
  
  console.log('Found content:', { 
    subject: subject.substring(0, 50), 
    bodyLength: body.length,
    attachmentCount: attachmentInfo.length,
    attachments: attachmentInfo 
  });
  
  return { subject, body, attachments: attachmentInfo };
}

// Create and insert UI elements
function createAnalysisUI(results, provider) {
  console.log('Creating UI with results:', results);
  const container = document.querySelector(PROVIDERS[provider].container);
  
  // Remove existing banner if present
  const existingBanner = container?.querySelector('.phishing-detector-banner');
  if (existingBanner) {
    existingBanner.remove();
  }
  
  const banner = document.createElement('div');
  banner.className = 'phishing-detector-banner loading';
  
  // Show loading state first
  banner.innerHTML = `
    <div class="loading-indicator">
      <div class="loading-spinner"></div>
      <span>Analyzing email for security threats...</span>
    </div>
  `;
  
  container?.insertBefore(banner, container.firstChild);
  
  // Simulate analysis time (remove in production)
  setTimeout(() => {
    banner.className = `phishing-detector-banner risk-${results.riskLevel}`;
    banner.innerHTML = `
      <div class="banner-content">
        <span class="risk-badge">${results.riskLevel.toUpperCase()} RISK</span>
        <span class="confidence-score">
          Confidence: ${(results.confidenceScore * 100).toFixed(1)}% 
          ${results.finalAssessment.falsePositiveRisk < 0.2 ? '✓' : ''}
        </span>
        <button class="details-toggle">View Analysis</button>
      </div>
      <div class="details hidden">
        <div class="context-analysis">
          <h4>Context Analysis</h4>
          <p>${results.contextAnalysis.businessContext}</p>
          ${results.legitimatePatterns.matches.length > 0 ? `
            <div class="legitimate-patterns">
              <h5>Legitimate Patterns Detected:</h5>
              <ul>
                ${results.legitimatePatterns.matches.map(pattern => `<li>${pattern}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
        </div>
        
        <div class="risk-analysis">
          <h4>Risk Factors</h4>
          <ul>
            ${results.riskFactors.map(factor => `
              <li class="risk-factor ${factor.severity > 0.7 ? 'high' : factor.severity > 0.4 ? 'medium' : 'low'}">
                <strong>${factor.category}:</strong> ${factor.detail}
                ${factor.falsePositiveRisk > 0.5 ? '<span class="false-positive-warning">⚠️ Possible false positive</span>' : ''}
              </li>
            `).join('')}
          </ul>
        </div>
        
        ${results.attachmentRisk ? `
          <div class="attachment-risk">
            <div class="attachment-risk-title">Attachment Analysis</div>
            <div>
              <p>${results.attachmentRisk.details}</p>
              ${results.attachmentRisk.legitimateUseCase ? `
                <p class="legitimate-use">Legitimate use case: ${results.attachmentRisk.legitimateUseCase}</p>
              ` : ''}
            </div>
          </div>
        ` : ''}
        
        <div class="final-assessment">
          <h4>Final Assessment</h4>
          <p>${results.finalAssessment.summary}</p>
        </div>
      </div>
    `;
  
    // Add event listeners
    banner.querySelector('.details-toggle').addEventListener('click', (e) => {
      const details = banner.querySelector('.details');
      const button = e.target;
      details.classList.toggle('hidden');
      button.textContent = details.classList.contains('hidden') ? 'View Analysis' : 'Hide Analysis';
    });
  }, 1500); // Show loading for 1.5s
}

// Main observer to detect when emails are opened
const observer = new MutationObserver(async (mutations) => {
  const provider = detectProvider();
  if (!provider) return;

  for (const mutation of mutations) {
    const emailContainer = mutation.target.querySelector(PROVIDERS[provider].container);
    if (emailContainer && !emailContainer.dataset.analyzed) {
      console.log('Found unanalyzed email container');
      emailContainer.dataset.analyzed = 'true';
      
      const emailContent = extractEmailContent(provider);
      
      // Send to background script for analysis
      console.log('Sending content for analysis');
      const results = await analyzeEmail(emailContent);

      console.log('Received analysis results:', results);
      createAnalysisUI(results, provider);
    }
  }
});

console.log('Starting observer');
// Start observing
observer.observe(document.body, {
  childList: true,
  subtree: true
});

// Analyze email content using WebLLM
async function analyzeEmail(emailData) {
  if (!status.isLoaded) {
    await initializeEngine();
  }
  
  const prompt = `You are an expert email security system. Analyze this email carefully, considering both phishing indicators AND legitimate business patterns.
  
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
  Attachments: ${emailData.attachments.map(a => `${a.name} (${a.type})`).join(', ') || 'None'}
  
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
    console.log('Starting analysis with provider:', AI_CONFIG.provider);
    
    let response;
    if (AI_CONFIG.provider === 'webllm') {
      response = await Promise.race([
        engine.chat.completions.create({
          messages: [
            { 
              role: "system", 
              content: "You are an enterprise email security system with deep understanding of business communication patterns. Focus on reducing false positives while maintaining security. Format all numbers with maximum 2 decimal places." 
            },
            { role: "user", content: prompt }
          ],
          temperature: 0.1,
          max_tokens: 800,  // Increased for more detailed analysis
          response_format: { type: "json_object" }
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Chat completion timed out after 30s')), 30000)
        )
      ]);
    } else if (AI_CONFIG.provider === 'openai') {
      response = await analyzeEmailWithOpenAI(prompt);
    }
    
    console.log('Response received:', response);
    let parsedResponse;
    try {
      const content = response.choices[0].message.content;
      console.log('Raw response:', content);
      
      // Sanitize the response before parsing
      const sanitizedContent = content.replace(/(\d+\.\d{2})\d+/g, '$1');
      console.log('Sanitized response:', sanitizedContent);
      
      parsedResponse = JSON.parse(sanitizedContent);
      
      // Ensure confidenceScore is properly formatted
      if (typeof parsedResponse.confidenceScore === 'number') {
        parsedResponse.confidenceScore = Math.min(1, Math.max(0, Number(parsedResponse.confidenceScore.toFixed(2))));
      }
    } catch (parseError) {
      console.error('Failed to parse response:', parseError);
      throw parseError;
    }
    
    console.log('Parsed response:', parsedResponse);
    status.analyzing++;
    return parsedResponse;
  } catch (error) {
    console.error("Analysis failed:", error.message, error.stack);
    return {
      isPhishing: false,
      confidenceScore: 0,
      reasons: [`Analysis error: ${error.message.substring(0, 100)}`],
      riskLevel: "unknown"
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
          'Authorization': `Bearer ${openaiConfig.apiKey}`,
          'OpenAI-Beta': 'assistants=v1'  // Enable latest features
        },
        body: JSON.stringify({
          model: openaiConfig.model,
          messages: [
            {
              role: "system",
              content: "You are a cybersecurity expert. Always format numbers with maximum 2 decimal places."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.1,
          max_tokens: 500,
          response_format: { "type": "json_object" },
          seed: 123, // For consistent outputs
          top_p: 0.95,
          frequency_penalty: 0,
          presence_penalty: 0
        })
      }).then(res => {
        if (!res.ok) {
          return res.json().then(err => {
            throw new Error(`OpenAI API Error: ${err.error?.message || 'Unknown error'}`);
          });
        }
        return res.json();
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('OpenAI request timed out')), openaiConfig.timeout)
      )
    ]);

    return response;
  } catch (error) {
    console.error('OpenAI API error:', error);
    
    // If it's a rate limit error or model overload, try backup model
    if (error.message.includes('rate_limit') || error.message.includes('overloaded')) {
      console.log('Attempting with backup model...');
      const backupResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiConfig.apiKey}`,
          'OpenAI-Beta': 'assistants=v1'
        },
        body: JSON.stringify({
          model: openaiConfig.backupModel,
          messages: [
            {
              role: "system",
              content: "You are a cybersecurity expert. Always format numbers with maximum 2 decimal places."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.1,
          max_tokens: 500,
          response_format: { "type": "json_object" }
        })
      }).then(res => res.json());
      
      return backupResponse;
    }
    
    throw error;
  }
}

// Initialize when content script loads
initializeEngine();

// Handle messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Content script received message:', message.type, 'Current status:', JSON.stringify(status));
  
  if (message.type === 'GET_STATUS') {
    sendResponse(status);
  }
  
  if (message.type === 'UPDATE_MODEL') {
    initializeEngine().then(() => sendResponse(status));
    return true;
  }
  
  if (message.type === 'CLEAR_CACHE') {
    status.analyzing = 0;
    status.lastUpdated = null;
    initializeEngine().then(() => sendResponse(status));
    return true;
  }
}); 