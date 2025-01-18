import { detectProvider, extractEmailContent, PROVIDERS } from '../../../src/content/providers';

describe('Email Provider Detection', () => {
  beforeEach(() => {
    window.location = {
      hostname: '',
      href: 'http://example.com',
    };
  });

  test('should detect Gmail provider', () => {
    window.location.hostname = 'mail.google.com';
    expect(detectProvider()).toBe('GMAIL');
  });

  test('should detect Hotmail provider', () => {
    window.location.hostname = 'hotmail.com';
    expect(detectProvider()).toBe('HOTMAIL');
  });

  test('should return null for unsupported providers', () => {
    window.location.hostname = 'unknown.com';
    expect(detectProvider()).toBeNull();
  });
});

describe('Email Content Extraction', () => {
  beforeEach(() => {
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

  test('should extract Gmail email content correctly', () => {
    const emailContent = extractEmailContent('GMAIL');
    expect(emailContent).toMatchObject({
      subject: 'Test Subject',
      body: 'Test Body Content',
      attachments: [
        {
          name: 'test.pdf',
          type: 'application/pdf',
          size: '1024',
        },
      ],
    });
  });

  test('should handle missing content gracefully', () => {
    document.body.innerHTML = '<div class="adn ads"></div>';
    const emailContent = extractEmailContent('GMAIL');
    expect(emailContent).toMatchObject({
      subject: '',
      body: '',
      attachments: [],
    });
  });

  test('should handle invalid provider', () => {
    expect(() => extractEmailContent('INVALID')).toThrow();
  });
});
