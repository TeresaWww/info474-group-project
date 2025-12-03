(function () {
    window.VizSocialNetworks = {
      dataLoaded: false,
      table: null,
      animFrame: 0,
      hoverIndex: -1,
  
      draw: function (p, manager, ai, progress) {
        p.textFont("TiemposTextWeb-Regular");
        p.push();
  
        const W = manager.canvasWidth;
        const H = manager.canvasHeight;
  
        // BLACK global background
        p.background(0);
  
        const margin = { top: 80, right: 150, bottom: 80, left: 120 };
        const chartHeight = H - margin.top - margin.bottom;
  
        const mouse = p.createVector(p.mouseX, p.mouseY);
  
        if (!this.dataLoaded) {
          p.loadTable(
            "data/media_users_2025.csv",
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
          p.textSize(24);
          p.text("Loading social networks data...", W / 2, H / 2);
          p.pop();
          return;
        }
  
        let dataset = [];
        for (let r = 0; r < this.table.getRowCount(); r++) {
          let name = this.table.getString(r, "applications");
  
          // Clean weird Excel formatting
          let raw = this.table.getString(r, "users");
          raw = raw.replace(/[^0-9.-]/g, "");
          let users = Number(raw);
  
          let year = this.table.getString(r, "year");

          dataset.push({
            name,
            users,
            year,
            highlight: name === "TikTok"
          });

        }
        dataset.sort((a, b) => b.users - a.users);
        dataset = dataset.slice(0, 10); 
  
        const maxUsers = Math.max(...dataset.map(d => d.users));

        const totalRows = dataset.length;
        const rowH = chartHeight / totalRows;
        const barH = rowH * 0.65;
        const barGap = rowH * 0.35;
  
        // Animation
        this.animFrame = Math.min(this.animFrame + 0.04, 1);
        let anim = this.animFrame;

        p.fill(255);
        p.textSize(32);
        p.textAlign(p.LEFT, p.CENTER);
        p.text(
          "Top 10 Social Media Platforms (2025)",
          margin.left,
          margin.top - 50
        );

        p.textSize(15);
        p.fill(150);
        p.text(
          "Hover to see what year each platform was launched",
          margin.right + 150,
          margin.top - 20
        );

  
        p.textSize(16);
        p.fill(220);
        p.text(
          "Number of active users (in millions)",
          margin.right + 100,
          H - margin.bottom + 50
        );
  
        p.push();
        p.translate(margin.left, margin.top);
  
        this.hoverIndex = -1;
  
        dataset.forEach((d, i) => {
          let y = i * (barH + barGap);
          let w = p.map(d.users, 0, maxUsers, 0, W - margin.right - margin.left) * anim;
  
          // Hover detection
          let isHover =
            mouse.x > margin.left &&
            mouse.x < margin.left + w &&
            mouse.y > margin.top + y &&
            mouse.y < margin.top + y + barH;
  
          if (isHover) this.hoverIndex = i;
  
          // Bar color
          if (isHover) {
            p.fill("#69C9D0"); // hover orange
          } else if (d.highlight) {
            p.fill("#EE1D52"); // red TikTok
          } else {
            p.fill(60); // gray bars
          }
  
          p.noStroke();
          p.rect(0, y, w, barH, 6);
  
          // Name label (WHITE)
          p.fill(255);
          p.textSize(18);
          p.textAlign(p.RIGHT, p.CENTER);
          p.text(d.name, -20, y + barH / 2);
  
          // Value label (WHITE)
          p.textAlign(p.LEFT, p.CENTER);
          p.text(d.users.toLocaleString(), w + 10, y + barH / 2);
        });
  
        p.pop();

        p.stroke(150);
        p.line(
          margin.left,
          H - margin.bottom,
          W - margin.right,
          H - margin.bottom
        );
  
        let ticks = [500, 1000, 1500, 2000, 2500, 3000];
        ticks.forEach((t) => {
          let x = p.map(t, 0, maxUsers, margin.left, W - margin.right);
  
          p.stroke(150);
          p.line(x, H - margin.bottom - 6, x, H - margin.bottom + 6);
  
          p.noStroke();
          p.fill(200);
          p.textSize(14);
          p.textAlign(p.CENTER, p.TOP);
          p.text(t, x, H - margin.bottom + 10);
        });
  
        if (this.hoverIndex !== -1) {
          let d = dataset[this.hoverIndex];
  
          p.noStroke();
          p.fill(30);
          p.rect(mouse.x + 12, mouse.y - 23, 180, 55, 6);
  
          p.fill(255);
          p.textSize(16);
          p.textAlign(p.LEFT, p.CENTER);
          p.text(`${d.name}`, mouse.x + 20, mouse.y - 5);
          p.text(`Launched in ${d.year}`, mouse.x + 20, mouse.y + 15);          
  
          p.cursor(p.HAND);
        } else {
          p.cursor(p.ARROW);
        }
  
        p.pop();
      }
    };
  })();
  