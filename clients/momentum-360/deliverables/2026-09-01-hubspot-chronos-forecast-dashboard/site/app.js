(function () {
  "use strict";

  var data = window.MOMENTUM_FORECAST;
  var SVG_NS = "http://www.w3.org/2000/svg";

  function byId(id) {
    return document.getElementById(id);
  }

  function setText(id, value) {
    var node = byId(id);
    if (node) node.textContent = value;
  }

  function formatCount(value) {
    return Math.round(Number(value)).toLocaleString("en-US");
  }

  function formatMetric(value) {
    return Number(value).toFixed(2);
  }

  function formatPercent(value) {
    return Number(value).toFixed(2) + "%";
  }

  function formatDate(value, includeYear) {
    var date = new Date(value + "T12:00:00Z");
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: includeYear ? "numeric" : undefined,
      timeZone: "UTC"
    }).format(date);
  }

  function svgNode(name, attributes, text) {
    var node = document.createElementNS(SVG_NS, name);
    Object.keys(attributes || {}).forEach(function (key) {
      node.setAttribute(key, String(attributes[key]));
    });
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function append(parent, child) {
    parent.appendChild(child);
    return child;
  }

  function linePath(values, xScale, yScale) {
    return values.map(function (value, index) {
      return (index === 0 ? "M" : "L") + xScale(index).toFixed(2) + " " + yScale(value).toFixed(2);
    }).join(" ");
  }

  function bandPath(upper, lower, xScale, yScale) {
    var top = upper.map(function (value, index) {
      return (index === 0 ? "M" : "L") + xScale(index).toFixed(2) + " " + yScale(value).toFixed(2);
    });
    var bottom = lower.map(function (value, index) {
      var reverseIndex = lower.length - 1 - index;
      return "L" + xScale(reverseIndex).toFixed(2) + " " + yScale(lower[reverseIndex]).toFixed(2);
    });
    return top.concat(bottom).join(" ") + " Z";
  }

  function chartLabelIds(svg) {
    var ids = (svg.getAttribute("aria-labelledby") || "").split(/\s+/).filter(Boolean);
    return {
      title: ids[0] || svg.id + "-title",
      desc: ids[1] || svg.id + "-desc"
    };
  }

  function renderHoldoutChart(svgId, tooltipId) {
    var svg = byId(svgId);
    if (!svg) return;

    var holdout = data.holdout;
    var width = 880;
    var height = 420;
    var margin = { top: 24, right: 26, bottom: 52, left: 58 };
    var plotWidth = width - margin.left - margin.right;
    var plotHeight = height - margin.top - margin.bottom;
    var yMax = 500;
    var ids = chartLabelIds(svg);
    var xScale = function (index) {
      return margin.left + (plotWidth * index / (holdout.dates.length - 1));
    };
    var yScale = function (value) {
      return margin.top + plotHeight - (Math.max(0, Math.min(yMax, value)) / yMax * plotHeight);
    };

    svg.replaceChildren();
    append(svg, svgNode("title", { id: ids.title }, "Twelve-week held-out evaluation of contacts created"));
    append(svg, svgNode("desc", { id: ids.desc }, "Actual weekly contacts created are compared with Chronos p50, a wide p10 to p90 band, and the 140-contact persistence baseline. Chronos did not beat persistence."));

    var grid = append(svg, svgNode("g", { "aria-hidden": "true" }));
    [0, 100, 200, 300, 400, 500].forEach(function (tick) {
      var y = yScale(tick);
      append(grid, svgNode("line", { x1: margin.left, y1: y, x2: width - margin.right, y2: y, class: "grid-line" }));
      append(grid, svgNode("text", { x: margin.left - 10, y: y + 4, class: "axis-label", "text-anchor": "end" }, String(tick)));
    });
    append(grid, svgNode("line", { x1: margin.left, y1: margin.top, x2: margin.left, y2: height - margin.bottom, class: "axis-line" }));
    append(grid, svgNode("line", { x1: margin.left, y1: height - margin.bottom, x2: width - margin.right, y2: height - margin.bottom, class: "axis-line" }));
    append(grid, svgNode("text", { x: 13, y: margin.top + plotHeight / 2, class: "axis-title", transform: "rotate(-90 13 " + (margin.top + plotHeight / 2) + ")", "text-anchor": "middle" }, "contacts created"));

    [0, 2, 4, 6, 8, 11].forEach(function (index) {
      append(grid, svgNode("text", { x: xScale(index), y: height - 23, class: "axis-label", "text-anchor": "middle" }, formatDate(holdout.dates[index], false)));
    });

    var band = append(svg, svgNode("g", { "data-series": "band", class: "series-band-group" }));
    append(band, svgNode("path", { d: bandPath(holdout.quantiles.p90, holdout.quantiles.p10, xScale, yScale), class: "series-band" }));

    var persistence = append(svg, svgNode("g", { "data-series": "persistence", class: "series-persistence" }));
    append(persistence, svgNode("path", { d: linePath(holdout.persistence, xScale, yScale), class: "series-line" }));

    var chronos = append(svg, svgNode("g", { "data-series": "chronos", class: "series-chronos" }));
    append(chronos, svgNode("path", { d: linePath(holdout.point, xScale, yScale), class: "series-line" }));
    holdout.point.forEach(function (value, index) {
      append(chronos, svgNode("circle", { cx: xScale(index), cy: yScale(value), r: 4.1, class: "chronos-point" }));
    });

    var actual = append(svg, svgNode("g", { "data-series": "actual", class: "series-actual" }));
    append(actual, svgNode("path", { d: linePath(holdout.actual, xScale, yScale), class: "series-line" }));
    holdout.actual.forEach(function (value, index) {
      append(actual, svgNode("circle", { cx: xScale(index), cy: yScale(value), r: 4.8, class: "actual-point" }));
    });

    var hits = append(svg, svgNode("g", { class: "chart-hits" }));
    holdout.actual.forEach(function (value, index) {
      var label = formatDate(holdout.dates[index], true) + ": actual " + formatCount(value) + ", Chronos p50 " + formatCount(holdout.point[index]) + ", persistence " + formatCount(holdout.persistence[index]) + ", p10 to p90 " + formatCount(holdout.quantiles.p10[index]) + " to " + formatCount(holdout.quantiles.p90[index]) + " contacts created.";
      var hit = append(hits, svgNode("circle", {
        cx: xScale(index),
        cy: yScale(value),
        r: 13,
        class: "chart-hit",
        tabindex: "0",
        role: "graphics-symbol",
        "aria-label": label,
        "data-index": index,
        "data-x": xScale(index),
        "data-y": yScale(value)
      }));
      if (tooltipId) bindChartTooltip(hit, tooltipId, label, width, height);
    });
  }

  function bindChartTooltip(hit, tooltipId, label, width, height) {
    var tooltip = byId(tooltipId);
    if (!tooltip) return;

    function show() {
      var parts = label.split(": ");
      tooltip.replaceChildren();
      append(tooltip, document.createElement("strong")).textContent = parts.shift();
      append(tooltip, document.createElement("span")).textContent = parts.join(": ");
      tooltip.style.left = (Number(hit.dataset.x) / width * 100) + "%";
      tooltip.style.top = (Number(hit.dataset.y) / height * 100) + "%";
      tooltip.classList.add("is-visible");
    }

    function hide() {
      tooltip.classList.remove("is-visible");
    }

    hit.addEventListener("mouseenter", show);
    hit.addEventListener("mouseleave", hide);
    hit.addEventListener("focus", show);
    hit.addEventListener("blur", hide);
  }

  function renderHistoryChart(svgId, zoomed) {
    var svg = byId(svgId);
    if (!svg) return;

    var history = data.history;
    var width = 760;
    var height = 300;
    var margin = { top: 22, right: 18, bottom: 42, left: 52 };
    var plotWidth = width - margin.left - margin.right;
    var plotHeight = height - margin.top - margin.bottom;
    var yMax = zoomed ? 220 : 6000;
    var ids = chartLabelIds(svg);
    var extremeDates = Object.keys(history.extremeWeeks);
    var isExtreme = function (index) { return extremeDates.indexOf(history.dates[index]) !== -1; };
    var xScale = function (index) { return margin.left + (plotWidth * index / (history.dates.length - 1)); };
    var yScale = function (value) { return margin.top + plotHeight - (Math.max(0, Math.min(yMax, value)) / yMax * plotHeight); };
    var ticks = zoomed ? [0, 50, 100, 150, 200] : [0, 2000, 4000, 6000];

    svg.replaceChildren();
    append(svg, svgNode("title", { id: ids.title }, zoomed ? "Normal-range weekly contacts-created history" : "Full weekly contacts-created history"));
    append(svg, svgNode("desc", { id: ids.desc }, zoomed ? "A zoomed view of weekly contacts created with the two extreme weeks removed from the line and retained as gold markers." : "A full-scale view of 44 weekly values showing two extreme weeks at 5,177 and 5,718 contacts created."));

    var grid = append(svg, svgNode("g", { "aria-hidden": "true" }));
    ticks.forEach(function (tick) {
      var y = yScale(tick);
      append(grid, svgNode("line", { x1: margin.left, y1: y, x2: width - margin.right, y2: y, class: "grid-line" }));
      append(grid, svgNode("text", { x: margin.left - 9, y: y + 4, class: "axis-label", "text-anchor": "end" }, tick >= 1000 ? (tick / 1000) + "k" : String(tick)));
    });
    append(grid, svgNode("line", { x1: margin.left, y1: margin.top, x2: margin.left, y2: height - margin.bottom, class: "axis-line" }));
    append(grid, svgNode("line", { x1: margin.left, y1: height - margin.bottom, x2: width - margin.right, y2: height - margin.bottom, class: "axis-line" }));
    [0, 10, 20, 30, 43].forEach(function (index) {
      append(grid, svgNode("text", { x: xScale(index), y: height - 16, class: "axis-label", "text-anchor": index === 0 ? "start" : index === 43 ? "end" : "middle" }, formatDate(history.dates[index], index === 0 || index === 43)));
    });

    if (!zoomed) {
      var fullPath = linePath(history.values, xScale, yScale);
      var areaPath = fullPath + " L" + xScale(history.values.length - 1).toFixed(2) + " " + yScale(0).toFixed(2) + " L" + xScale(0).toFixed(2) + " " + yScale(0).toFixed(2) + " Z";
      append(svg, svgNode("path", { d: areaPath, class: "history-area", "aria-hidden": "true" }));
      append(svg, svgNode("path", { d: fullPath, class: "history-line", "aria-hidden": "true" }));
      history.values.forEach(function (value, index) {
        if (isExtreme(index)) {
          append(svg, svgNode("circle", { cx: xScale(index), cy: yScale(value), r: 5, class: "extreme-point" }));
          append(svg, svgNode("text", { x: xScale(index), y: Math.max(margin.top + 13, yScale(value) - 10), class: "extreme-label", "text-anchor": "middle" }, formatCount(value)));
        }
      });
    } else {
      var segments = [];
      var current = [];
      history.values.forEach(function (value, index) {
        if (isExtreme(index)) {
          if (current.length) segments.push(current);
          current = [];
        } else {
          current.push({ value: value, index: index });
        }
      });
      if (current.length) segments.push(current);

      segments.forEach(function (segment) {
        var path = segment.map(function (entry, segmentIndex) {
          return (segmentIndex === 0 ? "M" : "L") + xScale(entry.index).toFixed(2) + " " + yScale(entry.value).toFixed(2);
        }).join(" ");
        append(svg, svgNode("path", { d: path, class: "history-line", "aria-hidden": "true" }));
      });

      history.values.forEach(function (value, index) {
        if (!isExtreme(index)) {
          append(svg, svgNode("circle", { cx: xScale(index), cy: yScale(value), r: 2.5, class: "history-dot", "aria-hidden": "true" }));
        } else {
          append(svg, svgNode("line", { x1: xScale(index), y1: margin.top + 12, x2: xScale(index), y2: height - margin.bottom, class: "extreme-line" }));
          append(svg, svgNode("path", { d: "M" + (xScale(index) - 5) + " " + (margin.top + 13) + " L" + (xScale(index) + 5) + " " + (margin.top + 13) + " L" + xScale(index) + " " + (margin.top + 3) + " Z", class: "extreme-marker" }));
          append(svg, svgNode("text", { x: xScale(index), y: margin.top + 29, class: "extreme-label", "text-anchor": "middle" }, formatCount(value) + " flagged"));
        }
      });
    }
  }

  function appendCell(row, tag, value, scope) {
    var cell = document.createElement(tag);
    if (scope) cell.setAttribute("scope", scope);
    cell.textContent = value;
    row.appendChild(cell);
    return cell;
  }

  function renderHoldoutTable() {
    var table = byId("holdout-table");
    if (!table) return;
    var body = table.querySelector("tbody");
    body.replaceChildren();
    data.holdout.dates.forEach(function (date, index) {
      var row = document.createElement("tr");
      appendCell(row, "th", formatDate(date, true), "row");
      appendCell(row, "td", formatCount(data.holdout.actual[index]));
      appendCell(row, "td", formatCount(data.holdout.point[index]));
      appendCell(row, "td", formatCount(data.holdout.persistence[index]));
      appendCell(row, "td", formatCount(data.holdout.quantiles.p10[index]));
      appendCell(row, "td", formatCount(data.holdout.quantiles.p90[index]));
      body.appendChild(row);
    });
  }

  function comparisonRows() {
    return [
      { label: "Chronos-2", values: data.metrics.chronos, className: "" },
      { label: "Persistence", values: data.metrics.persistence, className: "is-winner" },
      { label: "Trailing four-week mean", values: data.metrics.trailingMean, className: "" }
    ];
  }

  function renderComparisonTable(tableId) {
    var table = byId(tableId);
    if (!table) return;
    var body = table.querySelector("tbody");
    body.replaceChildren();
    comparisonRows().forEach(function (item) {
      var row = document.createElement("tr");
      if (item.className) row.className = item.className;
      appendCell(row, "th", item.label, "row");
      appendCell(row, "td", formatMetric(item.values.mae));
      appendCell(row, "td", formatMetric(item.values.rmse));
      appendCell(row, "td", formatPercent(item.values.wapePercent));
      appendCell(row, "td", formatPercent(item.values.smapePercent));
      body.appendChild(row);
    });
  }

  function renderHistoryTable() {
    var table = byId("history-table");
    if (!table) return;
    var body = table.querySelector("tbody");
    var extremes = data.history.extremeWeeks;
    body.replaceChildren();
    data.history.dates.forEach(function (date, index) {
      var row = document.createElement("tr");
      var flagged = Object.prototype.hasOwnProperty.call(extremes, date);
      if (flagged) row.className = "is-flagged";
      appendCell(row, "th", formatDate(date, true), "row");
      appendCell(row, "td", formatCount(data.history.values[index]));
      appendCell(row, "td", flagged ? "Flagged: likely import, migration, or backfill" : "Included in regular weekly history");
      body.appendChild(row);
    });
  }

  function renderIntegrationRail(id) {
    var rail = byId(id);
    if (!rail) return;
    var stages = [
      ["Account verified", "The intended Momentum 360 account was confirmed before extraction."],
      ["Read-only aggregate", "Only weekly aggregate CRM evidence entered the pilot."],
      ["Regular time series", "A complete 44-week contacts-created series was formed."],
      ["Governed gate", "Client, model, values, horizon, and request must match."],
      ["Local model run", "Chronos-2 produced the point and quantile outputs."],
      ["Baseline score", "The held-out result was compared with simple baselines."],
      ["Safe abstention", "Persistence won, so the system retained evidence only."]
    ];
    rail.replaceChildren();
    stages.forEach(function (stage, index) {
      var item = document.createElement("li");
      var node = document.createElement("span");
      var heading = document.createElement("h4");
      var copy = document.createElement("p");
      node.className = "rail-node";
      node.setAttribute("aria-hidden", "true");
      node.textContent = String(index + 1).padStart(2, "0");
      heading.textContent = stage[0];
      copy.textContent = stage[1];
      item.appendChild(node);
      item.appendChild(heading);
      item.appendChild(copy);
      rail.appendChild(item);
    });
  }

  function renderAccessGrid() {
    var grid = byId("access-grid");
    if (!grid) return;
    grid.replaceChildren();
    data.access.forEach(function (entry) {
      var item = document.createElement("div");
      var label = document.createElement("span");
      var count = document.createElement("strong");
      label.textContent = entry[0];
      count.textContent = formatCount(entry[1]);
      item.appendChild(label);
      item.appendChild(count);
      grid.appendChild(item);
    });
  }

  function renderNextExperiment(id) {
    var list = byId(id);
    if (!list) return;
    list.replaceChildren();
    data.nextExperiment.forEach(function (entry) {
      var item = document.createElement("li");
      var heading = document.createElement("h4");
      var copy = document.createElement("p");
      heading.textContent = entry[0];
      copy.textContent = entry[1];
      item.appendChild(heading);
      item.appendChild(copy);
      list.appendChild(item);
    });
  }

  function initLegendControls() {
    document.querySelectorAll(".legend-control").forEach(function (control) {
      control.addEventListener("click", function () {
        var chart = byId(control.dataset.chart);
        if (!chart) return;
        var pressed = control.getAttribute("aria-pressed") === "true";
        control.setAttribute("aria-pressed", pressed ? "false" : "true");
        chart.querySelectorAll("[data-series='" + control.dataset.series + "']").forEach(function (series) {
          series.classList.toggle("series-hidden", pressed);
          series.setAttribute("aria-hidden", pressed ? "true" : "false");
        });
      });
    });
  }

  function initTabs() {
    var tabList = document.querySelector("[role='tablist']");
    if (!tabList) return;
    var tabs = Array.prototype.slice.call(tabList.querySelectorAll("[role='tab']"));

    function selectTab(tab, focus) {
      tabs.forEach(function (candidate) {
        var selected = candidate === tab;
        candidate.setAttribute("aria-selected", selected ? "true" : "false");
        candidate.tabIndex = selected ? 0 : -1;
        var panel = byId(candidate.getAttribute("aria-controls"));
        if (panel) panel.hidden = !selected;
      });
      if (focus) tab.focus();
      if (window.history && window.history.replaceState) {
        window.history.replaceState(null, "", "#" + tab.id.replace("tab-", ""));
      }
    }

    tabs.forEach(function (tab, index) {
      tab.addEventListener("click", function () { selectTab(tab, false); });
      tab.addEventListener("keydown", function (event) {
        var nextIndex = null;
        if (event.key === "ArrowRight") nextIndex = (index + 1) % tabs.length;
        if (event.key === "ArrowLeft") nextIndex = (index - 1 + tabs.length) % tabs.length;
        if (event.key === "Home") nextIndex = 0;
        if (event.key === "End") nextIndex = tabs.length - 1;
        if (nextIndex !== null) {
          event.preventDefault();
          selectTab(tabs[nextIndex], true);
        }
      });
    });

    var hash = window.location.hash.replace("#", "");
    var hashTab = byId("tab-" + hash);
    if (hashTab) selectTab(hashTab, false);
  }

  function populateCommonCopy() {
    setText("verdict-state", data.verdict.state);
    setText("verdict-summary", data.verdict.summary);
    setText("verdict-decision", data.verdict.decision);
    setText("metric-chronos-wape", formatPercent(data.metrics.chronos.wapePercent));
    setText("metric-persistence-wape", formatPercent(data.metrics.persistence.wapePercent));
    setText("metric-coverage", formatPercent(data.metrics.coverageObserved));
    setText("metric-concentration", formatPercent(data.dataQuality.shareInTwoWeeks));
    setText("coverage-observed", formatPercent(data.metrics.coverageObserved));
    setText("warning-share", formatPercent(data.dataQuality.shareInTwoWeeks));
    setText("warning-counts", formatCount(data.dataQuality.recordsInTwoWeeks) + " of " + formatCount(data.dataQuality.completeWindowRecords) + " contacts created");
    setText("channel-coverage", formatPercent(data.coverage.channelMappingPercent));
    setText("brief-chronos-wape", formatPercent(data.metrics.chronos.wapePercent));
    setText("brief-persistence-wape", formatPercent(data.metrics.persistence.wapePercent));
    setText("brief-coverage", formatPercent(data.metrics.coverageObserved));
    setText("brief-concentration", formatPercent(data.dataQuality.shareInTwoWeeks));
    setText("brief-warning-share", formatPercent(data.dataQuality.shareInTwoWeeks));

    var evidenceDate = byId("evidence-date");
    if (evidenceDate) {
      evidenceDate.dateTime = data.meta.reviewedAt;
      evidenceDate.textContent = "Evidence reviewed " + formatDate(data.meta.reviewedAt, true);
    }

    var coverageBar = byId("coverage-bar");
    if (coverageBar) coverageBar.style.width = Math.max(0, Math.min(100, data.metrics.coverageObserved)) + "%";
    var coverageTarget = byId("coverage-target");
    if (coverageTarget) coverageTarget.style.left = Math.max(0, Math.min(100, data.metrics.coverageIntended)) + "%";
  }

  function initDashboard() {
    renderHoldoutChart("holdout-chart", "holdout-tooltip");
    renderHoldoutTable();
    renderComparisonTable("comparison-table");
    renderHistoryChart("history-full-chart", false);
    renderHistoryChart("history-zoom-chart", true);
    renderHistoryTable();
    renderIntegrationRail("integration-rail");
    renderAccessGrid();
    renderNextExperiment("next-experiment");
    initLegendControls();
    initTabs();
  }

  function initBrief() {
    renderIntegrationRail("brief-integration-rail");
    renderHoldoutChart("brief-holdout-chart", null);
    renderComparisonTable("brief-comparison-table");
    renderHistoryChart("brief-history-full", false);
    renderHistoryChart("brief-history-zoom", true);
    renderNextExperiment("brief-next-experiment");
  }

  function showDataError() {
    var notice = document.createElement("div");
    notice.className = "noscript";
    notice.setAttribute("role", "alert");
    notice.textContent = "Verified forecast data could not be loaded. Refresh the page or use the executive PDF.";
    document.body.appendChild(notice);
  }

  if (!data) {
    showDataError();
    return;
  }

  populateCommonCopy();
  if (document.body.dataset.page === "brief") initBrief();
  else initDashboard();
  window.MOMENTUM_DASHBOARD_READY = true;
}());
