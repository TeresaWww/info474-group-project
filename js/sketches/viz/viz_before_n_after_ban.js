// viz_before_n_after_ban.js  (VizSeven)

(function () {
    window.VizSeven = {
      draw: function (p, manager, ai, progress) {
  
        // Manual dataset
        const data = [
          { date: "2025-01-12", value: -0.05 },
          { date: "2025-01-13", value: -0.10 },
          { date: "2025-01-14", value: -0.07 },
          { date: "2025-01-15", value: -0.05 },
          { date: "2025-01-16", value: -0.02 },
          { date: "2025-01-17", value: -0.03 },
          { date: "2025-01-18", value: 0 },
          { date: "2025-01-19", value: -0.78 },
          { date: "2025-01-20", value: -0.30 },
          { date: "2025-01-21", value: -0.55 },
          { date: "2025-01-22", value: -0.50 },
          { date: "2025-01-23", value: -0.45 },
          { date: "2025-01-24", value: -0.35 },
          { date: "2025-01-25", value: -0.25 },
          { date: "2025-01-26", value: -0.15 },
        ];
  
        if (!data || data.length === 0) {
          p.fill(0);
          p.textAlign(p.CENTER, p.CENTER);
          p.text("No TikTok data", p.width / 2, p.height / 2);
          return;
        }
  
        p.push();
        p.background(0);
  
        // --- layout ---
        // 🔹 Make graph shorter by increasing top/bottom margins
        const margin = { top: 100, right: 40, bottom: 100, left: 70 };
        const w = p.width - margin.left - margin.right;
        const h = p.height - margin.top - margin.bottom;
  
        p.translate(margin.left, margin.top);
  
        // --- find y-range ---
        let minY = Infinity;
        let maxY = -Infinity;
        for (const d of data) {
          if (d.value < minY) minY = d.value;
          if (d.value > maxY) maxY = d.value;
        }
  
        const padding = 0.1;
        minY -= padding;
        maxY += padding;
  
        const xStep = w / (data.length - 1);
        const yScale = v => p.map(v, minY, maxY, h, 0);
  
        // --- axes ---
        p.stroke(255);
        p.strokeWeight(1);
        p.line(0, 0, 0, h);      // y-axis
        p.line(0, h, w, h);      // x-axis
  
        // y-axis ticks & labels
        p.textAlign(p.RIGHT, p.CENTER);
        p.textSize(10);
        const yTicks = 5;
        for (let i = 0; i <= yTicks; i++) {
          const t = p.lerp(minY, maxY, i / yTicks);
          const y = yScale(t);
          p.stroke(220);
          p.line(0, y, w, y);
          p.stroke(255);
          p.line(-5, y, 0, y);
          p.noStroke();
          p.fill(255);
          p.text(t.toFixed(1), -8, y);
        }
  
        // --- x-axis labels (horizontal now) ---
        // --- x-axis labels (horizontal, Feb 12–26) ---
        p.textAlign(p.CENTER, p.TOP);
        p.textSize(10);

        for (let i = 0; i < data.length; i++) {
        const x = i * xStep;

        // tick
        p.stroke(255);
        p.line(x, h, x, h + 5);
        p.noStroke();

        // Jan 12 corresponds to Feb 12
        const febDay = 12 + i;   // 12, 13, ..., 26
        const label = "Jan " + febDay;

        p.text(label, x, h + 8);
        }

  
        // main line
        p.noFill();
        p.stroke(255);
        p.strokeWeight(3);
        p.beginShape();
        for (let i = 0; i < data.length; i++) {
          const x = i * xStep;
          const y = yScale(data[i].value);
          p.vertex(x, y);
        }
        p.endShape();
  
      // event lines
      const findIndexByDate = dateStr =>
        data.findIndex(d => d.date === dateStr);

      const outageIdx = findIndexByDate("2025-01-19");
      const restoreIdx = findIndexByDate("2025-01-20");

      if (outageIdx !== -1) {
        const x = outageIdx * xStep;
        p.stroke(238, 29, 82);
        p.strokeWeight(2);
        p.drawingContext.setLineDash([5, 5]);
        p.line(x, 0, x, h);
        p.drawingContext.setLineDash([]);

        // 🔹 label slightly to the LEFT of the line
        p.noStroke();
        p.fill(238, 29, 82);
        p.textAlign(p.RIGHT, p.BOTTOM);
        p.text("TikTok outage", x + 16, -10);
      }

      if (restoreIdx !== -1) {
        const x = restoreIdx * xStep;
        p.stroke(105, 201, 208);
        p.strokeWeight(2);
        p.drawingContext.setLineDash([5, 5]);
        p.line(x, 0, x, h);
        p.drawingContext.setLineDash([]);

        // 🔹 label slightly to the RIGHT of the line
        p.noStroke();
        p.fill(105, 201, 208);
        p.textAlign(p.LEFT, p.BOTTOM);
        p.text("Service restoration", x - 16, -10);
      }

  
        // axis titles
        p.fill(255);
        p.noStroke();
        p.textAlign(p.CENTER, p.BOTTOM);
        p.text("Date (Jan 12–26, 2025)", w / 2, h + 40);
  
        p.push();
        p.translate(-50, h / 2);
        p.rotate(-p.HALF_PI);
        p.text("Change in daily advertiser spend (log USD)", 0, 0);
        p.pop();
  
        p.pop();
      }
    };
  })();
  