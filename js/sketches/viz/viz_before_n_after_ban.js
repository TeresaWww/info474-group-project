(function () {
  window.VizBan = {
    dataLoaded: false,
    table: null,

    draw: function (p, manager, ai, progress) {
      p.push();

      const canvasWidth = manager.canvasWidth || p.width;
      const canvasHeight = manager.canvasHeight || p.height;

      // CLEAR FRAME FIRST so nothing lingers
      p.background(0);

      // ---------- LOAD DATA ----------
      if (!this.dataLoaded) {
        p.loadTable(
          "data/tiktok_meta_spend_percent_change.csv",
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
        p.text(
          "Loading advertiser spend data...",
          canvasWidth / 2,
          canvasHeight / 2
        );
        p.pop();
        return;
      }

      // ---------- EXTRACT DATA ----------
      const rowCount = this.table.getRowCount();
      const dates = [];
      const tiktokVals = [];
      const metaVals = [];

      for (let r = 0; r < rowCount; r++) {
        dates.push(this.table.getString(r, "Date"));
        tiktokVals.push(this.table.getNum(r, "TikTok_spend_%"));
        metaVals.push(this.table.getNum(r, "Meta_spend_%"));
      }

      // ---------- LAYOUT ----------
      const margin = { top: 100, right: 120, bottom: 90, left: 70 };
      const w = canvasWidth - margin.left - margin.right;
      const h = canvasHeight - margin.top - margin.bottom;

      p.translate(margin.left, margin.top);

      // ---------- SCALES ----------
      let minY = Infinity;
      let maxY = -Infinity;
      for (let i = 0; i < rowCount; i++) {
        const v1 = tiktokVals[i];
        const v2 = metaVals[i];
        if (v1 < minY) minY = v1;
        if (v1 > maxY) maxY = v1;
        if (v2 < minY) minY = v2;
        if (v2 > maxY) maxY = v2;
      }
      const padding = 5;
      minY -= padding;
      maxY += padding;

      const xStep = rowCount > 1 ? w / (rowCount - 1) : w;
      const yScale = (v) => p.map(v, minY, maxY, h, 0);

      // ---------- GRID + AXES ----------
      p.stroke(255);
      p.strokeWeight(1);
      p.line(0, 0, 0, h); // y-axis
      p.line(0, h, w, h); // x-axis

      // y ticks
      p.textAlign(p.RIGHT, p.CENTER);
      p.textSize(10);
      const yTicks = 5;
      for (let i = 0; i <= yTicks; i++) {
        const t = p.lerp(minY, maxY, i / yTicks);
        const y = yScale(t);
        p.stroke(80);
        p.line(0, y, w, y);
        p.stroke(255);
        p.line(-5, y, 0, y);
        p.noStroke();
        p.fill(255);
        p.text(t.toFixed(1) + "%", -8, y);
      }

      // x ticks
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

      // zero line
      const zeroY = yScale(0);
      p.stroke(160);
      p.strokeWeight(1);
      p.drawingContext.setLineDash([4, 4]);
      p.line(0, zeroY, w, zeroY);
      p.drawingContext.setLineDash([]);

      // ---------- LINES ----------
      // TikTok (pink)
      p.noFill();
      p.strokeWeight(3);
      p.stroke(238, 29, 82);
      p.beginShape();
      for (let i = 0; i < rowCount; i++) {
        const x = i * xStep;
        const y = yScale(tiktokVals[i]);
        p.vertex(x, y);
      }
      p.endShape();

      // Meta (Facebook blue)
      p.stroke(24, 119, 242); // Facebook blue
      p.beginShape();
      for (let i = 0; i < rowCount; i++) {
        const x = i * xStep;
        const y = yScale(metaVals[i]);
        p.vertex(x, y);
      }
      p.endShape();

      // ---------- EVENT LINES ----------
      const findIndexByDate = (label) => dates.findIndex((d) => d === label);
      const outageIdx = findIndexByDate("Jan 19");
      const restoreIdx = findIndexByDate("Jan 20");

      // TikTok outage – orange
      if (outageIdx !== -1) {
        const x = outageIdx * xStep;
        p.push();
        p.stroke(255, 165, 0); // orange
        p.strokeWeight(2);
        p.drawingContext.setLineDash([5, 5]);
        p.line(x, 0, x, h);
        p.drawingContext.setLineDash([]);
        p.noStroke();
        p.fill(255, 165, 0);
        p.textSize(12);
        p.textAlign(p.RIGHT, p.BOTTOM);
        p.text("TikTok outage", x + 16, -10);
        p.pop();
      }

      // Service restoration – light gray
      if (restoreIdx !== -1) {
        const x = restoreIdx * xStep;
        p.push();
        p.stroke(200); // light gray
        p.strokeWeight(2);
        p.drawingContext.setLineDash([5, 5]);
        p.line(x, 0, x, h);
        p.drawingContext.setLineDash([]);
        p.noStroke();
        p.fill(200);
        p.textSize(12);
        p.textAlign(p.LEFT, p.BOTTOM);
        p.text("Service restoration", x - 16, -24);
        p.pop();
      }

      // ---------- HOVER ----------
      const localX = p.mouseX - margin.left;
      const localY = p.mouseY - margin.top;
      let hoverIndex = -1;

      if (localX >= 0 && localX <= w && localY >= 0 && localY <= h) {
        hoverIndex = Math.round(localX / xStep);
        hoverIndex = p.constrain(hoverIndex, 0, rowCount - 1);
      }

      if (hoverIndex !== -1) {
        const x = hoverIndex * xStep;
        const yTik = yScale(tiktokVals[hoverIndex]);
        const yMeta = yScale(metaVals[hoverIndex]);

        // vertical guide
        p.stroke(180);
        p.strokeWeight(1);
        p.drawingContext.setLineDash([3, 3]);
        p.line(x, 0, x, h);
        p.drawingContext.setLineDash([]);

        // points
        p.noStroke();
        p.fill(238, 29, 82);
        p.circle(x, yTik, 7);
        p.fill(24, 119, 242);
        p.circle(x, yMeta, 7);

        // tooltip
        const tooltipX = x + 10;
        const tooltipY = 20;
        p.textAlign(p.LEFT, p.TOP);
        p.fill(255);
        p.textSize(12);
        const lines = [
          dates[hoverIndex],
          `TikTok: ${tiktokVals[hoverIndex].toFixed(1)}%`,
          `Meta: ${metaVals[hoverIndex].toFixed(1)}%`,
        ];
        for (let i = 0; i < lines.length; i++) {
          p.text(lines[i], tooltipX, tooltipY + i * 14);
        }
      }

      // ---------- AXIS TITLES ----------
      p.fill(255);
      p.noStroke();
      p.textAlign(p.CENTER, p.BOTTOM);
      p.text("Date (Jan 12–26, 2025)", w / 2, h + 40);

      p.push();
      p.translate(-50, h / 2);
      p.rotate(-p.HALF_PI);
      p.text("Percent change in daily ad spend (vs Jan 18 baseline)", 0, 0);
      p.pop();

      // LEGEND
      const legendX = w + 20;
      const legendY = 10;
      p.textAlign(p.LEFT, p.TOP);
      p.textSize(12);

      p.fill(238, 29, 82);
      p.rect(legendX, legendY, 16, 3);
      p.fill(255);
      p.text("TikTok ad spend", legendX + 22, legendY - 4);

      p.fill(24, 119, 242);
      p.rect(legendX, legendY + 18, 16, 3);
      p.fill(255);
      p.text("Meta ad spend", legendX + 22, legendY + 14);

      p.pop();
    },
  };
})();
