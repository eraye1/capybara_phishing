import { CreateMLCEngine } from "@mlc-ai/web-llm";
import { detectProvider, extractEmailContent, PROVIDERS } from './providers';
import { createAnalysisUI } from './ui';

export const status = {
  isLoaded: false,
  lastUpdated: null,
  analyzing: 0
};

export const AI_CONFIG = {
  // ... existing config ...
};

export async function initializeEngine() {
  // ... existing initialization code ...
}

export async function analyzeEmail(emailData) {
  // ... existing analysis code ...
}

// Export everything needed
export {
  detectProvider,
  extractEmailContent,
  createAnalysisUI,
  PROVIDERS
}; 