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
            'eastmoney.com': function(request){
                if(request.cleanAds){
                    cleanDomBySelector(".lbadbox,.rbadbox,iframe,#flow-ad-169");
                }

                if(request.cleanStartup){
                    var table = document.querySelectorAll("#dt_1 tr");
                    Array.prototype.forEach.call(table, function(item){
                        var tds = item.querySelectorAll("td");
                        if(tds.length < 1){return;}
                        if(tds[0] && tds[0].innerText && tds[0].innerText.replace(/\s+/g,'').indexOf("3")==0){
                            item.style.cssText="display:none";
                        }
                    });
                }
            },
            'iteye.com': function(){
                cleanDomBySelector("iframe");
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
        if(request){
            clearRules[cleanKey](request);
        }
    });

    init();
})();