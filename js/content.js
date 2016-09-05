const currentTab = location.origin;
const ADD_TIME = 'ADD_TIME';
const GET_TIME = 'GET_TIME';
const CHECK_TAB_INTERVAL = 'CHECK_TAB_INTERVAL';
const SAVE_TAB_ID = 'SAVE_TAB_ID';
const TIME = 10000;

let intervalId = null;
let currentTabId = null;

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
    case CHECK_TAB_INTERVAL:
      checkTabInterval(req, res);
      return true;
    case SAVE_TAB_ID:
      saveTabId(req, res);
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
    }, (data) => {
      if (chrome.runtime.lastError) {
        res(null);
      } else {
        res(data);
      }
    });
}

/**
* Check if interval should be cleared or created.
*
* @param {Object} req Request object.
* @param {Function} res Callback function.
*/
function checkTabInterval(req, res) {
  console.debug('content.js:checkTabInterval()');
  console.debug('newTabId is ' + req.newTabId + ', currentTabId is' + currentTabId);

  let tabId = req.newTabId;
  if (tabId === currentTabId) {
    console.debug(`Interval was set for tab ${currentTabId}!`);

    if (intervalId === null) {
      intervalId = setInterval(countTime, TIME);
    }
    res({data: true, message: `Interval was set for tab ${currentTabId}!`});
  } else {
    console.debug(`Interval was stopped for tab ${currentTabId}!`);

    clearInterval(intervalId);
    intervalId = null;
    res({data: true, message: `Interval was stopped for tab ${currentTabId}!`});
  }
}

/**
* Save tab id for new created tab.
*
* @param {Object} req Request object.
* @param {Function} res Callback function.
*/
function saveTabId(req, res) {
  console.debug('content.js:saveTabid()');
  console.debug('TabId is ' + req.tabId);

  if(req.tabId) {
    currentTabId = req.tabId;
    res({data: true});
  } else {
    res({data: false});
  }

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
    }, (data) => {
      if (chrome.runtime.lastError) {
        console.error('Counted time has not been saved for: ' + currentTab);
      } else {
        console.log(data);
      }
    });
}

intervalId = setInterval(countTime, TIME);
