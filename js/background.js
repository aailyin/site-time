const ADD_TIME = 'ADD_TIME';
const GET_TIME = 'GET_TIME';

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
  let data = req.data;

  console.debug('background.js:listener()');
  console.debug('req:');
  console.debug(req);

  switch (action) {
    case ADD_TIME:
      addTime(data.tabId, data.time, res);
      return true;
    case GET_TIME: 
      getTime(data.tabId, res);
      return true;
    default:
      return false;
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
    let savedSiteTimeObj = savedTime[tabId];

    let total = 0;
    let currentDate = getDate();
    let storageObj = {};

    storageObj[tabId] = {
      date: currentDate
    };

    if (savedSiteTimeObj && savedSiteTimeObj.total) {
      if (savedSiteTimeObj.date === currentDate) {
        total = parseInt(savedSiteTimeObj.total, 10) + time;
      } else {
        storageObj[tabId].total = time;
        
        // We have to clear all data of the previous date
        chrome.storage.local.clear(function () {
          console.debug('Storage was cleared.');
          saveTime(storageObj, res);
        });
      }
    } else {
      storageObj[tabId].total = time;
      saveTime(storageObj, res);
    }
  });
}

/**
* Save time in storage.
* @param {Object} storageObj Object to save.
* @param {Function} callback
*/
function saveTime(storageObj, callback) {
  console.debug('background.js:saveTime()');
  console.debug('object to save/update');
  console.debug(storageObj);

  chrome.storage.local.set(storageObj, function () {
    callback({responseData: 'Saved!'});
  });
}

/**
* Get time that user wasted on the site.
* 
* @param {String} tabId Site name that is used as id.
* @param {Function} callback
*/
function getTime(tabId, res) {
  console.debug('background.js:getTime()');
  console.debug('tabId:');
  console.debug(tabId);

  if (!tabId) {
    res(null);
    return;
  }

  chrome.storage.local.get(tabId, function (savedTime) {
    if (savedTime[tabId]) {
      savedTime[tabId].siteName = tabId;
      res(savedTime[tabId]);
    } else {
      res(null);
    }
    
  });
}

/**
* Get date in format mm/dd/yyyy.
* @return {String}
*/
function getDate() {
    let date = new Date();
    let day = date.getDate();
    let month = date.getMonth();
    let year = date.getFullYear();

    return `${month}/${day}/${year}`;
}

chrome.runtime.onInstalled.addListener(function() {
  chrome.storage.local.clear(function () {
    console.debug('chrome storage was cleared on install.');
  });
});
