/**
 * Author: wxwdesign@gmail.com
 * Source: https://github.com/wahaha2012/ads-cleaner-extension
 */
chrome.browserAction.onClicked.addListener(function(tab) {
    chrome.browserAction.getBadgeText({tabId: tab.id}, function(text){
        var display = 'none',
            status = 'ON';
            
        if(text == 'ON') {
            status = '';
            display = 'block';
        }

        chrome.browserAction.setBadgeText({
            text: status,
            tabId: tab.id
        });
        chrome.tabs.executeScript({
            code: 'Array.prototype.forEach.call(document.querySelectorAll("iframe"), function(item){item.style.display="'+display+'"})'
        });
    });
});