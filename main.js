/**
 * Author: wxwdesign@gmail.com
 * Source: https://github.com/wahaha2012/ads-cleaner-extension
 */
(function () {
    var tabURL = window.location.href,
        cleanKey = '',
        clearRules = {
        'blog.sina.com.cn/s': function(){
            cleanDomBySelector(".sinaad-toolkit-box,.popBox,.godreply,.sinaads");
        },
        'eastmoney.com': function(){
            cleanDomBySelector(".lbadbox,.rbadbox,iframe");
        }
    };

    function cleanDomBySelector(selector){
        Array.prototype.forEach.call(document.querySelectorAll(selector),function(item){
            item.style.cssText="display:none";
        });
    }

    function init(){
        for(var key in clearRules){
            if(clearRules.hasOwnProperty(key) && tabURL.indexOf(key)>-1){
                cleanKey = key;
                // clearRules[key]();
                
                chrome.extension.sendMessage({
                    showContextMenu: true
                });
                break;
            }
        }
    }

    chrome.extension.onMessage.addListener(function(request, sender, sendResponse){
        if(request.cleanAds){
            clearRules[cleanKey]();
        }
    });

    init();
})();