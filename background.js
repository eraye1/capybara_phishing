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
    console.log('Creating MLCEngine...');
    engine = await CreateMLCEngine(
      "Llama-3.1-8B-Instruct-q4f32_1-MLC",
      {
        initProgressCallback: (progress) => {
          console.log("Model loading progress:", JSON.stringify(progress));
          chrome.runtime.sendMessage({
            type: 'LOADING_PROGRESS',
            progress
          });
        }
      }
    );
    console.log("WebLLM engine initialized successfully");
    status.isLoaded = true;
    status.lastUpdated = Date.now();
    console.log('Current status:', JSON.stringify(status));
  } catch (error) {
    console.error("Failed to initialize WebLLM:", error.message, error.stack);
    status.isLoaded = false;
  }
}

// Handle messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Received message:', message.type, 'Current status:', JSON.stringify(status));
  if (message.type === "ANALYZE_EMAIL") {
    status.analyzing++;
    analyzeEmail(message.data).then(sendResponse);
    return true; // Required for async response
  }
  
  if (message.type === "GET_STATUS") {
    sendResponse(status);
    return true;
  }

  if (message.type === "UPDATE_MODEL") {
    initializeEngine().then(() => sendResponse(status));
    return true;
  }

  if (message.type === "CLEAR_CACHE") {
    clearCache().then(() => sendResponse(status));
    return true;
  }
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

// Clear cache and reset status
async function clearCache() {
  try {
    if ('caches' in self) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
    }
    status.analyzing = 0;
    status.lastUpdated = null;
    await initializeEngine();
  } catch (error) {
    console.error('Failed to clear cache:', error);
    throw error;
  }
}

// Initialize on install
chrome.runtime.onInstalled.addListener(() => {
  initializeEngine();
});