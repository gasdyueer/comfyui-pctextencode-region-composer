import json


def generate_prompt_string(canvas: dict, regions: list) -> str:
    """Port of utils/promptGenerator.ts — pure function, no external deps."""
    W = canvas.get("width", 1024)
    H = canvas.get("height", 1024)
    mode = canvas.get("mode", "AND")
    fmt = canvas.get("format", "PERCENTAGE")
    base_prompt = canvas.get("basePrompt", "").strip()
    use_fill = canvas.get("useFill", True)
    mask_width = canvas.get("maskWidth", 512)
    mask_height = canvas.get("maskHeight", 512)
    mask_weight = canvas.get("maskWeight", 1.0)
    style = canvas.get("style", "comfy")
    normalization = canvas.get("normalization", ["none"])

    def format_coords(x, y, w, h):
        x1, x2, y1, y2 = x, x + w, y, y + h
        if fmt == "PERCENTAGE":
            x1 = round(x / W, 4)
            x2 = round((x + w) / W, 4)
            y1 = round(y / H, 4)
            y2 = round((y + h) / H, 4)
        return f"{x1} {x2}, {y1} {y2}"

    def feather_str(f):
        parts = [f.get("left", 0), f.get("top", 0), f.get("right", 0), f.get("bottom", 0)]
        if any(p > 0 for p in parts):
            return f"FEATHER({parts[0]} {parts[1]} {parts[2]} {parts[3]}) "
        return ""

    def mask_op_str(op):
        return f", {op}" if op and op != "multiply" else ""

    def style_prefix():
        if style == "comfy" and normalization == ["none"]:
            return ""
        norm = "" if normalization == ["none"] else " " + "+".join(normalization)
        return f"STYLE({style},{norm}) "

    prefix = style_prefix()

    if mode == "AND":
        output = base_prompt
        if mask_width != 512 or mask_height != 512:
            output += f" MASK_SIZE({mask_width}, {mask_height})"
        if mask_weight != 1.0:
            output += f" MASKW({mask_weight:.1f})"

        for r in regions:
            coords = format_coords(r.get("x", 0), r.get("y", 0),
                                   r.get("width", 100), r.get("height", 100))
            f = feather_str(r.get("feather", {}))
            op = mask_op_str(r.get("op", "multiply"))
            rtype = r.get("type", "MASK")
            weight = r.get("weight", 1.0)
            prompt = r.get("prompt", "").strip()
            region_str = f"{prompt} {rtype}({coords}, {weight:.1f}{op}) {f}".strip()
            if output:
                output += f" AND {region_str}"
            else:
                output = region_str

        return prefix + output

    else:  # COUPLE
        output = prefix + base_prompt
        if use_fill and base_prompt:
            output += " FILL()"

        for r in regions:
            f = feather_str(r.get("feather", {}))
            couple_mask_type = r.get("coupleMaskType", "MASK")
            prompt = r.get("prompt", "").strip()

            if couple_mask_type == "IMASK":
                imask_index = r.get("imaskIndex", 0)
                imask_weight = r.get("imaskWeight", 1)
                imask_op = r.get("imaskOp", "multiply")
                iw = f", {imask_weight}" if imask_weight != 1 else ""
                io = f", {imask_op}" if imask_op != "multiply" else ""
                mask_part = f"IMASK({imask_index}{iw}{io})"
            else:
                coords = format_coords(r.get("x", 0), r.get("y", 0),
                                       r.get("width", 100), r.get("height", 100))
                mask_part = f"({coords})"

            region_str = f"COUPLE{mask_part} {prompt} {f}".strip()
            if output:
                output += f" {region_str}"
            else:
                output = region_str

        return output


class PCTextEncode_RegionComposer:
    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "regions_json": ("STRING", {"default": "[]", "multiline": True}),
            }
        }

    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("prompt",)
    FUNCTION = "generate"
    CATEGORY = "prompt_control/region"
    DESCRIPTION = "Open the visual editor, paste the exported JSON, output Prompt Control syntax"

    def generate(self, regions_json):
        try:
            data = json.loads(regions_json) if regions_json else []
        except json.JSONDecodeError:
            data = []

        # Support two formats: raw regions array, or {canvas, regions} object from the editor
        if isinstance(data, dict):
            canvas = data.get("canvas", {})
            regions = data.get("regions", [])
        elif isinstance(data, list):
            canvas = {}
            regions = data
        else:
            canvas = {}
            regions = []

        # Fill canvas defaults
        canvas.setdefault("width", 1024)
        canvas.setdefault("height", 1024)
        canvas.setdefault("mode", "AND")
        canvas.setdefault("format", "PERCENTAGE")
        canvas.setdefault("basePrompt", "")
        canvas.setdefault("useFill", True)
        canvas.setdefault("maskWidth", 512)
        canvas.setdefault("maskHeight", 512)
        canvas.setdefault("maskWeight", 1.0)
        canvas.setdefault("style", "comfy")
        canvas.setdefault("normalization", ["none"])

        result = generate_prompt_string(canvas, regions)
        return (result,)
