
import { AppState, OutputMode, CoordFormat, RegionType, MaskOp, WeightStyle, CoupleMaskType, ScheduleMode, Region } from './types';

export const APP_VERSION = '2.0.0';

export interface RegionPresetSlot {
  /** 百分比坐标 0.0~1.0 */
  x1: number;
  x2: number;
  y1: number;
  y2: number;
  label: string;
  type?: RegionType;
}

export interface RegionPreset {
  id: string;
  name: string;
  desc: string;
  mode: OutputMode;
  useFill: boolean;
  slots: RegionPresetSlot[];
}

export const PRESETS: RegionPreset[] = [
  {
    id: 'couple-left-right',
    name: '左右分屏',
    desc: '左右各半，适合双人构图',
    mode: OutputMode.COUPLE,
    useFill: true,
    slots: [
      { x1: 0, x2: 0.5, y1: 0, y2: 1, label: '左' },
      { x1: 0.5, x2: 1, y1: 0, y2: 1, label: '右' },
    ],
  },
  {
    id: 'couple-top-bottom',
    name: '上下分屏',
    desc: '上下各半，适合天地构图',
    mode: OutputMode.COUPLE,
    useFill: true,
    slots: [
      { x1: 0, x2: 1, y1: 0, y2: 0.5, label: '上' },
      { x1: 0, x2: 1, y1: 0.5, y2: 1, label: '下' },
    ],
  },
  {
    id: 'couple-triple-col',
    name: '三栏',
    desc: '三等分垂直布局',
    mode: OutputMode.COUPLE,
    useFill: true,
    slots: [
      { x1: 0, x2: 1/3, y1: 0, y2: 1, label: '左' },
      { x1: 1/3, x2: 2/3, y1: 0, y2: 1, label: '中' },
      { x1: 2/3, x2: 1, y1: 0, y2: 1, label: '右' },
    ],
  },
  {
    id: 'couple-grid',
    name: '四宫格',
    desc: '2×2 网格布局',
    mode: OutputMode.COUPLE,
    useFill: true,
    slots: [
      { x1: 0, x2: 0.5, y1: 0, y2: 0.5, label: '左上' },
      { x1: 0.5, x2: 1, y1: 0, y2: 0.5, label: '右上' },
      { x1: 0, x2: 0.5, y1: 0.5, y2: 1, label: '左下' },
      { x1: 0.5, x2: 1, y1: 0.5, y2: 1, label: '右下' },
    ],
  },
  {
    id: 'couple-wide-left',
    name: '左大右小',
    desc: '2:1 宽度比，主体居左',
    mode: OutputMode.COUPLE,
    useFill: true,
    slots: [
      { x1: 0, x2: 2/3, y1: 0, y2: 1, label: '主' },
      { x1: 2/3, x2: 1, y1: 0, y2: 1, label: '副' },
    ],
  },
  {
    id: 'couple-tall-top',
    name: '上大下小',
    desc: '2:1 高度比，主体居上',
    mode: OutputMode.COUPLE,
    useFill: true,
    slots: [
      { x1: 0, x2: 1, y1: 0, y2: 2/3, label: '主' },
      { x1: 0, x2: 1, y1: 2/3, y2: 1, label: '副' },
    ],
  },
  {
    id: 'couple-fg-bg',
    name: '前景+背景',
    desc: '前景区域 + 全画布背景',
    mode: OutputMode.COUPLE,
    useFill: true,
    slots: [
      { x1: 0, x2: 1, y1: 0, y2: 1, label: '背景' },
      { x1: 0.25, x2: 0.75, y1: 0.25, y2: 0.85, label: '前景' },
    ],
  },
  {
    id: 'and-left-right',
    name: '左右分屏 (AND)',
    desc: 'AND 模式左右各半',
    mode: OutputMode.AND,
    useFill: true,
    slots: [
      { x1: 0, x2: 0.5, y1: 0, y2: 1, label: '左' },
      { x1: 0.5, x2: 1, y1: 0, y2: 1, label: '右' },
    ],
  },
  {
    id: 'and-grid',
    name: '四宫格 (AND)',
    desc: 'AND 模式 2×2 网格',
    mode: OutputMode.AND,
    useFill: true,
    slots: [
      { x1: 0, x2: 0.5, y1: 0, y2: 0.5, label: '左上' },
      { x1: 0.5, x2: 1, y1: 0, y2: 0.5, label: '右上' },
      { x1: 0, x2: 0.5, y1: 0.5, y2: 1, label: '左下' },
      { x1: 0.5, x2: 1, y1: 0.5, y2: 1, label: '右下' },
    ],
  },
];

export function presetToRegions(preset: RegionPreset, canvasW: number, canvasH: number): Region[] {
  return preset.slots.map((slot, idx) => ({
    id: Math.random().toString(36).substr(2, 9),
    x: Math.round(slot.x1 * canvasW),
    y: Math.round(slot.y1 * canvasH),
    width: Math.max(5, Math.round((slot.x2 - slot.x1) * canvasW)),
    height: Math.max(5, Math.round((slot.y2 - slot.y1) * canvasH)),
    prompt: slot.label,
    type: slot.type ?? RegionType.MASK,
    weight: 1.0,
    op: MaskOp.MULTIPLY,
    feather: { left: 0, top: 0, right: 0, bottom: 0 },
    color: COLORS[idx % COLORS.length],
    coupleMaskType: CoupleMaskType.MASK,
    imaskIndex: 0,
    imaskWeight: 1.0,
    imaskOp: MaskOp.MULTIPLY,
    scheduleStart: 0,
    scheduleEnd: 1,
  }));
}

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
    scheduleMode: 'NONE',
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

export const QUICK_INSERTS = [
  { label: 'BREAK', tip: '分块编码', cls: 'text-amber-400/70 hover:bg-amber-500/20 hover:text-amber-300' },
  { label: 'CAT', tip: '拼接编码', cls: 'text-cyan-400/70 hover:bg-cyan-500/20 hover:text-cyan-300' },
  { label: 'AVG(0.5)', tip: '加权平均', cls: 'text-violet-400/70 hover:bg-violet-500/20 hover:text-violet-300' },
  { label: '( :1.3)', tip: '权重强调', cls: 'text-pink-400/70 hover:bg-pink-500/20 hover:text-pink-300' },
  { label: 'SHUFFLE()', tip: '随机排列', cls: 'text-emerald-400/70 hover:bg-emerald-500/20 hover:text-emerald-300' },
  { label: '<lora: :1>', tip: '加载 LoRA', cls: 'text-purple-400/70 hover:bg-purple-500/20 hover:text-purple-300' },
  { label: 'DEF(=)', tip: '宏定义', cls: 'text-yellow-400/70 hover:bg-yellow-500/20 hover:text-yellow-300' },
  { label: '[ : :0.5]', tip: '调度切换', cls: 'text-blue-400/70 hover:bg-blue-500/20 hover:text-blue-300' },
  { label: '[ | :0.1]', tip: '交替切换', cls: 'text-teal-400/70 hover:bg-teal-500/20 hover:text-teal-300' },
  { label: 'NOISE(0.1)', tip: '添加噪声', cls: 'text-rose-400/70 hover:bg-rose-500/20 hover:text-rose-300' },
  { label: '[CUT:text:target]', tip: 'Cutoff 隔离', cls: 'text-orange-400/70 hover:bg-orange-500/20 hover:text-orange-300' },
];
