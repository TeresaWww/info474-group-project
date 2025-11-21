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


(function () {
    window.Vizplatform_compare = {
        draw: function (p, manager, ai, progress) {
            p.push();

            // changing data from long to wide format
            var dataMap = {}; // year -> { platform: value }

           /* if (!window.datasetSix || window.datasetSix.getRowCount() === 0) {
                // If the file hasn't loaded yet or is missing, draw a friendly message
                p.fill(0);
                p.textAlign(p.CENTER, p.CENTER);
                p.textSize(14);
                p.text("Dataset not loaded — check CSV path or reload the page.", p.width / 2, p.height / 2);
                p.pop();
                return;
            }*/

            window.datasetSix.rows.forEach(row => {
                var year = parseInt(row.get('Year'), 10);
                var platform = row.get('Platform');
                var valueStr = row.get('Number of Users (in millions)');
                var value = parseFloat(valueStr);
                if (isNaN(value)) value = null;

                if (!dataMap[year]) dataMap[year] = {};
                dataMap[year][platform] = value;
            });

            var years = Object.keys(dataMap).map(y => parseInt(y)).sort((a, b) => a - b);
            var chartData = years.map(y => {
                return {
                    year: y,
                    Facebook: dataMap[y]['Facebook'] || null,
                    Instagram: dataMap[y]['Instagram'] || null,
                    Pinterest: dataMap[y]['Pinterest'] || null,
                    SnapChat: dataMap[y]['SnapChat'] || null,
                    Twitter: dataMap[y]['Twitter'] || null,
                    TikTok: dataMap[y]['TikTok'] || null
                };
            });

            
            var platforms = [
                { key: "Facebook", color: "#4C78A8" },
                { key: "Instagram", color: "#F58518" },
                { key: "Pinterest", color: "#E45756" },
                { key: "SnapChat", color: "#72B7B2" },
                { key: "Twitter", color: "#F2CF5B" },
                { key: "TikTok", color: "#54A24B" }
            ];

           
            var left = manager.offsetX || 50;
            var top = manager.offsetY || 20;
            var width = (manager.width || 600) - 80;
            var height = (manager.height || 350) - 40;

            
            var minVal = 0;
            var maxVal = 180;
            var stepVal = 20;
            var steps = (maxVal - minVal) / stepVal;

           
            p.stroke(0);
            p.line(left, top, left, top + height);           // y-axis
            p.line(left, top + height, left + width, top + height); // x-axis

            
            p.stroke(200);
            p.fill(0);
            p.textAlign(p.RIGHT, p.CENTER);
            p.textSize(12);

            for (var i = 0; i <= steps; i++) {
                var yVal = minVal + i * stepVal;
                var y = top + height - ((yVal - minVal) / (maxVal - minVal)) * height;

                
                p.stroke(220);
                p.line(left, y, left + width, y);

                
                p.fill(0);
                p.noStroke();
                p.text(yVal, left - 10, y);
            }

            // adding hover feature when over the chart - to highlight TikTok specifically 
            var mouseOverChart = (
                p.mouseX >= left && p.mouseX <= left + width &&
                p.mouseY >= top && p.mouseY <= top + height
            );

           
            platforms.forEach(function (pf) {
                
                if (mouseOverChart) {
                    if (pf.key === "TikTok") {
                        p.stroke(pf.color);
                        p.strokeWeight(4); 
                    } else {
                        p.stroke("#ccc"); 
                        p.strokeWeight(2);
                    }
                } else {
                    p.stroke(pf.color);
                    p.strokeWeight(pf.key === "TikTok" ? 3 : 2);
                }

                
                p.noFill();
                p.beginShape();
                for (var j = 0; j < chartData.length; j++) {
                    var d = chartData[j];
                    var val = d[pf.key];
                    if (val !== null && val !== undefined) {
                        var x = left + (j / (chartData.length - 1)) * width;
                        var y = top + height - ((val - minVal) / (maxVal - minVal)) * height;
                        p.vertex(x, y);
                    }
                }
                p.endShape();

                
                for (var j2 = 0; j2 < chartData.length; j2++) {
                    var d2 = chartData[j2];
                    var val2 = d2[pf.key];
                    if (val2 !== null && val2 !== undefined) {
                        var x2 = left + (j2 / (chartData.length - 1)) * width;
                        var y2 = top + height - ((val2 - minVal) / (maxVal - minVal)) * height;

                        
                        if (mouseOverChart && pf.key !== "TikTok") {
                            p.fill("#ccc");
                        } else {
                            p.fill(pf.color);
                        }

                        p.noStroke();
                        p.circle(x2, y2, 8);

                        
                        if (pf.key === platforms[0].key) {
                            p.fill(0);
                            p.textAlign(p.CENTER, p.TOP);
                            p.text(d2.year, x2, top + height + 5);
                        }
                    }
                }
            });

            // axis titles
            p.fill(0);
            p.textSize(14);
            p.textAlign(p.CENTER, p.CENTER);
            p.text("Year", left + width / 2, top + height + 40);
            p.push();
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
                p.fill(0);
                p.text(pf.key, lx + 15, ly + i * 25);
            });

            p.pop();
        }
    };
})();













