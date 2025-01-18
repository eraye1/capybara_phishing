export const PROVIDERS = {
  GMAIL: {
    container: '.adn.ads',
    subject: '.hP',
    body: '.a3s',
    attachments: '.aZo, .aQH'
  },
  HOTMAIL: {
    container: '.ReadMsgBody',
    subject: '.subject',
    body: '.message-body',
    attachments: '.AttachmentTileGrid'
  }
};

export function detectProvider() {
  const hostname = window.location.hostname;
  if (hostname.includes('mail.google.com')) return 'GMAIL';
  if (hostname.includes('hotmail.com')) return 'HOTMAIL';
  return null;
}

export function extractEmailContent(provider) {
  const selectors = PROVIDERS[provider];
  return {
    subject: document.querySelector(selectors.subject)?.textContent || '',
    body: document.querySelector(selectors.body)?.textContent || '',
    attachments: Array.from(document.querySelectorAll(selectors.attachments)).map(el => ({
      name: el.getAttribute('data-name'),
      type: el.getAttribute('data-type'),
      size: el.getAttribute('data-size')
    }))
  };
} 