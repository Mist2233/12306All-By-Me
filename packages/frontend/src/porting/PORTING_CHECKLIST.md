# 前端像素级复刻迁移清单 (Porting Checklist)

目标：使用 `deconstructed_site` 中的原始 HTML/CSS/资源作为参考，有系统地将原站点页面按组件化方式迁移到 React + Vite 项目中，保证视觉与交互尽量一致并可维护。

步骤（迭代式，按页面/组件优先）：

1. 准备与导入
   - 使用根脚本 `npm run import:deconstructed <path>` 将 `deconstructed_site` 拷贝到 `packages/frontend/public/deconstructed_site`。
   - 在浏览器访问 `/deconstructed`（项目 dev 模式）确认资源已加载。

2. 页面分析
   - 打开目标页面（例如登录页），记录页面结构：header、content、form、footer 等区域。
   - 抽取关键 CSS：字体、颜色、间距、边框、布局（flex/grid）、响应断点。

3. 设计代币（Design Tokens）
   - 将颜色、字体、间距、圆角转换为 CSS 变量并放入 `src/styles/design-tokens.css`。
   - 使用变量替换组件样式，便于统一调整。

4. 组件化映射
   - 将页面切分为小组件（Button, Input, Modal, SlideVerify, Header, Footer, TrainList 等）。
   - 为每个组件创建文件夹，使用 CSS Module / Scoped CSS 或 CSS-in-JS（项目当前使用普通 CSS 即可）。

5. 移植 HTML/CSS（逐块移植）
   - 先复制原 HTML 片段到组件的 JSX（去除不必要的全局脚本），逐步替换为可复用 props。
   - 把原始 CSS 迁移为局部组件样式，替换成 design tokens。

6. 视觉回归测试（建议）
   - 对关键页面建立 Playwright 或 visual-regression 工具截图基线，并在后续变更中比较差异（或使用 Percy/Chromatic）。

7. 交互适配
   - 将原站点的行为（如滑动验证、下拉/联想）转为可控的 React 状态与事件处理。

8. 性能/资源
   - 优化图片（WebP）、字体（subset）、压缩 CSS/JS，确保 dev 与 prod 两套资源可用。

9. 可审计迁移记录
   - 每个页面/组件迁移完成后在 `packages/frontend/src/porting/README.md` 记录差异、已移植项与剩余工作。

验收标准（示例）
- 登录页：像素偏差 < 8px，交互行为与原站等价（表单校验、滑动验证占位）。
- 首页与查询页：主要布局一致、车次列表样式一致、可响应不同屏宽。

优先级建议
- 1: 登录页、查询页面、下单确认页（关键用户路径）
- 2: 用户中心、订单管理
- 3: 其余静态/展示页面
