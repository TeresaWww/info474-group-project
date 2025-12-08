(function () {
  window.banBusinessFilter = "small"; // default filter

  window.VizBan = {
    dataLoaded: false,
    table: null,
    filterButtonsCreated: false,
    uiInitialized: false,

// ---------------- UI INITIALIZATION ----------------
initUI: function (p) {
  const container = document.getElementById("vis");

  // Wrapper for both label + buttons
  this.filterUI = p.createDiv();
  this.filterUI.parent(container);
  this.filterUI.style("position", "absolute");
  this.filterUI.style("top", "60px");              // directly under title
  this.filterUI.style("left", "50%");
  this.filterUI.style("transform", "translateX(-50%)");
  this.filterUI.style("color", "white");
  this.filterUI.style("font-size", "14px");
  this.filterUI.style("display", "flex");
  this.filterUI.style("gap", "10px");
  this.filterUI.style("align-items", "center");
  this.filterUI.style("z-index", "10");

  // Label
  this.filterLabel = p.createDiv("Business Type:");
  this.filterLabel.parent(this.filterUI);

  // Buttons wrapper (inline)
  this.filterBtns = p.createDiv();
  this.filterBtns.parent(this.filterUI);
  this.filterBtns.style("display", "flex");
  this.filterBtns.style("gap", "8px");

  ["small", "large"].forEach((value) => {
    const name = value.charAt(0).toUpperCase() + value.slice(1);
    const b = p.createButton(name);
    b.parent(this.filterBtns);

    b.style("padding", "4px 10px");
    b.style("background", "#111");
    b.style("color", "white");
    b.style("border", "1px solid #444");
    b.style("border-radius", "4px");
    b.style("cursor", "pointer");

    // default highlight
    if (value === window.banBusinessFilter) {
      b.style("background", "#69C9D0");
      b.style("color", "black");
    }

    b.mousePressed(() => {
      window.banBusinessFilter = value;
      [...this.filterBtns.elt.children].forEach(btn => {
        btn.style.background = "#111";
        btn.style.color = "white";
      });
      b.style("background", "#69C9D0");
      b.style("color", "black");
    });
  });

  this.filterButtonsCreated = true;
},

    // ---------------- MAIN DRAW FUNCTION ----------------
    draw: function (p, manager, ai, progress) {
      p.push();

      const W = manager.canvasWidth;
      const H = manager.canvasHeight;

      p.background(0);

      // Initialize UI once
      if (!this.uiInitialized) {
        this.initUI(p);
        this.uiInitialized = true;
      }

      // Show/hide UI depending on AI index
      if (this.filterButtonsCreated) {
        if (ai === 10) {
          this.filterUI?.show();
          this.filterUI?.style("display", "flex");
        } else {
          this.filterUI?.hide();
        }
      }

      

      // ---------------- LOAD CSV ----------------
      if (!this.dataLoaded) {
        p.loadTable(
          "data/Tiktok_vs_Meta_ban.csv",
          "csv",
          "header",
          (table) => {
            this.table = table;
            this.dataLoaded = true;
          },
          (err) => console.error("CSV load error:", err)
        );

        p.fill(255);
        p.textAlign(p.CENTER, p.CENTER);
        p.textSize(18);
        p.text("Loading advertiser spend data...", W / 2, H / 2);
        p.pop();
        return;
      }

      // ---------------- TITLE ----------------
      p.push();
      p.fill(255);
      p.textAlign(p.CENTER, p.TOP);
      p.textSize(22);
      p.textStyle(p.BOLD);
      p.text("Advertisers Spending Shifts During the TikTok Outage (baseline Jan 18)", W / 2, 20);
      p.pop();

      // ---------------- EXTRACT DATA ----------------
      const rowCount = this.table.getRowCount();
      const dates = [];
      const tikTokSmall = [];
      const tikTokLarge = [];
      const metaSmall = [];
      const metaLarge = [];

      for (let r = 0; r < rowCount; r++) {
        const date = this.table.getString(r, "Date").trim();
        dates.push(date);

        tikTokSmall.push(this.table.getNum(r, "TikTok_small") * 100);
        tikTokLarge.push(this.table.getNum(r, "TikTok_large") * 100);
        metaSmall.push(this.table.getNum(r, "Meta_small") * 100);
        metaLarge.push(this.table.getNum(r, "Meta_large") * 100);
      }

      // ---------------- LAYOUT ----------------
      const M = { top: 120, right: 130, bottom: 80, left: 80 };
      const w = W - M.left - M.right;
      const h = H - M.top - M.bottom;

      const minY = -100;
      const maxY = 100;

      const xStep = w / (rowCount - 1);
      const yScale = (v) => p.map(v, minY, maxY, h, 0);

      p.translate(M.left, M.top);

      // ---------------- AXES ----------------
      p.stroke(255);
      p.line(0, 0, 0, h);
      p.line(0, h, w, h);

      // ---------------- Y-AXIS TITLE (NOT BOLD) ----------------
      p.push();
      p.translate(-45, h / 2);
      p.rotate(-p.HALF_PI);
      p.textAlign(p.CENTER, p.CENTER);
      p.textSize(12);
      p.fill(230);
      p.text("% Change Relative to Baseline (Jan 18)", 0, 0);
      p.pop();

      // ---------------- Y TICKS ----------------
      p.textAlign(p.RIGHT, p.CENTER);
      p.textSize(10);

      for (let t = -100; t <= 100; t += 20) {
        const y = yScale(t);
        p.stroke(80);
        p.line(0, y, w, y);

        p.noStroke();
        p.fill(255);
        p.text(`${t}%`, -5, y);
      }

      // ---------------- X TICKS ----------------
      p.textAlign(p.CENTER, p.TOP);
      p.textSize(10);

      dates.forEach((d, i) => {
        const x = i * xStep;
        p.stroke(255);
        p.line(x, h, x, h + 5);

        p.noStroke();
        p.fill(255);
        p.text(d, x, h + 8);
      });

      // ---------------- ZERO LINE ----------------
      const zeroY = yScale(0);
      p.stroke(160);
      p.drawingContext.setLineDash([4, 4]);
      p.line(0, zeroY, w, zeroY);
      p.drawingContext.setLineDash([]);

      // ---------------- SHADED REGION (Jan 18 → Jan 19) ----------------
      function shadeBetween(dateA, dateB, color) {
        let idxA = dates.indexOf(dateA);
        let idxB = dates.indexOf(dateB);
        if (idxA === -1 || idxB === -1) return;

        if (idxB < idxA) [idxA, idxB] = [idxB, idxA]; // swap

        const xA = idxA * xStep;
        const xB = idxB * xStep;

        p.push();
        p.noStroke();
        p.fill(color);
        p.rect(xA, 0, xB - xA, h);
        p.pop();

          // Add label right above shaded box
        p.push();
        p.fill(255);
        p.textSize(10);
        p.textAlign(p.LEFT, p.BOTTOM);
        p.text("TikTok outage", xA - 10, -5);
        p.pop();
      }

      shadeBetween("18-Jan", "19-Jan",p.color(255, 60, 60, 60));

      // ---------------- DRAW SERIES ----------------
      function drawSeries(arr, color) {
        p.noFill();
        p.stroke(color);
        p.strokeWeight(3);
        p.beginShape();
        arr.forEach((v, i) => p.vertex(i * xStep, yScale(v)));
        p.endShape();
      }

      const f = window.banBusinessFilter;

      if (f === "small") {
        drawSeries(tikTokSmall, p.color(238, 29, 82));
        drawSeries(metaSmall, p.color(24, 119, 242));
      } else {
        drawSeries(tikTokLarge, p.color(238, 29, 82));
        drawSeries(metaLarge, p.color(24, 119, 242));
      }

      // ---------------- HOVER ----------------
      let hoverIdx = Math.round((p.mouseX - M.left) / xStep);
      hoverIdx = p.constrain(hoverIdx, 0, rowCount - 1);
      const hx = hoverIdx * xStep;

      p.stroke(180);
      p.drawingContext.setLineDash([3, 3]);
      p.line(hx, 0, hx, h);
      p.drawingContext.setLineDash([]);

      function hoverCircle(arr, color) {
        p.fill(color);
        p.noStroke();
        p.circle(hx, yScale(arr[hoverIdx]), 7);
      }

      if (f === "small") {
        hoverCircle(tikTokSmall, p.color(238, 29, 82));
        hoverCircle(metaSmall, p.color(24, 119, 242));
      } else {
        hoverCircle(tikTokLarge, p.color(238, 29, 82));
        hoverCircle(metaLarge, p.color(24, 119, 242));
      }

      // ---------------- TOOLTIP ----------------
      p.fill(255);
      p.textSize(12);
      p.textAlign(p.LEFT, p.TOP);

      const tooltip = [dates[hoverIdx]];

      if (f === "small") {
        tooltip.push(`TikTok small: ${tikTokSmall[hoverIdx].toFixed(1)}%`);
        tooltip.push(`Meta small: ${metaSmall[hoverIdx].toFixed(1)}%`);
      } else {
        tooltip.push(`TikTok large: ${tikTokLarge[hoverIdx].toFixed(1)}%`);
        tooltip.push(`Meta large: ${metaLarge[hoverIdx].toFixed(1)}%`);
      }

      tooltip.forEach((text, i) => p.text(text, hx + 12, 10 + i * 16));

      // ---------------- LEGEND ----------------
      const lx = w + 20;
      let ly = 10;

      p.fill(255);
      p.textSize(13);
      p.text("Ads spent on:", lx, ly);
      ly += 20;

      function legend(color, label) {
        p.fill(color);
        p.rect(lx, ly, 18, 3);
        p.fill(255);
        p.textSize(12);
        p.text(label, lx + 25, ly + 1);
        ly += 20;
      }

      legend(p.color(238, 29, 82), "TikTok");
      legend(p.color(24, 119, 242), "Meta");

      p.pop();
    }
  };
})();
