import { detectProvider, extractEmailContent, PROVIDERS } from '../../../src/content/providers';

describe('Email Provider Detection', () => {
  beforeEach(() => {
    // Setup DOM
    document.body.innerHTML = `
      <div class="adn ads">
        <div class="hP">Test Subject</div>
        <div class="a3s">Test Body Content</div>
        <div class="aZo" data-name="test.pdf" data-type="application/pdf" data-size="1024">
          <div class="aV3">test.pdf</div>
        </div>
      </div>
    `;
  });

  test('should detect Gmail provider', () => {
    window.location.hostname = 'mail.google.com';
    expect(detectProvider()).toBe('GMAIL');
  });

  // ... other provider tests ...

  test('should extract email content correctly', () => {
    const emailContent = extractEmailContent('GMAIL');
    expect(emailContent).toMatchObject({
      subject: 'Test Subject',
      body: 'Test Body Content',
      attachments: [{
        name: 'test.pdf',
        type: 'application/pdf',
        size: '1024'
      }]
    });
  });
}); 