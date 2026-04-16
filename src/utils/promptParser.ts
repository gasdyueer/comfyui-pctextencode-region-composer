import {
  CanvasSettings, Region, OutputMode, CoordFormat,
  RegionType, MaskOp, WeightStyle, CoupleMaskType,
} from '../types';
import { INITIAL_STATE, COLORS } from '../constants';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const genId = () => Math.random().toString(36).substr(2, 9);

const assignColor = (idx: number) => COLORS[idx % COLORS.length];

const defaultCanvas = (): CanvasSettings => ({ ...INITIAL_STATE.canvas });

const defaultRegion = (idx: number): Region => ({
  id: genId(),
  x: 0, y: 0, width: 256, height: 256,
  prompt: '',
  type: RegionType.MASK,
  weight: 1.0,
  op: MaskOp.MULTIPLY,
  feather: { left: 0, top: 0, right: 0, bottom: 0 },
  color: assignColor(idx),
  coupleMaskType: CoupleMaskType.MASK,
  imaskIndex: 0,
  imaskWeight: 1.0,
  imaskOp: MaskOp.MULTIPLY,
});

// ---------------------------------------------------------------------------
// JSON import
// ---------------------------------------------------------------------------

export function parseJsonInput(input: string): { canvas: CanvasSettings; regions: Region[] } | null {
  let data: unknown;
  try {
    data = JSON.parse(input);
  } catch {
    return null;
  }

  const canvas = defaultCanvas();
  let rawRegions: unknown[] = [];

  if (Array.isArray(data)) {
    rawRegions = data;
  } else if (data && typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    if (obj.canvas && typeof obj.canvas === 'object') {
      Object.assign(canvas, obj.canvas);
    }
    if (Array.isArray(obj.regions)) {
      rawRegions = obj.regions;
    }
  } else {
    return null;
  }

  // Ensure canvas normalisation is always an array
  if (!Array.isArray(canvas.normalization) || canvas.normalization.length === 0) {
    canvas.normalization = ['none'];
  }

  const regions: Region[] = rawRegions.map((r: unknown, idx: number) => {
    if (!r || typeof r !== 'object') return defaultRegion(idx);
    const src = r as Record<string, unknown>;
    return {
      id: genId(),
      x: Number(src.x ?? 0),
      y: Number(src.y ?? 0),
      width: Number(src.width ?? 256),
      height: Number(src.height ?? 256),
      prompt: String(src.prompt ?? ''),
      type: (Object.values(RegionType).includes(src.type as RegionType) ? src.type : RegionType.MASK) as RegionType,
      weight: Number(src.weight ?? 1.0),
      op: (Object.values(MaskOp).includes(src.op as MaskOp) ? src.op : MaskOp.MULTIPLY) as MaskOp,
      feather: {
        left: Number((src.feather as Record<string, unknown>)?.left ?? 0),
        top: Number((src.feather as Record<string, unknown>)?.top ?? 0),
        right: Number((src.feather as Record<string, unknown>)?.right ?? 0),
        bottom: Number((src.feather as Record<string, unknown>)?.bottom ?? 0),
      },
      color: assignColor(idx),
      coupleMaskType: (Object.values(CoupleMaskType).includes(src.coupleMaskType as CoupleMaskType)
        ? src.coupleMaskType : CoupleMaskType.MASK) as CoupleMaskType,
      imaskIndex: Number(src.imaskIndex ?? 0),
      imaskWeight: Number(src.imaskWeight ?? 1.0),
      imaskOp: (Object.values(MaskOp).includes(src.imaskOp as MaskOp) ? src.imaskOp : MaskOp.MULTIPLY) as MaskOp,
    };
  });

  return { canvas, regions };
}

// ---------------------------------------------------------------------------
// Prompt string parser  (Prompt Control syntax → { canvas, regions })
// ---------------------------------------------------------------------------

interface ParsedRegion {
  prompt: string;
  type: RegionType;
  x1: number; x2: number; y1: number; y2: number;
  weight: number;
  op: MaskOp;
  feather: { left: number; top: number; right: number; bottom: number };
  // COUPLE specific
  coupleMaskType: CoupleMaskType;
  imaskIndex: number;
  imaskWeight: number;
  imaskOp: MaskOp;
}

export function parsePromptString(input: string): { canvas: CanvasSettings; regions: Region[] } | null {
  if (!input || !input.trim()) return null;

  const canvas = defaultCanvas();
  let text = input.trim();

  // 1. Extract STYLE(style, norm1+norm2)
  const styleRe = /STYLE\(\s*([^,)]+)\s*,\s*([^)]*)\s*\)/i;
  const styleMatch = text.match(styleRe);
  if (styleMatch) {
    const styleVal = styleMatch[1].trim().toLowerCase();
    if (Object.values(WeightStyle).includes(styleVal as WeightStyle)) {
      canvas.style = styleVal as WeightStyle;
    }
    const normStr = styleMatch[2].trim();
    if (normStr && normStr !== 'none') {
      canvas.normalization = normStr.split('+').map(s => s.trim());
    } else {
      canvas.normalization = ['none'];
    }
    text = text.replace(styleRe, ' ');
  }

  // Detect mode: presence of COUPLE keyword (but not inside FEATHER etc.)
  const hasCouple = /\bCOUPLE\b/i.test(text);
  canvas.mode = hasCouple ? OutputMode.COUPLE : OutputMode.AND;

  if (canvas.mode === OutputMode.AND) {
    return parseAndMode(text, canvas);
  } else {
    return parseCoupleMode(text, canvas);
  }
}

// ---------------------------------------------------------------------------
// AND mode parser
// ---------------------------------------------------------------------------

function parseAndMode(text: string, canvas: CanvasSettings): { canvas: CanvasSettings; regions: Region[] } | null {
  // Extract MASK_SIZE(w, h)
  const maskSizeRe = /MASK_SIZE\(\s*(\d+)\s*,\s*(\d+)\s*\)/i;
  const maskSizeMatch = text.match(maskSizeRe);
  if (maskSizeMatch) {
    canvas.maskWidth = parseInt(maskSizeMatch[1]);
    canvas.maskHeight = parseInt(maskSizeMatch[2]);
    text = text.replace(maskSizeRe, ' ');
  }

  // Extract MASKW(weight)
  const maskwRe = /MASKW\(\s*([\d.]+)\s*\)/i;
  const maskwMatch = text.match(maskwRe);
  if (maskwMatch) {
    canvas.maskWeight = parseFloat(maskwMatch[1]);
    text = text.replace(maskwRe, ' ');
  }

  // Find all MASK(...) and AREA(...) markers as anchors
  // Pattern: MASK(x1 x2, y1 y2, weight[, op]) or AREA(x1 x2, y1 y2, weight[, op])
  const regionRe = /\b(MASK|AREA)\s*\(\s*([\d.]+)\s+([\d.]+)\s*,\s*([\d.]+)\s+([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*(\w+))?\s*\)/gi;

  const anchors: { index: number; length: number; parsed: ParsedRegion }[] = [];
  let m: RegExpExecArray | null;

  while ((m = regionRe.exec(text)) !== null) {
    const x1 = parseFloat(m[2]);
    const x2 = parseFloat(m[3]);
    const y1 = parseFloat(m[4]);
    const y2 = parseFloat(m[5]);
    const weight = parseFloat(m[6]);
    const opStr = m[7]?.toLowerCase();
    const op = (opStr && Object.values(MaskOp).includes(opStr as MaskOp)) ? opStr as MaskOp : MaskOp.MULTIPLY;

    anchors.push({
      index: m.index,
      length: m[0].length,
      parsed: {
        prompt: '',
        type: m[1].toUpperCase() === 'AREA' ? RegionType.AREA : RegionType.MASK,
        x1, x2, y1, y2, weight, op,
        feather: { left: 0, top: 0, right: 0, bottom: 0 },
        coupleMaskType: CoupleMaskType.MASK,
        imaskIndex: 0, imaskWeight: 1.0, imaskOp: MaskOp.MULTIPLY,
      },
    });
  }

  if (anchors.length === 0) return null;

  // Determine coord format: if all values <= 1.0 then PERCENTAGE
  let allSmall = true;
  for (const a of anchors) {
    if (a.parsed.x1 > 1 || a.parsed.x2 > 1 || a.parsed.y1 > 1 || a.parsed.y2 > 1) {
      allSmall = false;
      break;
    }
  }
  canvas.format = allSmall ? CoordFormat.PERCENTAGE : CoordFormat.PIXEL;

  // Extract FEATHER after each anchor
  const featherRe = /FEATHER\(\s*(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s*\)/gi;

  // Build a map: anchor end → nearest FEATHER after it
  const featherMap = new Map<number, { left: number; top: number; right: number; bottom: number }>();
  let fm: RegExpExecArray | null;
  while ((fm = featherRe.exec(text)) !== null) {
    // Find the closest preceding anchor
    let bestIdx = -1;
    for (let i = 0; i < anchors.length; i++) {
      if (anchors[i].index + anchors[i].length <= fm.index) {
        bestIdx = i;
      }
    }
    if (bestIdx >= 0 && !featherMap.has(bestIdx)) {
      featherMap.set(bestIdx, {
        left: parseInt(fm[1]),
        top: parseInt(fm[2]),
        right: parseInt(fm[3]),
        bottom: parseInt(fm[4]),
      });
    }
  }

  // Extract prompts: text between anchors (remove " AND " separators and known tokens)
  // Base prompt = text before first anchor
  const firstAnchorEnd = anchors[0].index;
  let basePrompt = text.substring(0, firstAnchorEnd).replace(/\bAND\b/gi, '').trim();

  // Remove MASK_SIZE, MASKW if still lingering
  basePrompt = basePrompt.replace(/MASK_SIZE\([^)]*\)/gi, '').replace(/MASKW\([^)]*\)/gi, '').trim();

  canvas.basePrompt = basePrompt;

  // For each anchor, the prompt is the text between the previous anchor's FEATHER end and this anchor
  for (let i = 0; i < anchors.length; i++) {
    const start = i === 0 ? firstAnchorEnd : anchors[i].index;
    const end = anchors[i].index;

    // The prompt is actually the text immediately BEFORE the MASK/AREA marker
    // We need to look between the previous region's end and this region's MASK/AREA start
    let regionStart: number;
    if (i === 0) {
      regionStart = firstAnchorEnd;
    } else {
      // After previous anchor + its length + possible FEATHER
      regionStart = anchors[i - 1].index + anchors[i - 1].length;
    }

    // Extract text between regionStart and this anchor's MASK/AREA position
    let rawPrompt = text.substring(regionStart, anchors[i].index);
    // Clean up: remove " AND " separators, FEATHER, MASK_SIZE, MASKW
    rawPrompt = rawPrompt.replace(/\bAND\b/gi, '').replace(/FEATHER\([^)]*\)/gi, '').replace(/MASK_SIZE\([^)]*\)/gi, '').replace(/MASKW\([^)]*\)/gi, '').trim();
    anchors[i].parsed.prompt = rawPrompt;

    // Assign feather
    if (featherMap.has(i)) {
      anchors[i].parsed.feather = featherMap.get(i)!;
    }
  }

  // Convert to regions
  const W = canvas.width;
  const H = canvas.height;
  const regions: Region[] = anchors.map((a, idx) => {
    const p = a.parsed;
    let x: number, y: number, w: number, h: number;
    if (canvas.format === CoordFormat.PERCENTAGE) {
      x = Math.round(p.x1 * W);
      y = Math.round(p.y1 * H);
      w = Math.round((p.x2 - p.x1) * W);
      h = Math.round((p.y2 - p.y1) * H);
    } else {
      x = Math.round(p.x1);
      y = Math.round(p.y1);
      w = Math.round(p.x2 - p.x1);
      h = Math.round(p.y2 - p.y1);
    }
    return {
      id: genId(),
      x, y, width: Math.max(5, w), height: Math.max(5, h),
      prompt: p.prompt,
      type: p.type,
      weight: p.weight,
      op: p.op,
      feather: p.feather,
      color: assignColor(idx),
      coupleMaskType: CoupleMaskType.MASK,
      imaskIndex: 0, imaskWeight: 1.0, imaskOp: MaskOp.MULTIPLY,
    };
  });

  return { canvas, regions };
}

// ---------------------------------------------------------------------------
// COUPLE mode parser
// ---------------------------------------------------------------------------

function parseCoupleMode(text: string, canvas: CanvasSettings): { canvas: CanvasSettings; regions: Region[] } | null {
  // Extract FILL()
  const hasFill = /\bFILL\(\s*\)/i.test(text);
  canvas.useFill = hasFill;
  text = text.replace(/\bFILL\(\s*\)/gi, ' ');

  // Remove STYLE already handled above; clean lingering tokens
  text = text.replace(/STYLE\([^)]*\)/gi, ' ');

  // Find all COUPLE markers:
  //   COUPLE(x1 x2, y1 y2)   — mask type
  //   COUPLE IMASK(index[, weight][, op]) — imask type
  // We'll process them in order

  const coupleRe = /\bCOUPLE\s*(?:\(\s*([\d.]+)\s+([\d.]+)\s*,\s*([\d.]+)\s+([\d.]+)\s*\)|IMASK\(\s*(\d+)(?:\s*,\s*([\d.]+))?(?:\s*,\s*(\w+))?\s*\))/gi;

  const anchors: { index: number; length: number; parsed: ParsedRegion }[] = [];
  let m: RegExpExecArray | null;

  while ((m = coupleRe.exec(text)) !== null) {
    if (m[1] !== undefined) {
      // COUPLE(x1 x2, y1 y2) — mask coords
      anchors.push({
        index: m.index,
        length: m[0].length,
        parsed: {
          prompt: '',
          type: RegionType.MASK,
          x1: parseFloat(m[1]), x2: parseFloat(m[2]),
          y1: parseFloat(m[3]), y2: parseFloat(m[4]),
          weight: 1.0, op: MaskOp.MULTIPLY,
          feather: { left: 0, top: 0, right: 0, bottom: 0 },
          coupleMaskType: CoupleMaskType.MASK,
          imaskIndex: 0, imaskWeight: 1.0, imaskOp: MaskOp.MULTIPLY,
        },
      });
    } else {
      // COUPLE IMASK(index[, weight][, op])
      const imaskIndex = parseInt(m[5]);
      const imaskWeight = m[6] ? parseFloat(m[6]) : 1.0;
      const imaskOpStr = m[7]?.toLowerCase();
      const imaskOp = (imaskOpStr && Object.values(MaskOp).includes(imaskOpStr as MaskOp))
        ? imaskOpStr as MaskOp : MaskOp.MULTIPLY;
      anchors.push({
        index: m.index,
        length: m[0].length,
        parsed: {
          prompt: '',
          type: RegionType.MASK,
          x1: 0, x2: 1, y1: 0, y2: 1,
          weight: 1.0, op: MaskOp.MULTIPLY,
          feather: { left: 0, top: 0, right: 0, bottom: 0 },
          coupleMaskType: CoupleMaskType.IMASK,
          imaskIndex, imaskWeight, imaskOp,
        },
      });
    }
  }

  if (anchors.length === 0) return null;

  // Determine coord format for MASK-type anchors
  let allSmall = true;
  for (const a of anchors) {
    if (a.parsed.coupleMaskType === CoupleMaskType.MASK) {
      if (a.parsed.x1 > 1 || a.parsed.x2 > 1 || a.parsed.y1 > 1 || a.parsed.y2 > 1) {
        allSmall = false;
        break;
      }
    }
  }
  canvas.format = allSmall ? CoordFormat.PERCENTAGE : CoordFormat.PIXEL;

  // Extract FEATHER
  const featherRe = /FEATHER\(\s*(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s*\)/gi;
  const featherMap = new Map<number, { left: number; top: number; right: number; bottom: number }>();
  let fm: RegExpExecArray | null;
  while ((fm = featherRe.exec(text)) !== null) {
    let bestIdx = -1;
    for (let i = 0; i < anchors.length; i++) {
      if (anchors[i].index + anchors[i].length <= fm.index) {
        bestIdx = i;
      }
    }
    if (bestIdx >= 0 && !featherMap.has(bestIdx)) {
      featherMap.set(bestIdx, {
        left: parseInt(fm[1]),
        top: parseInt(fm[2]),
        right: parseInt(fm[3]),
        bottom: parseInt(fm[4]),
      });
    }
  }

  // Base prompt = text before first COUPLE
  const firstAnchorIdx = anchors[0].index;
  let basePrompt = text.substring(0, firstAnchorIdx)
    .replace(/FILL\(\s*\)/gi, '')
    .replace(/MASK_SIZE\([^)]*\)/gi, '')
    .replace(/MASKW\([^)]*\)/gi, '')
    .trim();
  canvas.basePrompt = basePrompt;

  // Extract each region's prompt (text between anchors, after the COUPLE marker)
  for (let i = 0; i < anchors.length; i++) {
    const promptStart = anchors[i].index + anchors[i].length;
    const promptEnd = i + 1 < anchors.length ? anchors[i + 1].index : text.length;

    let rawPrompt = text.substring(promptStart, promptEnd);
    rawPrompt = rawPrompt.replace(/FEATHER\([^)]*\)/gi, '').replace(/FILL\(\s*\)/gi, '').trim();
    anchors[i].parsed.prompt = rawPrompt;

    if (featherMap.has(i)) {
      anchors[i].parsed.feather = featherMap.get(i)!;
    }
  }

  // Convert to regions
  const W = canvas.width;
  const H = canvas.height;
  const regions: Region[] = anchors.map((a, idx) => {
    const p = a.parsed;
    let x = 0, y = 0, w = 256, h = 256;
    if (p.coupleMaskType === CoupleMaskType.MASK) {
      if (canvas.format === CoordFormat.PERCENTAGE) {
        x = Math.round(p.x1 * W);
        y = Math.round(p.y1 * H);
        w = Math.round((p.x2 - p.x1) * W);
        h = Math.round((p.y2 - p.y1) * H);
      } else {
        x = Math.round(p.x1);
        y = Math.round(p.y1);
        w = Math.round(p.x2 - p.x1);
        h = Math.round(p.y2 - p.y1);
      }
    }
    return {
      id: genId(),
      x, y, width: Math.max(5, w), height: Math.max(5, h),
      prompt: p.prompt,
      type: p.type,
      weight: p.weight,
      op: p.op,
      feather: p.feather,
      color: assignColor(idx),
      coupleMaskType: p.coupleMaskType,
      imaskIndex: p.imaskIndex,
      imaskWeight: p.imaskWeight,
      imaskOp: p.imaskOp,
    };
  });

  return { canvas, regions };
}
