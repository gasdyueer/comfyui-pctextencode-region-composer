import { app } from "../../scripts/app.js";

app.registerExtension({
    name: "pctextencode.RegionComposer",

    async beforeRegisterNodeDef(nodeType, nodeData) {
        if (nodeData.name !== "PCTextEncode_RegionComposer") return;

        const origOnNodeCreated = nodeType.prototype.onNodeCreated;
        nodeType.prototype.onNodeCreated = function () {
            origOnNodeCreated?.apply(this, arguments);

            const btn = document.createElement("button");
            btn.textContent = "Open Region Editor";
            btn.title = "Open the visual region editor in a new tab";
            btn.style.cssText = "width:100%;padding:6px;cursor:pointer;border:1px solid #555;border-radius:4px;background:#2a2a3e;color:#ddd;font-size:12px;margin-top:4px;";
            btn.addEventListener("click", () => {
                // ComfyUI serves web/ contents at /extensions/<id>/ (no /web/ in URL)
                // e.g. /extensions/comfyui-pctextencode-region-composer/region_composer.js
                const jsPath = new URL(import.meta.url, location.href).pathname;
                const base = jsPath.replace(/\/[^/]+$/, ""); // strip filename
                window.open(`${base}/editor/index.html`, "_blank");
            });

            this.addDOMWidget("open_editor", "custom", btn, {
                getValue: () => "",
                setValue: () => {},
            });
        };
    },
});
