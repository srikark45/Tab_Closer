document.addEventListener('DOMContentLoaded', function() {
    const saveButton = document.getElementById('saveButton');
    const toggleSwitch = document.getElementById('toggleSwitch');
    const closingTimeInput = document.getElementById('closingTime');
  
    chrome.storage.local.get(['closingTime'], function(result) {
      const savedClosingTime = result.closingTime;
      if (savedClosingTime) {
        closingTimeInput.value = savedClosingTime;
      }
    });
  
    saveButton.addEventListener('click', function() {
      const closingTime = parseInt(closingTimeInput.value, 10);
  
      chrome.runtime.sendMessage({ action: 'saveClosingTime', closingTime: closingTime }, function(response) {
        if (response && response.success) {
          chrome.runtime.sendMessage({ action: 'reloadBackground' });
          window.close();
        } else {
          console.error('Error saving closing time.');
        }
      });
    });
  
    toggleSwitch.addEventListener('change', function() {
      const isChecked = toggleSwitch.checked;
      chrome.runtime.sendMessage({ action: 'toggleTabClosing', enabled: isChecked });
    });
  });
  