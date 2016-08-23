const currentTab = location.origin;
const ADD_TIME = 'ADD_TIME';
const GET_TIME = 'GET_TIME';

let intervalId = null;

// The current tab is inactive so we need to remove timeout
window.onblur = function () {
  console.log('Window is NOT active.');
  clearInterval(intervalId);
  intervalId = null;
};

window.onfocus = function () {
  console.log('Window is active.');
  if (intervalId) {
    clearIntervel(intervalId);
  }
  intervalId = setInterval(countTime, 60000);
};


chrome.runtime.onMessage.addListener(listener);

/**
* Background listener for all tabs.
*
* @param {Object} req Request object that has format {action: String, {data: *} }
* @param {Object} sender Sender of request.
* @param {Function} res Callback function.
*/
function listener(req, sender, res) {
  let action = req.action;

  switch (action) {
    case GET_TIME: 
      console.log('GET TIME FROM CONTENT!');
      getTime(res);
      return true;
    default:
      return false;
  }
}

// TODO: update
/**
* Get time that user wasted on the site.
* 
* @param {Object} data Site name that is used as id.
* @param {Function} callback
*/
function getTime(res) {
  console.log('GET TIME FROM BACKGROUND!');

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

// TODO: comments
function countTime() {
  chrome.runtime.sendMessage({
      action: ADD_TIME, 
      data: {
        tabId: currentTab,
        time: 60000
      }
    }, function (data) {
      if (chrome.runtime.lastError) {
        console.error('Counted time has not been saved!');
      } else {
        console.log(data);
      }
    });
}

intervalId = setInterval(countTime, 60000);