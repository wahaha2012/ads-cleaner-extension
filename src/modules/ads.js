import { debounce } from "../utils/index";
import {
  cleanDomBySelector,
  cleanParentNode,
  setStyles,
  beautiJisiluTable,
} from "../utils/dom";

let cleanKey = "";
const autoCleanRules = [
  "jisilu.cn",
  "xueqiu.com",
  "eastmoney.com",
  "jisilu.cn/data/",
];
const tabURL = window.location.href;

const clearRules = {
  "blog.sina.com.cn/s": function () {
    // cleanDomBySelector(".sinaad-toolkit-box,.popBox,.godreply,.sinaads,.blogreco,#column_1");
    document.body.innerHTML = document.querySelector(
      "#module_920_SG_connBody"
    ).innerHTML;
    document.body.style.cssText = "background:#4d4d4d;color:#c1c1c1";
    document.querySelector(".articalContent,.BNE_cont").style.cssText =
      "margin:0 auto;";
  },

  "eastmoney.com": function (request) {
    // if(request && request.cleanAds){
    cleanDomBySelector(".lbadbox,.rbadbox,iframe,#emFloat_rd");
    // }

    if (request && request.cleanStartup) {
      var table = document.querySelectorAll("#dt_1 tr");
      Array.prototype.forEach.call(table, function (item) {
        var tds = item.querySelectorAll("td");
        if (tds.length < 1) {
          return;
        }
        if (
          tds[0] &&
          tds[0].innerText &&
          tds[0].innerText.replace(/\s+/g, "").indexOf("3") == 0
        ) {
          item.style.cssText = "display:none";
        }
      });
    }

    if (~window.location.href.indexOf("PC_HSF10")) {
      var F10Table = document.querySelector("#F10MainTargetDiv");
      if (F10Table) {
        F10Table.style.cssText = "height: auto";
      }
      document.querySelector("#RightMenu").style.display = "none";
      document.querySelector(".header").style.position = "static";
      document.querySelector(".subnav").style.position = "static";
    }
  },

  "iteye.com": function () {
    cleanDomBySelector("iframe");
  },

  "stock.hexun.com": function () {
    cleanDomBySelector(
      ".box15_ad,#topFullWidthBanner,#list4_ad,#BannerMiddle_01,#BannerMiddle_02"
    );

    Array.prototype.forEach.call(
      document.querySelectorAll(".adcLoadingTip"),
      function (item) {
        item.style.cssText = "display:none";
        nextNode = item.nextSlbling || item.nextElementSibling;
        nextNode.style.cssText = "display:none";
      }
    );
  },

  "chinaz.com": function () {
    cleanDomBySelector(
      "iframe,.mt10,.mb10,.mtb20,.otherContent_01,.ml10,.sideAdList"
    );
  },

  "jisilu.cn": function () {
    cleanDomBySelector("div.foot_ad");
    cleanParentNode("a.jsl_ad_banner");

    var replayBox = document.querySelector("div.aw-mod-replay-box");
    if (
      replayBox &&
      replayBox.previousElementSibling &&
      String(replayBox.previousElementSibling.getAttribute("class")).indexOf(
        "aw-mod"
      ) < 0
    ) {
      replayBox.previousElementSibling.style.display = "none";
    }

    var allTables = document.getElementsByTagName("table");
    var beautyFunc = debounce(function () {
      console.log("beautify table");
      beautiJisiluTable();
    }, 500);

    [].forEach.call(allTables, function (table) {
      // console.log(table.getAttribute("id"));
      var observer = new MutationObserver(beautyFunc);

      observer.observe(table, {
        attributes: true,
        childList: true,
      });
    });
  },

  "xueqiu.com": function () {
    if (window.localStorage.getItem("clean-dom-xueqiu") === "1") {
      cleanDomBySelector(
        ".nav__logo,.home__stock-index,.optional__tabs__contentsw.chart-container-box,.stock-info,.before-after,.stock-widget,.stock-hot__container,.most-profitable__container,.stock-relation"
      );
    }
    setStyles(".nav", {
      position: "absolute",
    });

    var symbol = window.location.href.toLowerCase().match(/s[hz]\d{6}/);
    if (
      symbol &&
      Object.prototype.toString.call(symbol).slice(8, -1) === "Array"
    ) {
      var stockTabs = document.querySelector(".stock-timeline-tabs");
      var financeLink = document.createElement("a");

      financeLink.innerHTML = "财务";
      financeLink.setAttribute(
        "href",
        "http://emweb.securities.eastmoney.com/PC_HSF10/NewFinanceAnalysis/Index?code=" +
          symbol
      );
      financeLink.setAttribute("target", "_blank");
      stockTabs.appendChild(financeLink);

      var valueGoLink = document.createElement("a");
      valueGoLink.innerHTML = "指标";
      valueGoLink.setAttribute(
        "href",
        "https://wayougou.com/stock/" +
          String(symbol).replace(/[a-z]+/, "") +
          "/outline/outline"
      );
      valueGoLink.setAttribute("target", "_blank");
      stockTabs.appendChild(valueGoLink);
    }
  },
};

for (var key in clearRules) {
  if (clearRules.hasOwnProperty(key) && tabURL.indexOf(key) > -1) {
    cleanKey = key;
    if (autoCleanRules.includes(key)) {
      try {
        clearRules[key]();
      } catch (err) {
        console.log("err=>", err);
      }
    }

    chrome.extension.sendMessage({
      showContextMenu: true,
    });
    break;
  }
}

chrome.extension.onMessage.addListener(function (
  request
  // sender,
  // sendResponse
) {
  if (request) {
    clearRules[cleanKey](request);
  }
});
