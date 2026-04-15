# ComfyUI Regional Prompt Composer

一个可视化的 ComfyUI 区域提示词编辑器，帮助用户通过图形化界面快速生成符合 [ComfyUI Prompt Control](https://github.com/asagi4/comfyui-prompt-control) 语法的区域提示词。

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![React](https://img.shields.io/badge/React-19.2.3-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## 功能特性

### 可视化区域编辑

- **拖拽创建和调整**：在画布上直观地创建、移动和调整区域大小
- **实时预览**：即时查看区域布局和提示词生成结果
- **多区域支持**：支持添加任意数量的区域，每个区域独立配置

### 丰富的提示词选项

- **两种组合模式**：
  - `AND` 模式：使用 `AND` 语法组合多个区域
  - `COUPLE` 模式：使用注意力耦合语法（实验性功能）

- **两种区域类型**：
  - `MASK`：潜空间遮罩（全尺寸计算 + 遮罩叠加）
  - `AREA`：分区域独立计算 + 合成

- **坐标格式**：
  - 百分比（0.0-1.0）：适合响应式场景
  - 像素（绝对值）：精确控制尺寸

- **高级功能**：
  - 羽化（Feather）：四边独立像素值，支持链接/独立控制
  - 遮罩合成操作（Mask Op）：multiply/add/subtract/intersect
  - 遮罩尺寸（MASK_SIZE）：自定义遮罩分辨率（默认 512x512）
  - 整体遮罩权重（MASKW）：多区域时统一调整遮罩强度
  - 权重控制：调整每个区域的影响力
  - 基础提示词：设置全局背景提示
  - 自动 FILL()：COUPLE 模式下自动填充未遮罩区域

### 用户友好设计

- **深色主题**：护眼的深色界面，符合现代设计趋势
- **实时生成**：任何修改都会立即反映在生成的提示词中
- **一键复制**：快速将生成的提示词复制到剪贴板
- **键盘导航**：支持区域选择和删除的快捷操作

## 技术栈

- **Frontend Framework**: React 19.2 + TypeScript
- **Build Tool**: Vite 6.2
- **Canvas Rendering**: Konva 10.0 + React-Konva 19.2
- **UI Icons**: Lucide React 0.562
- **Styling**: Tailwind CSS 3.4（通过 CDN）

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

应用将在 `http://localhost:3000` 启动。

### 构建生产版本

```bash
npm run build
```

构建输出位于 `dist/` 目录。

### 预览生产构建

```bash
npm run preview
```

## 使用指南

### 界面布局

应用分为三个主要区域：

1. **左侧设置面板**：
   - 画布设置：尺寸、坐标格式、组合模式
   - 区域列表：管理所有已创建的区域
   - 选中属性：编辑当前选中区域的详细参数

2. **中央画布区域**：
   - 可视化显示画布和所有区域
   - 支持拖拽、缩放和调整大小
   - 网格辅助线帮助定位

3. **底部输出面板**：
   - 实时显示生成的提示词
   - 一键复制到剪贴板

### 基本工作流

1. **设置画布参数**：
   - 在左侧面板调整画布尺寸（默认 1024×1024）
   - 选择坐标格式（百分比或像素）
   - 选择组合模式（AND 或 COUPLE）

2. **添加区域**：
   - 点击区域列表右侧的 `+` 按钮添加新区域
   - 在画布上拖拽区域到目标位置
   - 使用控制点调整区域大小

3. **配置区域属性**：
   - 输入区域提示词
   - 选择区域类型（MASK 或 AREA）
   - 调整权重（0-1）
   - 选择遮罩合成操作（Op）：multiply / add / subtract / intersect
   - 设置羽化值（0-100px），支持四边独立设置或统一调整

4. **生成提示词**：
   - 提示词会自动更新
   - 点击底部"Copy to Clipboard"按钮复制

### 生成语法说明

#### AND 模式示例

```
a beautiful landscape AND a cat MASK(0 0.5, 0 1, 1.0) AND a dog MASK(0.5 1, 0 1, 1.0)
```

- 使用 `AND` 组合多个区域
- `MASK(x1 x2, y1 y2, weight, op)` 指定遮罩范围、权重和合成操作
- `op` 默认为 `multiply`，支持 `add`、`subtract`、`intersect`

#### COUPLE 模式示例

```
landscape FILL() COUPLE(0 0.5, 0 1) a cat COUPLE(0.5 1, 0 1) a dog
```

- 使用 `COUPLE` 应用注意力耦合
- `FILL()` 自动填充未遮罩区域
- 更精确的区域控制

#### 坐标格式

**百分比**：
```
MASK(0.1 0.4, 0.2 0.6)
```

**像素**（基于画布尺寸）：
```
MASK(100 400, 200 600)
```

#### 羽化效果

```
cat MASK(0 0.5, 0 1) FEATHER(10 20 10 20)
```

- `FEATHER(left top right bottom)` 指定四边独立羽化值（单位：像素）
- UI 中可切换链接模式（统一调整）和独立模式（四边分别设置）
- 平滑区域边缘过渡

#### 遮罩尺寸

```
landscape MASK_SIZE(1024, 1024) AND cat MASK(0 0.5, 0 1) AND dog MASK(0.5 1, 0 1)
```

- `MASK_SIZE(width, height)` 设置遮罩分辨率（默认 512x512）
- 仅在非默认值时输出到提示词

#### 整体遮罩权重

```
landscape MASKW(0.8) AND cat MASK(0 0.5, 0 1) AND dog MASK(0.5 1, 0 1)
```

- `MASKW(weight)` 设置所有遮罩的整体权重（默认 1.0）
- 仅在多区域且权重非 1.0 时输出

### 高级技巧

1. **多风格融合**：使用 AVG() 混合不同区域的提示词
2. **分层区域**：通过调整权重创建层次感
3. **羽化过渡**：使用适当的羽化值避免区域边界生硬
4. **组合模式选择**：
   - AND 模式适合大多数场景
   - COUPLE 模式适合需要更精确控制的场景

## 项目结构

```
comfyui-pctextencode-region-composer/
├── index.html              # HTML 入口
├── index.tsx              # React 应用入口
├── index.css              # 全局样式
├── App.tsx               # 主应用组件
├── types.ts               # TypeScript 类型定义
├── constants.ts           # 常量定义
├── components/            # React 组件
│   ├── CanvasArea.tsx    # 画布区域和区域渲染
│   ├── Sidebar.tsx       # 左侧设置面板
│   ├── OutputPanel.tsx   # 提示词输出面板
│   └── Header.tsx       # 顶部标题栏
├── utils/                # 工具函数
│   └── promptGenerator.ts # 提示词生成逻辑
└── package.json          # 项目配置
```

## 开发指南

### 添加新功能

1. 在 `types.ts` 中定义新的类型
2. 在 `utils/promptGenerator.ts` 中实现生成逻辑
3. 在 `components/` 中创建或更新组件
4. 在 `App.tsx` 中集成新组件

### 代码规范

- 使用 TypeScript 进行类型安全开发
- 遵循 React Hooks 最佳实践
- 使用 Tailwind CSS 进行样式设计
- 组件保持单一职责原则

### 测试

```bash
# 运行开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

## 相关资源

- [ComfyUI Prompt Control 文档](https://github.com/asagi4/comfyui-prompt-control)
- [区域提示与注意力耦合指南](./04-区域提示与注意力耦合.md)
- [提示词语法大全](./03-提示词语法大全.md)
- [LoRA调度与高级技巧](./05-LoRA调度与高级技巧.md)

## 常见问题

### Q: 生成的提示词在 ComfyUI 中不工作？

A: 确保你使用的是 `PC: Schedule prompt` 节点，而不是普通的 `CLIPTextEncode`。并且需要安装 [ComfyUI Prompt Control](https://github.com/asagi4/comfyui-prompt-control) 扩展。

### Q: 区域之间的边界生硬？

A: 尝试增加羽化值（Feather），通常 10-20px 的值可以产生平滑过渡。

### Q: 如何使用自定义遮罩？

A: 使用 `PC: Attach Mask` 节点将自定义遮罩附加到 CLIP，然后在提示词中使用 `IMASK(index)` 引用。

### Q: MASK 和 AREA 有什么区别？

A: 
- `MASK`：全尺寸计算后应用遮罩，区域间可能有轻微渗透
- `AREA`：分区域独立计算后合成，区域完全独立

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License

## 更新日志

### v1.1.0 (2025)

- FEATHER 改为四边独立像素值（left top right bottom），支持链接/独立切换
- 新增 MASK op 参数支持（multiply/add/subtract/intersect）
- 新增 MASK_SIZE 遮罩尺寸设置（默认 512x512）
- 新增 MASKW 整体遮罩权重设置
- COUPLE 模式新增 FEATHER 支持
- 新增侧边栏遮罩合成操作选择器

### v1.0.0 (2024)

- 初始版本发布
- 支持可视化区域编辑
- 支持多种组合模式和区域类型
- 实时提示词生成
- 深色主题界面

## 作者

基于 [ComfyUI Prompt Control](https://github.com/asagi4/comfyui-prompt-control) 项目开发。

---

**享受创作！** 🎨✨
