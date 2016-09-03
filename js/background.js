const ADD_TIME = 'ADD_TIME';
const GET_TIME = 'GET_TIME';
const SAVE_TAB_ID = 'SAVE_TAB_ID';
const CHECK_TAB_INTERVAL = 'CHECK_TAB_INTERVAL';
const GET_STATISTICS = 'GET_STATISTICS';

//---------------------------------------------------------------
// Listeners
//---------------------------------------------------------------
chrome.runtime.onMessage.addListener(listener);

chrome.extension.onMessage.addListener(function (req, sender, res) {
  if (req.action === GET_STATISTICS) {
    chrome.storage.local.get(null, function (data) {
      console.debug('background.js:Get all statistics. Data is:');
      console.debug(data);

      res(data);
    });
  }
});


chrome.runtime.onInstalled.addListener(function() {
  chrome.storage.local.clear(function () {
    console.debug('chrome storage was cleared on install.');
  });
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  console.debug('background.js:Tab was updated: ' + tab.url);

  chrome.tabs.sendMessage(tab.id, {
      action: SAVE_TAB_ID,
      tabId: tab.id
    }, function (resp) {
      console.debug('background.js:Tab id was saved for: ' + tab.url);
    });
});

chrome.tabs.onActivated.addListener(function (activeInfo) {
  console.debug('background.js:Tab was activated: ' + activeInfo.tabId);
  
  chrome.tabs.query({}, function(tabs) {
    tabs.forEach(function (tab) {
      let tabId = tab.id;
      chrome.tabs.sendMessage(tabId, {
        action: CHECK_TAB_INTERVAL,
        newTabId: activeInfo.tabId
      }, function (resp) {
        console.debug('Interval was checked for : ' + tabId);
        if(resp) {
          console.debug('Message is: ' + resp.message);
        }
      });
    });
  });
});

//--------------------------------------------------------------
// Methods
//--------------------------------------------------------------

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
        storageObj[tabId].total  = parseInt(savedSiteTimeObj.total, 10) + time;
        saveTime(storageObj, res);
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
