import { createElement } from "../utils/dom";
import {
  numberUnitFormat,
  thousandsSeparatorFormat,
  compareDirFormat,
} from "../utils/format";

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
    yctj.data.slice(0, 6).forEach((tr, i) => {
      const newTR = document.createElement("tr");
      const newTds = [];
      const key = `syl${i > 2 ? i - 2 : ""}`;

      newTds.push(`<td>${tr.rq}</td>`);
      newTds.push(`<td>${tr.jlr}</td>`);
      newTds.push(`<td>${i > 1 ? gsjlr[i - 2].ratio + "%" : "-"}</td>`);
      newTds.push(`<td>${i > 1 ? jgyc.data[0][key] : "-"}</td>`);

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
        widget[0].parentNode.insertBefore(newWidget, widget[2]);

        this.addFinanceData(symbolStr);
        this.addShareholdersData(symbolStr);

        this.addManagementActivity(symbolStr);
      }
    );
  },

  addManagementActivity(symbolStr) {
    const url = `https://emweb.securities.eastmoney.com/PC_HSF10/CompanyManagement/CompanyManagementAjax?code=${symbolStr}`;
    chrome.runtime.sendMessage(
      {
        url,
        source: "eastmoney",
      },
      (data) => {
        const { RptShareHeldChangeList } = data;
        const table = document.createElement("table");

        const firstTr = document.createElement("tr");
        firstTr.innerHTML =
          "<th>日期</th><th width='20%'>变动人</th><th>变动数</th><th>均价(元)</th><th width='20%'>职位</th>";
        table.appendChild(firstTr);

        RptShareHeldChangeList.slice(0, 10).forEach((tr, i) => {
          const newTR = document.createElement("tr");
          const newTds = [];

          newTds.push(`<td>${tr.rq}</td>`);
          newTds.push(`<td>${tr.bdr}</td>`);
          newTds.push(`<td>${tr.bdsl}</td>`);
          newTds.push(`<td>${tr.jjjj}</td>`);
          newTds.push(`<td>${tr.ggzw}</td>`);

          newTR.innerHTML = newTds.join("");

          table.appendChild(newTR);
        });

        const widget = document.querySelectorAll(".stock-widget");
        const url = `https://emweb.securities.eastmoney.com/PC_HSF10/CompanyManagement/Index?type=soft&code=${symbolStr}`;
        const newWidget = createElement({
          tagName: "div",
          innerHTML: `<div class="widget-header"><div class="title"><a href="${url}" target="_blank" style="color:#33353c;">持股变动</a></div></div><div class="widget-content"><table style="font-size:12px;width:100%;">${table.innerHTML}</table></div>`,
          attrs: {
            class: "stock-widget",
          },
        });
        widget[0].parentNode.insertBefore(newWidget, widget[4]);
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
          innerHTML: `<div class="widget-header"><div class="title"><a href="${url}" target="_blank" style="color:#33353c;">十大股东</a></div></div><div class="widget-content"><table style="font-size:12px;width:100%;font-size:12px;width:100%;border-collapse:collapse;margin-bottom: 10px;" border bordercolor="#dedede">${table.innerHTML}</table></div>`,
          attrs: {},
        });
        editor.parentNode.insertBefore(newWidget, editor);
      }
    );
  },

  addBalanceData(symbolStr, dateList) {
    // 资产负债表
    const url = `https://emweb.securities.eastmoney.com/PC_HSF10/NewFinanceAnalysis/zcfzbAjaxNew?companyType=4&reportDateType=0&reportType=1&dates=${dateList.join(
      ","
    )}&code=${symbolStr}`;
    chrome.runtime.sendMessage(
      {
        url,
        source: "eastmoney",
      },
      (res) => {
        const { data } = res;
        const table = document.createElement("table");

        const firstTr = document.createElement("tr");
        firstTr.innerHTML =
          "<th>报告期</th><th>货币资金</th><th>短期借款</th><th>应收账款</th><th>无形资产</th><th>商誉</th><th>股东权益</th><th>负债合计</th>";
        table.appendChild(firstTr);

        const getTrend = (i, key) => {
          const nextId = i < data.length - 1 ? i + 1 : data.length - 1;
          return compareDirFormat(data[i][key], data[nextId][key]);
        };

        data.forEach((tr, i) => {
          const newTR = document.createElement("tr");
          const newTds = [];

          newTds.push(`<td>${tr.REPORT_DATE.split(" ")[0]}</td>`);
          newTds.push(
            `<td>${numberUnitFormat(tr.MONETARYFUNDS)}${getTrend(
              i,
              "MONETARYFUNDS"
            )}</td>`
          );
          newTds.push(
            `<td>${numberUnitFormat(tr.SHORT_LOAN) || "--"}${getTrend(
              i,
              "SHORT_LOAN"
            )}</td>`
          );
          newTds.push(
            `<td>${numberUnitFormat(tr.NOTE_ACCOUNTS_RECE)}${getTrend(
              i,
              "NOTE_ACCOUNTS_RECE"
            )}</td>`
          );
          newTds.push(
            `<td>${numberUnitFormat(tr.INTANGIBLE_ASSET) || "--"}${getTrend(
              i,
              "INTANGIBLE_ASSET"
            )}</td>`
          );
          newTds.push(
            `<td>${numberUnitFormat(tr.GOODWILL) || "--"}${getTrend(
              i,
              "GOODWILL"
            )}</td>`
          );
          newTds.push(
            `<td>${numberUnitFormat(tr.TOTAL_EQUITY)}${getTrend(
              i,
              "TOTAL_EQUITY"
            )}</td>`
          );
          newTds.push(
            `<td>${numberUnitFormat(tr.TOTAL_LIABILITIES)}${getTrend(
              i,
              "TOTAL_LIABILITIES"
            )}</td>`
          );

          newTR.innerHTML = newTds.join("");

          table.appendChild(newTR);
        });

        // 总结
        const lastTr = document.createElement("tr");
        lastTr.innerHTML = `<th>总结</th><th colspan="2">${
          data[0].MONETARYFUNDS / data[0].SHORT_LOAN > 1.2
            ? "现金充足"
            : "现金紧张"
        }</th><th></th><th>${
          data[0].INTANGIBLE_ASSET / data[0].TOTAL_EQUITY > 0.15
            ? "占比过大"
            : "正常"
        }</th><th>${
          data[0].GOODWILL / data[0].TOTAL_EQUITY > 0.15 ? "商誉过大" : "正常"
        }</th><th colspan="2">${
          data[0].TOTAL_LIABILITIES / data[0].TOTAL_EQUITY > 1
            ? "高杠杆"
            : "正常"
        }</th>`;
        table.appendChild(lastTr);

        const editor = document.querySelector(".editor-container");
        const newWidget = createElement({
          tagName: "div",
          innerHTML: `<div class="widget-content"><table style="font-size:12px;width:100%;font-size:12px;width:100%;border-collapse:collapse;margin-bottom: 10px;" border bordercolor="#dedede">${table.innerHTML}</table></div>`,
          attrs: {},
        });
        editor.parentNode.insertBefore(newWidget, editor);
      }
    );
  },

  addFinanceData(symbolStr) {
    const url = `https://emweb.securities.eastmoney.com/PC_HSF10/NewFinanceAnalysis/ZYZBAjaxNew?type=0&code=${symbolStr}`;
    chrome.runtime.sendMessage(
      {
        url,
        source: "eastmoney",
      },
      (res) => {
        const { data } = res;
        const dateList = [];
        const table = document.createElement("table");

        const firstTr = document.createElement("tr");
        firstTr.innerHTML =
          "<th>报告期</th><th>流动比率</th><th>权益乘数</th><th>应收周转天数</th><th>存货周转天数</th><th>扣非净资产收益率%</th><th>毛利率%</th><th>净利率%</th>";
        table.appendChild(firstTr);

        const getTrend = (i, key) => {
          const nextId = i < data.length - 1 ? i + 1 : data.length - 1;
          return compareDirFormat(data[i][key], data[nextId][key]);
        };

        data.forEach((tr, i) => {
          const newTR = document.createElement("tr");
          const newTds = [];

          dateList.push(tr.REPORT_DATE.split(" ")[0]);
          // 与前一项做对比，升还是降(箭头表示)
          newTds.push(`<td>${tr.REPORT_DATE.split(" ")[0]}</td>`);
          newTds.push(`<td>${tr.LD.toFixed(3)}${getTrend(i, "LD")}</td>`);
          newTds.push(`<td>${tr.QYCS.toFixed(3)}${getTrend(i, "QYCS")}</td>`);
          newTds.push(
            `<td>${tr.YSZKZZTS?.toFixed(3)}${getTrend(i, "YSZKZZTS")}</td>`
          );
          newTds.push(
            `<td>${tr.CHZZTS?.toFixed(0)}${getTrend(i, "CHZZTS")}</td>`
          );
          newTds.push(
            `<td>${tr.ROEKCJQ ? tr.ROEKCJQ.toFixed(2) : "--"}${
              tr.ROEKCJQ ? getTrend(i, "ROEKCJQ") : ""
            }</td>`
          );
          newTds.push(
            `<td>${tr.XSMLL?.toFixed(2)}${getTrend(i, "XSMLL")}</td>`
          );
          newTds.push(
            `<td>${tr.XSJLL?.toFixed(2)}${getTrend(i, "XSJLL")}</td>`
          );

          newTR.innerHTML = newTds.join("");

          table.appendChild(newTR);
        });

        // 总结
        const lastTr = document.createElement("tr");
        lastTr.innerHTML = `<th>总结</th><th>${
          data[0].LD > 1.5
            ? "资金充裕"
            : data[0].LD < 1
            ? "资金紧张"
            : "资金正常"
        }</th><th>${
          data[0].QYCS >= 3
            ? "超高杠杆"
            : data[0].QYCS >= 2
            ? "高杠杆"
            : data[0].QYCS < 1
            ? "低杠杆"
            : "正常"
        }</th><th>${
          data[0].YSZKZZTS > 150
            ? "收款困难"
            : data[0].YSZKZZTS < 30
            ? "收款容易"
            : "账期一般"
        }</th><th>${
          data[0].CHZZTS > 300
            ? "存货较多"
            : data[0].CHZZTS < 100
            ? "存货较少"
            : "存货正常"
        }</th><th></th><th>${
          data[0].XSMLL > 50
            ? "高毛利"
            : data[0].XSMLL < 20
            ? "低毛利"
            : "毛利正常"
        }</th><th>${
          data[0].XSJLL > 20
            ? "利润率高"
            : data[0].XSJLL < 10
            ? "利润率低"
            : "正常利润"
        }</th>`;
        table.appendChild(lastTr);

        const editor = document.querySelector(".editor-container");
        const url = `https://emweb.securities.eastmoney.com/PC_HSF10/NewFinanceAnalysis/Index?type=soft&code=${symbolStr}`;
        const newWidget = createElement({
          tagName: "div",
          innerHTML: `<div class="widget-header"><div class="title"><a href="${url}" target="_blank" style="color:#33353c;">财务指标</a></div></div><div class="widget-content"><table style="font-size:12px;width:100%;font-size:12px;width:100%;border-collapse:collapse;margin-bottom: 10px;" border bordercolor="#dedede">${table.innerHTML}</table></div>`,
          attrs: {},
        });
        editor.parentNode.insertBefore(newWidget, editor);

        this.addBalanceData(symbolStr, dateList);
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

  // fear and greed index
  addGreedAndFearIndex() {
    const url = `http://funddb.cn/tool/fear`;
    chrome.runtime.sendMessage(
      {
        url,
        dataType: "text",
        source: "funddb",
      },
      (html) => {
        const rawHTML = html.replace(/[\r\n]+/g, "");
        const itemPattern = /\s*<.+?>\s*/g;
        const indexStatusList = (
          rawHTML.match(/<p\s+class="p2">.*?<\/p>/g) || []
        ).map((item) => item.replace(itemPattern, ""));

        const statusList = (
          rawHTML.match(/<span\s+class="s3">.*?<\/span>/g) || []
        ).map((item) => item.replace(itemPattern, ""));

        const sideMenu = document.querySelector(".xueqiu__menu");
        const list = [
          `<li>贪婪指数：<strong>${indexStatusList[3]}</strong></li>`,
          `<li>贪婪程度：<strong>${indexStatusList[2]}</strong></li>`,
          `<li>融资杠杆：<strong>${statusList[8]}</strong></li>`,
          `<li>股回报率：<strong>${statusList[7]}</strong></li>`,
          `<li>股价强度：<strong>${statusList[5]}</strong></li>`,
        ];

        const greedFearInfo = createElement({
          tagName: "ul",
          innerHTML: list.join(""),
          attrs: {
            class: "user__control__pannel",
          },
        });

        sideMenu.parentElement.insertBefore(greedFearInfo, sideMenu);
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
