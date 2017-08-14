/**
 * Author: wxwdesign@gmail.com
 * Source: https://github.com/wahaha2012/ads-cleaner-extension
 */
(function () {
    var contextMenuId,
        cleanStartUpMenuId;
    chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
        if(request.showContextMenu){
            if(!contextMenuId){
                contextMenuId = chrome.contextMenus.create({
                    "title" : "Clean Advertisements",
                    "documentUrlPatterns" : [
                        "*://*.iteye.com/*",
                        "*://*.eastmoney.com/*",
                        "*://blog.sina.com.cn/*",
                        "*://*.stock.hexun.com/*",
                        "*://*.chinaz.com/*",
                        "*://*.jisilu.cn/*",
                        "*://*.xueqiu.com/*",
                    ],
                    "onclick" : sendCleanMsg
                });
            }
            //clean startup menu
            if(!cleanStartUpMenuId){
                cleanStartUpMenuId = chrome.contextMenus.create({
                    "title" : "Clean Startup Company",
                    "documentUrlPatterns" : [
                        "*://*.eastmoney.com/*"
                    ],
                    "onclick" : sendCleanStMsg
                });
            }
        }
    });

    function sendCleanMsg(info, tab){
        chrome.tabs.sendMessage(tab.id, {
            cleanAds: true
        });
    }

    function sendCleanStMsg(info, tab){
        chrome.tabs.sendMessage(tab.id, {
            cleanStartup: true
        });
    }
})();