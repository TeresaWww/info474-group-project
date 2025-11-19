(function () {
    window.VizSix = {
        draw: function (p, manager, ai, progress) {
            p.push();

            // --- Dataset ---
            var data = [
                { year: 2019, Facebook:173, Instagram:110.8, Pinterest:82.3, Snapchat:82.1, Twitter:54, TikTok:35.7 },
                { year: 2020, Facebook:179.3, Instagram:118.3, Pinterest:89, Snapchat:85.5, Twitter:56.4, TikTok:66.9 },
                { year: 2021, Facebook:179.7, Instagram:123.4, Pinterest:85.7, Snapchat:87.9, Twitter:57.8, TikTok:86.9 },
                { year: 2022, Facebook:178.3, Instagram:128.3, Pinterest:86.1, Snapchat:88.8, Twitter:58.7, TikTok:95.8 },
                { year: 2023, Facebook:177.9, Instagram:133.5, Pinterest:86.4, Snapchat:89.6, Twitter:55.1, TikTok:102.4 },
                { year: 2024, Facebook:177.5, Instagram:138.5, Pinterest:86.8, Snapchat:90.5, Twitter:50.5, TikTok:107.8 },
                { year: 2025, Facebook:177.5, Instagram:143.3, Pinterest:87.3, Snapchat:91.1, Twitter:null, TikTok:112.1 }
            ];

            var platforms = [
                { key: "Facebook", color: "#4C78A8" },
                { key: "Instagram", color: "#F58518" },
                { key: "Pinterest", color: "#E45756" },
                { key: "Snapchat", color: "#72B7B2" },
                { key: "Twitter", color: "#F2CF5B" },
                { key: "TikTok", color: "#54A24B" }
            ];

            // --- Layout ---
            var left = manager.offsetX || 50;
            var top = manager.offsetY || 20;
            var width = (manager.width || 600) - 80;
            var height = (manager.height || 350) - 40;

            // --- Fixed Y-axis scale ---
            var minVal = 0;
            var maxVal = 180;
            var stepVal = 20;
            var steps = (maxVal - minVal) / stepVal;

            // --- Draw axes ---
            p.stroke(0);
            p.line(left, top, left, top + height);           // y-axis
            p.line(left, top + height, left + width, top + height); // x-axis

            // --- Draw gridlines & y-axis labels ---
            p.stroke(200);
            p.fill(0);
            p.textAlign(p.RIGHT, p.CENTER);
            p.textSize(12);

            for (var i = 0; i <= steps; i++) {
                var yVal = minVal + i * stepVal;
                var y = top + height - ((yVal - minVal) / (maxVal - minVal)) * height;

                // gridline
                p.stroke(220);
                p.line(left, y, left + width, y);

                // y-axis label
                p.fill(0);
                p.noStroke();
                p.text(yVal, left - 10, y);
            }

            // --- Hover detection ---
            var mouseOverChart = (
                p.mouseX >= left && p.mouseX <= left + width &&
                p.mouseY >= top && p.mouseY <= top + height
            );

            // --- Draw lines and dots ---
            platforms.forEach(function(pf) {
                // Determine stroke and weight
                if (mouseOverChart) {
                    if (pf.key === "TikTok") {
                        p.stroke(pf.color);
                        p.strokeWeight(4); // highlighted TikTok
                    } else {
                        p.stroke("#ccc"); // dim others
                        p.strokeWeight(2);
                    }
                } else {
                    p.stroke(pf.color);
                    p.strokeWeight(p.key === "TikTok" ? 3 : 2);
                }

                // Draw line
                p.noFill();
                p.beginShape();
                data.forEach(function(d, i) {
                    if (d[pf.key] !== null) {
                        var x = left + (i / (data.length - 1)) * width;
                        var y = top + height - ((d[pf.key] - minVal) / (maxVal - minVal)) * height;
                        p.vertex(x, y);
                    }
                });
                p.endShape();

                // Draw dots
                data.forEach(function(d, i) {
                    if (d[pf.key] !== null) {
                        var x = left + (i / (data.length - 1)) * width;
                        var y = top + height - ((d[pf.key] - minVal) / (maxVal - minVal)) * height;

                        // Dimming logic only for dots
                        if (mouseOverChart && pf.key !== "TikTok") {
                            p.fill("#ccc");
                        } else {
                            p.fill(pf.color);
                        }

                        p.noStroke();
                        p.circle(x, y, 8);

                        // Year labels (always normal)
                        if (pf.key === platforms[0].key) {
                            p.fill(0);
                            p.textAlign(p.CENTER, p.TOP);
                            p.text(d.year, x, top + height + 5);
                        }
                    }
                });
            });

            // --- Axis labels ---
            p.fill(0);
            p.textSize(14);
            p.textAlign(p.CENTER, p.CENTER);
            p.text("Year", left + width / 2, top + height + 40);
            p.push();
            p.translate(left - 50, top + height / 2);
            p.rotate(-Math.PI / 2);
            p.text("Number of Users (millions)", 0, 0);
            p.pop();

            // --- Legend ---
            var lx = left + width + 20;
            var ly = top;
            p.textAlign(p.LEFT, p.CENTER);
            p.textSize(12);
            platforms.forEach(function(pf, i) {
                p.fill(pf.color);
                p.noStroke();
                p.circle(lx, ly + i * 25, 10);
                p.fill(0);
                p.text(pf.key, lx + 15, ly + i * 25);
            });

            p.pop();
        }
    };
})();











