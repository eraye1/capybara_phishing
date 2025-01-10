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
}

// Email provider specific selectors
const PROVIDERS = {
  GMAIL: {
    container: '.adn.ads',
    subject: '.hP',
    body: '.a3s.aiL'
  },
  HOTMAIL: {
    container: '.ReadMsgBody',
    subject: '.subject',
    body: '.message-body'
  }
};

// Detect email provider
function detectProvider() {
  const hostname = window.location.hostname;
  console.log('Current hostname:', hostname);
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
  
  console.log('Found content:', { subject: subject.substring(0, 50), bodyLength: body.length });
  return { subject, body };
}

// Create and insert UI elements
function createAnalysisUI(results) {
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
  console.log('DOM mutation detected');
  const provider = detectProvider();
  console.log('Provider detected:', provider);
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
      createAnalysisUI(results);
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
  const prompt = `Analyze this email for phishing attempts. Consider urgency, suspicious links, credential requests, sender legitimacy, and grammar issues.
  
  Email Subject: ${emailData.subject}
  Email Body: ${emailData.body}
  
  Provide a JSON response with the following structure:
  {
    "isPhishing": boolean,
    "confidenceScore": number,
    "reasons": string[],
    "riskLevel": "low" | "medium" | "high"
  }`;
  
  try {
    const response = await engine.chat.completions.create({
      messages: [
        { role: "system", content: "You are a cybersecurity expert specializing in email phishing detection." },
        { role: "user", content: prompt }
      ],
      temperature: 0.1,
      response_format: { type: "json_object" }
    });

    status.analyzing++;
    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error("Analysis failed:", error);
    return {
      isPhishing: false,
      confidenceScore: 0,
      reasons: ["Analysis failed"],
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