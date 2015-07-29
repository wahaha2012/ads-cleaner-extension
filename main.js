/**
 * Author: wxwdesign@gmail.com
 * Source: https://github.com/wahaha2012/ads-cleaner-extension
 */
(function () {
    var tabURL = window.location.href,
        cleanKey = '',
        autoClean = true,
        clearRules = {
            'blog.sina.com.cn/s': function(){
                cleanDomBySelector(".sinaad-toolkit-box,.popBox,.godreply,.sinaads");
            },
            'eastmoney.com': function(request){
                if(request.cleanAds){
                    cleanDomBySelector(".lbadbox,.rbadbox,iframe");
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
            },
            'stock.hexun.com': function(){
                cleanDomBySelector(".box15_ad,#topFullWidthBanner,#list4_ad,#BannerMiddle_01,#BannerMiddle_02");

                Array.prototype.forEach.call(document.querySelectorAll('.adcLoadingTip'),function(item){
                    item.style.cssText="display:none";
                    nextNode = item.nextSlbling||item.nextElementSibling; 
                    nextNode.style.cssText="display:none";
                });
            },
            'chinaz.com':function(){
                cleanDomBySelector("iframe,.mt10,.mb10,.mtb20,.otherContent_01,.ml10,.sideAdList");
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
                autoClean && clearRules[key]();
                
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