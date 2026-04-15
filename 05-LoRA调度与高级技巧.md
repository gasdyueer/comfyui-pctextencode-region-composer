# LoRA 调度与高级技巧指南

本指南涵盖 LoRA 调度的完整用法、多遍工作流、宏的高级应用，以及各种实用技巧。

---

## 一、LoRA 调度详解

### 工作原理

PC 的 LoRA 调度基于 ComfyUI 的 Hook 系统，工作方式如下：

1. **全程 LoRA** → 直接用 `LoraLoader` 加载到模型上（最高效）
2. **调度 LoRA** → 通过 `CreateHookLora` + `CreateHookKeyframe` 实现，在指定时间范围内生效

### 基本用法

```
# 全程生效
<lora:basestyle:1>

# 前 50% 生效
[<lora:detail:0.8>::0.5]

# 50% 后生效
[:<lora:detail:0.8>:0.5]

# 不同时段用不同 LoRA
[<lora:style1:1>:<lora:style2:1>:0.5]

# 渐变切换（交替）
[<lora:soft:1>|<lora:sharp:1>:0.1]
```

### LoRA 权重参数

```
<lora:名称:模型权重>
<lora:名称:模型权重:CLIP权重>
```

- 只写一个权重：模型和 CLIP 都使用该权重
- 写两个权重：分别控制模型和 CLIP 的强度

```
<lora:style:0.8>         → 模型 0.8，CLIP 0.8
<lora:style:0.8:0.3>    → 模型 0.8，CLIP 0.3（弱化文本影响）
<lora:style:1.0:0>      → 只影响模型，不影响 CLIP
```

> 设 CLIP 权重为 0 时，该 LoRA 不会影响文本编码，但仍会影响 UNet。

### LoRA 查找规则

按优先级：

1. **精确文件名匹配**（不含扩展名）
2. **子目录搜索**：在所有 LoRA 目录的子目录中搜索
3. **空格→下划线**：自动将空格替换为下划线重新搜索
4. **关键词模糊匹配**：空格拆分后查找包含所有关键词的文件，仅当唯一匹配时生效

```
<lora:cats:1>                    → cats.safetensors
<lora:XL/sdxllora:0.5>          → 指定路径 XL/sdxllora
<lora:cats and dogs:1>          → → cats_and_dogs.safetensors
<lora:red cats xl:1>            → 匹配 xl/red_cats.safetensors（若唯一）
```

也可以使用含扩展名的完整路径，与 ComfyUI 原生 `LoRALoader` 一致。

### 多 LoRA 叠加

多个全程 LoRA 会按顺序加载：

```
<lora:style1:0.8> <lora:style2:0.5> a cat
```

效果等同于依次通过两个 `LoraLoader` 节点。

---

## 二、多遍工作流

### 使用标签过滤

多遍渲染是高级场景，例如先用低分辨率生成构图，再用高分辨率细化。

**在提示词中用大写标签标记分支**：

```
a [rough sketch:highly detailed:X] [<lora:composition:1>:<lora:detail:1>:Y] landscape
```

**第一遍**（构图）：在 Advanced 节点设 `tags=X`
**第二遍**（细化）：在 Advanced 节点设 `tags=Y`

### 标签语法规则

- 调度中的标签必须是大写字母和下划线：`FIRST_PASS`、`DETAIL`、`HR` 等
- `[a:b:TAG]` 中的 `b` 被忽略，等同于 `[a:TAG]`
- `tags` 参数逗号分隔，大小写不敏感

**示例**：

```
提示词：a [black:blue:X] [cat:dog:Y] [walking:running:Z] in space

tags="x,z" → a blue cat running in space
tags="y"   → a black dog walking in space
tags=""    → 使用 before 选项：a black cat walking in space
```

### 完整多遍工作流示例

```
# 正面提示词
a [simple:detailed:DETAIL] [<lora:composition:1>:<lora:detailer:0.8>:DETAIL] landscape

# 第一遍：PC: Schedule prompt (Advanced), tags="DETAIL", 512x512
# → a simple landscape, 使用 composition LoRA

# 第二遍：PC: Schedule prompt (Advanced), tags="" (不匹配 DETAIL)
# → a detailed landscape, 不使用任何 LoRA
```

---

## 三、宏的高级应用

### 模板化提示词

用宏定义可复用的提示词片段：

```
DEF(QUALITY=masterpiece, best quality, highly detailed)
DEF(NEG=lowres, bad anatomy, bad hands)
QUALITY, a cat   → masterpiece, best quality, highly detailed, a cat
```

### 参数化宏

创建可参数化的提示词模板：

```
DEF(CHARA=[(a $1 wearing $2:1.2):1.3] standing in $3)
CHARA(girl; red dress; a garden)   → [(a girl wearing red dress:1.2):1.3] standing in a garden
CHARA(boy; suit; an office)        → [(a boy wearing suit:1.2):1.3] standing in an office
```

### 宏与调度结合

宏在调度解析之前展开，所以宏内容可以包含调度语法：

```
DEF(FADE=[(style1:1.0):(style2:1.0):0.5])
FADE, a cat   → [(style1:1.0):(style2:1.0):0.5], a cat
```

### 实用宏示例

```
# 定义一个渐入渐出的权重宏
DEF(EASEIN=[($1:0.5):($1:1.0):0.3])
EASEIN(beautiful)   → [(beautiful:0.5):(beautiful:1.0):0.3]

# 定义一个带权重的提示词片段宏
DEF(W=(quality:1.3), highly detailed, intricate)
W, a cat   → (quality:1.3), highly detailed, intricate, a cat
```

---

## 四、高级编码技巧

### STYLE 切换

不同的权重解析方式适合不同的场景：

```
# 使用 A1111 权重方式（(word:1.5) 的效果与 WebUI 一致）
STYLE(A1111) a (red:1.3) cat

# SDXL 推荐使用 comfy++ 
STYLE(comfy++) a (detailed:1.2) landscape

# 使用归一化减少偏差
STYLE(comfy, length) a (long prompt with many words:1.1) and more words
```

### 多编码器独立提示（SDXL/Flux）

```
# SDXL: CLIP-L 和 CLIP-G 使用不同的提示词
TE(l=simple description) TE(g=detailed, artistic description of a cat)

# Flux: T5 和 CLIP-L 使用不同提示词
TE(l=short prompt) TE(t5xxl=a very long and detailed description of the scene)

# 查看可用编码器
TE(help)   → 在日志中打印编码器键名
```

### TE_WEIGHT 调整编码器影响力

```
# SDXL: 降低 CLIP-G 的影响力
TE_WEIGHT(g=0.25, l=0.75)

# Flux: 降低 T5 的影响力
TE_WEIGHT(t5xxl=0.5)

# 统一设置所有编码器
TE_WEIGHT(all=0.5)
```

### Cutoff 隔离概念

避免概念"串色"：

```
a plate with [CUT:red apple:red], [CUT:green pear:green], and a banana
```

这会确保红色只影响苹果，绿色只影响梨，减少"绿色苹果"或"红色梨"的出现。

---

## 五、实用配方

### 配方 1：渐进细化

```
[rough sketch:detailed illustration:0.3] [<lora:sketch:1>:<lora:detail:0.8>:0.3]
```
前 30% 用草图风格，后 70% 切换到精细插画。

### 配方 2：多风格融合

```
STYLE(A1111) (a cat:1.0) AVG(0.5) (a dog:1.0)
```
50% 猫 + 50% 狗的效果融合。

### 配方 3：动态 LoRA 强度曲线

利用序列语法和 Jinja 模板（需配合 comfyui-utility-nodes）：

```
[SEQ<% for x in steps(0.1, 0.9, 0.1) %>:<lora:test:<= sin(x*pi) + 0.1 =>>:<= x =><% endfor %>]
```
基于正弦波的 LoRA 强度调度。

### 配方 4：角色与背景分离

```
beautiful landscape FILL() COUPLE(0.2 0.8, 0.3 0.9) a girl in red dress :1.5
```
背景填充未被遮罩的区域，女孩在中间区域有 1.5 倍权重。

### 配方 5：分区域不同风格

```
STYLE(A1111) left side content MASK(0 0.5, 0 1) AND STYLE(comfy++) right side content MASK(0.5 1, 0 1)
```
左右两侧使用不同的权重解析方式。

### 配方 6：步数精确定位

```
# num_steps = 30
[<lora:base:1>::10] [<lora:detail:0.8>:10:20] [<lora:sharpen:0.5>:20]
```
- 0~10 步：base LoRA
- 10~20 步：base + detail LoRA
- 20~30 步：base + detail + sharpen LoRA

---

## 六、常见问题与排错

### LoRA 没有效果

1. 确认使用了 `PC: Schedule LoRAs` 节点（不是 `PCTextEncode`）
2. 检查 LoRA 名称是否正确（查看控制台日志）
3. 确认模型和 CLIP 都正确连接

### 提示词调度不工作

1. 确认使用了 `PC: Schedule prompt`（不是 `PC: Text Encode`）
2. 检查语法：`[before:after:X]` 中的 X 是 0.0~1.0 的小数
3. 开启 DEBUG 日志查看解析过程：`PC: Configure Logging` 设为 DEBUG

### AND 被当作普通文本

- 检查是否在引号内：`"CAT AND DOG"` 中的 AND 不会触发
- 检查大小写：必须是大写 `AND`

### Cutoff 在 Flux 上不工作

Cutoff 依赖 CLIP 编码器的特殊行为，不适用于 T5 等非 CLIP 编码器。这是已知的限制。

### 嵌入 (embedding) 与调度冲突

`[embedding:xyz:0.5]` 会被误解析为调度语法。使用替代写法：

```
<emb:xyz>           → 正确
embedding\:xyz:0.5  → 转义冒号也可行
```

### 缓存导致不必要的重编码

这是 ComfyUI 缓存机制的已知问题。当使用 Advanced 节点的过滤功能时，即使调度内容没变，改变 tags 等参数也可能导致下游重编码。目前没有完美的解决方案。

### 调试技巧

1. 使用 `PC: Configure Logging` 设为 DEBUG 查看详细解析过程
2. 使用 `PC: Extract Scheduled Prompt` 查看特定时间点的提示词内容
3. 设置环境变量 `PROMPTCONTROL_DEBUG=1` 全局启用调试
