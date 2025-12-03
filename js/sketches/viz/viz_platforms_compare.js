// global dataset
window.datasetSix = null;

// loading dataset
p5.prototype.preload = function () {
    window.datasetSix = this.loadTable(
        'data/us_social_network_users_by_platform.csv',
        'csv',
        'header'
    );
};

// global state for Twitter popup
window.twitterPopup = {
    visible: false,
    x: 0,
    y: 0,
    text: ""
};

// global state for animation
window.lineAnimation = {
    progress: 0,
    speed: 0.01,
    finished: false
};

(function () {
    window.Vizplatform_compare = {
        draw: function (p, manager, ai, progress) {
            p.push();
            p.background(0);


            // change dataset from long format to wide format 
            var dataMap = {};
            if (!window.datasetSix || window.datasetSix.getRowCount() === 0) {
                p.fill(0);
                p.textAlign(p.CENTER, p.CENTER);
                p.textSize(14);
                p.text("Dataset not loaded — check CSV path or reload the page.", p.width / 2, p.height / 2);
                p.pop();
                return;
            }

            window.datasetSix.rows.forEach(row => {
                var year = parseInt(row.get('Year'), 10);
                var platform = row.get('Platform');
                var valueStr = row.get('Number of Users (in millions)') || "";
                var value = parseFloat(valueStr);
                if (isNaN(value)) value = null;

                if (!dataMap[year]) dataMap[year] = {};
                dataMap[year][platform] = value;
            });

            var years = Object.keys(dataMap).map(y => parseInt(y)).sort((a, b) => a - b);

            var chartData = years.map(year => {

                return Object.assign({ year }, dataMap[year]);
            });

            var platformSet = new Set();
            Object.values(dataMap).forEach(yearObj => {
                Object.keys(yearObj).forEach(pf => platformSet.add(pf));
            });

            var palette = [
                "#4DA6FF", "#FF5E99", "#FF3355", "#FFF500", "#B388FF",
                "#69F6FF", "#00FFA2", "#FFA200", "#9D4EDD", "#FF7090"
            ];

            var platforms = Array.from(platformSet).map((pf, i) => ({
                key: pf,
                color: palette[i % palette.length]
            }));

            var left = manager.offsetX || 50;
            var top = manager.offsetY || 30;
            var width = (manager.width || 600) - 80;
            var height = (manager.height || 350) - 40;

            // Draw graph title
            p.push();
            p.fill(255); // white text
            p.textSize(20); // larger font for title
            p.textAlign(p.CENTER, p.TOP); // center horizontally, top-aligned vertically
            p.text("US Social Network Users by Platform from 2019 to 2025", left + width / 2, top - 30); // adjust top offset if needed
            p.pop();

            var minVal = 0;
            var maxVal = 180;
            var stepVal = 20;
            var steps = (maxVal - minVal) / stepVal;

            // axes and grid
            p.stroke(200);
            p.line(left, top, left, top + height);
            p.line(left, top + height, left + width, top + height);

            p.stroke(200);
            p.fill(255);
            p.textAlign(p.RIGHT, p.CENTER);
            p.textSize(12);

            for (var i = 0; i <= steps; i++) {
                var yVal = minVal + i * stepVal;
                var y = top + height - ((yVal - minVal) / (maxVal - minVal)) * height;
                p.stroke(220);
                p.line(left, y, left + width, y);
                p.fill(255);
                p.noStroke();
                p.text(yVal, left - 10, y);
            }

            var mouseOverChart = (
                p.mouseX >= left && p.mouseX <= left + width &&
                p.mouseY >= top && p.mouseY <= top + height
            );

            
            var lastTwitterIndex = -1;
            for (var i = chartData.length - 1; i >= 0; i--) {
                if (chartData[i]['Twitter'] !== null && chartData[i]['Twitter'] !== undefined) {
                    lastTwitterIndex = i;
                    break;
                }
            }
            var lastTwitterPoint = null;
            if (lastTwitterIndex >= 0) {
                lastTwitterPoint = {
                    x: left + (lastTwitterIndex / (chartData.length - 1)) * width,
                    y: top + height - ((chartData[lastTwitterIndex]['Twitter'] - minVal) / (maxVal - minVal)) * height,
                    text: "No data for Twitter in 2025 since Twitter became X"
                };
                window.lastTwitterPoint = lastTwitterPoint;
            }

            // animation for lines
            if (!window.lineAnimation.finished) {
                window.lineAnimation.progress += window.lineAnimation.speed;
                if (window.lineAnimation.progress >= 1) {
                    window.lineAnimation.progress = 1;
                    window.lineAnimation.finished = true;
                }
            }

            platforms.forEach(function (pf) {
                p.stroke(mouseOverChart && pf.key !== "TikTok" ? "#ccc" : pf.color);
                p.strokeWeight(p.key === "TikTok" ? 6 : 3);
                p.noFill();

                p.beginShape();
                var maxDrawIndex = Math.floor((chartData.length - 1) * window.lineAnimation.progress);
                var t = ((chartData.length - 1) * window.lineAnimation.progress) - maxDrawIndex; // fractional progress
                for (var j = 0; j <= maxDrawIndex; j++) {
                    var d = chartData[j];
                    var val = d[pf.key];
                    if (val !== null && val !== undefined) {
                        var x = left + (j / (chartData.length - 1)) * width;
                        var y = top + height - ((val - minVal) / (maxVal - minVal)) * height;
                        p.vertex(x, y);
                    }
                }
                
                if (maxDrawIndex < chartData.length - 1) {
                    var d1 = chartData[maxDrawIndex];
                    var d2 = chartData[maxDrawIndex + 1];
                    var v1 = d1[pf.key];
                    var v2 = d2[pf.key];
                    if (v1 !== null && v1 !== undefined && v2 !== null && v2 !== undefined) {
                        var x1 = left + (maxDrawIndex / (chartData.length - 1)) * width;
                        var y1 = top + height - ((v1 - minVal) / (maxVal - minVal)) * height;
                        var x2 = left + ((maxDrawIndex + 1) / (chartData.length - 1)) * width;
                        var y2 = top + height - ((v2 - minVal) / (maxVal - minVal)) * height;
                        var xi = p.lerp(x1, x2, t);
                        var yi = p.lerp(y1, y2, t);
                        p.vertex(xi, yi);
                    }
                }
                p.endShape();

                // draw dots only up to progress
                for (var j2 = 0; j2 <= maxDrawIndex; j2++) {
                    var d2 = chartData[j2];
                    var val2 = d2[pf.key];
                    if (val2 !== null && val2 !== undefined) {
                        var x2 = left + (j2 / (chartData.length - 1)) * width;
                        var y2 = top + height - ((val2 - minVal) / (maxVal - minVal)) * height;
                        p.fill(mouseOverChart && pf.key !== "TikTok" ? "#ccc" : pf.color);
                        p.noStroke();
                        p.circle(x2, y2, 8);

                        if (pf.key === platforms[0].key) {
                            p.fill(255);
                            p.textAlign(p.CENTER, p.TOP);
                            p.text(d2.year, x2, top + height + 5);
                        }
                    }
                }
            });

            
            if (window.lineAnimation.finished && lastTwitterPoint) {
                p.push();
                p.noFill();
                p.stroke('red');
                p.strokeWeight(3);
                p.circle(lastTwitterPoint.x, lastTwitterPoint.y, 16);
                p.pop();
            }

            // axis titles
            p.push();
            p.fill(255);
            p.textSize(14);
            p.textAlign(p.CENTER, p.CENTER);
            p.text("Year", left + width / 2, top + height + 40);
            p.push();
            p.fill(255);
            p.translate(left - 50, top + height / 2);
            p.rotate(-Math.PI / 2);
            p.text("Number of Users (millions)", 0, 0);
            p.pop();

            // legend
            var lx = left + width + 20;
            var ly = top;
            p.textAlign(p.LEFT, p.CENTER);
            p.textSize(12);
            platforms.forEach(function (pf, i) {
                p.fill(pf.color);
                p.noStroke();
                p.circle(lx, ly + i * 25, 10);
                p.fill(255);
                p.text(pf.key, lx + 15, ly + i * 25);
            });

            
            if (window.twitterPopup.visible) {
                var popupWidth = 220;
                var popupHeight = 50;
                var px = window.twitterPopup.x - popupWidth / 2;
                var py = window.twitterPopup.y + 15;

                p.fill(255);
                p.stroke(0);
                p.rect(px, py, popupWidth, popupHeight, 5);

                p.fill(200, 50, 50);
                p.noStroke();
                p.rect(px + popupWidth - 20, py + 5, 15, 15);
                p.fill(255);
                p.textSize(12);
                p.textAlign(p.CENTER, p.CENTER);
                p.text("X", px + popupWidth - 12.5, py + 12.5);

                p.fill(0);
                p.noStroke();
                p.textAlign(p.LEFT, p.TOP);
                p.text(window.twitterPopup.text, px + 10, py + 10, popupWidth - 25, popupHeight - 20);
            }

            p.pop();

           
            p.mousePressed = function () {
                if (!window.lastTwitterPoint) return;

                var pt = window.lastTwitterPoint;
                var d = p.dist(p.mouseX, p.mouseY, pt.x, pt.y);

                if (window.lineAnimation.finished && d <= 8) {
                    window.twitterPopup.visible = true;
                    window.twitterPopup.x = pt.x;
                    window.twitterPopup.y = pt.y;
                    window.twitterPopup.text = pt.text;
                    return;
                }

            
                window.twitterPopup.visible = false;
            };
        }
    };
})();

