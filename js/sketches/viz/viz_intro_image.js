// js/sketches/viz/viz_intro_image.js
(function () {
    window.VizIntroImage = {
      img: null,
  
      draw: function (p, manager, ai, progress) {
        if (!this.img) {
          this.img = p.loadImage("img/tiktok_intro_image.jpg");
        }
  
        p.push();
        p.background(0);
  
        if (this.img) {
          const imgW = this.img.width;
          const imgH = this.img.height;
  
          const scale = Math.min(p.width / imgW, p.height / imgH);
          const drawW = imgW * scale * 0.8;
          const drawH = imgH * scale * 0.9;
  
          const x = (p.width - drawW) / 2;
          const y = (p.height - drawH) / 2;
  
          p.image(this.img, x, y, drawW, drawH);

        } else {
          p.fill(255);
          p.textAlign(p.CENTER, p.CENTER);
          p.textSize(18);
          p.text("Loading intro image...", p.width / 2, p.height / 2);
        }
  
        p.pop();
      },
    };
  })();
  