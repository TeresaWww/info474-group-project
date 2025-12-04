(function () {
    window.VizRednoteDownloads = {
      dataLoaded: false,
      table: null,
      animFrame: 0,
      highlightCircleCenter: null,
  
      draw: function (p, manager, ai, progress) {
        p.push();
  
        const canvasWidth = manager.canvasWidth || 1200;
        const canvasHeight = manager.canvasHeight || 800;
  
        // --- Black background ---
        p.background(0);
  
        const margin = {
          top: 80,
          right: 120,
          bottom: 120,
          left: 100,
        };
  
        const chartWidth = canvasWidth - margin.left - margin.right;
        const chartHeight = canvasHeight - margin.top - margin.bottom;
        const mousePt = p.createVector(p.mouseX, p.mouseY);
  
        // --- Load CSV once ---
        if (!this.dataLoaded) {
          p.loadTable(
            "data/rednote_dataset.csv",
            "csv",
            "header",
            (table) => {
              this.table = table;
              this.dataLoaded = true;
              this.animFrame = 0;
            },
            (err) => console.error("CSV load error:", err)
          );
  
          p.fill(255);
          p.textAlign(p.CENTER, p.CENTER);
          p.textSize(18);
          p.text("Loading Rednote downloads data...", canvasWidth / 2, canvasHeight / 2);
          p.pop();
          return;
        }
  
        const table = this.table;
        const rowCount = table.getRowCount();
  
        // --- Parse data ---
        const rows = [];
        let maxTotalDownloads = 0;
  
        for (let r = 0; r < rowCount; r++) {
          const row = table.getRow(r);
  
          const time = row.get("Time");
  
          const china = parseFloat(row.get("Mobile App Downloads in China").replace(/,/g, ""));
          const us = parseFloat(row.get("Mobile App Downloads in United States").replace(/,/g, ""));
          const rest = parseFloat(row.get("Mobile App Downloads in Rest of the World").replace(/,/g, ""));
  
          const total = china + us + rest;
          rows.push({ time, china, us, rest, total });
  
          maxTotalDownloads = Math.max(maxTotalDownloads, total);
        }
  
        if (maxTotalDownloads === 0) {
          p.fill(255, 0, 0);
          p.textAlign(p.CENTER, p.CENTER);
          p.text("No valid data found.", canvasWidth / 2, canvasHeight / 2);
          p.pop();
          return;
        }
  
        maxTotalDownloads *= 1.1;
  
        // --- Animation: all bars grow together from bottom ---
        this.animFrame++;
        const totalFrames = 55; 
        const t = p.constrain(this.animFrame / totalFrames, 0, 1);
        const highlightOn = (this.animFrame > totalFrames + 17);

        // --- Chart base values ---
        const xStep = chartWidth / rowCount;
        const barWidth = xStep * 0.6;
        const xOffsetStart = margin.left;
        const yBase = canvasHeight - margin.bottom;
        const scaleY = chartHeight / maxTotalDownloads;
  
        // --- Axes ---
        p.stroke(80);
        p.strokeWeight(1);
  
        // y-axis
        p.line(margin.left, margin.top - 10, margin.left, yBase);
  
        // x-axis
        p.line(margin.left, yBase, canvasWidth - margin.right, yBase);
  
        // --- Y-axis ticks ---
        p.textAlign(p.RIGHT, p.CENTER);
        p.textSize(12);
        p.fill(230);
  
        for (let i = 0; i <= 6; i++) {
          const value = (maxTotalDownloads * i) / 6;
          const y = yBase - value * scaleY;
          p.stroke(50);
          p.line(margin.left, y, canvasWidth - margin.right, y);
  
          p.noStroke();
          p.text(formatNumberShort(value), margin.left - 10, y);
        }
  
        // y-axis label
        p.push();
        p.translate(40, canvasHeight / 2);
        p.rotate(-p.HALF_PI);
        p.textAlign(p.CENTER, p.CENTER);
        p.textSize(14);
        p.fill(230);
        p.text("Mobile app downloads", 0, 0);
        p.pop();
  
        // --- Colors ---
        const colorChina = p.color("#69C9D0");
        const colorUSNormal = p.color("#EE1D52");
        const colorRest = p.color("#FFFFFF");
        const colorUSHighlight = p.color(230, 60, 60);
  
        this.highlightCircleCenter = null;
  
        // --- Draw stacked bars ---
        let hoverIndex = -1;
  
        for (let i = 0; i < rows.length; i++) {
          const d = rows[i];
          const xCenter = xOffsetStart + xStep * (i + 0.5);
        
          let currentTop = yBase;
        
          const hChinaFull = d.china * scaleY;
          const hUSFull    = d.us    * scaleY;
          const hRestFull  = d.rest  * scaleY;
        
          const hChina = hChinaFull * t;
          const hUS    = hUSFull    * t;
          const hRest  = hRestFull  * t;
        
          // --- China segment ---
          const yChinaTop = currentTop - hChina;
          p.fill(colorChina);
          p.stroke(0);
          p.rect(xCenter - barWidth / 2, yChinaTop, barWidth, hChina);
          currentTop = yChinaTop;
        
          // --- US segment ---
          const yUSTop = currentTop - hUS;
        
          const isLastBar = i === rows.length - 1;
          const usColor = (isLastBar && highlightOn) ? colorUSHighlight : colorUSNormal;
        
          p.fill(usColor);
          p.rect(xCenter - barWidth / 2, yUSTop, barWidth, hUS);
        
          // Highlight circle setup
          if (isLastBar && highlightOn && hUS > 0) {
            this.highlightCircleCenter = {
              x: xCenter,
              y: yUSTop + hUS / 2,
              r: Math.max(barWidth * 1.3, 47),
            };
          }
        
          currentTop = yUSTop;
        
          // --- Rest of world ---
          const yRestTop = currentTop - hRest;
          p.fill(colorRest);
          p.rect(xCenter - barWidth / 2, yRestTop, barWidth, hRest);
        
          // Hover Detection
          if (mousePt.x >= xCenter - barWidth / 2 &&
              mousePt.x <= xCenter + barWidth / 2 &&
              mousePt.y >= margin.top &&
              mousePt.y <= yBase) {
            hoverIndex = i;
          }
        }
  
        // --- X-axis labels ---
        p.textAlign(p.CENTER, p.TOP);
        p.textSize(11);
        p.fill(230);
  
        for (let i = 0; i < rows.length; i++) {
          const xCenter = xOffsetStart + xStep * (i + 0.5);
          const [year, quarter] = rows[i].time.split(" ");
  
          const yLabel = yBase + 8;
          p.text(year, xCenter, yLabel);
          p.text(quarter, xCenter, yLabel + 14);
        }
  
        // --- Title ---
        p.textAlign(p.LEFT, p.CENTER);
        p.textSize(18);
        p.fill(255);
        p.text("Quarterly Xiaohongshu (Rednote) app downloads worldwide from 2021 to 2025",
          margin.left,
          margin.top - 40);
  
        // --- Legend ---
        const legendX = canvasWidth - margin.right + 10;
        const legendY = margin.top;
  
        const legendItems = [
          { label: "China", color: colorChina },
          { label: "United States", color: colorUSNormal },
          { label: "Rest of\nthe world", color: colorRest },
        ];
  
        p.textAlign(p.LEFT, p.CENTER);
        p.textSize(13);
  
        legendItems.forEach((item, idx) => {
          const y = legendY + idx * 32;
          p.fill(item.color);
          p.rect(legendX, y - 7, 18, 14);
  
          p.fill(230);
          p.text(item.label, legendX + 24, y);
        });
  
        // --- Tooltip ---
        if (hoverIndex >= 0) {
          const d = rows[hoverIndex];
          const tooltipLines = [
            d.time,
            `China: ${formatNumber(d.china)}`,
            `United States: ${formatNumber(d.us)}`,
            `Rest of world: ${formatNumber(d.rest)}`,
            `Total: ${formatNumber(d.total)}`,
          ];
  
          p.textSize(12);
          p.textAlign(p.LEFT, p.TOP);
  
          const padding = 8;
          const lineH = 16;
  
          let tooltipWidth = 0;
          tooltipLines.forEach((line) => {
            tooltipWidth = Math.max(tooltipWidth, p.textWidth(line));
          });
          tooltipWidth += padding * 2;
          const tooltipHeight =
            tooltipLines.length * lineH + padding * 2;
  
          let tooltipX = mousePt.x + 12;
          let tooltipY = mousePt.y + 12;
  
          if (tooltipX + tooltipWidth > canvasWidth)
            tooltipX = canvasWidth - tooltipWidth - 10;
          if (tooltipY + tooltipHeight > canvasHeight)
            tooltipY = canvasHeight - tooltipHeight - 10;
  
          p.fill(20, 220);
          p.stroke(255);
          p.rect(tooltipX, tooltipY, tooltipWidth, tooltipHeight, 6);
  
          p.noStroke();
          p.fill(255);
          tooltipLines.forEach((line, i) => {
            p.text(line, tooltipX + padding, tooltipY + padding + i * lineH);
          });
        }
  
        // --- Highlight circle (final bar US segment) ---
        if (this.highlightCircleCenter) {
            const c = this.highlightCircleCenter;
            // yellow glow
            p.noStroke();
            p.fill(255, 215, 0, 80);  // soft yellow glow
            // p.circle(c.x, c.y, c.r * 1.8);  // make it bigger
          
            p.fill(255, 215, 0, 130);
            p.circle(c.x, c.y, c.r * 1.4);
          }
          
  
        // Helpers
        function formatNumber(n) {
          if (!n && n !== 0) return "N/A";
          return Math.round(n).toLocaleString();
        }
  
        function formatNumberShort(n) {
          if (!n && n !== 0) return "0";
          if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
          if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
          return Math.round(n).toString();
        }
  
        p.pop();
      },
    };
  })();
  
  
  