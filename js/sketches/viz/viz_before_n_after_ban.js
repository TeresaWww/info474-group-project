(function () {
  window.banBusinessFilter = "small"; // default filter

  window.VizBan = {
    dataLoaded: false,
    table: null,
    filterButtonsCreated: false,

    draw: function (p, manager, ai, progress) {
      p.push();

      const W = manager.canvasWidth;
      const H = manager.canvasHeight;

      p.background(0);

      if (this.filterButtonsCreated) {
        if (ai === 10) {
          this.filterLabel.show();
          this.filterBtns.show();
        } else {
          this.filterLabel.hide();
          this.filterBtns.hide();
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

      // ---------------- CREATE FILTER BUTTONS ----------------
      if (!this.filterButtonsCreated) {
        const container = document.getElementById("vis");

        this.filterLabel = p.createDiv("Business Type:");
        this.filterLabel.parent(container);
        this.filterLabel.style("color", "white");
        this.filterLabel.style("font-size", "14px");
        this.filterLabel.position(20, 1);

        this.filterBtns = p.createDiv();
        this.filterBtns.parent(container);
        this.filterBtns.position(80, 30);

        const options = [
          { name: "Small", value: "small" },
          { name: "Large", value: "large" }
        ];

        options.forEach(opt => {
          const b = p.createButton(opt.name);
          b.parent(this.filterBtns);
          b.style("margin-right", "8px");
          b.style("padding", "4px 10px");
          b.style("background", "#111");
          b.style("color", "white");
          b.style("border", "1px solid #444");
          b.style("border-radius", "4px");
          b.style("cursor", "pointer");

          b.mousePressed(() => {
            window.banBusinessFilter = opt.value;

            [...this.filterBtns.elt.children].forEach(btn => {
              btn.style.background = "#111";
              btn.style.color = "white";
            });

            b.style("background", "#69C9D0");
            b.style("color", "black");
          });
        });

        this.filterButtonsCreated = true;
      }

      // ---------------- EXTRACT DATA ----------------
      const rowCount = this.table.getRowCount();
      const dates = [];

      const tikTokSmall = [];
      const tikTokLarge = [];
      const metaSmall = [];
      const metaLarge = [];

      for (let r = 0; r < rowCount; r++) {
        const dateStr = this.table.getString(r, "Date").trim();
        dates.push(dateStr);

        tikTokSmall.push(this.table.getNum(r, "TikTok_small") * 100);
        tikTokLarge.push(this.table.getNum(r, "TikTok_large") * 100);
        metaSmall.push(this.table.getNum(r, "Meta_small") * 100);
        metaLarge.push(this.table.getNum(r, "Meta_large") * 100);
      }

      // DEBUG PRINT — shows your real CSV values
      // console.log("DATES:", dates);

      // ---------------- LAYOUT ----------------
      const M = { top: 70, right: 130, bottom: 80, left: 70 };
      const w = W - M.left - M.right;
      const h = H - M.top - M.bottom;

      p.translate(M.left, M.top);

      // ---------------- SCALE ----------------
      let minY = -100;
      let maxY =  100;

      const xStep = w / (rowCount - 1);
      const yScale = (v) => p.map(v, minY, maxY, h, 0);

      // ---------------- AXES ----------------
      p.stroke(255);
      p.line(0, 0, 0, h); 
      p.line(0, h, w, h);

      // ---------------- Y-AXIS TITLE ----------------
      p.push();
      p.fill(255);
      p.textSize(14);
      p.textAlign(p.CENTER, p.CENTER);

      // Rotate text for vertical axis
      p.translate(-50, h / 2);
      p.rotate(-p.HALF_PI);
      p.text("% Change Relative to Baseline (Jan 18)", 0, 0);

      p.pop();


      // ---------------- Y TICKS ----------------
      p.textSize(10);
      p.textAlign(p.RIGHT, p.CENTER);

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

      for (let i = 0; i < rowCount; i++) {
        const x = i * xStep;
        p.stroke(255);
        p.line(x, h, x, h + 5);

        p.noStroke();
        p.fill(255);
        p.text(dates[i], x, h + 8);
      }

      // ---------------- ZERO LINE ----------------
      const zeroY = yScale(0);
      p.stroke(160);
      p.drawingContext.setLineDash([4, 4]);
      p.line(0, zeroY, w, zeroY);
      p.drawingContext.setLineDash([]);

      // ---------------- DRAW SERIES ----------------
      function drawSeries(arr, color) {
        p.noFill();
        p.stroke(color);
        p.strokeWeight(3);
        p.beginShape();
        for (let i = 0; i < arr.length; i++) {
          p.vertex(i * xStep, yScale(arr[i]));
        }
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

      // ---------------- SHADED REGION ----------------
      function shadeBetween(dateA, dateB, color) {
        const idxA = dates.findIndex(d => d.trim() === dateA);
        const idxB = dates.findIndex(d => d.trim() === dateB);

        if (idxA === -1 || idxB === -1) {
          console.log("Shade NOT drawn (bad date):", dateA, dateB, dates);
          return;
        }

        const xA = idxA * xStep;
        const xB = idxB * xStep;

        p.push();
        p.noStroke();
        p.fill(color);
        p.rect(xA, 0, xB - xA, h);
        p.pop();
      }

      // SHADING (use exact CSV labels)
      shadeBetween("Jan-19", "Jan-20", p.color(255, 60, 60, 60));

      // ---------------- EVENT MARKERS ----------------
      function markEvent(dateLabel, color, textLabel, align = "right") {
        const idx = dates.findIndex(d => d.trim() === dateLabel);
        if (idx === -1) return;

        const x = idx * xStep;

        p.push();
        p.stroke(color);
        p.strokeWeight(2);
        p.drawingContext.setLineDash([5, 5]);
        p.line(x, 0, x, h);
        p.drawingContext.setLineDash([]);
        p.noStroke();

        p.fill(color);
        p.textSize(12);
        p.textAlign(align === "right" ? p.RIGHT : p.LEFT, p.BOTTOM);
        p.text(textLabel, x + (align === "right" ? 15 : -15), -10);
        p.pop();
      }

      markEvent("Jan-19", p.color(255, 165, 0), "TikTok outage", "right");
      markEvent("Jan-20", p.color(200), "Restored", "left");

      // ---------------- HOVER ----------------
      let hoverIndex = Math.round((p.mouseX - M.left) / xStep);
      hoverIndex = p.constrain(hoverIndex, 0, rowCount - 1);

      const hx = hoverIndex * xStep;

      p.stroke(180);
      p.drawingContext.setLineDash([3, 3]);
      p.line(hx, 0, hx, h);
      p.drawingContext.setLineDash([]);

      function hoverCircle(arr, color) {
        p.fill(color);
        p.noStroke();
        p.circle(hx, yScale(arr[hoverIndex]), 7);
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

      const lines = [dates[hoverIndex]];

      if (f === "small") {
        lines.push(`TikTok small: ${tikTokSmall[hoverIndex].toFixed(1)}%`);
        lines.push(`Meta small: ${metaSmall[hoverIndex].toFixed(1)}%`);
      } else {
        lines.push(`TikTok large: ${tikTokLarge[hoverIndex].toFixed(1)}%`);
        lines.push(`Meta large: ${metaLarge[hoverIndex].toFixed(1)}%`);
      }

      for (let i = 0; i < lines.length; i++) {
        p.text(lines[i], hx + 12, 10 + i * 16);
      }

      // ---- LEGEND ----
      const lx = w + 20;
      let ly = 10;

      function legendLine(color, label) {
        p.fill(color);
        p.noStroke();
        p.rect(lx, ly, 18, 3);
        p.fill(255);
        p.textSize(12);
        p.textAlign(p.LEFT, p.CENTER);
        p.text(label, lx + 25, ly + 1);
        ly += 20;
      }

      legendLine(p.color(238, 29, 82), "TikTok");
      legendLine(p.color(24, 119, 242), "Meta");

      p.pop();
    }
  };
})();
