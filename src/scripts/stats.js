/* ──────────────────────────────────────────
   stats.js — Statistics dashboard logic
   ────────────────────────────────────────── */

var docLabels = {
  "КонтингентПользов": "Контингент (пользов.)",
  "КонтингентЧастных": "Контингент (частные)",
  "УточнениеКонтинг": "Уточнение контингента",
  "КонтингентЕжемес": "Контингент ежемесячный",
  "Тарификация": "Тарификационные списки",
  "РасходыФинОрг": "Расходы фин.органов",
  "ОтчетСубвенции": "Отчёт о субвенциях",
  "ЗагрКонтингент": "Загруженный контингент",
  "ВводНормативов": "Ввод нормативов",
  "ПолученныеДанные": "Полученные данные",
  "СборДанных": "Сбор данных",
  "СборДанныхЕжемес": "Сбор данных ежемес."
};

var PALETTE = [
  "#00c6ff","#7b61ff","#00e5a0","#ff6b6b","#ffb347","#d16cff",
  "#00bcd4","#f9ca24","#6ab04c","#eb4d4b","#686de0","#30336b"
];

function animCounter(id, target, dur) {
  dur = dur || 1800;
  var el = document.getElementById(id);
  var start = null;
  function step(ts) {
    if (!start) start = ts;
    var p = Math.min((ts - start) / dur, 1);
    var ease = 1 - Math.pow(1 - p, 4);
    el.textContent = Math.round(ease * target).toLocaleString("ru-RU");
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function initDashboard(raw) {
  var userDocs = {}, userSess = {}, docTotals = {};

  Object.keys(raw).forEach(function(u) {
    var d = raw[u];
    userDocs[u] = Object.keys(d)
      .filter(function(k) { return k !== "Сеанс"; })
      .reduce(function(s, k) { return s + d[k]; }, 0);
    userSess[u] = d["Сеанс"] || 0;
    Object.keys(d).forEach(function(k) {
      if (k !== "Сеанс") docTotals[k] = (docTotals[k] || 0) + d[k];
    });
  });

  var sorted = Object.entries(userDocs).sort(function(a, b) { return b[1] - a[1]; });
  var top20 = sorted.slice(0, 20).reverse();
  var top25sess = Object.entries(userSess).sort(function(a, b) { return b[1] - a[1]; }).slice(0, 25).reverse();
  var totalDocs = Object.values(userDocs).reduce(function(a, b) { return a + b; }, 0);
  var totalSess = Object.values(userSess).reduce(function(a, b) { return a + b; }, 0);

  /* KPI counters */
  animCounter("kv1", 10210);
  animCounter("kv2", totalDocs);
  animCounter("kv3", totalSess);
  animCounter("kv4", 132);
  animCounter("kv5", 96);

  /* Chart defaults */
  Chart.defaults.color = "rgba(232,234,240,0.55)";
  Chart.defaults.font.family = "'Inter',system-ui,sans-serif";
  Chart.defaults.font.size = 12;
  var gc = "rgba(255,255,255,0.06)";
  var tc = "rgba(232,234,240,0.45)";

  /* Bar chart: top-20 by documents */
  (function() {
    var ctx = document.getElementById("barChart").getContext("2d");
    var g1 = ctx.createLinearGradient(0, 0, 500, 0);
    g1.addColorStop(0, "#00c6ff");
    g1.addColorStop(1, "#7b61ff");
    var g2 = ctx.createLinearGradient(0, 0, 500, 0);
    g2.addColorStop(0, "rgba(0,229,160,0.6)");
    g2.addColorStop(1, "rgba(123,97,255,0.4)");
    new Chart(ctx, {
      type: "bar",
      data: {
        labels: top20.map(function(e) { return e[0]; }),
        datasets: [
          { label: "Документы", data: top20.map(function(e) { return e[1]; }), backgroundColor: g1, borderRadius: 6, borderSkipped: false },
          { label: "Сессии", data: top20.map(function(e) { return userSess[e[0]]; }), backgroundColor: g2, borderRadius: 6, borderSkipped: false }
        ]
      },
      options: {
        indexAxis: "y", responsive: true, maintainAspectRatio: false,
        animation: { duration: 1200, easing: "easeOutQuart" },
        plugins: {
          legend: { position: "top", labels: { color: "rgba(232,234,240,0.7)", boxWidth: 12, padding: 20 } },
          tooltip: { backgroundColor: "rgba(10,14,26,0.92)", borderColor: "rgba(255,255,255,0.12)", borderWidth: 1, padding: 12, titleFont: { size: 13 }, bodyFont: { size: 12 } }
        },
        scales: {
          x: { grid: { color: gc }, ticks: { color: tc }, title: { display: true, text: "Количество событий", color: tc } },
          y: { grid: { color: gc }, ticks: { color: "rgba(232,234,240,0.75)", font: { size: 10 } } }
        }
      }
    });
  })();

  /* Doughnut chart: document types */
  (function() {
    var ctx = document.getElementById("donutChart").getContext("2d");
    var keys = Object.keys(docTotals);
    var vals = keys.map(function(k) { return docTotals[k]; });
    var lbls = keys.map(function(k) { return docLabels[k] || k; });
    var total = vals.reduce(function(a, b) { return a + b; }, 0);
    new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: lbls,
        datasets: [{ data: vals, backgroundColor: PALETTE, borderColor: "rgba(10,14,26,0.8)", borderWidth: 3, hoverOffset: 8 }]
      },
      options: {
        responsive: true, maintainAspectRatio: false, cutout: "66%",
        animation: { animateRotate: true, duration: 1400 },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "rgba(10,14,26,0.92)", borderColor: "rgba(255,255,255,0.12)", borderWidth: 1, padding: 12,
            callbacks: {
              label: function(c) {
                return c.label + ': ' + c.parsed.toLocaleString("ru-RU") + ' (' + (c.parsed / total * 100).toFixed(1) + '%)';
              }
            }
          }
        }
      },
      plugins: [{
        id: "centerText",
        beforeDraw: function(chart) {
          var area = chart.chartArea;
          var cx = (area.left + area.right) / 2;
          var cy = (area.top + area.bottom) / 2;
          var ctx2 = chart.ctx;
          ctx2.save();
          ctx2.font = "bold 26px Inter";
          ctx2.fillStyle = "#e8eaf0";
          ctx2.textAlign = "center";
          ctx2.textBaseline = "middle";
          ctx2.fillText(total.toLocaleString("ru-RU"), cx, cy - 10);
          ctx2.font = "12px Inter";
          ctx2.fillStyle = "rgba(232,234,240,0.45)";
          ctx2.fillText("документов", cx, cy + 14);
          ctx2.restore();
        }
      }]
    });

    var pillsEl = document.getElementById("pills");
    keys.forEach(function(k, i) {
      var pct = (docTotals[k] / total * 100).toFixed(1);
      pillsEl.innerHTML +=
        '<div class="pill"><span class="pill-dot" style="background:' + PALETTE[i % 12] + '"></span>' +
        (docLabels[k] || k) + ' <strong style="color:' + PALETTE[i % 12] + '">' + pct + '%</strong></div>';
    });
  })();

  /* Rank list: top-10 by sessions */
  (function() {
    var top10 = Object.entries(userSess).sort(function(a, b) { return b[1] - a[1]; }).slice(0, 10);
    var max = top10[0][1];
    var rankEl = document.getElementById("rankList");
    var medals = ["gold", "silver", "bronze"];
    top10.forEach(function(entry, i) {
      var u = entry[0], v = entry[1];
      rankEl.innerHTML +=
        '<div class="rank-item">' +
          '<div class="rank-n ' + (medals[i] || '') + '">' + (i + 1) + '</div>' +
          '<div class="rank-name">' + u + '</div>' +
          '<div class="rank-bar-wrap"><div class="rank-bar" style="width:' + Math.round(v / max * 100) + '%"></div></div>' +
          '<div class="rank-val">' + v + '</div>' +
        '</div>';
    });
  })();

  /* Bar chart: top-25 by sessions */
  (function() {
    var ctx = document.getElementById("sessChart").getContext("2d");
    var g = ctx.createLinearGradient(0, 0, 0, 300);
    g.addColorStop(0, "rgba(123,97,255,0.85)");
    g.addColorStop(1, "rgba(0,198,255,0.45)");
    new Chart(ctx, {
      type: "bar",
      data: {
        labels: top25sess.map(function(e) { return e[0]; }),
        datasets: [{ label: "Сессий", data: top25sess.map(function(e) { return e[1]; }), backgroundColor: g, borderRadius: 6, borderSkipped: false }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        animation: { duration: 1000, easing: "easeOutCubic" },
        plugins: {
          legend: { display: false },
          tooltip: { backgroundColor: "rgba(10,14,26,0.92)", borderColor: "rgba(255,255,255,0.12)", borderWidth: 1, padding: 10 }
        },
        scales: {
          x: { grid: { color: gc }, ticks: { color: tc, maxRotation: 40, minRotation: 30, font: { size: 10 } } },
          y: { grid: { color: gc }, ticks: { color: tc }, title: { display: true, text: "Сессий", color: tc } }
        }
      }
    });
  })();
}

/* ── Initialization: load data then render ── */

window.addEventListener("load", function() {
  fetch("data/stats-data.json")
    .then(function(response) { return response.json(); })
    .then(function(data) { initDashboard(data); })
    .catch(function(err) { console.error("Failed to load stats data:", err); });
});
