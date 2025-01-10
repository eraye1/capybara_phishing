import { CreateMLCEngine } from "@mlc-ai/web-llm";

let engine;
let status = {
  isLoaded: false,
  lastUpdated: null,
  analyzing: 0
};

// Initialize WebLLM engine
async function initializeEngine() {
  console.log('Initializing WebLLM engine');
  try {
    console.log('About to create MLCEngine');
    engine = await CreateMLCEngine(
      "TinyLlama-1.1B-Chat-v0.6",
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
  const banner = document.createElement('div');
  banner.className = `phishing-detector-banner risk-${results.riskLevel}`;
  
  banner.innerHTML = `
    <div class="banner-content">
      <span class="risk-level">${results.riskLevel.toUpperCase()} RISK</span>
      <span class="confidence">Confidence: ${Math.round(results.confidenceScore * 100)}%</span>
      <button class="details-toggle">Show Details</button>
    </div>
    <div class="details hidden">
      <ul>
        ${results.reasons.map(reason => `<li>${reason}</li>`).join('')}
      </ul>
    </div>
  `;

  const container = document.querySelector(PROVIDERS[provider].container);
  console.log('Found container for banner:', !!container);
  container?.insertBefore(banner, container.firstChild);

  // Add event listeners
  banner.querySelector('.details-toggle').addEventListener('click', () => {
    banner.querySelector('.details').classList.toggle('hidden');
  });
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
  if (!engine) {
    await initializeEngine();
  }
  
  // Simplified prompt with explicit number formatting guidance
  const prompt = `Analyze this email for phishing attempts. Consider urgency, suspicious links, credential requests, sender legitimacy, grammar issues, and attachment safety.
  
  Email Subject: ${emailData.subject}
  Email Body: ${emailData.body}
  Attachments: ${emailData.attachments.map(a => `${a.name} (${a.type})`).join(', ') || 'None'}
  
  Provide a JSON response with the following structure, using numbers between 0 and 1 with max 2 decimal places:
  {
    "isPhishing": boolean,
    "confidenceScore": number (0.00 to 1.00),
    "reasons": string[],
    "riskLevel": "low" | "medium" | "high",
    "attachmentRisk": {
      "level": "low" | "medium" | "high",
      "details": string
    }
  }`;
  
  try {
    console.log('Starting chat completion...', prompt);
    const response = await Promise.race([
      engine.chat.completions.create({
        messages: [
          { 
            role: "system", 
            content: "You are a cybersecurity expert. Always format numbers with maximum 2 decimal places." 
          },
          { role: "user", content: prompt }
        ],
        temperature: 0.1,
        max_tokens: 500,
        response_format: { type: "json_object" }
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Chat completion timed out after 30s')), 30000)
      )
    ]);
    
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