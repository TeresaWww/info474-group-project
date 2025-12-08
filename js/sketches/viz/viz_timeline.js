(function () {
  window.VizTimeline = {
    draw: function (p, manager, ai, progress) {
      p.push();
      p.background(0);

      // ---------------------------------------
      // FULL TIMELINE EVENTS
      // ---------------------------------------
      const events = [
        { date: "2020.08", text: "Trump orders TikTok sale or ban" },
        { date: "2022.12", text: "TikTok banned on all federal devices" },
        { date: "2024.03", text: "Biden signs law requiring sale or ban" },
        { date: "2024.12", text: "Federal appeals court upholds ban" },
      
        { 
          date: "2025.01.19", 
          text: "TikTok shuts down temporarily",
          highlight: "#FFB347",
          textColor: "#FFB347"
        },
        { 
          date: "2025.01.20", 
          text: "Trump delays ban for 75 days",
          highlight: "#FFB347",
          textColor: "#FFB347"
        },
        
      
        { date: "2025.02.13", text: "TikTok returns to app stores" },
        { date: "2025.06", text: "Another 90-day extension announced" },
        { date: "2025.09", text: "Fourth extension: new deadline Dec 16" }
      ];
      

      // ---------------------------------------
      // SPLIT BY INDEX
      // ---------------------------------------
      const mid = Math.floor(events.length / 2);

      let visibleEvents =
        ai === 7 ? events.slice(0, mid) :
        ai === 8 ? events.slice(mid) :
        [];

      if (visibleEvents.length === 0) {
        p.pop();
        return;
      }

      // ---------------------------------------
      // REVEAL BASED ON PROGRESS (0 → 1)
      // ---------------------------------------
      const revealCount = Math.min(
        visibleEvents.length,
        Math.floor(progress * (visibleEvents.length + 0.0001))
      );
      

      // ---------------------------------------
      // LAYOUT
      // ---------------------------------------
      const top = 40;
      const bottom = manager.height - 40;
      const cx = manager.width * 0.5;

      const spacing = (bottom - top) / (visibleEvents.length - 1);

      p.textFont("Georgia");

      // ---------------------------------------
      // GRADIENT TIMELINE + DOT COLOR MAP
      // ---------------------------------------

      const TikTokRed = p.color(238, 29, 82);  // starting color for both timelines

      // Timeline 1 (ai === 7): TikTok red → medium red → dark red
      const med1  = p.color(190, 20, 60);      // slightly deeper
      const dark1 = p.color(120, 10, 35);      // dark red
      
      // Timeline 2 (ai === 8): TikTok red → darker red → very deep red
      const med2  = p.color(150, 15, 40);      // deeper & cooler tone
      const dark2 = p.color(80, 5, 20);        // very dark red for escalation
      
      // Select gradient set based on timeline segment
      let C1 = TikTokRed;
      let C2 = ai === 7 ? med1  : med2;
      let C3 = ai === 7 ? dark1 : dark2;


      // how many vertical steps to draw
      const steps = 300;

      // timeline gradient
      for (let i = 0; i < steps; i++) {
        let t = i / (steps - 1);

        let y1 = p.lerp(top, bottom, t);
        let y2 = p.lerp(top, bottom, t + 1 / steps);

        let col;
        if (t < 0.5) {
          col = p.lerpColor(C1, C2, t / 0.5);    // first half
        } else {
          col = p.lerpColor(C2, C3, (t - 0.5) / 0.5); // second half
        }

        p.stroke(col);
        p.strokeWeight(4);
        p.line(cx, y1, cx, y2);
      }


      // ---------------------------------------
      // DRAW EVENTS
      // ---------------------------------------
      for (let i = 0; i < visibleEvents.length; i++) {
        const ev = visibleEvents[i];
        const y = top + spacing * i;

        const direction = (i % 2 === 0) ? -1 : 1;
        const textX = cx + direction * 10;

        // Fade-in based on reveal
        let alpha = i < revealCount ? 255 : 40;

        // DOT COLOR MATCHES GRADIENT SET
        let tDot = (y - top) / (bottom - top);
        let dotCol;

        if (tDot < 0.5) {
          dotCol = p.lerpColor(C1, C2, tDot / 0.5);
        } else {
          dotCol = p.lerpColor(C2, C3, (tDot - 0.5) / 0.5);
        }

        p.noStroke();
        p.fill(p.red(dotCol), p.green(dotCol), p.blue(dotCol), alpha);
        p.circle(cx, y, 18);



        // ------ DATE ------
        p.fill(180, alpha);
        p.textAlign(direction === -1 ? p.RIGHT : p.LEFT, p.CENTER);
        p.textSize(20);
        p.text(ev.date, cx + direction * 40, y);

        // ------ TEXT ------
        const txtCol = ev.textColor ? ev.textColor : "white";
        p.fill(p.red(txtCol), p.green(txtCol), p.blue(txtCol), alpha);
        
        p.textSize(20);
        p.textAlign(direction === -1 ? p.RIGHT : p.LEFT, p.TOP);
        p.text(ev.text, textX, y + 25); 
      }

      p.pop();
    }
  };
})();
