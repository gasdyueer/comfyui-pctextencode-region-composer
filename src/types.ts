
export enum OutputMode {
  AND = 'AND',
  COUPLE = 'COUPLE'
}

export enum CoordFormat {
  PERCENTAGE = 'PERCENTAGE',
  PIXEL = 'PIXEL'
}

export enum RegionType {
  MASK = 'MASK',
  AREA = 'AREA'
}

export enum CoupleMaskType {
  MASK = 'MASK',
  IMASK = 'IMASK',
}

export enum MaskOp {
  MULTIPLY = 'multiply',
  ADD = 'add',
  SUBTRACT = 'subtract',
  INTERSECT = 'intersect'
}

export enum WeightStyle {
  COMFY = 'comfy',
  COMFY_PLUS = 'comfy++',
  A1111 = 'A1111',
  COMPEL = 'compel',
  PERP = 'perp',
  DOWN_WEIGHT = 'down_weight',
}

export interface CanvasSettings {
  width: number;
  height: number;
  mode: OutputMode;
  format: CoordFormat;
  basePrompt: string;
  useFill: boolean;
  maskWidth: number;
  maskHeight: number;
  maskWeight: number;
  style: WeightStyle;
  normalization: string[];
}

export interface Feather {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export interface Region {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  prompt: string;
  type: RegionType;
  weight: number;
  op: MaskOp;
  feather: Feather;
  color: string;
  /** COUPLE 模式下的遮罩类型 */
  coupleMaskType: CoupleMaskType;
  /** COUPLE 模式下 IMASK 的索引 */
  imaskIndex: number;
  /** COUPLE 模式下 IMASK 的权重 */
  imaskWeight: number;
  /** COUPLE 模式下 IMASK 的合成操作 */
  imaskOp: MaskOp;
}

export interface AppState {
  canvas: CanvasSettings;
  regions: Region[];
  selectedRegionId: string | null;
}
