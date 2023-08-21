let tabClosingEnabled = true;
let closingTime = 1440; // Default closing time in minutes (24 hours)
let tabLastActive = {}; // Stores the last accessed timestamp for each tab

chrome.runtime.onInstalled.addListener(function() {
  loadClosingTime();
  enableTabClosing();
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'saveClosingTime') {
    const newClosingTime = request.closingTime;
    saveClosingTime(newClosingTime);
    sendResponse({ success: true });
  } else if (request.action === 'toggleTabClosing') {
    toggleTabClosing();
  } else if (request.action === 'reloadBackground') {
    reloadBackgroundScript();
  }
});

function saveClosingTime(newClosingTime) {
  closingTime = newClosingTime;
  chrome.storage.local.set({ 'closingTime': closingTime });
}

function loadClosingTime() {
  chrome.storage.local.get(['closingTime'], function(result) {
    closingTime = result.closingTime || 1440; // Default to 1440 minutes (24 hours)
  });
}

function toggleTabClosing() {
  tabClosingEnabled = !tabClosingEnabled;

  if (tabClosingEnabled) {
    enableTabClosing();
  } else {
    clearInterval(tabClosingInterval);
  }
}

function enableTabClosing() {
  closeUnusedTabs();
  tabClosingInterval = setInterval(closeUnusedTabs, 10000); // Check every 10 seconds
}

function reloadBackgroundScript() {
  closeUnusedTabs();
}

function closeUnusedTabs() {
  const currentTime = Date.now();
  chrome.tabs.query({}, function(tabs) {
    tabs.forEach(function(tab) {
      if (isURLAccessible(tab.url)) {
        const tabId = tab.id;
        const lastActive = tabLastActive[tabId];
        if (lastActive && (currentTime - lastActive) >= closingTime * 60 * 1000) {
          chrome.tabs.remove(tabId);
        }
      }
    });
  });
}

function isURLAccessible(url) {
  return url.startsWith('http://') || url.startsWith('https://');
}

// Update tabLastActive when a tab becomes active or receives focus
chrome.tabs.onActivated.addListener(function(activeInfo) {
  const tabId = activeInfo.tabId;
  const currentTime = Date.now();
  tabLastActive[tabId] = currentTime;
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (changeInfo.status === 'complete') {
    const currentTime = Date.now();
    tabLastActive[tabId] = currentTime;
  }
});

// Execute the tab closing code on extension startup
closeUnusedTabs();
