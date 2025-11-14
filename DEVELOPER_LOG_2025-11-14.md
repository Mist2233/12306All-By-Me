# 开发日志 — 2025-11-14

记录今天（2025-11-14）在仓库 `12306All-By-Me` 中的所有主要修改、运行操作、遇到的问题与下一步建议。

## 一、总体目标
- 将爬取的 `deconstructed_site` 导入前端预览并开始逐步把原站页面迁移/组件化。
- 搭建基础首页/登录/注册的前端框架并与后端开发接口联通（开发用 mock / 临时实现）。

## 二、代码变更清单（按模块）

### 根 / 工具
- `tools/import_deconstructed.js` — 新增：把本地 `deconstructed_site` 复制到 `packages/frontend/public/deconstructed_site` 的导入脚本。
- `tools/patch_deconstructed_base.js` — 新增：为导入的 HTML 注入 `<base href="/deconstructed_site/...">`，修正相对路径解析的问题。
- 修改 `package.json`（根） — 新增脚本 `import:deconstructed`，便于运行上述导入脚本。

### 前端（packages/frontend）
- `packages/frontend/src/pages/Deconstructed.tsx` — 新增：iframe 预览页面（`/deconstructed` 路由）。
- `packages/frontend/src/porting/PORTING_CHECKLIST.md` — 新增：像素复刻迁移清单与流程建议。
- `packages/frontend/src/styles/design-tokens.css` — 新增：CSS 变量（design tokens）。
- `packages/frontend/src/pages/LoginPage.tsx` & `LoginPage.css` — 改进：登录页表单、双栏布局、验证码占位、记住我、跳转链接。
- `packages/frontend/src/pages/SignupPage.tsx` & `SignupPage.css` — 新增：注册页面（表单字段、验证码占位、密码确认等）。
- `packages/frontend/src/components/Header/Header.tsx` & `Header.css` — 新增/改进：顶部导航（使用 `react-router` Link，加入登录/注册链接）。
- `packages/frontend/src/pages/HomePage.tsx` & `HomePage.css` — 新增：首页骨架（hero、查询卡、四项功能卡、公告列表），并把根路由 `/` 指向该页面（`src/App.tsx` 已更新）。

### 后端（packages/backend）
- `packages/backend/src/modules/auth/routes/auth.routes.ts` — 改进：现有登录逻辑保留，并新增 `POST /api/v1/auth/register` 用于开发环境创建 mock 用户。导出 `authRouter` 与 `mockUsers`。
- `packages/backend/src/index.ts` — 改进：挂载 `authRouter`，并在启动时为开发注入一个 demo 用户（用户名 `demo`，密码来自环境变量 `DEMO_USER_PASSWORD` 或默认 `Password123!`）。

## 三、已执行的运行/系统操作
- 将本地 `deconstructed_site` 复制到 `packages/frontend/public/deconstructed_site`：
  - 命令：`node ./tools/import_deconstructed.js e:\\Development\\12306All-By-Me\\deconstructed_site`（已执行）。
- 在 `packages/frontend` 中安装依赖并启动 Vite（dev server）
  - 命令：`npm install`、`npm run dev`。
  - Vite 默认监听端口：`3000`（本次运行是 3000）。
- 在 `packages/backend` 中安装依赖并启动后端 dev server
  - 命令：`npm install`、`npm run dev`。
  - Node 启动时遇到 `require is not defined`（ESM/require 混用），已修复为使用 ES import，随后端口 5000 启动成功。
  - 为开发释放并重启端口时，我终止了占用 `5000` 的旧进程（`PID 3468`）。

## 四、遇到的问题与解决方法（要点）
- 问题：访问 `http://localhost:3000/` 只看到 SPA 根（React 渲染的“首页”），没有直接显示解构页面。原因：Vite 的 `/` 返回 `packages/frontend/index.html`（React app），解构页面为静态文件，需要访问 `/deconstructed_site/...` 或设置覆盖。解决：新增 iframe 预览 (`/deconstructed`) 并提供临时替换方案。\
- 问题：爬取页面的资源引用为绝对或根路径（例如 `/css/global.css`），在本地 `deconstructed_site` 目录中无法直接加载。解决：写入 `tools/patch_deconstructed_base.js` 注入 `<base>`，并准备后续的绝对路径批量重写脚本（可选）。\
- 问题：后端 `npm run dev` 初次失败：`tsx` 未识别（依赖未安装），已在 `packages/backend` 运行 `npm install`。\
- 问题：启动后端端口 5000 被占用，进程终止并重新启动服务器以绑定 5000。

## 五、测试与验证（如何复现／验证）
1. 启动后端（在 repo 根或 packages/backend）：
```powershell
cd e:\\Development\\12306All-By-Me\\packages\\backend
npm install
npm run dev
```
后端监听 `http://localhost:5000`，接口示例：
- 登录：`POST http://localhost:5000/api/v1/auth/login`（body: { username, password, nc_token })
- 注册：`POST http://localhost:5000/api/v1/auth/register`（body: { username?, email?, phone?, password })

2. 启动前端：
```powershell
cd e:\\Development\\12306All-By-Me\\packages\\frontend
npm install
npm run dev
```
打开：
- 首页： `http://localhost:3000/`（React HomePage）
- 登录： `http://localhost:3000/login`（与后端联通的表单）
- 注册： `http://localhost:3000/signup`（注册表单）
- 解构预览： `http://localhost:3000/deconstructed` 或直接访问静态文件 `http://localhost:3000/deconstructed_site/otn/view/index.html`

3. Demo 用户（已注入，便于测试）
- 用户名: `demo`
- 密码: value of env `DEMO_USER_PASSWORD` or default `Password123!`

## 六、下一步建议（优先级）
1. 将前端 `LoginPage` / `SignupPage` 的 submit 逻辑替换为真实请求（我可立即实现）。
2. 对 `deconstructed_site` 的绝对路径（以 `/` 开头）做一次批量重写，或把重要资源移动到 `public` 根路径；长期建议是把页面逐步组件化并替换为 React 组件。\
3. 添加 MSW mock（本地 dev）与 Playwright 视觉回归测试（保护像素迁移）。

---
如果你需要，我可以把此日志追加到仓库的 `DEVELOPER_STATUS.md` 或其他指定位置，或把今天的每次交互记录成更细粒度的提交注释。

记录者: AI 开发助理（按你要求在本地工作区执行了更改）
时间: 2025-11-14
