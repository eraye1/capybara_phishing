export function createAnalysisUI(results, provider, PROVIDERS) {
  const container = document.querySelector(PROVIDERS[provider].container);
  if (!container) return;

  // Remove existing banner if present
  const existingBanner = container.querySelector('.phishing-detector-banner');
  if (existingBanner) {
    existingBanner.remove();
  }

  const banner = document.createElement('div');
  banner.className = `phishing-detector-banner risk-${results.riskLevel}`;
  // ... rest of UI creation code ...
  container.insertBefore(banner, container.firstChild);
} 