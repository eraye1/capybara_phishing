import { createAnalysisUI, showLoadingState } from '../../../src/content/ui';

describe('UI Generation', () => {
  let container;
  const mockProvider = 'gmail';
  const mockProviders = {
    gmail: {
      container: '.mock-container',
    },
  };
  const defaultStatus = {
    analyzing: 0,
    provider: 'openai',
    stage: 'ready',
    message: '',
    error: null,
  };

  beforeEach(() => {
    container = document.createElement('div');
    container.className = 'mock-container';
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  test('should create analysis UI with correct risk level', () => {
    const results = {
      riskLevel: 'low',
      confidenceScore: 0.95,
    };

    createAnalysisUI(results, mockProvider, mockProviders, defaultStatus);

    const banner = document.querySelector('.security-analysis');
    expect(banner).toBeTruthy();
    expect(banner.classList.contains('risk-low')).toBe(true);
    expect(banner.querySelector('.status-message').textContent).toBe(
      'This email appears to be safe'
    );
    expect(banner.querySelector('.confidence').textContent).toBe('95% confidence');
  });

  test('should update existing UI when analyzing same email', () => {
    const results = {
      riskLevel: 'medium',
      confidenceScore: 0.75,
    };

    // Create initial UI
    createAnalysisUI(results, mockProvider, mockProviders, defaultStatus);

    // Update with new results
    const newResults = {
      riskLevel: 'high',
      confidenceScore: 0.85,
    };
    createAnalysisUI(newResults, mockProvider, mockProviders, defaultStatus);

    const banner = document.querySelector('.security-analysis');
    expect(banner.classList.contains('risk-high')).toBe(true);
    expect(banner.querySelector('.confidence').textContent).toBe('85% confidence');
  });

  test('should display analyzing state correctly', () => {
    const results = {
      riskLevel: 'low',
      confidenceScore: 0.9,
    };
    const analyzingStatus = {
      ...defaultStatus,
      analyzing: 2,
    };

    createAnalysisUI(results, mockProvider, mockProviders, analyzingStatus);

    const analyzing = document.querySelector('.analyzing');
    expect(analyzing).toBeTruthy();
    expect(analyzing.textContent).toBe('Analyzed 2 emails...');
  });

  test('should display risk factors when present', () => {
    const results = {
      riskLevel: 'high',
      confidenceScore: 0.9,
      riskFactors: [
        {
          category: 'Urgency',
          detail: 'Suspicious urgency in message',
          severity: 0.8,
        },
      ],
    };

    createAnalysisUI(results, mockProvider, mockProviders, defaultStatus);

    const factor = document.querySelector('.factor');
    expect(factor).toBeTruthy();
    expect(factor.querySelector('.factor-title').textContent).toBe('Urgency');
    expect(factor.querySelector('.factor-detail').textContent).toBe(
      'Suspicious urgency in message'
    );
  });

  test('should handle details toggle interaction', () => {
    const results = {
      riskLevel: 'medium',
      confidenceScore: 0.8,
    };

    createAnalysisUI(results, mockProvider, mockProviders, defaultStatus);

    const banner = document.querySelector('.security-analysis');
    const toggle = banner.querySelector('.details-toggle');

    toggle.click();
    expect(banner.classList.contains('expanded')).toBe(true);

    toggle.click();
    expect(banner.classList.contains('expanded')).toBe(false);
  });

  test('should handle settings toggle interaction', () => {
    const results = {
      riskLevel: 'low',
      confidenceScore: 0.9,
    };

    createAnalysisUI(results, mockProvider, mockProviders, defaultStatus);

    const banner = document.querySelector('.security-analysis');
    const toggle = banner.querySelector('.settings-toggle');
    const panel = banner.querySelector('.settings-panel');

    toggle.click();
    expect(panel.style.display).toBe('block');

    toggle.click();
    expect(panel.style.display).toBe('none');
  });

  test('should fallback to container insertion', () => {
    const results = {
      riskLevel: 'low',
      confidenceScore: 0.9,
    };

    createAnalysisUI(results, mockProvider, mockProviders, defaultStatus);

    const banner = document.querySelector('.security-analysis');
    expect(banner).toBeTruthy();
    expect(banner.parentElement.className).toBe('mock-container');
  });

  test('should handle error state', () => {
    const results = {
      riskLevel: 'error',
      confidenceScore: 0,
    };
    const errorStatus = {
      ...defaultStatus,
      error: 'Failed to analyze email',
      stage: 'error',
    };

    createAnalysisUI(results, mockProvider, mockProviders, errorStatus);

    const banner = document.querySelector('.security-analysis');
    expect(banner.classList.contains('risk-error')).toBe(true);
    const error = banner.querySelector('.error');
    expect(error).toBeTruthy();
    expect(error.textContent).toBe('Failed to analyze email');
  });

  test('should handle different risk levels', () => {
    const riskLevels = ['low', 'medium', 'high'];

    riskLevels.forEach((level) => {
      document.body.innerHTML = '';
      container = document.createElement('div');
      container.className = 'mock-container';
      document.body.appendChild(container);

      const results = {
        riskLevel: level,
        confidenceScore: 0.9,
      };

      createAnalysisUI(results, mockProvider, mockProviders, defaultStatus);

      const banner = document.querySelector('.security-analysis');
      expect(banner.classList.contains(`risk-${level}`)).toBe(true);
    });
  });

  test('should handle empty risk factors', () => {
    const results = {
      riskLevel: 'low',
      confidenceScore: 0.9,
      riskFactors: [],
    };

    createAnalysisUI(results, mockProvider, mockProviders, defaultStatus);

    const factors = document.querySelector('.risk-factors');
    expect(factors).toBeFalsy();
  });

  test('should handle missing or incomplete finalAssessment', () => {
    const results = {
      riskLevel: 'low',
      confidenceScore: 0.9,
    };

    createAnalysisUI(results, mockProvider, mockProviders, defaultStatus);

    const summary = document.querySelector('.summary');
    expect(summary).toBeFalsy();
  });
});

describe('Loading State', () => {
  let container;
  const mockProvider = 'gmail';
  const mockProviders = {
    gmail: {
      container: '.mock-container',
    },
  };

  beforeEach(() => {
    container = document.createElement('div');
    container.className = 'mock-container';
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  test('should show loading state', () => {
    showLoadingState(mockProvider, mockProviders);

    const loading = document.querySelector('.security-analysis.is-loading');
    expect(loading).toBeTruthy();
    expect(loading.querySelector('.loading-indicator')).toBeTruthy();
    expect(loading.querySelector('.status-message').textContent).toBe(
      'Analyzing email security...'
    );
  });
});
