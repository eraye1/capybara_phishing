function updateUI(status) {
  const statusElement = document.querySelector('.status p');
  if (status.error) {
    statusElement.textContent = `Status: ${status.error}`;
  } else {
    statusElement.textContent = status.isLoaded
      ? `Status: Active | Analyzed: ${status.analyzing} emails`
      : 'Status: Model Loading...';
  }
}

// Get status from content script
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  if (!tabs[0]?.id) return;

  chrome.runtime.sendMessage({ type: 'GET_STATUS' }, (response) => {
    if (response) {
      updateUI(response);
    }
  });
});
