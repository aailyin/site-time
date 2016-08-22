const currentTab = location.origin;
const ADD_TIME = 'ADD_TIME';
const GET_TIME = 'GET_TIME';

let timeoutId = null;

// The current tab is inactive so we need to remove timeout
window.onblur = function () {
  clearTimeout(timeoutId);
  timeoutId = null;
};

window.onfocus = function () {
  if (timeoutId) {
    clearTimeout(timeoutId);
  }
  timeoutId = setTimeout(function () {
    chrome.runtime.sendMessage({
      action: ADD_TIME, 
      data: {
        tabId: currentTab,
        time: 60000
      }
    }, function (data) {
      // data was sent
      console.log(data);
    });
  }, 60000);
};