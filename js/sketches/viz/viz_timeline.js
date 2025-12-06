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
        { date: "2025.01.19", text: "TikTok shuts down temporarily"},
        { date: "2025.01.20", text: "Trump delays ban for 75 days"},
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
      // DRAW TIMELINE LINE
      // ---------------------------------------
      p.stroke("#EE1D52");
      p.strokeWeight(4);
      p.line(cx, top, cx, bottom);

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

        // ------ DOT ------
        let color = ev.highlight || "#EE1D52";
        p.noStroke();
        p.fill(p.red(color), p.green(color), p.blue(color), alpha);
        p.circle(cx, y, 15);

        // ------ DATE ------
        p.fill(180, alpha);
        p.textAlign(direction === -1 ? p.RIGHT : p.LEFT, p.CENTER);
        p.textSize(19);
        p.text(ev.date, cx + direction * 40, y);

        // ------ TEXT ------
        p.fill(230, alpha);
        p.textSize(17);
        p.textAlign(direction === -1 ? p.RIGHT : p.LEFT, p.TOP);
        p.text(ev.text, textX, y + 25); 
      }

      p.pop();
    }
  };
})();
