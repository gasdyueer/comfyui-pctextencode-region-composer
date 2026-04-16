
import { AppState, OutputMode, CoordFormat, RegionType, MaskOp, WeightStyle, CoupleMaskType } from './types';

export const AVAILABLE_STYLES = [
  { value: WeightStyle.COMFY, label: 'comfy（默认）' },
  { value: WeightStyle.COMFY_PLUS, label: 'comfy++' },
  { value: WeightStyle.A1111, label: 'A1111' },
  { value: WeightStyle.COMPEL, label: 'compel' },
  { value: WeightStyle.PERP, label: 'perp' },
  { value: WeightStyle.DOWN_WEIGHT, label: 'down_weight' },
];

export const AVAILABLE_NORMALIZATIONS = ['none', 'mean', 'length'] as const;

export const INITIAL_STATE: AppState = {
  canvas: {
    width: 1024,
    height: 1024,
    mode: OutputMode.AND,
    format: CoordFormat.PERCENTAGE,
    basePrompt: '',
    suffixPrompt: '',
    useFill: true,
    maskWidth: 512,
    maskHeight: 512,
    maskWeight: 1.0,
    style: WeightStyle.COMFY,
    normalization: ['none'],
  },
  regions: [],
  selectedRegionId: null,
};

export const COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981',
  '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef', '#f43f5e'
];

export const MASK_OPS = [
  { value: MaskOp.MULTIPLY, label: 'multiply（交集）' },
  { value: MaskOp.ADD, label: 'add（并集）' },
  { value: MaskOp.SUBTRACT, label: 'subtract（差集）' },
  { value: MaskOp.INTERSECT, label: 'intersect（严格交集）' },
];

export const COUPLE_MASK_TYPES = [
  { value: CoupleMaskType.MASK, label: 'MASK（矩形遮罩）' },
  { value: CoupleMaskType.IMASK, label: 'IMASK（自定义遮罩）' },
];
