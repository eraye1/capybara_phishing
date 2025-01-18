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
      contextAnalysis: { businessContext: 'Normal business email' },
      legitimatePatterns: { matches: ['Standard format'] },
      riskFactors: [],
      finalAssessment: { 
        summary: 'Safe email',
        falsePositiveRisk: 0.1
      }
    };

    createAnalysisUI(results, 'GMAIL', PROVIDERS);

    const banner = document.querySelector('.security-analysis');
    expect(banner).toBeTruthy();
    expect(banner.classList.contains('risk-low')).toBe(true);
  });

  test('should update existing UI when analyzing same email', () => {
    document.body.innerHTML = `
      <div class="adn ads">
        <div class="security-analysis risk-low"></div>
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

    createAnalysisUI(results, 'GMAIL', PROVIDERS);

    const banners = document.querySelectorAll('.security-analysis');
    expect(banners.length).toBe(1);
    expect(banners[0].classList.contains('risk-high')).toBe(true);
  });

  test('should handle missing container', () => {
    document.body.innerHTML = '';
    const results = { riskLevel: 'low' };
    
    expect(() => createAnalysisUI(results, 'GMAIL', PROVIDERS)).not.toThrow();
  });
}); 