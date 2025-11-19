// Visualization towards age groups using TikTok in United States (Demographics investigation)

(function () {
    window.VizTikTokAge = {
      draw: function (p, manager, ai, progress) {
        // ----- Data: US TikTok Users by Age (2025) -----
        const data = [
          { age: "18-24", value: 27.2 },
          { age: "25-34", value: 39.7 },
          { age: "35-44", value: 15.9 },
          { age: "45-54", value: 8.8 },
          { age: "55+",  value: 8.2 },
        ];
  
        if (!data || data.length === 0) {
          p.fill(0);
          p.textAlign(p.CENTER, p.CENTER);
          p.text("No age data", p.width / 2, p.height / 2);
          return;
        }
  
        p.push();
  
        // ----- background + title -----
        p.noStroke();
        p.fill(0);
        p.textAlign(p.CENTER, p.TOP);
        p.textSize(28);
        p.text("TikTok Users by Age in United States", p.width / 2, 35);
  
        // ----- layout -----
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
        const barAreaHeight = h;
        const barHeight = (barAreaHeight - barGap * (n - 1)) / n;
  
        // x-axis scale
        const minVal = 0;
        const maxVal = 40;
        const stepVal = 5;
        const steps = (maxVal - minVal) / stepVal;
  
        const xScale = (v) => p.map(v, minVal, maxVal, 0, w);
  
        const axisY = h; // x-axis, y location
  
        p.stroke(0);
        p.strokeWeight(1.2);
        p.line(0, axisY, w, axisY); // x-axis
  
        p.textSize(12);
        p.textAlign(p.CENTER, p.TOP);
  
        for (let i = 0; i <= steps; i++) {
          const xVal = minVal + i * stepVal;
          const x = xScale(xVal);
  
          // vertical line
          p.stroke(230);
          p.line(x, 0, x, axisY);
  
          // tick + label
          p.stroke(0);
          p.line(x, axisY, x, axisY + 4);
  
          p.noStroke();
          p.fill(60);
          p.text(xVal + "%", x, axisY + 8);
        }
  
        // ----- y-axis with "Age Group" words -----
        p.push();
        p.translate(-75, h / 2);
        p.rotate(-p.HALF_PI);
        p.textAlign(p.CENTER, p.CENTER);
        p.textSize(14);
        p.fill(60);
        p.text("Age Group", 0, 0);
        p.pop();
        
        // interactivity: show the exact proportions on hover
        const baseColor = p.color(145, 30, 30); 
        const dimColor  = p.color(210, 180, 180);

        // mouse position relative to drawing area
        const localMouseX = p.mouseX - margin.left;
        const localMouseY = p.mouseY - margin.top;

        let hoveredIndex = -1;

        // check if mouse is over any bar
        if (localMouseX >= 0 && localMouseX <= w &&
            localMouseY >= 0 && localMouseY <= h) {
          for (let i = 0; i < n; i++) {
            const barY = i * (barHeight + barGap);
            const barX = 0;
            const barW = xScale(data[i].value);

            if (localMouseX >= barX && localMouseX <= barX + barW &&
            localMouseY >= barY && localMouseY <= barY + barHeight) {
              hoveredIndex = i;
              break;
            }
          }
        }

        // ----- bar graph + labels -----
        for (let i = 0; i < n; i++) {
          const d = data[i];
          const barY = i * (barHeight + barGap);
          const barX = 0;
          const barW = xScale(d.value);
  
          // bar
          p.noStroke();
          if (hoveredIndex === -1 || hoveredIndex === i) {
            p.fill(baseColor);
          } else {
            p.fill(dimColor);
          }
          p.rect(barX, barY, barW, barHeight, 8);
  
          // age labels
          p.fill(40);
          p.textAlign(p.RIGHT, p.CENTER);
          p.textSize(14);
          p.text(d.age, -10, barY + barHeight / 2);

          if (hoveredIndex === i) {
            p.fill(255);
            p.textAlign(p.LEFT, p.CENTER);
            p.textSize(18);
  
            let labelX;
            if (barW > 70) {
              labelX = barX + barW - 5;
              p.textAlign(p.RIGHT, p.CENTER);
            } else {
              labelX = barX + barW + 8;
              p.textAlign(p.LEFT, p.CENTER);
            }
            p.text(d.value.toFixed(1) + "%", labelX, barY + barHeight / 2);
          }
        }
  
        // ----- bottom -----
        p.fill(40);
        p.textAlign(p.CENTER, p.TOP);
        p.textSize(14);
        p.text("Proportion of Users", w / 2, h + 40);
  
        p.pop();
      },
    };
  })();
  
