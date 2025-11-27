// sketch_renderer.js

(function () {
    window.Renderer = {

        setData: function (manager) {
            manager.offsetX = (manager.margin && manager.margin.left) || 20;
            manager.offsetY = (manager.margin && manager.margin.top) || 0;

            // parse TikTok CSV from global `tables.tikTok`
            const parsedTikTok = [];
            if (window.tables && window.tables.tikTok) {
                const t = window.tables.tikTok;
                for (let r = 0; r < t.getRowCount(); r++) {
                    parsedTikTok.push({
                        date: t.getString(r, "date"),
                        value: t.getNum(r, "spend_logusd")
                    });
                }
            }

            console.log("Renderer.setData parsedTikTok:", parsedTikTok);

            // make all datasets available here if you add more later
            manager.data = {
                tikTok: parsedTikTok
            };

            return Promise.resolve(manager.data);
        },

        draw: function (p, manager, ai, progress) {
            try { console.log('Renderer: delegating draw, ai=', ai); } catch (e) { }

            //if (ai === 0) {
            //    window.VizTitle.draw(p, manager, ai, progress);
           //     return;
           // }

            if (window.VizTikTokMap) {
                if (ai === 1) {  // 1 = first visualization (the map)
                    window.VizTikTokMap.yearDropdown?.show();
                    window.VizTikTokMap.yearLabel?.show();
                } else {
                    window.VizTikTokMap.yearDropdown?.hide();
                    window.VizTikTokMap.yearLabel?.hide();
                }
            }

            if (ai === 1) {
                window.VizTikTokMap.draw(p, manager, ai, progress);
                return;
            }

            if (ai === 2) {
                window.VizTikTokAge.draw(p, manager, ai, progress);
                return;
            }

            if (ai === 3) {
                window.VizTimeline.draw(p, manager, ai, progress);
                return;
            }

            if (ai === 4) {
                window.VizBan.draw(p, manager, ai, progress);
                return;
            }

            if (ai === 5) {
                window.VizRednoteDownloads.draw(p, manager, ai, progress);
                return;
            }

            if (ai === 6) { 
                window.Vizplatform_compare.draw(p, manager, ai, progress);
                return;
            }
        }           
    };
})();
