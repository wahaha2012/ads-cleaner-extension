export function cleanDomBySelector(selector) {
  Array.prototype.forEach.call(
    document.querySelectorAll(selector),
    function (item) {
      item.style.cssText = "display:none";
    }
  );
}

export function cleanParentNode(selector) {
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

export function setStyles(selector, options) {
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

export function beautiJisiluTable() {
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
