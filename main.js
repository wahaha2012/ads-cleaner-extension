/**
 * Author: wxwdesign@gmail.com
 * Source: https://github.com/wahaha2012/ads-cleaner-extension
 */
(function () {
    var tabURL = window.location.href,
        cleanKey = '',
        autoCleanRules = ['jisilu.cn','xueqiu.com'],
        clearRules = {
            'blog.sina.com.cn/s': function(){
                // cleanDomBySelector(".sinaad-toolkit-box,.popBox,.godreply,.sinaads,.blogreco,#column_1");
                document.body.innerHTML = document.querySelector('#module_920_SG_connBody').innerHTML;
                document.body.style.cssText = 'background:#4d4d4d;color:#c1c1c1';
                document.querySelector('.articalContent,.BNE_cont').style.cssText = 'margin:0 auto;';
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
            },
            'jisilu.cn':function(){
                cleanDomBySelector("div.foot_ad");
                // var firstClassDivs = document.querySelectorAll('.J_head_bg+div');
                // firstClassDivs[1].style.cssText="display:none";
            },
            'xueqiu.com':function(){
                cleanDomBySelector('.nav__logo');
                setStyles('.nav', {position: 'absolute'});
                // if (!document.querySelector('#home-top-right')) {
                //     cleanDomBySelector("#head");
                //     cleanDomBySelector("nav.nav");
                // }
            }
        };

    function cleanDomBySelector(selector){
        Array.prototype.forEach.call(document.querySelectorAll(selector),function(item){
            item.style.cssText="display:none";
        });
    }
    
    function setStyles(selector, options) {
        const cssText = [];
        for(var key in options) {
            cssText.push(key + ':' + options[key]);
        }
        Array.prototype.forEach.call(document.querySelectorAll(selector),function(item){
            item.style.cssText = cssText.join(';');
        });
    }

    function init(){
        for(var key in clearRules){
            if(clearRules.hasOwnProperty(key) && tabURL.indexOf(key)>-1){
                cleanKey = key;
                if (autoCleanRules.includes(key)) {
                    try{
                        clearRules[key]();
                    }catch(err){
                        console.log('err=>', err);
                    }
                }

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