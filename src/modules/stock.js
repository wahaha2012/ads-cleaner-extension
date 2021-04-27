import { createElement } from "../utils/dom";
import { numberUnitFormat } from "../utils/format";

export const xueqiu = {
  getCurrentPrice() {
    return Number(
      document.querySelector(".stock-current").innerText.replace(/[^\d\.]+/, "")
    );
  },

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
        this.addRepurchaseData([...symbol]);
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
    const url = `http://stock.finance.sina.com.cn/stock/go.php/vIR_StockSearch/key/${symbol[1]}.phtml`;
    chrome.runtime.sendMessage(
      {
        url,
        getRankTable: true,
        source: "sina",
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
        const currentPrice = this.getCurrentPrice();
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
        url: `http://vip.stock.finance.sina.com.cn/hk/view/rating.php?symbol=${symbol[1]}`,
        source: "sina",
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
        const currentPrice = this.getCurrentPrice();
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

  addRepurchaseData(symbol) {
    const url = `http://stock.finance.sina.com.cn/hkstock/rights/${symbol[1]}.html`;
    chrome.runtime.sendMessage(
      {
        getHKRepurchase: true,
        url,
        source: "sina",
        code: symbol,
      },
      (data) => {
        const matches = data
          .replace(/[\r\n\t]+/g, "")
          .match(/<div\s+id="sub01_c3".*?>.*?<\/div>/);
        if (!matches || !matches[0]) {
          return;
        }
        const container = document.createElement("div");
        container.innerHTML = matches[0];
        const table = createElement({
          tagName: "table",
        });
        const trs = container.querySelectorAll("tr");
        [].slice.call(trs, 0, 30).forEach((tr, i) => {
          const tds = tr.querySelectorAll("td");
          const newTR = document.createElement("tr");
          const newTds = [];

          newTds.push(`<td>${tds[0].innerText}</td>`);
          newTds.push(`<td>${numberUnitFormat(tds[4].innerText)}</td>`);
          newTds.push(`<td>${tds[5].innerText}</td>`);

          newTR.innerHTML = newTds.join("");

          table.appendChild(newTR);
        });

        const widget = document.querySelectorAll(".stock-widget");
        const newWidget = createElement({
          tagName: "div",
          innerHTML: `<div class="widget-header"><div class="title"><a href="${url}" target="_blank" style="color:#33353c;">回购</a></div></div><div class="widget-content"><table style="font-size:12px;width:100%;">${table.innerHTML}</table></div>`,
          attrs: {
            class: "stock-widget",
          },
        });
        widget[3].parentNode.insertBefore(newWidget, widget[3]);
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
