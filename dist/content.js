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
