import { createAnalysisUI } from '../../../src/content/ui';
import { PROVIDERS } from '../../../src/content/providers';

describe('UI Generation', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div class="adn ads"></div>';
  });

  test('should create analysis UI with correct risk level', () => {
    const results = {
      riskLevel: 'low',
      confidenceScore: 0.95,
      // ... other result data ...
    };

    createAnalysisUI(results, 'GMAIL', PROVIDERS);

    const banner = document.querySelector('.phishing-detector-banner');
    expect(banner).toBeTruthy();
    expect(banner.classList.contains('risk-low')).toBe(true);
  });

  // ... other UI tests ...
}); 