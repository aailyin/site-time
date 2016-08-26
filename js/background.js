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
    let storageObj = {};
    let currentDate = getDate();

    if (savedSiteTimeObj && savedSiteTimeObj.total) {
      if (savedSiteTimeObj.date === currentDate) {
        total = parseInt(savedSiteTimeObj.total, 10) + time;
      } else {
        total = time;
      }
    } else {
      total = time;
    }

    storageObj[tabId] = {
      total: total,
      date: currentDate
    };
    console.debug('background.js:addTime()');
    console.debug('object to save/update');
    console.debug(storageObj);

    chrome.storage.local.set(storageObj, function () {
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
function getTime(tabId, res) {
  console.debug('background.js:getTime()');
  console.debug('tabId:');
  console.debug(tabId);

  if (!tabId) {
    res(null);
    return;
  }

  chrome.storage.local.get(tabId, function (savedTime) {
    savedTime[tabId].siteName = tabId;
    res(savedTime[tabId]);
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
