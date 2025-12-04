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

            if (ai === 1) {
                p.clear();
                return;
            }

            if (ai === 2) {
                window.VizSocialNetworks.draw(p, manager, ai, progress);
                return;
            }

            if (ai === 3) {
                p.clear();
                window.VizTikTokMap.yearLabel?.hide();
                window.VizTikTokMap.btnGroup?.hide();
                return;
            }

            if (ai === 4) {
                window.VizTikTokMap.draw(p, manager, ai, progress);
                window.VizTikTokMap.yearLabel?.show();
                window.VizTikTokMap.btnGroup?.show();
                return;
            }

            if (ai === 5) {
                window.VizTikTokMap.yearLabel?.hide();
                window.VizTikTokMap.btnGroup?.hide();
                window.TikTokAge.draw(p, manager, ai, progress);
                return;
            }

            if (ai === 6 || ai === 9) {
                p.clear();
                return;
            }

            if (ai === 7 || ai === 8) {
                window.VizTimeline.draw(p, manager, ai, progress);
                return;

            }

            if (ai === 10) {
                window.VizBan.draw(p, manager, ai, progress);
                return;
            }

            if (ai === 11) {
                p.clear();
                return;
            }
            
            if (ai === 12) {
                window.VizRednoteDownloads.draw(p, manager, ai, progress);
                return;
            }

            if (ai === 13) {
                window.VizRednoteDownloads.draw(p, manager, ai, progress);
                return;
            }

            if (ai === 14) { 
                window.Vizplatform_compare.draw(p, manager, ai, progress);
                return;
            }

            if (ai === 15) { 
                p.clear();
                return;
            }
        }           
    };
})();
