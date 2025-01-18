export function createAnalysisUI(results, provider, PROVIDERS) {
  const container = document.querySelector(PROVIDERS[provider].container);
  if (!container) return;

  // Clean up any existing analysis
  const existingBanner = container.querySelector('.security-analysis');
  if (existingBanner) existingBanner.remove();

  // Create main container
  const analysis = document.createElement('div');
  analysis.className = `security-analysis risk-${results.riskLevel}`;

  // Create banner content
  analysis.innerHTML = `
    <div class="banner-wrapper">
      <div class="banner-content">
        <div class="primary-info">
          ${getStatusIcon(results.riskLevel)}
          <span class="status-message">${getRiskLevelText(results.riskLevel)}</span>
          <span class="confidence">${Math.round(results.confidenceScore * 100)}% confidence</span>
        </div>
        <button class="details-toggle" aria-expanded="false">
          <span>Details</span>
          <svg viewBox="0 0 24 24" width="18" height="18">
            <path d="M7 10l5 5 5-5z" fill="currentColor"/>
          </svg>
        </button>
      </div>
    </div>
    <div class="details-panel">
      <div class="details-content">
        ${
          results.finalAssessment?.summary
            ? `
          <p class="summary">${results.finalAssessment.summary}</p>
        `
            : ''
        }
        ${
          results.riskFactors?.length > 0
            ? `
          <div class="risk-factors">
            ${results.riskFactors
              .map(
                (factor) => `
              <div class="factor">
                <div class="factor-header">
                  <span class="factor-title">${factor.category}</span>
                  <span class="factor-severity">
                    Impact: ${Math.round(factor.severity * 100)}%
                  </span>
                </div>
                <p class="factor-detail">${factor.detail}</p>
              </div>
            `
              )
              .join('')}
          </div>
        `
            : ''
        }
      </div>
    </div>
  `;

  // Find the best insertion point
  let insertionPoint = null;

  // Try different possible selectors in order of preference
  const selectors = [
    '.ha', // Gmail header area
    '.hP', // Subject line
    '.aeF', // Email content wrapper
    '.adn.ads', // Email body container
    '.gs', // General email section
  ];

  for (const selector of selectors) {
    const element = container.querySelector(selector);
    if (element) {
      // Found a valid insertion point
      insertionPoint = element;
      while (insertionPoint && !insertionPoint.parentElement?.classList.contains('adn')) {
        insertionPoint = insertionPoint.parentElement;
      }
      break;
    }
  }

  // Insert the banner
  if (insertionPoint && insertionPoint.parentElement) {
    insertionPoint.parentElement.insertBefore(analysis, insertionPoint.nextSibling);
  } else {
    // Fallback to inserting at the top of the container
    container.insertBefore(analysis, container.firstChild);
  }

  // Add click handler for details toggle
  const toggle = analysis.querySelector('.details-toggle');
  if (toggle) {
    toggle.addEventListener('click', () => {
      const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', !isExpanded);
      analysis.classList.toggle('expanded');
    });
  }

  // Add styles
  if (!document.getElementById('security-analysis-styles')) {
    const styles = document.createElement('style');
    styles.id = 'security-analysis-styles';
    styles.textContent = `
      .security-analysis {
        --success-color: #188038;
        --warning-color: #F29900;
        --danger-color: #D93025;
        --surface-color: #FFF;
        --border-color: #E8EAED;
        
        width: 100%;
        font-family: 'Google Sans', Roboto, sans-serif;
      }

      .banner-wrapper {
        padding: 0 16px;
        margin: 16px 0;
      }

      .banner-content {
        background: var(--surface-color);
        border: 1px solid var(--border-color);
        border-radius: 8px;
        padding: 12px 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        min-height: 48px;
      }

      .primary-info {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .status-icon {
        flex-shrink: 0;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .status-icon .icon-base {
        fill: currentColor;
        opacity: 0.12;
      }

      .status-icon .icon-symbol {
        fill: currentColor;
      }

      .status-message {
        font-size: 14px;
        font-weight: 500;
        color: currentColor;
      }

      .confidence {
        font-size: 13px;
        color: #5F6368;
        padding: 4px 8px;
        background: #F1F3F4;
        border-radius: 12px;
      }

      .details-toggle {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 8px 12px;
        border: none;
        border-radius: 4px;
        background: transparent;
        color: #5F6368;
        font-family: inherit;
        font-size: 13px;
        cursor: pointer;
        transition: background 0.2s;
      }

      .details-panel {
        padding: 0 16px;
        margin-top: -8px;
        overflow: hidden;
        max-height: 0;
        opacity: 0;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .expanded .details-panel {
        max-height: 2000px;
        opacity: 1;
        margin-bottom: 16px;
      }

      .details-content {
        background: var(--surface-color);
        border: 1px solid var(--border-color);
        border-radius: 8px;
        padding: 16px;
      }

      .summary {
        font-size: 14px;
        line-height: 1.5;
        color: #202124;
        margin: 16px 0;
      }

      .risk-factors {
        display: grid;
        gap: 12px;
      }

      .factor {
        background: #F8F9FA;
        border-radius: 8px;
        padding: 12px;
      }

      .factor-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
      }

      .factor-title {
        font-size: 13px;
        font-weight: 500;
        color: #202124;
      }

      .factor-severity {
        font-size: 12px;
        padding: 2px 8px;
        border-radius: 12px;
        background: rgba(0,0,0,0.05);
        color: ${results.riskLevel === 'high' ? 'var(--danger-color)' : '#5F6368'};
      }

      .factor-detail {
        font-size: 13px;
        line-height: 1.5;
        color: #5F6368;
        margin: 0;
      }

      .risk-low {
        color: var(--success-color);
      }

      .risk-medium {
        color: var(--warning-color);
      }

      .risk-high {
        color: var(--danger-color);
      }

      .risk-low .status-icon {
        color: var(--success-color);
      }

      .risk-medium .status-icon {
        color: var(--warning-color);
      }

      .risk-high .status-icon {
        color: var(--danger-color);
      }

      .status-icon.loading {
        animation: rotate 1.5s linear infinite;
      }

      .status-icon .spinner-track {
        stroke: currentColor;
        opacity: 0.2;
      }

      .status-icon .spinner {
        stroke: currentColor;
        stroke-dasharray: 60;
        stroke-dashoffset: 120;
        animation: dash 1.5s ease-in-out infinite;
      }

      @keyframes rotate {
        100% {
          transform: rotate(360deg);
        }
      }

      @keyframes dash {
        0% {
          stroke-dashoffset: 120;
        }
        50% {
          stroke-dashoffset: 30;
        }
        100% {
          stroke-dashoffset: 120;
        }
      }

      @keyframes pulse {
        0% {
          opacity: 0;
          transform: scale(0.95);
        }
        50% {
          opacity: 0.15;
          transform: scale(1);
        }
        100% {
          opacity: 0;
          transform: scale(0.95);
        }
      }

      @media (max-width: 768px) {
        .banner-content {
          flex-direction: column;
          align-items: flex-start;
          gap: 8px;
        }

        .details-toggle {
          width: 100%;
          justify-content: space-between;
        }
      }
    `;
    document.head.appendChild(styles);
  }
}

function getRiskLevelText(level) {
  switch (level) {
    case 'low':
      return 'This email appears to be safe';
    case 'medium':
      return 'Use caution with this email';
    case 'high':
      return 'Warning: This email appears suspicious';
    default:
      return 'Email analysis complete';
  }
}

export function showLoadingState(provider, PROVIDERS) {
  const container = document.querySelector(PROVIDERS[provider].container);
  if (!container) return;

  const analysis = document.createElement('div');
  analysis.className = 'security-analysis is-loading';
  analysis.innerHTML = `
    <div class="banner-wrapper">
      <div class="banner-content">
        <div class="primary-info">
          <div class="loading-indicator"></div>
          <span class="status-message">Analyzing email security...</span>
        </div>
      </div>
    </div>
  `;

  // Use same insertion point finding logic
  let insertionPoint = null;
  const selectors = ['.ha', '.hP', '.aeF', '.adn.ads', '.gs'];

  for (const selector of selectors) {
    const element = container.querySelector(selector);
    if (element) {
      insertionPoint = element;
      while (insertionPoint && !insertionPoint.parentElement?.classList.contains('adn')) {
        insertionPoint = insertionPoint.parentElement;
      }
      break;
    }
  }

  if (insertionPoint && insertionPoint.parentElement) {
    insertionPoint.parentElement.insertBefore(analysis, insertionPoint.nextSibling);
  } else {
    container.insertBefore(analysis, container.firstChild);
  }

  return analysis;
}

function getStatusIcon(riskLevel) {
  const icons = {
    low: `
      <svg viewBox="0 0 24 24" width="24" height="24" class="status-icon">
        <path class="icon-base" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
        <path class="icon-symbol" d="M10 17l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
      </svg>
    `,
    medium: `
      <svg viewBox="0 0 24 24" width="24" height="24" class="status-icon">
        <path class="icon-base" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
        <path class="icon-symbol" d="M12 13c.55 0 1-.45 1-1V8c0-.55-.45-1-1-1s-1 .45-1 1v4c0 .55.45 1 1 1zm0 4c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1z"/>
      </svg>
    `,
    high: `
      <svg viewBox="0 0 24 24" width="24" height="24" class="status-icon">
        <path class="icon-base" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
        <path class="icon-symbol" d="M13 17h-2v-2h2v2zm0-4h-2V7h2v6z"/>
      </svg>
    `,
    loading: `
      <svg viewBox="0 0 24 24" width="24" height="24" class="status-icon loading">
        <circle class="spinner-track" cx="12" cy="12" r="10" stroke-width="2" fill="none"/>
        <circle class="spinner" cx="12" cy="12" r="10" stroke-width="2" fill="none"/>
      </svg>
    `,
  };

  return icons[riskLevel] || icons.loading;
}
