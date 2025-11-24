// viz_scatter.js
// Data-agnostic scatter viz — draws cached random points and updates them
// only occasionally to reduce churn.
(function () {
    window.VizScatter = {
        draw: function (p, manager, ai, progress) {
            p.noStroke();
            var cols = manager.width || 600;
            var rows = manager.height || 520;
            var offsetX = (manager.offsetX || 0);
            var offsetY = (manager.offsetY || 0);
            var count = 120;
            var updateEvery = 15; // frames between regenerations (~0.5s at 30fps)

            if (!manager._randomPoints || (p.frameCount % updateEvery === 0)) {
                var pts = [];
                for (var i = 0; i < count; i++) {
                    var rx = offsetX + Math.random() * cols;
                    var ry = offsetY + Math.random() * rows;
                    var rsz = 2 + Math.random() * 6;
                    var r = Math.floor(30 + Math.random() * 60);
                    var g = Math.floor(100 + Math.random() * 80);
                    var b = Math.floor(160 + Math.random() * 40);
                    var a = 180;
                    pts.push({ x: rx, y: ry, r: rsz, c: [r, g, b, a] });
                }
                manager._randomPoints = pts;
            }

            var pts = manager._randomPoints || [];
            for (var j = 0; j < pts.length; j++) {
                var ptd = pts[j];
                var col = ptd.c;
                p.fill(col[0], col[1], col[2], col[3]);
                p.ellipse(ptd.x, ptd.y, ptd.r, ptd.r);
            }
        }
    };
})();
