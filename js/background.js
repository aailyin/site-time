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

  console.log('Got message!');
  console.log(req);

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
* @param {Function} res Callback function.
*/
function addTime(tabId, time, res) {
  let response = {
    action: ADD_TIME,
    data: null
  };

  tabId = encodeURI(tabId);

  if (!tabId) {
    res({responseData: 'Not Saved!'});
    return;
  }

  chrome.storage.local.get(tabId, function (savedTime) {
    let total = 0;
    let storageObj = {};

    //check error in app
    //if(chrome.runtime.lastError)

    if(savedTime[tabId]) {
      total = parseInt(savedTime[tabId], 10) + time;
      console.debug('Tab was found: ' + total);
    } else {
      total = time;
      console.debug('Tab wasn\'t found: ' + total);
    }

    storageObj[tabId] = total;

    chrome.storage.local.set(storageObj, function () {
      
      //check error in app
      //if(chrome.runtime.lastError)

      res({responseData: 'Saved!'});
    });
  });
}

/**
* Get time that user wasted on the site.
* 
* @param {String} tabId Site name that is used as id.
* @param {Function} callback
*/
// TODO: change based on addTime
function getTime(tabId, res) {
  let response = {
    action: GET_TIME,
    data: null
  };

  if (!tabId) {
    res(response);
    return;
  }

  chrome.storage.sync.get(tabId, function (savedTime) {
    response.data = parseInt(savedTime[tabId], 10);
    res(response);
  });
}

// Set listener.
chrome.runtime.onMessage.addListener(listener);