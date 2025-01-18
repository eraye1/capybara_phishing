import { createAnalysisUI, showLoadingState } from '../../../src/content/ui';
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

  test('should display risk factors when present', () => {
    const results = {
      riskLevel: 'high',
      confidenceScore: 0.95,
      riskFactors: [
        { category: 'Urgency', severity: 0.8, detail: 'High pressure tactics' },
        { category: 'Links', severity: 0.9, detail: 'Suspicious URLs' }
      ],
      finalAssessment: { summary: 'High risk email' }
    };

    createAnalysisUI(results, 'GMAIL', PROVIDERS);
    
    const factors = document.querySelectorAll('.factor');
    expect(factors.length).toBe(2);
    expect(factors[0].querySelector('.factor-title').textContent).toBe('Urgency');
    expect(factors[0].querySelector('.factor-severity').textContent).toContain('80%');
  });

  test('should handle details toggle interaction', () => {
    const results = {
      riskLevel: 'medium',
      confidenceScore: 0.8,
      riskFactors: [],
      finalAssessment: { summary: 'Medium risk' }
    };

    createAnalysisUI(results, 'GMAIL', PROVIDERS);
    
    const toggle = document.querySelector('.details-toggle');
    const analysis = document.querySelector('.security-analysis');
    
    toggle.click();
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(analysis.classList.contains('expanded')).toBe(true);
    
    toggle.click();
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(analysis.classList.contains('expanded')).toBe(false);
  });

  test('should try different insertion points', () => {
    // Test each insertion point in isolation
    const selectors = ['.ha', '.hP', '.aeF', '.adn.ads', '.gs'];
    
    selectors.forEach(selector => {
      document.body.innerHTML = `
        <div class="adn ads">
          ${selector === '.adn.ads' ? '' : `<div class="${selector.slice(1)}"></div>`}
        </div>
      `;

      const results = {
        riskLevel: 'low',
        confidenceScore: 0.9,
        riskFactors: [],
        finalAssessment: { summary: 'Safe' }
      };

      createAnalysisUI(results, 'GMAIL', PROVIDERS);
      
      const banner = document.querySelector('.security-analysis');
      expect(banner).toBeTruthy();
      
      if (selector === '.adn.ads') {
        // Should insert at the beginning of container
        const container = document.querySelector('.adn.ads');
        expect(container.firstChild).toBe(banner);
      } else {
        const element = document.querySelector(selector.slice(1));
        expect(banner.nextElementSibling).toBe(element);
      }
    });
  });

  test('should fallback to container insertion', () => {
    document.body.innerHTML = '<div class="adn ads"><div class="other-content"></div></div>';
    
    const results = {
      riskLevel: 'low',
      confidenceScore: 0.9,
      riskFactors: [],
      finalAssessment: { summary: 'Safe' }
    };

    createAnalysisUI(results, 'GMAIL', PROVIDERS);
    
    const banner = document.querySelector('.security-analysis');
    const container = document.querySelector('.adn.ads');
    expect(container.firstChild).toBe(banner);
  });

  test('should handle different risk levels', () => {
    const levels = ['low', 'medium', 'high'];
    
    levels.forEach(level => {
      document.body.innerHTML = '<div class="adn ads"></div>';
      const results = {
        riskLevel: level,
        confidenceScore: 0.9,
        riskFactors: [],
        finalAssessment: { summary: 'Test' }
      };

      createAnalysisUI(results, 'GMAIL', PROVIDERS);
      
      const banner = document.querySelector('.security-analysis');
      expect(banner.classList.contains(`risk-${level}`)).toBe(true);
      
      const message = banner.querySelector('.status-message');
      expect(message.textContent).toBeTruthy();
      
      const icon = banner.querySelector('.status-icon');
      expect(icon).toBeTruthy();
    });
  });

  test('should handle empty risk factors', () => {
    const results = {
      riskLevel: 'low',
      confidenceScore: 0.9,
      riskFactors: [],
      finalAssessment: { summary: 'Safe' }
    };

    createAnalysisUI(results, 'GMAIL', PROVIDERS);
    
    const riskFactors = document.querySelector('.risk-factors');
    expect(riskFactors).toBeFalsy();
  });

  test('should handle missing or incomplete finalAssessment', () => {
    // Test with missing finalAssessment
    const results1 = {
      riskLevel: 'low',
      confidenceScore: 0.9,
      riskFactors: []
    };

    createAnalysisUI(results1, 'GMAIL', PROVIDERS);
    let summary = document.querySelector('.summary');
    expect(summary).toBeFalsy();

    // Test with empty finalAssessment
    document.body.innerHTML = '<div class="adn ads"></div>';
    const results2 = {
      riskLevel: 'low',
      confidenceScore: 0.9,
      riskFactors: [],
      finalAssessment: {}
    };

    createAnalysisUI(results2, 'GMAIL', PROVIDERS);
    summary = document.querySelector('.summary');
    expect(summary).toBeFalsy();

    // Test with null summary
    document.body.innerHTML = '<div class="adn ads"></div>';
    const results3 = {
      riskLevel: 'low',
      confidenceScore: 0.9,
      riskFactors: [],
      finalAssessment: { summary: null }
    };

    createAnalysisUI(results3, 'GMAIL', PROVIDERS);
    summary = document.querySelector('.summary');
    expect(summary).toBeFalsy();
  });

  describe('Loading State', () => {
    test('should show loading state with spinner', () => {
      const loadingUI = showLoadingState('GMAIL', PROVIDERS);
      
      expect(loadingUI).toBeTruthy();
      expect(loadingUI.classList.contains('is-loading')).toBe(true);
      expect(loadingUI.querySelector('.loading-indicator')).toBeTruthy();
      expect(loadingUI.querySelector('.status-message').textContent).toContain('Analyzing');
    });

    test('should handle loading state insertion points', () => {
      // Test each insertion point in isolation
      const selectors = ['.ha', '.hP', '.aeF', '.adn.ads', '.gs'];
      
      selectors.forEach(selector => {
        document.body.innerHTML = `
          <div class="adn ads">
            ${selector === '.adn.ads' ? '' : `<div class="${selector.slice(1)}"></div>`}
          </div>
        `;

        const loadingUI = showLoadingState('GMAIL', PROVIDERS);
        expect(loadingUI).toBeTruthy();
        
        if (selector === '.adn.ads') {
          // Should insert at the beginning of container
          const container = document.querySelector('.adn.ads');
          expect(container.firstChild).toBe(loadingUI);
        } else {
          const element = document.querySelector(selector.slice(1));
          expect(loadingUI.nextElementSibling).toBe(element);
        }
      });
    });

    test('should handle missing container for loading state', () => {
      document.body.innerHTML = '';
      expect(showLoadingState('GMAIL', PROVIDERS)).toBeUndefined();
    });
  });

  describe('Status Icons', () => {
    test('should render all risk level icons', () => {
      const levels = ['low', 'medium', 'high', 'loading'];
      
      levels.forEach(level => {
        document.body.innerHTML = '<div class="adn ads"></div>';
        const results = {
          riskLevel: level,
          confidenceScore: 0.9,
          riskFactors: [],
          finalAssessment: { summary: 'Test' }
        };

        createAnalysisUI(results, 'GMAIL', PROVIDERS);
        
        const icon = document.querySelector('.status-icon');
        expect(icon).toBeTruthy();
        
        if (level === 'loading') {
          expect(icon.classList.contains('loading')).toBe(true);
          expect(icon.querySelector('.spinner')).toBeTruthy();
          expect(icon.querySelector('.spinner-track')).toBeTruthy();
        } else {
          expect(icon.querySelector('.icon-base')).toBeTruthy();
          expect(icon.querySelector('.icon-symbol')).toBeTruthy();
        }
      });
    });

    test('should handle unknown risk level', () => {
      const results = {
        riskLevel: 'unknown',
        confidenceScore: 0.9,
        riskFactors: [],
        finalAssessment: { summary: 'Test' }
      };

      createAnalysisUI(results, 'GMAIL', PROVIDERS);
      
      const icon = document.querySelector('.status-icon');
      expect(icon).toBeTruthy();
      expect(icon.classList.contains('loading')).toBe(true);
    });
  });

  describe('Responsive Design', () => {
    test('should include mobile styles in stylesheet', () => {
      const results = {
        riskLevel: 'low',
        confidenceScore: 0.9,
        riskFactors: [],
        finalAssessment: { summary: 'Test' }
      };

      createAnalysisUI(results, 'GMAIL', PROVIDERS);
      
      const styles = document.getElementById('security-analysis-styles');
      const styleContent = styles.textContent;
      
      // Check if mobile media query styles are present
      expect(styleContent).toContain('@media (max-width: 768px)');
      expect(styleContent).toContain('flex-direction: column');
      expect(styleContent).toContain('width: 100%');
      expect(styleContent).toContain('justify-content: space-between');
    });

    test('should include animation keyframes', () => {
      const results = {
        riskLevel: 'low',
        confidenceScore: 0.9,
        riskFactors: [],
        finalAssessment: { summary: 'Test' }
      };

      createAnalysisUI(results, 'GMAIL', PROVIDERS);
      
      const styles = document.getElementById('security-analysis-styles');
      const styleContent = styles.textContent;
      
      // Check if animations are present
      expect(styleContent).toContain('@keyframes rotate');
      expect(styleContent).toContain('@keyframes dash');
      expect(styleContent).toContain('@keyframes pulse');
    });
  });
}); 