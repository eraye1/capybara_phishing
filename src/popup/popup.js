(() => {
  function e(e) {
    const t = document.querySelector('.status p');
    e.error
      ? (t.textContent = `Status: ${e.error}`)
      : (t.textContent = e.isLoaded
          ? `Status: Active | Analyzed: ${e.analyzing} emails`
          : 'Status: Model Loading...');
  }
  document.addEventListener('DOMContentLoaded', async () => {
    const [t] = await chrome.tabs.query({ active: !0, currentWindow: !0 });
    console.log('Current tab:', t?.url),
      t?.url?.includes('mail.google.com') || t?.url?.includes('hotmail.com')
        ? (console.log('On supported email site, sending GET_STATUS'),
          chrome.tabs.sendMessage(t.id, { type: 'GET_STATUS' }, (t) => {
            console.log('Received status response:', t), e(t || { isLoaded: !1, analyzing: 0 });
          }),
          document.getElementById('updateModel').addEventListener('click', async () => {
            chrome.tabs.sendMessage(t.id, { type: 'UPDATE_MODEL' }, (t) => {
              e(t || { isLoaded: !1, analyzing: 0 });
            });
          }),
          document.getElementById('clearCache').addEventListener('click', async () => {
            chrome.tabs.sendMessage(t.id, { type: 'CLEAR_CACHE' }, (t) => {
              e(t || { isLoaded: !1, analyzing: 0 });
            });
          }))
        : e({ isLoaded: !1, analyzing: 0, error: 'Not on supported email site' });
  });
})();
