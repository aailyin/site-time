const currentTab = location.origin;
const ADD_TIME = 'ADD_TIME';
const GET_TIME = 'GET_TIME';

let intervalId = null;

// The current tab is inactive so we need to remove timeout
window.onblur = function () {
  clearInterval(intervalId);
  intervalId = null;
};

window.onfocus = function () {
  if (intervalId) {
    clearIntervel(intervalId);
  }
  intervalId = setInterval(countTime, 3000);
};

function countTime() {
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
}

setInterval(countTime, 3000);