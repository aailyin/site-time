// Background js file to count and save time

const ADD_TIME = 'ADD_TIME';
const GET_TIME = 'GET_TIME';
/**
* Background listener for all tabs.
*
* @param {Object} req Request object that has format {action: String, {data: *} }
* @param {Object} sender Sender of request.
* @param {Function} res Callback function.
*/
function listener(req, sender, res) {
  let action = req.action;
  let data = req.data;

  switch (action) {
    case ADD_TIME:
      addTime(data.tabId, data.time, res);
      break;
    case GET_TIME: 
      getTime(data.tabId, res);
      break;
    default:
      break;
  }
}

/**
* Add time that user wasted on the site.
* 
* @param {String} tabId Site name that is used as id.
* @param {Number} time Time value.
* @param {Function} callback
*/
function addTime(tabId, time, callback) {
  let response = {
    action: ADD_TIME,
    data: null
  };

  if (!tabId) {
    res(response);
    return;
  }

  chrome.storage.sync.get(tabId, (savedTime) => {
    let total = parseInt(savedTime[tabId], 10) + time;

    chrome.storage.sync.set({tabId: total}, (result) => {
      response.data = result[tabId];
      res(response);
    });
  });
}

/**
* Get time that user wasted on the site.
* 
* @param {String} tabId Site name that is used as id.
* @param {Function} callback
*/
function getTime(tabId, res) {
  let response = {
    action: GET_TIME,
    data: null
  };

  if (!tabId) {
    res(response);
    return;
  }

  chrome.storage.sync.get(tabId, (savedTime) => {
    response.data = parseInt(savedTime[tabId], 10);
    res(response);
  });
}

// Set listener.
chrome.runtime.onMessage.addListener(listener);