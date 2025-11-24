(function () {
    window.VizTimeline = {
      draw: function (p, manager, ai, progress) {
        p.push();
        p.background(0);
  
        let events = [
          { date: "2020.08", text: "Trump issues order: TikTok must\n be sold or banned in the U.S." },
          { date: "2022.12", text: "U.S. government bans TikTok\non all federal devices" },
          { date: "2024.03", text: "Biden signs law mandating TikTok\nsale or nationwide ban" },
          { date: "2024.12", text: "Federal appeals court upholds\nnational TikTok ban" },
          { date: "2025.01.19", text: "TikTok sale deadline arrives;\napp temporarily shuts down", highlight: "#69C9D0" },
          { date: "2025.01.20", text: "President Trump delays\nban for 75 days", highlight: "#69C9D0" },
          { date: "2025.02.13", text: "TikTok returns to app stores\nduring the delay" },
          { date: "2025.06", text: "White House announces\nanother 90-day extension" },
          { date: "2025.09", text: "Fourth extension granted;\nnew deadline: Dec 16, 2025" }
        ];
  
        // Layout
        const top = manager.offsetY + 10;
        const bottom = manager.offsetY + manager.height - 10;
        const cx = manager.offsetX + manager.width * 0.5;
  
        const spacing = (bottom - top) / (events.length - 1);
        const textOffset = 90;  // closer to line
        const dateOffset = 15;  // small spacing near line
  
        if (!window.timelineState) window.timelineState = { activeIndex: -1 };
        let hoverIndex = -1;
  
        // Vertical line
        p.stroke("#EE1D52");
        p.strokeWeight(4);
        p.line(cx, top, cx, bottom);
  
        p.textFont("Georgia");
  
        //----------------------------------------------------
        // DRAW EVENTS
        //----------------------------------------------------
        for (let i = 0; i < events.length; i++) {
          let y = top + spacing * i;
  
          // Alternate left/right
          let direction = (i % 2 === 0) ? -1 : 1;
          let textX = cx + direction * textOffset;
  
          //----------------------------------------------------
          // HOVER DETECTION ON TEXT (NOT DOT)
          //----------------------------------------------------
          p.textSize(14);
          let lines = events[i].text.split("\n");
  
          // find longest line
          let longest = lines.reduce((a, b) => (b.length > a.length ? b : a), "");
          let textW = p.textWidth(longest);
          let textH = lines.length * 16;
  
          // bounding box
          let boxLeft  = (direction === -1) ? textX - textW : textX;
          let boxRight = (direction === -1) ? textX : textX + textW;
          let boxTop   = y - textH * 0.5;
          let boxBottom = y + textH * 0.5;
  
          if (p.mouseX >= boxLeft && p.mouseX <= boxRight &&
              p.mouseY >= boxTop && p.mouseY <= boxBottom) {
            hoverIndex = i;
          }
  
          let isHover = hoverIndex === i;
          let isActive = window.timelineState.activeIndex === i;
  
          //----------------------------------------------------
          // DOT (still visible but NOT interactive)
          //----------------------------------------------------
          let nodeColor = events[i].highlight || "#EE1D52";
          let nodeSize = isActive ? 22 : isHover ? 18 : 14;
  
          p.noStroke();
          p.fill(nodeColor);
          p.circle(cx, y, nodeSize);
  
          //----------------------------------------------------
          // DRAW EVENT TEXT
          //----------------------------------------------------
          p.textAlign(direction === -1 ? p.RIGHT : p.LEFT, p.CENTER);
          p.textSize(isHover || isActive ? 15 : 14);
          p.fill(isHover || isActive ? nodeColor : 220);
  
          p.text(events[i].text, textX, y + 10);
  
          //----------------------------------------------------
          // DRAW DATE (alternating)
          //----------------------------------------------------
          p.fill(255);
          p.textSize(13);
          p.textAlign(direction === -1 ? p.RIGHT : p.LEFT, p.TOP);
  
          let dateX = cx + direction * dateOffset;
          p.text(events[i].date, dateX, y);
        }
  
        //----------------------------------------------------
        // CLICK → PIN EVENT
        //----------------------------------------------------
        p.mousePressed = function () {
          if (hoverIndex !== -1) {
            window.timelineState.activeIndex = hoverIndex;
          } else {
            window.timelineState.activeIndex = -1;
          }
        };
  
        p.pop();
      }
    };
  })();
  