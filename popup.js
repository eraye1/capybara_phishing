document.addEventListener('DOMContentLoaded', async () => {
  // Get current tab to communicate with content script
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  console.log('Current tab:', tab?.url);
  
  if (tab?.url?.includes('mail.google.com') || tab?.url?.includes('hotmail.com')) {
    console.log('On supported email site, sending GET_STATUS');
    // Get status from content script
    chrome.tabs.sendMessage(tab.id, { type: 'GET_STATUS' }, (response) => {
      console.log('Received status response:', response);
      updateStatusDisplay(response || { isLoaded: false, analyzing: 0 });
    });

    // Setup button listeners
    document.getElementById('updateModel').addEventListener('click', async () => {
      chrome.tabs.sendMessage(tab.id, { type: 'UPDATE_MODEL' }, (response) => {
        updateStatusDisplay(response || { isLoaded: false, analyzing: 0 });
      });
    });

    document.getElementById('clearCache').addEventListener('click', async () => {
      chrome.tabs.sendMessage(tab.id, { type: 'CLEAR_CACHE' }, (response) => {
        updateStatusDisplay(response || { isLoaded: false, analyzing: 0 });
      });
    });
  } else {
    updateStatusDisplay({ isLoaded: false, analyzing: 0, error: 'Not on supported email site' });
  }
});

function updateStatusDisplay(status) {
  const statusText = document.querySelector('.status p');
  if (status.error) {
    statusText.textContent = `Status: ${status.error}`;
  } else {
    statusText.textContent = status.isLoaded ? 
      `Status: Active | Analyzed: ${status.analyzing} emails` :
      'Status: Model Loading...';
  }
} 