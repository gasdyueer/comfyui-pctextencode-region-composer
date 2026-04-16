/**
 * ComfyUI Prompt Control 语法提示数据
 * 基于 doc/guide 文档整理
 */

export interface SyntaxItem {
  /** 语法关键字/模式 */
  keyword: string;
  /** 显示名称 */
  name: string;
  /** 简要说明 */
  desc: string;
  /** 完整语法模板 */
  syntax: string;
  /** 使用示例 */
  example: string;
  /** 分类标签 */
  category: '调度' | '区域' | '组合' | 'LoRA' | '编码' | '其他';
}

export const SYNTAX_CATEGORIES = ['调度', '区域', '组合', 'LoRA', '编码', '其他'] as const;

export const SYNTAX_DATA: SyntaxItem[] = [
  // === 调度 ===
  {
    keyword: '[a:b:X]',
    name: '基本调度',
    desc: '在采样进度 X（0.0~1.0）处从 before 切换到 after',
    syntax: '[before:after:X]',
    example: 'a [red:blue:0.5] cat',
    category: '调度',
  },
  {
    keyword: '[a:during:b:start,end]',
    name: '范围表达式',
    desc: '三段式范围表达，指定多个阶段',
    syntax: '[before:during:after:start,end]',
    example: '[morning:noon:night:0.2,0.7]',
    category: '调度',
  },
  {
    keyword: '[a|b:X]',
    name: '交替',
    desc: '每隔 X 比例交替切换提示词，默认 X=0.1',
    syntax: '[选项A|选项B:间隔]',
    example: '[red|blue:0.1]',
    category: '调度',
  },
  {
    keyword: 'SEQ:',
    name: '序列',
    desc: '按顺序依次切换的快捷写法',
    syntax: '[SEQ:内容1:结束位置:内容2:结束位置:...]',
    example: '[SEQ:sunrise:0.2:noon:0.5:sunset:0.8]',
    category: '调度',
  },
  {
    keyword: '(word:X)',
    name: '权重强调',
    desc: '调整词语的权重，大于 1 增强，小于 1 减弱',
    syntax: '(词语:权重)',
    example: '(red:1.3), (blue:0.8)',
    category: '调度',
  },
  {
    keyword: '[X]',
    name: '嵌入调度',
    desc: '嵌入(embedding)会被误解析为调度，需转义冒号或用替代写法',
    syntax: '<emb:名称> 或 embedding\\:名称:0.5',
    example: '<emb:easynegative>',
    category: '调度',
  },

  // === 区域 ===
  {
    keyword: 'MASK()',
    name: '遮罩区域',
    desc: '在潜空间上指定矩形遮罩区域，全尺寸计算后叠加',
    syntax: 'MASK(x1 x2, y1 y2, weight, op)',
    example: 'cat MASK(0 0.5, 0 1) AND dog MASK(0.5 1, 0 1)',
    category: '区域',
  },
  {
    keyword: 'AREA()',
    name: '计算区域',
    desc: '指定区域独立计算后再合成，各区域完全隔离',
    syntax: 'AREA(x1 x2, y1 y2, weight)',
    example: 'cat AREA(0 0.5, 0 1) AND dog AREA(0.5 1, 0 1)',
    category: '区域',
  },
  {
    keyword: 'IMASK()',
    name: '自定义遮罩',
    desc: '引用通过节点传入的自定义遮罩，支持非矩形区域',
    syntax: 'IMASK(index, weight, op)',
    example: 'background AND cat IMASK(0)',
    category: '区域',
  },
  {
    keyword: 'FEATHER()',
    name: '羽化',
    desc: '对遮罩边缘应用羽化，平滑过渡（像素为单位）',
    syntax: 'FEATHER(左 上 右 下)',
    example: 'FEATHER(20 20 20 20)',
    category: '区域',
  },
  {
    keyword: 'MASK_SIZE()',
    name: '遮罩尺寸',
    desc: '设置遮罩的默认分辨率，默认 512×512',
    syntax: 'MASK_SIZE(宽, 高)',
    example: 'MASK_SIZE(1024, 1024)',
    category: '区域',
  },
  {
    keyword: 'MASKW()',
    name: '全局遮罩权重',
    desc: '设置所有遮罩的整体权重，默认 1.0',
    syntax: 'MASKW(权重)',
    example: 'MASKW(0.8)',
    category: '区域',
  },
  {
    keyword: 'COUPLE',
    name: '注意力耦合',
    desc: '基于注意力机制的区域提示，通常比遮罩更快更精确',
    syntax: '基础提示 COUPLE(遮罩参数) 耦合提示词',
    example: 'landscape COUPLE(0.5 1) a cat COUPLE(0 0.5) a dog',
    category: '区域',
  },
  {
    keyword: 'FILL()',
    name: '自动填充',
    desc: '基础提示词自动填充未被耦合提示遮罩覆盖的区域',
    syntax: '基础提示词 FILL() COUPLE(...) 内容',
    example: 'dog FILL() COUPLE(0.5 1) cat',
    category: '区域',
  },
  {
    keyword: '[CUT:]',
    name: 'Cutoff 隔离',
    desc: '隔离提示词中不同概念的相互影响，减少"颜色串色"等问题',
    syntax: '[CUT:区域文本:目标词:权重:strict_mask:start_from_masked:padding]',
    example: '[CUT:white cat:white], [CUT:brown dog:brown]',
    category: '区域',
  },

  // === 组合 ===
  {
    keyword: 'AND',
    name: '组合提示词',
    desc: '用 AND 分隔的提示词会被独立编码后组合',
    syntax: '提示词1 AND 提示词2',
    example: 'cat MASK(0 0.5, 0 1) AND dog MASK(0.5 1, 0 1)',
    category: '组合',
  },
  {
    keyword: 'BREAK',
    name: '分块编码',
    desc: '将提示词分成独立的 token 块，每块分别编码',
    syntax: '提示词1 BREAK 提示词2',
    example: 'a cat BREAK sitting on a chair',
    category: '组合',
  },
  {
    keyword: 'CAT',
    name: '拼接编码',
    desc: '分别编码每段提示词，然后将张量拼接',
    syntax: '提示词1 CAT 提示词2',
    example: 'a cat CAT a dog',
    category: '组合',
  },
  {
    keyword: 'AVG()',
    name: '加权平均',
    desc: '分别编码两段提示词后按权重混合，默认权重 0.5',
    syntax: '提示词1 AVG(权重) 提示词2',
    example: '(a cat:1.0) AVG(0.3) (a dog:1.0)',
    category: '组合',
  },

  // === LoRA ===
  {
    keyword: '<lora:>',
    name: '加载 LoRA',
    desc: '在提示词中直接加载 LoRA，可分别设置模型和 CLIP 权重',
    syntax: '<lora:名称:权重> 或 <lora:名称:模型权重:CLIP权重>',
    example: '<lora:cat_style:0.8> 或 <lora:detail:0.8:0.5>',
    category: 'LoRA',
  },
  {
    keyword: '[<lora:>::X]',
    name: 'LoRA 调度',
    desc: '将 LoRA 放入调度表达式中实现时间段控制',
    syntax: '[<lora:名称:权重>::结束位置]',
    example: '[<lora:detail:0.8>::0.5]',
    category: 'LoRA',
  },

  // === 编码 ===
  {
    keyword: 'STYLE()',
    name: '权重风格',
    desc: '设置权重解析方式和归一化方式',
    syntax: 'STYLE(权重风格, 归一化)',
    example: 'STYLE(A1111, length+mean)',
    category: '编码',
  },
  {
    keyword: 'TE()',
    name: '多编码器提示',
    desc: '为不同的文本编码器指定不同的提示词（SDXL/Flux）',
    syntax: 'TE(l=...) TE(g=...) TE(t5xxl=...)',
    example: 'TE(l=simple) TE(g=detailed description)',
    category: '编码',
  },
  {
    keyword: 'SDXL()',
    name: 'SDXL 参数',
    desc: '设置 SDXL 的分辨率和裁剪参数',
    syntax: 'SDXL(宽 高, 目标宽 目标高, 裁剪宽 裁剪高)',
    example: 'SDXL(1024 1024, 1024 1024, 0 0)',
    category: '编码',
  },
  {
    keyword: 'TE_WEIGHT()',
    name: '编码器权重',
    desc: '调整各文本编码器输出的影响力',
    syntax: 'TE_WEIGHT(编码器=权重, ...)',
    example: 'TE_WEIGHT(g=0.25, l=0.75)',
    category: '编码',
  },

  // === 其他 ===
  {
    keyword: 'DEF()',
    name: '宏定义',
    desc: '定义可复用的提示词片段，支持参数化',
    syntax: 'DEF(名称=内容)',
    example: 'DEF(MYCAT=a cute orange cat)',
    category: '其他',
  },
  {
    keyword: 'SHUFFLE()',
    name: '随机排列',
    desc: '按分隔符拆分提示词后随机排列',
    syntax: 'SHUFFLE(种子, 分隔符, 连接符) 提示词',
    example: 'SHUFFLE(42) cat, dog, tiger',
    category: '其他',
  },
  {
    keyword: 'SHIFT()',
    name: '循环移位',
    desc: '将元素左移指定步数',
    syntax: 'SHIFT(步数, 分隔符, 连接符) 提示词',
    example: 'SHIFT(1) cat, dog, tiger → dog, tiger, cat',
    category: '其他',
  },
  {
    keyword: 'NOISE()',
    name: '添加噪声',
    desc: '向条件张量添加随机噪声',
    syntax: 'NOISE(权重, 种子)',
    example: 'NOISE(0.1, 42) a cat',
    category: '其他',
  },
  {
    keyword: '#',
    name: '注释',
    desc: '# 后的内容到行末被当作注释，会被移除',
    syntax: '提示词 # 注释内容',
    example: 'a cat # 这是注释',
    category: '其他',
  },
  {
    keyword: '\\',
    name: '转义',
    desc: '转义特殊字符避免被解析',
    syntax: '\\# \\: \\\\ \\,',
    example: '[embedding\\:xyz\\:0.5]',
    category: '其他',
  },
];

/** 根据关键词模糊搜索语法项 */
export function searchSyntax(query: string): SyntaxItem[] {
  if (!query.trim()) return SYNTAX_DATA;
  const q = query.toLowerCase();
  return SYNTAX_DATA.filter(
    (item) =>
      item.keyword.toLowerCase().includes(q) ||
      item.name.includes(q) ||
      item.desc.includes(q)
  );
}
