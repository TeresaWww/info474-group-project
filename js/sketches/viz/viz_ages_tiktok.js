(function () {
  window.VizTikTokAge = {
    dataLoaded: false,
    table: null,

    draw: function (p, manager, ai, progress) {

      // 1. LOAD CSV on first draw
      if (!this.dataLoaded) {
        p.loadTable(
          "data/tiktok_user_group.csv",
          "csv",
          "header",
          (table) => {
            this.table = table;
            this.dataLoaded = true;
          },
          (err) => console.error("CSV load error:", err)
        );

        // loading screen
        p.fill(255);
        p.textAlign(p.CENTER, p.CENTER);
        p.textSize(24);
        p.text("Loading TikTok age data...", p.width / 2, p.height / 2);
        return;
      }

      // 2. CONVERT CSV into your expected data[] array
      let data = [];
      for (let r = 0; r < this.table.getRowCount(); r++) {
        let age = this.table.getString(r, "Age Group");       // column: age group
        let raw = this.table.getString(r, "2020");     // column: percentage
        raw = raw.replace(/[^0-9.-]/g, "");             // clean formatting
        let value = Number(raw);

        data.push({ age, value });
      }

      if (data.length === 0) {
        p.fill(255);
        p.textAlign(p.CENTER, p.CENTER);
        p.text("No data found in CSV", p.width / 2, p.height / 2);
        return;
      }

      // ---- ORIGINAL CHART CODE STARTS HERE ----
      p.push();

      p.noStroke();
      p.background(0);

      p.fill(255);
      p.textAlign(p.CENTER, p.TOP);
      p.textSize(28);
      p.text("TikTok Users by Age in United States", p.width / 2, 35);

      const margin = {
        top: 90,
        right: 80,
        bottom: 90,
        left: 110,
      };
      const w = p.width - margin.left - margin.right;
      const h = p.height - margin.top - margin.bottom;

      p.translate(margin.left, margin.top);

      const n = data.length;
      const barGap = 12;
      const barHeight = (h - barGap * (n - 1)) / n;

      const minVal = 0;
      const maxVal = 40;
      const stepVal = 5;
      const steps = (maxVal - minVal) / stepVal;

      const xScale = (v) => p.map(v, minVal, maxVal, 0, w);

      const axisY = h;

      p.fill(255);
      p.strokeWeight(1.2);
      p.line(0, axisY, w, axisY); // x-axis

      p.textSize(12);
      p.textAlign(p.CENTER, p.TOP);

      for (let i = 0; i <= steps; i++) {
        const xVal = minVal + i * stepVal;
        const x = xScale(xVal);

        p.line(x, 0, x, axisY);
        p.stroke(0);
        p.line(x, axisY, x, axisY + 4);

        p.noStroke();
        p.fill(255);
        p.text(xVal + "%", x, axisY + 8);
      }

      // y-axis label
      p.push();
      p.translate(-75, h / 2);
      p.rotate(-p.HALF_PI);
      p.textAlign(p.CENTER, p.CENTER);
      p.textSize(14);
      p.fill(255);
      p.text("Age Group", 0, 0);
      p.pop();

      // Hover setup
      const baseColor = p.color(198, 26, 69);
      const dimColor = p.color(198, 26, 69, 90);

      const localMouseX = p.mouseX - margin.left;
      const localMouseY = p.mouseY - margin.top;
      let hoveredIndex = -1;

      if (localMouseX >= 0 && localMouseX <= w && localMouseY >= 0 && localMouseY <= h) {
        for (let i = 0; i < n; i++) {
          const y = i * (barHeight + barGap);
          const barW = xScale(data[i].value);

          if (
            localMouseX >= 0 &&
            localMouseX <= barW &&
            localMouseY >= y &&
            localMouseY <= y + barHeight
          ) {
            hoveredIndex = i;
            break;
          }
        }
      }

      // Draw bars
      for (let i = 0; i < n; i++) {
        const d = data[i];
        const y = i * (barHeight + barGap);
        const barW = xScale(d.value);

        p.noStroke();
        p.fill(hoveredIndex === -1 || hoveredIndex === i ? baseColor : dimColor);
        p.rect(0, y, barW, barHeight, 8);

        // Age labels
        p.fill(255);
        p.textAlign(p.RIGHT, p.CENTER);
        p.textSize(14);
        p.text(d.age, -10, y + barHeight / 2);

        // Hover value
        if (hoveredIndex === i) {
          p.fill(255);
          p.textSize(18);

          let labelX = barW > 70 ? barW - 5 : barW + 8;
          p.textAlign(barW > 70 ? p.RIGHT : p.LEFT, p.CENTER);

          p.text(d.value.toFixed(1) + "%", labelX, y + barHeight / 2);
        }
      }

      // Bottom label
      p.fill(255);
      p.textAlign(p.CENTER, p.TOP);
      p.textSize(14);
      p.text("Proportion of Users", w / 2, h + 40);

      p.pop();
    },
  };
})();
