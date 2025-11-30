(function () {
  window.VizTikTokAge = {
    dataLoaded: false,
    table: null,
    hoverIndex: { group: -1, year: "" },

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

        p.fill(255);
        p.textAlign(p.CENTER, p.CENTER);
        p.textSize(24);
        p.text("Loading TikTok age data...", p.width / 2, p.height / 2);
        return;
      }

      // 2. Parse CSV
      let data = [];
      for (let r = 0; r < this.table.getRowCount(); r++) {
        data.push({
          age: this.table.getString(r, "Age Group"),
          y2020: Number(this.table.getString(r, "2020")),
          y2023: Number(this.table.getString(r, "2023/2024")),
        });
      }

      if (data.length === 0) return;

      // --------------------
      // DRAW STARTS
      // --------------------
      p.push();
      p.background(0);

      const margin = { top: 80, right: 80, bottom: 90, left: 120 };
      const innerW = p.width - margin.left - margin.right;
      const innerH = p.height - margin.top - margin.bottom;
      const n = data.length;

      const groupGap = 40;
      const barWidth = innerW / n / 3;
      const maxVal = Math.max(...data.flatMap(d => [d.y2020, d.y2023]));

      const xScale = (i) => i * (innerW / n) + barWidth;
      const yScale = (v) => p.map(v, 0, maxVal, 0, innerH);

      p.translate(margin.left, margin.top);

      // // Title
      // p.fill(255);
      // p.textAlign(p.CENTER, p.TOP);
      // p.textSize(26);
      // p.text("TikTok’s Rapid Rise to Popularity", innerW / 2, -50);

      // // Subtitle
      // p.textSize(16);
      // p.fill(220);
      // p.text(
      //   "Share of U.S. adults who regularly use TikTok, by age group",
      //   innerW / 2,
      //   -20
      // );

      // Legend
      p.textAlign(p.LEFT, p.CENTER);
      p.textSize(15);

      p.fill(60);
      p.rect(0, -55, 18, 18, 3);
      p.fill(255);
      p.text("2020", 28, -46);

      p.fill(180, 50, 70);
      p.rect(90, -55, 18, 18, 3);
      p.fill(255);
      p.text("2023/2024", 120, -46);

      // X-axis
      p.stroke(255);
      p.line(0, innerH, innerW, innerH);

      this.hoverIndex = { group: -1, year: "" };

      // Bars
      data.forEach((d, i) => {
        const groupX = xScale(i);
        const barX2020 = groupX;
        const barX2023 = groupX + barWidth + 8;

        const h2020 = yScale(d.y2020);
        const h2023 = yScale(d.y2023);

        const y2020 = innerH - h2020;
        const y2023 = innerH - h2023;

        // Hover detection
        const mx = p.mouseX - margin.left;
        const my = p.mouseY - margin.top;

        const isHover2020 =
          mx > barX2020 && mx < barX2020 + barWidth &&
          my > y2020 && my < innerH;

        const isHover2023 =
          mx > barX2023 && mx < barX2023 + barWidth &&
          my > y2023 && my < innerH;

        // Draw bars
        // 2020 (gray/black)
        p.fill(isHover2020 ? p.color(120) : p.color(50));
        p.noStroke();
        p.rect(barX2020, y2020, barWidth, h2020);

        // 2023/2024 (red)
        p.fill(isHover2023 ? p.color(255, 100, 120) : p.color(180, 50, 70));
        p.rect(barX2023, y2023, barWidth, h2023);

        // Store hover info
        if (isHover2020) this.hoverIndex = { group: i, year: "2020" };
        if (isHover2023) this.hoverIndex = { group: i, year: "2023" };

        // Labels above bars
        p.fill(255);
        p.textAlign(p.CENTER, p.BOTTOM);
        p.textSize(16);
        p.text(d.y2020 + "%", barX2020 + barWidth / 2, y2020 - 5);
        p.text(d.y2023 + "%", barX2023 + barWidth / 2, y2023 - 5);

        // Age group labels
        p.textAlign(p.CENTER, p.TOP);
        p.textSize(15);
        p.text(d.age, groupX + barWidth, innerH + 10);
      });

      // Tooltip
      if (this.hoverIndex.group !== -1) {
        const d = data[this.hoverIndex.group];
        const value =
          this.hoverIndex.year === "2020" ? d.y2020 : d.y2023;
        const label =
          this.hoverIndex.year === "2020" ? "2020" : "2023/2024";

        p.fill(30);
        p.noStroke();
        p.rect(p.mouseX + 15, p.mouseY - 20, 160, 50, 6);

        p.fill(255);
        p.textAlign(p.LEFT, p.CENTER);
        p.textSize(16);
        p.text(
          `${d.age} — ${label}: ${value}%`,
          p.mouseX + 25,
          p.mouseY + 5
        );
      }

      p.pop();
    },
  };
})();
