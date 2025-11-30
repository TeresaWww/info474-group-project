(function () {
  window.VizTikTokAge = {
    dataLoaded: false,
    table: null,
    hoverIndex: { group: -1, year: "" },
    animRed: 0, // animation progress

    draw: function (p, manager, ai, progress) {

      if (!this.dataLoaded) {
        p.loadTable(
          "data/tiktok_user_group.csv",
          "csv",
          "header",
          (table) => {
            this.table = table;
            this.dataLoaded = true;
            this.animRed = 0;
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

      let data = [];
      for (let r = 0; r < this.table.getRowCount(); r++) {
        let age = this.table.getString(r, "Age Group");

        // Clean percentage signs
        let raw2020 = this.table.getString(r, "2020") || "0";
        raw2020 = raw2020.replace(/[^0-9.-]/g, "");
        let y2020 = Number(raw2020);

        let raw2023 = this.table.getString(r, "2023/2024") || "0";
        raw2023 = raw2023.replace(/[^0-9.-]/g, "");
        let y2023 = Number(raw2023);

        data.push({ age, y2020, y2023 });
      }

      if (data.length === 0) return;

      this.animRed = Math.min(this.animRed + 0.04, 1);

      p.push();
      p.background(0);

      const margin = { top: 80, right: 80, bottom: 90, left: 120 };
      const innerW = p.width - margin.left - margin.right;
      const innerH = p.height - margin.top - margin.bottom;
      const n = data.length;

      const barSpace = innerW / n;
      const barWidth = barSpace * 0.35;

      const maxVal = Math.max(...data.flatMap(d => [d.y2020, d.y2023]));

      const yScale = (v) => p.map(v, 0, maxVal, 0, innerH);

      p.translate(margin.left, margin.top);

      const legendWidth = 200;
      const legendX = innerW / 2 - legendWidth / 2;
      const legendY = -55;

      p.textAlign(p.LEFT, p.CENTER);
      p.textSize(15);

      // 2020 box
      p.fill(60);
      p.rect(legendX, legendY, 18, 18, 3);
      p.fill(255);
      p.text("2020", legendX + 28, legendY + 9);

      // 2023/2024 box
      p.fill("#EE1D52");
      p.rect(legendX + 90, legendY, 18, 18, 3);
      p.fill(255);
      p.text("2023/2024", legendX + 118, legendY + 9);

      // X-axis
      p.stroke(255);
      p.line(0, innerH, innerW, innerH);

      this.hoverIndex = { group: -1, year: "" };

      data.forEach((d, i) => {
        const groupX = i * barSpace;
        const barX2020 = groupX + (barSpace * 0.15);
        const barX2023 = barX2020 + barWidth + 10;

        const h2020 = yScale(d.y2020);
        const h2023 = yScale(d.y2023) * this.animRed; // animate only red bars

        const y2020 = innerH - h2020;
        const y2023 = innerH - h2023;

        // mouse detection
        const mx = p.mouseX - margin.left;
        const my = p.mouseY - margin.top;

        const isHover2020 =
          mx > barX2020 && mx < barX2020 + barWidth &&
          my > y2020 && my < innerH;

        const isHover2023 =
          mx > barX2023 && mx < barX2023 + barWidth &&
          my > y2023 && my < innerH;

        p.noStroke();
        p.fill(isHover2020 ? p.color(120) : p.color(60));
        p.rect(barX2020, y2020, barWidth, h2020);

        p.fill(isHover2023 ? p.color(255, 120, 140) : p.color("#EE1D52"));
        p.rect(barX2023, y2023, barWidth, h2023);

        // store hover info
        if (isHover2020) this.hoverIndex = { group: i, year: "2020" };
        if (isHover2023) this.hoverIndex = { group: i, year: "2023/2024" };

        p.fill(255);
        p.textAlign(p.CENTER, p.BOTTOM);
        p.textSize(16);

        p.text(`${d.y2020}%`, barX2020 + barWidth / 2, y2020 - 5);

        if (h2023 > 10) {
          p.text(`${d.y2023}%`, barX2023 + barWidth / 2, y2023 - 5);
        }

        p.textAlign(p.CENTER, p.TOP);
        p.textSize(15);
        p.text(d.age, groupX + barSpace / 2, innerH + 10);
      });

      if (this.hoverIndex.group !== -1) {
        const d = data[this.hoverIndex.group];
        const label = this.hoverIndex.year;
        const value = label === "2020" ? d.y2020 : d.y2023;

        p.fill(30);
        p.noStroke();
        p.rect(p.mouseX + 15, p.mouseY - 20, 170, 50, 6);

        p.fill(255);
        p.textSize(16);
        p.textAlign(p.LEFT, p.CENTER);
        p.text(`${d.age} — ${label}: ${value}%`, p.mouseX + 25, p.mouseY + 5);
      }

      p.pop();
    },
  };
})();
