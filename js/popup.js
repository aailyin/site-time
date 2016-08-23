document.addEventListener('DOMContentLoaded', () => {
  getCurrentTabUrl( function (tab) {
    // TODO: save url and count time
    let urlName = document.getElementById('site-name');
    
    chrome.tabs.sendMessage(tab.id, {action: 'GET_TIME'}, function(data) {
      if (!data || chrome.runtime.lastError) {
        console.debug('Cannot get Time!');
        // TODO: Display error in popup here
        return;
      }

      let siteName = data.siteName;
      let time = getWastedTime(data.total);
      urlName.innerHTML = siteName + ' - ' + time;
    });
  });
});

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

  chrome.tabs.query(queryInfo, function (tabs) {
    // chrome.tabs.query invokes the callback with a list of tabs that match the
    // query. When the popup is opened, there is certainly a window and at least
    // one tab, so we can safely assume that |tabs| is a non-empty array.
    // A window can only have one active tab at a time, so the array consists of
    // exactly one tab.
    callback(tabs[0]);
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
  let minutes = mins - hours*60;

  return hours + 'h ' + minutes + 'm';
}