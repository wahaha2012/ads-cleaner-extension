/**
 * Author: wxwdesign@gmail.com
 * Source: https://github.com/wahaha2012/ads-cleaner-extension
 */
(function () {
    chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
        if(request.showContextMenu){
            chrome.contextMenus.create({
                "title" : "Clean Advertisements",
                "onclick" : sendCleanMsg
            });
        }
    });

    function sendCleanMsg(info, tab){
        chrome.tabs.sendMessage(tab.id, {
            cleanAds: true
        });
    }
})();