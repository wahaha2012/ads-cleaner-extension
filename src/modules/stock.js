import { createElement } from "../utils/dom";
import { numberUnitFormat, thousandsSeparatorFormat } from "../utils/format";

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
    const url = `https://emweb.securities.eastmoney.com/PC_HSF10/ProfitForecast/ProfitForecastAjax?code=${symbolStr}`;
    // get ranking data
    chrome.runtime.sendMessage(
      {
        url,
        source: "eastmoney",
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

        this.addProfitPrediction(data, symbolStr);
      }
    );
  },

  // add profit prediction
  addProfitPrediction(data, symbolStr) {
    const { yctj, jgyc, gsjlr } = data;
    const table = document.createElement("table");

    const firstTr = document.createElement("tr");
    firstTr.innerHTML =
      "<th>年份</th><th>归母净利润</th><th>利润增速</th><th>市盈率</th>";
    table.appendChild(firstTr);
    yctj.data.slice(2, 6).forEach((tr, i) => {
      const newTR = document.createElement("tr");
      const newTds = [];
      const key = `syl${i ? i : ""}`;

      newTds.push(`<td>${tr.rq}</td>`);
      newTds.push(`<td>${tr.jlr}</td>`);
      newTds.push(`<td>${gsjlr[i].ratio}%</td>`);
      newTds.push(`<td>${jgyc.data[0][key]}</td>`);

      newTR.innerHTML = newTds.join("");

      table.appendChild(newTR);
    });

    const widget = document.querySelectorAll(".stock-widget");
    const url = `https://emweb.securities.eastmoney.com/PC_HSF10/ProfitForecast/Index?type=soft&code=${symbolStr}`;
    const newWidget = createElement({
      tagName: "div",
      innerHTML: `<div class="widget-header"><div class="title"><a href="${url}" target="_blank" style="color:#33353c;">业绩预测</a></div></div><div class="widget-content"><table style="font-size:12px;width:100%;">${table.innerHTML}</table></div>`,
      attrs: {
        class: "stock-widget",
      },
    });
    widget[1].parentNode.insertBefore(newWidget, widget[1]);

    this.addBussinessData(symbolStr);
  },

  addBussinessData(symbolStr) {
    const url = `https://emweb.securities.eastmoney.com/PC_HSF10/BusinessAnalysis/BusinessAnalysisAjax?code=${symbolStr}`;
    chrome.runtime.sendMessage(
      {
        url,
        source: "eastmoney",
      },
      (data) => {
        const { zygcfx } = data;
        const table = document.createElement("table");

        const firstTr = document.createElement("tr");
        firstTr.innerHTML =
          "<th>产品</th><th>收入</th><th>占比</th><th>利润</th>";
        table.appendChild(firstTr);

        zygcfx[0].cp.forEach((tr, i) => {
          const newTR = document.createElement("tr");
          const newTds = [];

          newTds.push(`<td>${tr.zygc}</td>`);
          newTds.push(`<td>${tr.zysr}</td>`);
          newTds.push(`<td>${tr.srbl}</td>`);
          newTds.push(`<td>${tr.zylr}</td>`);

          newTR.innerHTML = newTds.join("");

          table.appendChild(newTR);
        });

        const widget = document.querySelectorAll(".stock-widget");
        const url = `https://emweb.securities.eastmoney.com/PC_HSF10/BusinessAnalysis/Index?type=soft&code=${symbolStr}`;
        const newWidget = createElement({
          tagName: "div",
          innerHTML: `<div class="widget-header"><div class="title"><a href="${url}" target="_blank" style="color:#33353c;">营收构成</a></div></div><div class="widget-content"><table style="font-size:12px;width:100%;">${table.innerHTML}</table></div>`,
          attrs: {
            class: "stock-widget",
          },
        });
        widget[0].parentNode.insertBefore(newWidget, widget[4]);

        this.addShareholdersData(symbolStr);
      }
    );
  },

  addShareholdersData(symbolStr) {
    const url = `https://emweb.securities.eastmoney.com/PC_HSF10/ShareholderResearch/ShareholderResearchAjax?code=${symbolStr}`;
    chrome.runtime.sendMessage(
      {
        url,
        source: "eastmoney",
      },
      (data) => {
        const { sdgd } = data;
        const table = document.createElement("table");
        const currentPrice = this.getCurrentPrice();

        const firstTr = document.createElement("tr");
        firstTr.innerHTML =
          "<th width='30%'>股东名称</th><th>持股数</th><th>市值</th><th>类型</th><th>占比</th><th>变动</th>";
        table.appendChild(firstTr);

        sdgd[0].sdgd.forEach((tr, i) => {
          const newTR = document.createElement("tr");
          const newTds = [];

          newTds.push(`<td>${tr.gdmc}</td>`);
          newTds.push(`<td>${tr.cgs}</td>`);
          newTds.push(
            `<td>${numberUnitFormat(
              tr.cgs.replace(/,/g, "") * currentPrice
            )}</td>`
          );
          newTds.push(`<td>${tr.gflx}</td>`);
          newTds.push(`<td>${tr.zltgbcgbl}</td>`);
          newTds.push(`<td>${thousandsSeparatorFormat(tr.zj)}</td>`);

          newTR.innerHTML = newTds.join("");

          table.appendChild(newTR);
        });

        const editor = document.querySelector(".editor-container");
        const url = `https://emweb.securities.eastmoney.com/PC_HSF10/ShareholderResearch/Index?type=soft&code=${symbolStr}`;
        const newWidget = createElement({
          tagName: "div",
          innerHTML: `<div class="widget-header"><div class="title"><a href="${url}" target="_blank" style="color:#33353c;">十大股东</a></div></div><div class="widget-content"><table style="font-size:12px;width:100%;font-size:12px;width:100%;border-collapse:collapse;" border bordercolor="#dedede">${table.innerHTML}</table></div>`,
          attrs: {},
        });
        editor.parentNode.insertBefore(newWidget, editor);
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
        widget[0].parentNode.insertBefore(newWidget, widget[2]);
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
        const table = document.createElement("table");
        const trs = container.querySelectorAll("tr");
        let lineCount = 0;
        [].slice.call(trs, 0, 30).forEach((tr, i) => {
          const tds = tr.querySelectorAll("td");
          const newTR = document.createElement("tr");
          const newTds = [];

          if (tds.length < 3) {
            return;
          }

          newTds.push(`<td>${tds[0].innerText}</td>`);
          newTds.push(`<td>${numberUnitFormat(tds[4].innerText)}</td>`);
          newTds.push(`<td>${tds[5].innerText}</td>`);

          newTR.innerHTML = newTds.join("");

          table.appendChild(newTR);
          lineCount += 1;
        });

        if (lineCount < 2) {
          return;
        }

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
