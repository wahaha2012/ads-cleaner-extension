(function (factory) {
  typeof define === 'function' && define.amd ? define(factory) :
  factory();
}((function () { 'use strict';

  function debounce(func, wait, immediate) {
    var timeout;
    return function () {
      var context = this,
        args = arguments;
      var later = function () {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  }

  function cleanDomBySelector(selector) {
    Array.prototype.forEach.call(
      document.querySelectorAll(selector),
      function (item) {
        item.style.cssText = "display:none";
      }
    );
  }

  function cleanParentNode(selector) {
    Array.prototype.forEach.call(
      document.querySelectorAll(selector),
      function (item) {
        if (
          item &&
          item.parentNode &&
          !["html", "body"].includes(item.parentNode.tagName.toLowerCase())
        ) {
          item.parentNode.style.cssText = "display:none";
        }
      }
    );
  }

  function setStyles(selector, options) {
    const cssText = [];
    for (var key in options) {
      cssText.push(key + ":" + options[key]);
    }
    Array.prototype.forEach.call(
      document.querySelectorAll(selector),
      function (item) {
        item.style.cssText = cssText.join(";");
      }
    );
  }

  function beautiJisiluTable() {
    if (window.location.href.indexOf("/data/") > -1) {
      var tables = document.querySelectorAll("#flex_cb, #flex_fundb");
      [].forEach.call(tables, function (tb) {
        var ths = tb.querySelectorAll("th");
        var trs = tb.querySelectorAll("tbody>tr");
        var colIndex = -1;
        [].forEach.call(ths, function (th, i) {
          if (th.innerText === "溢价率") {
            colIndex = i;
          }
        });
        [].forEach.call(trs, function (tr) {
          var tds = tr.querySelectorAll("td");
          [].forEach.call(tds, function (td, n) {
            if (n === colIndex) {
              var v = parseFloat(td.innerText);
              var r = 0,
                g = 0,
                b = 0;
              if (v > 0) {
                r = Math.round(255 - (255 * v) / 100 / 2);
                g = b = Math.round(r / 2);
                r = 255;
              } else {
                g = Math.round(255 + (255 * v) / 100 / 2);
                r = b = Math.round(g / 2);
                g = 255;
              }
              td.style.background = "rgb(" + r + "," + g + "," + b + ")";
            }
          });
        });
      });
    }
  }

  function createElement(config) {
    var el = document.createElement(config.tagName || "a");

    el.innerHTML = config.innerHTML || config.innerText;

    if (config.href) {
      el.setAttribute("href", config.href);
      el.setAttribute("target", config.target || "_blank");
    }

    if (config.attrs) {
      Object.entries(config.attrs).forEach(([k, v]) => {
        el.setAttribute(k, v);
      });
    }

    return el;
  }

  const xueqiu = {
    addTabs() {
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

          this.addRankSummary(symbolStr);
          this.addRankTable([...symbol]);
          symbol[0] = symbol[0].toUpperCase().replace("H", "") + "SE";

          // add EX prefix to hongkong stocks
        } else if (["HK"].includes(symbol[0].toUpperCase())) {
          this.addHKRankTable([...symbol]);
          symbol[0] = symbol[0].toUpperCase() + "EX";
          symbol[1] = Number(symbol[1]);
        }

        // add TradingView link for all stocks
        stockTabs.appendChild(
          createElement({
            innerText: "TradingView",
            href: `https://www.tradingview.com/symbols/${symbol.join("-")}/`,
          })
        );
      }
    },

    addRankSummary(symbolStr) {
      // get ranking data
      chrome.runtime.sendMessage(
        {
          getRanking: true,
          code: symbolStr,
        },
        (data) => {
          const { pjtj } = data;
          const container = document.querySelector("div.chart-container-box");
          const table = document.createElement("table");
          table.setAttribute("class", "quote-info");
          const tr = document.createElement("tr");
          const tds = [
            `<td><span><a target="_blank" href="https://emweb.securities.eastmoney.com/PC_HSF10/ProfitForecast/Index?code=${symbolStr}">机构评级</a></span></td>`,
          ];
          pjtj.slice(0, 4).forEach((td) => {
            tds.push(
              `<td>${td.sjd} <span>${((td.pjxs / 5) * 100).toFixed(0)}%${
              td.zhpj
            }(${td.mr > 0 ? "+" : ""}${td.mr})</span></td>`
            );
          });
          tr.innerHTML = tds.join("");
          table.appendChild(tr);

          container.parentNode.insertBefore(table, container);
        }
      );
    },

    addRankTable(symbol) {
      chrome.runtime.sendMessage(
        {
          getRankTable: true,
          code: symbol,
        },
        (data) => {
          const matches = data
            .replace(/[\r\n\t]+/g, "")
            .match(/<table.*>.*?<\/table>/);
          if (!matches || !matches[0]) {
            return;
          }
          const container = document.createElement("div");
          container.innerHTML = matches[0];
          const table = document.createElement("table");
          const trs = container.querySelectorAll("tr");
          const rankPrice = [];
          const currentPrice = Number(
            document
              .querySelector(".stock-current")
              .innerText.replace(/[^\d\.]+/, "")
          );
          [].forEach.call(trs, (tr, i) => {
            const tds = tr.querySelectorAll("td");
            const targetPrice = Number(tds[2].innerText.replace(/,/g, ""));
            if (!targetPrice && i > 0) {
              return;
            }
            const newTR = document.createElement("tr");

            newTR.appendChild(tds[4]);
            newTR.appendChild(tds[3]);
            newTR.appendChild(tds[2]);
            if (targetPrice) {
              rankPrice.push(targetPrice);
            }
            newTR.appendChild(tds[7]);

            table.appendChild(newTR);
          });

          // console.log(table);
          rankPrice.sort((a, b) => b - a);
          const highPrice = rankPrice.shift();
          const highPriceRate = ((highPrice / currentPrice - 1) * 100).toFixed(2);
          const lowPrice = rankPrice.pop();
          const lowPriceRate = ((lowPrice / currentPrice - 1) * 100).toFixed(2);

          const widget = document.querySelectorAll(".stock-widget");
          const url = `http://stock.finance.sina.com.cn/stock/go.php/vIR_StockSearch/key/${symbol[1]}.phtml`;
          const newWidget = createElement({
            tagName: "div",
            innerHTML: `<div class="widget-header"><div class="title"><a href="${url}" target="_blank" style="color:#33353c;">评级</a><span style="font-size:12px;font-weight:normal;margin-left: 10px;">最高:${highPrice}(${
            highPriceRate > 0 ? "+" : ""
          }${highPriceRate}%) / 最低:${lowPrice}(${
            lowPriceRate > 0 ? "+" : ""
          }${lowPriceRate}%)</span></div></div><div class="widget-content"><table style="font-size:12px;width:100%;">${
            table.innerHTML
          }</table></div>`,
            attrs: {
              class: "stock-widget",
            },
          });
          widget[2].parentNode.insertBefore(newWidget, widget[2]);
        }
      );
    },

    addHKRankTable(symbol) {
      chrome.runtime.sendMessage(
        {
          getHKRankTable: true,
          code: symbol,
        },
        (data) => {
          const matches = data
            .replace(/[\r\n\t]+/g, "")
            .match(/<table.*>.*?<\/table>/);
          if (!matches || !matches[0]) {
            return;
          }
          const container = document.createElement("div");
          container.innerHTML = matches[0];
          const table = document.createElement("table");
          const trs = container.querySelectorAll("tr");
          const rankPrice = [];
          const currentPrice = Number(
            document
              .querySelector(".stock-current")
              .innerText.replace(/[^\d\.]+/, "")
          );
          [].forEach.call(trs, (tr, i) => {
            const tds = tr.querySelectorAll("th,td");
            const targetPrice = Number(tds[5].innerText.replace(/,/g, ""));
            if (!targetPrice && i > 0) {
              return;
            }
            const newTR = document.createElement("tr");
            const newTds = [];

            newTds.push(`<td>${tds[2].innerText}</td>`);
            newTds.push(`<td>${tds[3].innerText}</td>`);
            newTds.push(`<td>${tds[5].innerText}</td>`);
            newTds.push(`<td>${tds[7].innerText}</td>`);

            if (targetPrice) {
              rankPrice.push(targetPrice);
            }

            newTR.innerHTML = newTds.join("");

            table.appendChild(newTR);
          });

          // console.log(table);
          rankPrice.sort((a, b) => b - a);
          const highPrice = rankPrice.shift();
          const highPriceRate = ((highPrice / currentPrice - 1) * 100).toFixed(2);
          const lowPrice = rankPrice.pop();
          const lowPriceRate = ((lowPrice / currentPrice - 1) * 100).toFixed(2);

          const widget = document.querySelectorAll(".stock-widget");
          const url = `http://stock.finance.sina.com.cn/hkstock/quotes/${symbol[1]}.html`;
          const newWidget = createElement({
            tagName: "div",
            innerHTML: `<div class="widget-header"><div class="title"><a href="${url}" target="_blank" style="color:#33353c;">评级</a><span style="font-size:12px;font-weight:normal;margin-left: 10px;">最高:${highPrice}(${
            highPriceRate > 0 ? "+" : ""
          }${highPriceRate}%) / 最低:${lowPrice}(${
            lowPriceRate > 0 ? "+" : ""
          }${lowPriceRate}%)</span></div></div><div class="widget-content"><table style="font-size:12px;width:100%;">${
            table.innerHTML
          }</table></div>`,
            attrs: {
              class: "stock-widget",
            },
          });
          widget[2].parentNode.insertBefore(newWidget, widget[2]);
        }
      );
    },

    // update nav menus
    updateNavMenu() {
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
    },
  };

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

      xueqiu.updateNavMenu();
      xueqiu.addTabs();
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

  const getAllVideos = (container = document) => {
    return container.querySelectorAll("video");
  };

  const createContainer = () => {
    const container = document.createElement("div");
    container.style.cssText =
      "position:absolute; padding: 10px; background: rgba(0,0,0,0.3); z-index: 999999; color: #ffffff; font-size: 14px; opacity: 0.3;";
    return container;
  };

  const createControlBar = (c, v) => {
    if (v.videoWidth < 100 || v.videoHeight < 100) {
      setTimeout(() => {
        c.parentNode && c.parentNode.removeChild(c);
      }, 500);
      return;
    }
    const fields = ["进度", "尺寸", "速度", "音量"];
    const pos = v.getBoundingClientRect();
    c.style.cssText += `left: ${pos.left}px; top: ${pos.top}px; width: ${pos.width}px;`;
    c.innerHTML = "";

    const attrList = [
      `${Math.floor(v.currentTime / 60)}:${Math.floor(
      v.currentTime % 60
    )}/${Math.floor(v.duration / 60)}:${Math.floor(v.duration % 60)}`,
      `${v.videoWidth}x${v.videoHeight}`,
      v.playbackRate,
      v.volume,
    ];
    fields.forEach((f, i) => {
      const span = document.createElement("span");
      span.style.cssText = "margin-right: 10px;";
      span.innerHTML = `${f}: ${attrList[i]}`;
      c.appendChild(span);
    });

    const source = document.createElement("div");
    source.style.cssText =
      "white-space: nowrap; width: 100%; overflow: hidden; text-overflow: ellipsis;margin-top: 9px; font-size: 12px; color: rgba(255,255,255, 0.5); display: none;";
    source.innerText = v.currentSrc;

    const action = [
      {
        type: "volume",
        change: -0.25,
      },
      {
        type: "volume",
        change: 0.25,
      },
      {
        type: "playbackRate",
        change: -0.25,
      },
      {
        type: "playbackRate",
        change: 0.25,
      },
      () => {
        if (document.pictureInPictureElement) {
          document.exitPictureInPicture();
        } else {
          if (document.pictureInPictureEnabled) {
            v.requestPictureInPicture();
          }
        }
      },
      () => {
        createControlBar(c, v);
      },
      () => {
        source.style.display = source.style.display === "none" ? "block" : "none";
      },
      () => {
        c.style.display = "none";
      },
    ];

    // create all buttons
    [
      "音量-",
      "音量+",
      "速度-",
      "速度+",
      "画中画",
      "刷新",
      "显示源",
      "关闭",
    ].forEach((item, i) => {
      const btn = document.createElement("button");
      btn.innerText = item;
      btn.style.cssText =
        "border-radius: 2px; margin: 0 2px; border: 0 none; color: #666666; cursor: pointer; padding: 0 2px;";
      if (typeof action[i] !== "function") {
        const act = action[i];
        btn.onclick = () => {
          if (act.type === "volume" && (v[act.type] > 1 || v[act.type] < 0)) {
            return;
          }

          try {
            v[act.type] += act.change;

            action[5]();
          } catch (err) {
            console.warn("[Extension AC]", err);
          }
        };
      } else {
        btn.onclick = action[i];
      }

      c.appendChild(btn);
    });
    c.appendChild(source);
  };

  const createVideoController = (videos) => {
    [].forEach.call(videos, (v) => {
      const c = createContainer();

      c.onmouseenter = () => {
        c.style.opacity = 1;
      };
      c.onmouseleave = () => {
        c.style.opacity = 0;
      };

      createControlBar(c, v);
      document.body.appendChild(c);
    });
  };

  const init = () => {
    const videos = getAllVideos();
    // console.log("find videos: ", videos.length);

    createVideoController(videos);
  };

  setTimeout(() => {
    init();
  }, 1000);

})));
