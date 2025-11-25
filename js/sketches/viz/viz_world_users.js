(function () {
  window.VizTikTokMap = {
    year: 2025,
    dataLoaded: false,
    dropdownCreated: false,

    draw: function (p, manager, ai, progress) {
      p.push();
      const canvasWidth = manager.canvasWidth || 1200;
      const canvasHeight = manager.canvasHeight || 800;
      p.background(30);

      const mousePt = p.createVector(p.mouseX, p.mouseY);

      // --- Load CSV once ---
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
        p.text("Loading dataset...", canvasWidth / 2, canvasHeight / 2);
        p.pop();
        return;
      }

      // --- Ensure country polygons exist ---
      if (!window.country) {
        p.fill(255);
        p.textAlign(p.CENTER, p.CENTER);
        p.textSize(16);
        p.text("Country polygons not loaded — include country.js", canvasWidth / 2, canvasHeight / 2);
        p.pop();
        return;
      }

      // --- Create year dropdown once ---
      if (!this.dropdownCreated) {
        this.yearDropdown = p.createSelect();
        this.yearDropdown.position(20, 20);
        this.yearDropdown.style('z-index', '10');
        this.yearDropdown.option("2023");
        this.yearDropdown.option("2024");
        this.yearDropdown.option("2025");
        this.yearDropdown.selected(this.year);
        this.yearDropdown.changed(() => {
          window.VizTikTokMap.year = parseInt(this.yearDropdown.value());
        });
        this.dropdownCreated = true;
      }

      // --- Convert vertex paths to polygons ---
      window.country.forEach(c => {
        if (!c.polygons && c.vertexPoint) c.polygons = convertPathToPolygons(c.vertexPoint, 1);
      });

      // --- Compute map bounding box ---
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

      // --- Scale and center map ---
      const mapWidth = canvasWidth - 40;
      const mapHeight = canvasHeight - 60;
      const scaleX = mapWidth / (maxX - minX);
      const scaleY = mapHeight / (maxY - minY);
      const scale = Math.min(scaleX, scaleY) * 0.98;
      const offsetX = (canvasWidth - (maxX - minX) * scale) / 2 - minX * scale;
      const offsetY = (canvasHeight - (maxY - minY) * scale) / 2 - minY * scale;

      // --- Compute min/max TikTok users ---
      let minUsers = Infinity, maxUsers = -Infinity;
      const t = window.tiktokData;
      for (let r = 0; r < t.getRowCount(); r++) {
        const val = parseFloat(t.getRow(r).get(`TikTokUsers_${window.VizTikTokMap.year}`)?.trim());
        if (!isNaN(val)) { minUsers = Math.min(minUsers, val); maxUsers = Math.max(maxUsers, val); }
      }

      // --- Draw countries ---
      let hoverCountry = null;
      window.country.forEach(c => {
        let row = null;
        if (t) row = t.findRow(c.name, 'country') || t.findRow(c.id, 'flagCode');
        let users = NaN;
        if (row) users = parseFloat(row.get(`TikTokUsers_${window.VizTikTokMap.year}`)?.trim());

        let col = p.color(200, 200, 200); // light gray for missing data
        if (!isNaN(users) && maxUsers !== minUsers) {
          const amt = (users - minUsers) / (maxUsers - minUsers);
          col = p.lerpColor(p.color(200, 230, 255), p.color(0, 50, 200), amt); // blue gradient
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

      // --- Tooltip with offset to avoid clipping ---
      if (hoverCountry) {
        const tooltipText = `${hoverCountry.name}: ${hoverCountry.users?.toLocaleString() || "N/A"} users`;
        const padding = 5;
        const tooltipWidth = p.textWidth(tooltipText) + 2 * padding;
        const tooltipHeight = 25;

        let tooltipX = p.mouseX + 10;
        let tooltipY = p.mouseY + 10;

        if (tooltipX + tooltipWidth > canvasWidth) tooltipX = p.mouseX - tooltipWidth - 10;
        if (tooltipY + tooltipHeight > canvasHeight) tooltipY = p.mouseY - tooltipHeight - 10;

        p.fill(0, 200);
        p.stroke(255);
        p.rect(tooltipX, tooltipY, tooltipWidth, tooltipHeight, 5);
        p.fill(255);
        p.noStroke();
        p.textSize(14);
        p.textAlign(p.LEFT, p.CENTER);
        p.text(tooltipText, tooltipX + padding, tooltipY + tooltipHeight / 2);
      }

      // --- Color legend ---
      const legendX = canvasWidth - 110; // moved more right
      const legendY = 50;
      const legendHeight = 150;
      const legendWidth = 20;
      for (let i = 0; i <= 1; i += 0.01) {
        const col = p.lerpColor(p.color(200, 230, 255), p.color(0, 50, 200), 1 - i); // reverse so top=high
        p.stroke(col);
        p.line(legendX, legendY + i * legendHeight, legendX + legendWidth, legendY + i * legendHeight);
      }
      p.noStroke();
      p.fill(255);
      p.textSize(12);
      p.textAlign(p.LEFT, p.CENTER);
      p.text(maxUsers.toLocaleString(), legendX + legendWidth + 5, legendY);
      p.text(minUsers.toLocaleString(), legendX + legendWidth + 5, legendY + legendHeight);
      p.textAlign(p.CENTER, p.CENTER);
      p.text("TikTok Users", legendX + legendWidth / 2, legendY - 15);

      // --- Helper functions ---
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















