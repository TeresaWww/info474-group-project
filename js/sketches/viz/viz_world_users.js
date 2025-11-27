(function () {
  window.VizTikTokMap = {
    year: 2025,
    dataLoaded: false,
    dropdownCreated: false,

    draw: function (p, manager, ai, progress) {
      p.push();
      const canvasWidth = manager.canvasWidth || 1200;
      const canvasHeight = manager.canvasHeight || 800;
      p.background(0);

      const mousePt = p.createVector(p.mouseX, p.mouseY);

      
      if (!this.dataLoaded) {
        p.loadTable(
          'data/tiktok_users_by_country_2023_2025.csv',
          'csv',
          'header',
          (table) => { window.tiktokData = table; this.dataLoaded = true; },
          (err) => console.error('CSV load error:', err)
        );
        p.fill(255);
        p.textAlign(p.CENTER, p.CENTER);
        p.textSize(16);
        p.pop();
        return;
      }

      
      if (!window.country) {
        p.fill(255);
        p.textAlign(p.CENTER, p.CENTER);
        p.textSize(16);
        p.text("Country polygons not loaded — include country.js", canvasWidth / 2, canvasHeight / 2);
        p.pop();
        return;
      }

      
      if (!this.dropdownCreated) {
        const visContainer = document.getElementById('vis');

        this.yearLabel = p.createDiv('Select Year:');
        if (visContainer) this.yearLabel.parent(visContainer);
        this.yearLabel.position(20, 30);
        this.yearLabel.style('color', 'white');
        this.yearLabel.style('font-size', '14px');
        this.yearLabel.style('font-weight', 'bold');

        this.yearDropdown = p.createSelect();
        ["2023", "2024", "2025"].forEach(y => this.yearDropdown.option(y));
        this.yearDropdown.selected(this.year);
        if (visContainer) this.yearDropdown.parent(visContainer);
        this.yearDropdown.position(20, 50);
        this.yearDropdown.style('z-index', '1000');
        this.yearDropdown.style('color', 'black');
        this.yearDropdown.style('background-color', 'white');
        this.yearDropdown.style('font-size', '14px');


        this.yearDropdown.changed(() => {
          window.VizTikTokMap.year = parseInt(this.yearDropdown.value());
        });

        this.dropdownCreated = true;
      }

      window.country.forEach(c => {
        if (!c.polygons && c.vertexPoint) c.polygons = convertPathToPolygons(c.vertexPoint, 1);
      });

      
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      window.country.forEach(c => {
        if (c.polygons) {
          c.polygons.forEach(poly => {
            poly.forEach(v => {
              minX = Math.min(minX, v[0]);
              maxX = Math.max(maxX, v[0]);
              minY = Math.min(minY, v[1]);
              maxY = Math.max(maxY, v[1]);
            });
          });
        }
      });

      
      const mapWidth = canvasWidth - 150; 
      const mapHeight = canvasHeight - 60;
      const scaleX = mapWidth / (maxX - minX);
      const scaleY = mapHeight / (maxY - minY);
      const scale = Math.min(scaleX, scaleY) * 0.98;
      const offsetX = (canvasWidth - (maxX - minX) * scale) / 2 - minX * scale;
      const offsetY = (canvasHeight - (maxY - minY) * scale) / 2 - minY * scale;

      
      let minUsers = Infinity, maxUsers = -Infinity;
      const t = window.tiktokData;
      for (let r = 0; r < t.getRowCount(); r++) {
        const val = parseFloat(t.getRow(r).get(`TikTokUsers_${window.VizTikTokMap.year}`)?.trim());
        if (!isNaN(val)) { minUsers = Math.min(minUsers, val); maxUsers = Math.max(maxUsers, val); }
      }

      
      let hoverCountry = null;
      window.country.forEach(c => {
        let row = t.findRow(c.name, 'country') || t.findRow(c.id, 'flagCode');
        let users = row ? parseFloat(row.get(`TikTokUsers_${window.VizTikTokMap.year}`)?.trim()) : NaN;

        let col = p.color(200, 200, 200); // light gray if no data
        if (!isNaN(users) && maxUsers !== minUsers) {
          const amt = (users - minUsers) / (maxUsers - minUsers);
          col = p.lerpColor(p.color(200, 230, 255), p.color(0, 50, 200), amt);
        }

        p.fill(col);
        p.stroke(150);
        p.strokeWeight(0.5);

        if (c.polygons) {
          c.polygons.forEach(poly => {
            p.beginShape();
            poly.forEach(v => p.vertex(v[0] * scale + offsetX, v[1] * scale + offsetY));
            p.endShape(p.CLOSE);

            if (!hoverCountry && pointInPoly(poly, mousePt, scale, offsetX, offsetY)) {
              hoverCountry = { name: c.name, users };
            }
          });
        }
      });

      
      if (hoverCountry) {
        const tooltipText = `${hoverCountry.name}: ${hoverCountry.users?.toLocaleString() || "N/A"} users`;
        const padding = 6;
        const maxWidth = 200;

        p.textSize(14);
        p.textAlign(p.LEFT, p.TOP);

        const words = tooltipText.split(" ");
        const lines = [];
        let currentLine = "";

        words.forEach(word => {
            const testLine = currentLine ? currentLine + " " + word : word;
            const testWidth = p.textWidth(testLine);

            if (testWidth > maxWidth - padding * 2) {
            
            if (currentLine.length > 0) lines.push(currentLine);
            currentLine = word;
            } else {
            currentLine = testLine;
            }
        });

        if (currentLine.length > 0) lines.push(currentLine);

        const tooltipWidth = Math.min(
            maxWidth,
            Math.max(...lines.map(l => p.textWidth(l))) + padding * 2
        );

        const lineHeight = 18;
        const tooltipHeight = lines.length * lineHeight + padding * 2;

        let tooltipX = p.mouseX + 12;
        let tooltipY = p.mouseY + 12;

        if (tooltipX + tooltipWidth > canvasWidth)
            tooltipX = canvasWidth - tooltipWidth - 10;

        if (tooltipY + tooltipHeight > canvasHeight)
            tooltipY = canvasHeight - tooltipHeight - 10;

        p.fill(0, 210);
        p.stroke(255);
        p.rect(tooltipX, tooltipY, tooltipWidth, tooltipHeight, 5);

        p.noStroke();
        p.fill(255);

        lines.forEach((line, i) => {
            p.text(line, tooltipX + padding, tooltipY + padding + i * lineHeight);
        });
      }


      
      const legendX = canvasWidth - 110;
      const legendY = 50;
      const legendHeight = 150;
      const legendWidth = 20;
      p.noStroke();
      for (let i = 0; i <= 1; i += 0.01) {
        const col = p.lerpColor(p.color(200, 230, 255), p.color(0, 50, 200), 1 - i);
        p.fill(col);
        p.rect(legendX, legendY + i * legendHeight, legendWidth, legendHeight * 0.01);
      }
      p.noStroke();
      p.fill(255);
      p.textSize(12);
      p.textAlign(p.LEFT, p.CENTER);
      p.text(maxUsers.toLocaleString(), legendX + legendWidth + 5, legendY);
      p.text(minUsers.toLocaleString(), legendX + legendWidth + 5, legendY + legendHeight);
      p.textAlign(p.CENTER, p.CENTER);
      p.text("TikTok Users", legendX + legendWidth / 2, legendY - 15);

      
      function pointInPoly(verts, pt, scale = 1, offsetX = 0, offsetY = 0) {
        let c = false;
        for (let i = 0, j = verts.length - 1; i < verts.length; j = i++) {
          const vi = { x: verts[i][0] * scale + offsetX, y: verts[i][1] * scale + offsetY };
          const vj = { x: verts[j][0] * scale + offsetX, y: verts[j][1] * scale + offsetY };
          if (((vi.y > pt.y) != (vj.y > pt.y)) &&
              (pt.x < (vj.x - vi.x) * (pt.y - vi.y) / (vj.y - vi.y) + vi.x)) c = !c;
        }
        return c;
      }

      function convertPathToPolygons(path, scale = 1) {
        let coord_point = [0, 0], polygons = [], currentPolygon = [];
        for (const node of path) {
          if (node[0] === "m") { coord_point[0] += node[1] * scale; coord_point[1] += node[2] * scale; currentPolygon = []; }
          else if (node[0] === "M") { coord_point[0] = node[1] * scale; coord_point[1] = node[2] * scale; currentPolygon = []; }
          else if (node === "z") { currentPolygon.push([...coord_point]); polygons.push(currentPolygon); }
          else { currentPolygon.push([...coord_point]); coord_point[0] += node[0] * scale; coord_point[1] += node[1] * scale; }
        }
        return polygons;
      }

      p.pop();
    }
  };
})();
