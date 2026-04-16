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
                // Try local extension path first, fallback to online version
                const base = import.meta.url.replace(/\/web\/.*$/, "");
                const url = `${base}/web/editor/index.html`;
                window.open(url, "_blank");
            });

            this.addDOMWidget("open_editor", "custom", btn, {
                getValue: () => "",
                setValue: () => {},
            });
        };
    },
});
