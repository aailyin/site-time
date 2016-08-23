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

    let date = new Date();
    let day = date.getDate();
    let month = date.getMonth();
    let year = date.getFullYear();
    let currentDate = `${month}/${day}/${year}`;

    if (savedSiteTimeObj && savedSiteTimeObj.total) {
      
      if (savedSiteTimeObj.date === currentDate) {
        total = parseInt(savedSiteTimeObj.total, 10) + time;
      } else {
        total = time;
      }
      
      console.debug('Tab was found: ' + total);
    } else {
      total = time;
      console.debug('Tab wasn\'t found: ' + total);
    }

    storageObj[tabId] = {
      total: total,
      date: currentDate
    };
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
  console.log('GET TIME FROM BACKGROUND!');

  if (!tabId) {
    res(null);
    return;
  }

  chrome.storage.local.get(tabId, function (savedTime) {
    savedTime[tabId].siteName = tabId;
    res(savedTime[tabId]);
  });
}

// Set listener.
chrome.runtime.onMessage.addListener(listener);