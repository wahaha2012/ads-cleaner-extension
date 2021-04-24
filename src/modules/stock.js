import { createElement } from "../utils/dom";

export const xueqiu = {
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
        [].forEach.call(trs, (tr, i) => {
          const tds = tr.querySelectorAll("td");
          if (!Number(tds[2].innerText) && i > 0) {
            return;
          }
          const newTR = document.createElement("tr");

          newTR.appendChild(tds[4]);
          newTR.appendChild(tds[3]);
          newTR.appendChild(tds[2]);
          if (Number(tds[2].innerText)) {
            rankPrice.push(Number(tds[2].innerText));
          }
          newTR.appendChild(tds[7]);

          table.appendChild(newTR);
        });

        // console.log(table);
        rankPrice.sort((a, b) => b - a);

        const widget = document.querySelectorAll(".stock-widget");
        const newWidget = createElement({
          tagName: "div",
          innerHTML: `<div class="widget-header"><div class="title">评级<span style="font-size:12px;font-weight:normal;margin-left: 10px;">最高:${rankPrice.shift()} / 最低:${rankPrice.pop()}</span></div></div><div class="widget-content"><table style="font-size:12px;width:100%;">${
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
        [].forEach.call(trs, (tr, i) => {
          const tds = tr.querySelectorAll("th,td");
          if (!Number(tds[5].innerText) && i > 0) {
            return;
          }
          const newTR = document.createElement("tr");
          const newTds = [];

          newTds.push(`<td>${tds[2].innerText}</td>`);
          newTds.push(`<td>${tds[3].innerText}</td>`);
          newTds.push(`<td>${tds[5].innerText}</td>`);
          newTds.push(`<td>${tds[7].innerText}</td>`);

          if (Number(tds[5].innerText)) {
            rankPrice.push(Number(tds[5].innerText));
          }

          newTR.innerHTML = newTds.join("");

          table.appendChild(newTR);
        });

        // console.log(table);
        rankPrice.sort((a, b) => b - a);

        const widget = document.querySelectorAll(".stock-widget");
        const newWidget = createElement({
          tagName: "div",
          innerHTML: `<div class="widget-header"><div class="title">评级<span style="font-size:12px;font-weight:normal;margin-left: 10px;">最高:${rankPrice.shift()} / 最低:${rankPrice.pop()}</span></div></div><div class="widget-content"><table style="font-size:12px;width:100%;">${
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
