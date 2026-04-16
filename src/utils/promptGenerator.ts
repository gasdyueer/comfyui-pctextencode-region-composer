import { CanvasSettings, Region, OutputMode, CoordFormat, RegionType, MaskOp, WeightStyle, CoupleMaskType } from '../types';

const hasFeather = (f: Region['feather']) =>
  f.left > 0 || f.top > 0 || f.right > 0 || f.bottom > 0;

const featherStr = (f: Region['feather']) =>
  hasFeather(f) ? `FEATHER(${f.left} ${f.top} ${f.right} ${f.bottom}) ` : '';

const maskOpStr = (op: MaskOp) =>
  op !== MaskOp.MULTIPLY ? `, ${op}` : '';

const styleStr = (style: WeightStyle, normalization: string[]): string => {
  if (style === WeightStyle.COMFY && normalization.length === 1 && normalization[0] === 'none') {
    return '';
  }
  const norm = normalization.length === 1 && normalization[0] === 'none'
    ? ''
    : ` ${normalization.join('+')}`;
  return `STYLE(${style},${norm}) `;
};

export function generatePromptString(canvas: CanvasSettings, regions: Region[]): string {
  const { width: W, height: H, mode, format, basePrompt, suffixPrompt, useFill, maskWidth, maskHeight, maskWeight, style, normalization } = canvas;
  const suffix = suffixPrompt.trim();

  const formatCoords = (x: number, y: number, w: number, h: number) => {
    let x1 = x;
    let x2 = x + w;
    let y1 = y;
    let y2 = y + h;

    if (format === CoordFormat.PERCENTAGE) {
      x1 = Number((x / W).toFixed(4));
      x2 = Number(((x + w) / W).toFixed(4));
      y1 = Number((y / H).toFixed(4));
      y2 = Number(((y + h) / H).toFixed(4));
    }

    return `${x1} ${x2}, ${y1} ${y2}`;
  };

  const prefix = styleStr(style, normalization);

  if (mode === OutputMode.AND) {
    let output = basePrompt.trim();

    // MASK_SIZE prefix (only when non-default)
    if (maskWidth !== 512 || maskHeight !== 512) {
      output += ` MASK_SIZE(${maskWidth}, ${maskHeight})`;
    }

    // MASKW prefix (only when non-default)
    if (maskWeight !== 1.0) {
      output += ` MASKW(${maskWeight.toFixed(1)})`;
    }

    regions.forEach((r) => {
      const coords = formatCoords(r.x, r.y, r.width, r.height);
      const f = featherStr(r.feather);
      const op = maskOpStr(r.op);
      const regionPrompt = suffix ? `${r.prompt.trim()} ${suffix}`.trim() : r.prompt.trim();
      const regionStr = `${regionPrompt} ${r.type}(${coords}, ${r.weight.toFixed(1)}${op}) ${f}`.trim();

      if (output.length > 0) {
        output += ` AND ${regionStr}`;
      } else {
        output = regionStr;
      }
    });

    return prefix + output;
  } else {
    // COUPLE Mode: base COUPLE(maskparams) region1 COUPLE(maskparams) region2 ...
    // COUPLE(maskparams) is shorthand for COUPLE MASK(maskparams)
    let output = prefix + basePrompt.trim();
    if (useFill && basePrompt.trim().length > 0) {
      output += ' FILL()';
    }

    regions.forEach((r) => {
      const f = featherStr(r.feather);
      let maskPart = '';

      if (r.coupleMaskType === CoupleMaskType.IMASK) {
        // COUPLE IMASK(index, weight, op)
        const imaskOp = r.imaskOp !== MaskOp.MULTIPLY ? `, ${r.imaskOp}` : '';
        const imaskWeight = r.imaskWeight !== 1 ? `, ${r.imaskWeight}` : '';
        maskPart = `IMASK(${r.imaskIndex}${imaskWeight}${imaskOp})`;
      } else {
        // COUPLE(coords) — shorthand for COUPLE MASK(coords)
        const coords = formatCoords(r.x, r.y, r.width, r.height);
        maskPart = `(${coords})`;
      }

      const regionPrompt = suffix ? `${r.prompt.trim()} ${suffix}`.trim() : r.prompt.trim();
      const regionStr = `COUPLE${maskPart} ${regionPrompt} ${f}`.trim();

      if (output.length > 0) {
        output += ` ${regionStr}`;
      } else {
        output = regionStr;
      }
    });

    return output;
  }
}
