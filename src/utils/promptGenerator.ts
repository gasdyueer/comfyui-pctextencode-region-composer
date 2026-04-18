import { CanvasSettings, Region, OutputMode, CoordFormat, RegionType, MaskOp, WeightStyle, CoupleMaskType, ScheduleMode } from '../types';

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

/**
 * Generate the prompt content for a subset of regions (no scheduling wrapper).
 * This is the existing AND/COUPLE logic extracted as a reusable function.
 */
function generateGroupPrompt(canvas: CanvasSettings, regions: Region[]): string {
  const { width: W, height: H, mode, format, basePrompt, suffixPrompt, useFill, maskWidth, maskHeight, maskWeight } = canvas;
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

  if (mode === OutputMode.AND) {
    let output = basePrompt.trim();

    if (maskWidth !== 512 || maskHeight !== 512) {
      output += ` MASK_SIZE(${maskWidth}, ${maskHeight})`;
    }

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

    return output;
  } else {
    let output = basePrompt.trim();
    if (useFill && basePrompt.trim().length > 0) {
      output += ' FILL()';
    }

    regions.forEach((r) => {
      const f = featherStr(r.feather);
      let maskPart = '';

      if (r.coupleMaskType === CoupleMaskType.IMASK) {
        const imaskOp = r.imaskOp !== MaskOp.MULTIPLY ? `, ${r.imaskOp}` : '';
        const imaskWeight = r.imaskWeight !== 1 ? `, ${r.imaskWeight}` : '';
        maskPart = `IMASK(${r.imaskIndex}${imaskWeight}${imaskOp})`;
      } else {
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

interface ScheduleGroup {
  start: number;
  end: number;
  regions: Region[];
}

/**
 * Group regions by (scheduleStart, scheduleEnd) and sort by start ascending.
 */
function groupBySchedule(regions: Region[]): ScheduleGroup[] {
  const map = new Map<string, { start: number; end: number; regions: Region[] }>();
  for (const r of regions) {
    const key = `${r.scheduleStart}-${r.scheduleEnd}`;
    let group = map.get(key);
    if (!group) {
      group = { start: r.scheduleStart, end: r.scheduleEnd, regions: [] };
      map.set(key, group);
    }
    group.regions.push(r);
  }
  return Array.from(map.values()).sort((a, b) => a.start - b.start);
}

/**
 * Check if all groups cover the full 0~1 range (no scheduling needed).
 */
function isFullCoverage(groups: ScheduleGroup[]): boolean {
  if (groups.length <= 1) return true;
  const sorted = [...groups].sort((a, b) => a.start - b.start);
  return sorted[0].start === 0 && sorted[sorted.length - 1].end === 1 &&
    sorted.every((g, i) => i === sorted.length - 1 || g.end === sorted[i + 1].start);
}

/**
 * Build nested [before:after:X] scheduling expression.
 * Groups must be sorted by start ascending.
 */
function wrapScheduled(canvas: CanvasSettings, groups: ScheduleGroup[]): string {
  // Generate prompt content for each group
  const contents = groups.map(g => ({
    start: g.start,
    end: g.end,
    text: generateGroupPrompt(canvas, g.regions),
  }));

  // If single group covering full range, no scheduling needed
  if (contents.length === 1) return contents[0].text;

  // Build nested scheduling from right to left:
  // Start with the last group's content, then wrap with [current:accumulated:nextStart]
  let result = contents[contents.length - 1].text;
  for (let i = contents.length - 2; i >= 0; i--) {
    const switchPoint = contents[i + 1].start;
    result = `[${contents[i].text}:${result}:${switchPoint}]`;
  }
  return result;
}

export function generatePromptString(canvas: CanvasSettings, regions: Region[]): string {
  const { style, normalization, scheduleMode } = canvas;
  const prefix = styleStr(style, normalization);

  if (scheduleMode !== 'SCHEDULE' || regions.length === 0) {
    return prefix + generateGroupPrompt(canvas, regions);
  }

  const groups = groupBySchedule(regions);

  // Degenerate case: all regions have same interval (or single group) — no scheduling brackets
  if (groups.length <= 1) {
    return prefix + generateGroupPrompt(canvas, regions);
  }

  const scheduledContent = wrapScheduled(canvas, groups);
  return prefix + scheduledContent;
}
