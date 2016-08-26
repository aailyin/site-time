const currentTab = location.origin;
const ADD_TIME = 'ADD_TIME';
const GET_TIME = 'GET_TIME';

let intervalId = null;

chrome.runtime.onMessage.addListener(listener);

/**
* Background listener for all tabs.
*
* @param {Object} req Request object that has format {action: String, {data: *} }
* @param {Object} sender Sender of request.
* @param {Function} res Callback function.
*/
function listener(req, sender, res) {
  console.debug('content.js:listener()');
  console.debug('req:');
  console.debug(req);

  let action = req.action;

  switch (action) {
    case GET_TIME:
      getTime(res);
      return true;
    default:
      return false;
  }
}

/**
* Get time that user wasted on the site.
* @param {Function} res Callback function.
*/
function getTime(res) {
  console.debug('content.js:getTime()');

  chrome.runtime.sendMessage({
      action: GET_TIME, 
      data: {
        tabId: currentTab
      }
    }, function (data) {
      if (chrome.runtime.lastError) {
        res(null);
      } else {
        res(data);
      }
    });
}

/**
* Count time main function.
*/
function countTime() {
  chrome.runtime.sendMessage({
      action: ADD_TIME, 
      data: {
        tabId: currentTab,
        time: 60000
      }
    }, function (data) {
      if (chrome.runtime.lastError) {
        console.error('Counted time has not been saved for: ' + currentTab);
      } else {
        console.log(data);
      }
    });
}

// Window events---------------------------------------
// The current tab is inactive so we need to remove timeout.
window.onblur = function () {
  clearInterval(intervalId);
  intervalId = null;
};

window.onfocus = function () {
  if (intervalId) {
    clearIntervel(intervalId);
  }
  intervalId = setInterval(countTime, 60000);
};

intervalId = setInterval(countTime, 60000);