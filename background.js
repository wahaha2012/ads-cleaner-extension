/**
 * Author: wxwdesign@gmail.com
 * Source: https://github.com/wahaha2012/ads-cleaner-extension
 */
(function () {
    var contextMenuId;
    chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
        if(request.showContextMenu){
            if(!contextMenuId){
                contextMenuId = chrome.contextMenus.create({
                    "title" : "Clean Advertisements",
                    "documentUrlPatterns" : [
                        "*://blog.sina.com.cn/*",
                        "*://*.eastmoney.com/*"
                    ],
                    "onclick" : sendCleanMsg
                });
            }
        }
    });

    function sendCleanMsg(info, tab){
        chrome.tabs.sendMessage(tab.id, {
            cleanAds: true
        });
    }
})();