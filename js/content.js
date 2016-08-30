const currentTab = location.origin;
const ADD_TIME = 'ADD_TIME';
const GET_TIME = 'GET_TIME';
const TIME = 60000;

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
        time: TIME
      }
    }, function (data) {
      if (chrome.runtime.lastError) {
        console.error('Counted time has not been saved for: ' + currentTab);
      } else {
        console.log(data);
      }
    });
}

chrome.tabs.onActivated.addListener(function (tabId, windowId) {
  chrome.tabs.getCurrent(function (tabInfo){
    console.debug('The active tab was changed! I\'m ' + currentTab);

    if (tabInfo.id === tabId) {
      console.debug('New tab is me! Set interval!');
      intervalId = setInterval(countTime, TIME);
    } else {
      console.debug('New tab is not me! Clear interval!');

      clearInterval(intervalId);
      intervalId = null;
    }
  });
});

intervalId = setInterval(countTime, TIME);
