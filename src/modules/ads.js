import { debounce } from "../utils/index";
import {
  cleanDomBySelector,
  cleanParentNode,
  setStyles,
  beautiJisiluTable,
  createElement,
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

    var symbol = document.querySelector(".stock__main>.stock-name");
    var symbolStr = "";
    if (symbol && symbol.innerText) {
      symbol = symbol.innerText.replace(/^.+\(|\)$/g, "").split(":");
      symbolStr = symbol.join("");
      var stockTabs = document.querySelector(".stock-timeline-tabs");

      if (["SH", "SZ"].includes(symbol[0].toUpperCase())) {
        stockTabs.appendChild(
          createElement({
            innerText: "财务",
            href:
              "https://emweb.securities.eastmoney.com/PC_HSF10/NewFinanceAnalysis/Index?type=soft&code=" +
              symbolStr,
          })
        );

        symbol[0] = symbol[0].toUpperCase().replace("H", "") + "SE";
      } else if (["HK"].includes(symbol[0].toUpperCase())) {
        symbol[0] = symbol[0].toUpperCase() + "EX";
        symbol[1] = Number(symbol[1]);
      }

      stockTabs.appendChild(
        createElement({
          innerText: "TradingView",
          href: `https://www.tradingview.com/symbols/${symbol.join("-")}/`,
        })
      );
    }

    // other tools
    var navMenu = document.querySelector("div.nav__menu");
    navMenu.removeChild(navMenu.firstChild);
    navMenu.appendChild(
      createElement({
        innerHTML: "估值",
        attrs: {
          class: "nav__menu__item",
        },
        href: "https://danjuanapp.com/valuation-table/jiucai",
      })
    );
    navMenu.appendChild(
      createElement({
        innerHTML: "性价比",
        attrs: {
          class: "nav__menu__item",
        },
        href: "http://funddb.cn/site/fed",
      })
    );

    document.querySelectorAll(".nav__dropdown")[1].appendChild(
      createElement({
        innerText: "投资数据网",
        href: "https://www.touzid.com/",
      })
    );

    chrome.runtime.sendMessage(
      {
        getRanking: true,
        code: symbolStr,
      },
      (data) => {
        const { pjtj } = data;
        const table = document.querySelector("table.quote-info>tbody");
        const tr = document.createElement("tr");
        const tds = [
          `<td><span><a target="_blank" href="https://emweb.securities.eastmoney.com/PC_HSF10/ProfitForecast/Index?code=${symbolStr}">机构评级</a></span></td>`,
        ];
        pjtj.slice(0, 3).forEach((td) => {
          tds.push(
            `<td>${td.sjd}：<span>${td.zhpj}(${td.mr > 0 ? "+" : ""}${
              td.mr
            })</span></td>`
          );
        });
        tr.innerHTML = tds.join("");
        table.appendChild(tr);
      }
    );
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

    chrome.runtime.sendMessage({
      showContextMenu: true,
    });
    break;
  }
}

chrome.runtime.onMessage.addListener(function (
  request
  // sender,
  // sendResponse
) {
  if (request) {
    // console.log("get message", request);
    clearRules[cleanKey](request);
  }
});
