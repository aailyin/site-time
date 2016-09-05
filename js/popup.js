const GET_STATISTICS = 'GET_STATISTICS';

document.addEventListener('DOMContentLoaded', () => {
  let mainWrapper = document.getElementById('site-name-wrapper');
  let allStatistics = document.getElementById('site-time-all-statistics');

  document.getElementById('show-all-statistics').addEventListener('click', (event) => {
    event.preventDefault();

    getAllStatistics(function (data) {
      if (data) {
        let keys = Object.keys(data);
        let html = '';
        keys.map((key) => {
          html += '<li>' +
                    '<div class="info">' +
                      '<p class="name">' + key + '</p>' +
                      '<span class="time">' + getWastedTime(data[key].total) + '</span>' +
                    '</div>' +
                  '</li>';
        });
        allStatistics.innerHTML = html;
        mainWrapper.className += ' has-info';
      }
    });
  });

  document.getElementById('hide-statistics').addEventListener('click', (event) => {
    event.preventDefault();
    getCurrentTabUrl((tab) => {
      getCurrentTabUrlRes(tab);
      mainWrapper.className = mainWrapper.className.replace('has-info', '');
    });
  });

  getCurrentTabUrl(getCurrentTabUrlRes);
});


/**
* Get all today statistics.
* @param {Function} callback Callback function.
*/
function getAllStatistics(callback) {
  chrome.extension.sendMessage({action: GET_STATISTICS}, (data) => {
    console.debug('popup.js:getAllStatistics() has been called.');
    console.debug('Data is:');
    console.debug(data);

    callback(data);
  });
}

/**
 * Get the current URL.
 *
 * @param {Function} callback - called when the URL of the current tab
 *   is found.
 */
function getCurrentTabUrl(callback) {
  // Query filter to be passed to chrome.tabs.query - see
  // https://developer.chrome.com/extensions/tabs#method-query
  let queryInfo = {
    active: true,
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, (tabs) => {
    // chrome.tabs.query invokes the callback with a list of tabs that match the
    // query. When the popup is opened, there is certainly a window and at least
    // one tab, so we can safely assume that |tabs| is a non-empty array.
    // A window can only have one active tab at a time, so the array consists of
    // exactly one tab.
    callback(tabs[0]);
  });
}

/**
* Get current tab url callback.
* @param {Object} tab The current tab data object.
*/
function getCurrentTabUrlRes(tab) {
  let urlName = document.getElementById('site-name');
  let timeBlock = document.getElementById('time-block');
  
  // TODO: udate to display ALL sites with asted time
  chrome.tabs.sendMessage(tab.id, {action: 'GET_TIME'}, (data) => {
    if (!data || chrome.runtime.lastError) {
      console.error('Cannot get Time!');
      // TODO: Display error in popup here
      // add class has-error to root wrapper
      return;
    }

    urlName.innerHTML = data.siteName;
    timeBlock.innerHTML = getWastedTime(data.total);
  });
}

/**
* Get wasted time in format hh:mm.
* @param {Number|String} msTime Saved wasted time in ms.
* @return {String} 
*/
function getWastedTime(msTime) {
  let ms = parseInt(msTime, 10);
  let mins = ms / (60*1000);
  let hours = ~~(mins/60);
  let minutes = ~~(mins - hours*60);

  return hours + 'h ' + minutes + 'm';
}