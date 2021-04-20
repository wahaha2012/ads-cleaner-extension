/**
 * Author: wxwdesign@gmail.com
 * Source: https://github.com/wahaha2012/ads-cleaner-extension
 */
(function () {
  var contextMenuId, cleanStartUpMenuId, translateMenuId;
  chrome.runtime.onMessage.addListener(function (
    request,
    sender,
    sendResponse
  ) {
    if (request.showContextMenu) {
      if (!contextMenuId) {
        contextMenuId = chrome.contextMenus.create({
          title: "Clean Advertisements",
          documentUrlPatterns: [
            "*://*.iteye.com/*",
            "*://*.eastmoney.com/*",
            "*://blog.sina.com.cn/*",
            "*://*.stock.hexun.com/*",
            "*://*.chinaz.com/*",
            "*://*.jisilu.cn/*",
            "*://*.xueqiu.com/*",
          ],
          id: "cleanAds",
          // onclick: sendCleanMsg,
        });
      }

      //clean startup menu
      if (!cleanStartUpMenuId) {
        cleanStartUpMenuId = chrome.contextMenus.create({
          title: "Clean Startup Company",
          documentUrlPatterns: ["*://*.eastmoney.com/*"],
          // onclick: sendCleanStMsg,
          id: "cleanStartup",
        });
      }
    } else if (request.getRanking) {
      fetch(
        "https://emweb.securities.eastmoney.com/PC_HSF10/ProfitForecast/ProfitForecastAjax?code=" +
          request.code,
        {
          method: "GET",
        }
      )
        .then((response) => {
          if (response.ok) {
            return response.json();
          }
        })
        .then((data) => {
          sendResponse(data);
        })
        .catch((err) => {
          console.log("Error:", err);
        });
      return true;
    }
  });

  function sendCleanMsg(info, tab) {
    chrome.tabs.sendMessage(tab.id, {
      cleanAds: true,
    });
  }

  function sendCleanStMsg(info, tab) {
    chrome.tabs.sendMessage(tab.id, {
      cleanStartup: true,
    });
  }

  function translatePage(info, tab) {
    var translators = {
      Google:
        "https://translate.google.com/translate?sl=auto&tl=zh-CN&js=y&prev=_t&hl=en&ie=UTF-8&edit-text=&act=url&u=",
      Bing: "https://www.microsofttranslator.com/bv.aspx?to=zh-CHS&a=",
    };
    chrome.tabs.create({
      url: translators[info.menuItemId] + decodeURIComponent(tab.url),
    });
    // console.log(info.menuItemId, tab.url);
  }

  // translate content
  if (!translateMenuId) {
    translateMenuId = chrome.contextMenus.create({
      title: "Translate Page",
      documentUrlPatterns: ["*://*.sec.gov/*", "*://*.seekingalpha.com/*"],
      id: "parentMenu",
    });
    chrome.contextMenus.create({
      title: "Google",
      parentId: "parentMenu",
      id: "Google",
      // onclick: translatePage,
    });
    chrome.contextMenus.create({
      title: "Bing",
      parentId: "parentMenu",
      id: "Bing",
      // onclick: translatePage,
    });
  }

  chrome.contextMenus.onClicked.addListener(function (clickData, tab) {
    switch (clickData.menuItemId) {
      case "Google":
      case "Bing":
        translatePage(clickData, tab);
        break;
      case "cleanAds":
        sendCleanMsg(clickData, tab);
        break;
      case "cleanStartup":
        sendCleanStMsg(clickData, tab);
        break;
    }
  });
})();
