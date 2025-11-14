---
marp: true
theme: gaia
paginate: true
class: invert
math: katex

# 铁路12306 项目汇报

---

<!-- Speaker notes:
本页：封面。说明项目名称、汇报组/成员、日期。
-->

# 铁路12306：需求实现与开发回顾

#### 小组：示例组  ·  日期：2025-11-17

---

## 报告结构

- 项目与需求概览
- 已完成需求统计 / 进度
- 成功案例（模型驱动 → 可执行代码）
- 失败案例与手动修复
- 团队协作与未来计划

<!-- Speaker notes:
说明本次汇报流程和时间分配（7分钟汇报+3分钟问答）。
提示每个部分重点：需求树、一个成功的 TDD 案例、一个失败并手动修复的案例、总结与展望。
-->

---

## 1. 项目与需求概览

- 页面总数：6
- 功能总数：16（核心 12，辅助 4）
- 导航关系：21

<!-- Speaker notes:
引用 `target_output/.extract/overview.md` 中总结：列出页面与功能总量，向评审展示整体规模。
-->

---

## 页面与功能树（摘要）

- P001 首页（导航、快捷入口）
- P002 车票查询（查询、筛选、预订、中转）
- P003 登录 / P004 注册
- P005 订单填写 / P006 个人中心（含订单管理、改签、支付）

<!-- Speaker notes:
快速展示需求树结构，说明每页负责的核心/辅助功能。可用一张图在 PPT 中可视化（此处为文字摘要）。
-->

---

## 2. 已完成的功能（当前状态）

- 已实现（示例）：
  - 后端：JSON DB + 查询/下单/订单接口
  - 前端：页面骨架、站点下拉组件、订单页、简化的车票查询回退页
- 未完成/需修复：
  - 车票查询页面复杂交互（正在逐步恢复）

<!-- Speaker notes:
结合开发日志说明哪些功能完整、哪些在修复中。强调已经完成的 API 接口和订单流程实现。
-->

---

## 统计（已完成 vs 总量）

- 页面：6 / 6（全部建立页面框架）
- 功能：完成 x / 16（在此处替换为实际已完成数）
- 核心流程（购票/登录/订单）已实现主流程但需稳定性修复

<!-- Speaker notes:
把实际实现数量替换成项目中统计的数字（如果需要我可以从代码中统计并填充）。
-->

---

## 已实现功能（详细清单 与 证据）

- 已实现（代码/文件证据）：
  - 后端 JSON DB 与票务路由： `packages/backend/src/lib/db.ts`, `packages/backend/src/modules/trains/routes/tickets.routes.ts`
  - 前端订单页与服务： `packages/frontend/src/pages/MyOrders.tsx`, `packages/frontend/src/services/orders.ts`
  - 站点下拉组件与站点服务： `packages/frontend/src/components/StationSelect/StationSelect.tsx`, `packages/frontend/src/services/stations.ts`
  - 票务查询/预订服务与简化页面： `packages/frontend/src/services/tickets.ts`, `packages/frontend/src/pages/TicketsFixed.tsx`, `packages/frontend/src/pages/TicketsBook.tsx`
  - 路由与导航更新： `packages/frontend/src/App.tsx`, `packages/frontend/src/components/Header/Header.tsx`

<!-- Speaker notes:
展示具体文件路径作为完成工作的证据。说明这些实现覆盖了订单管理、站点选择、基础查询/下单 API 与前端页面骨架。
-->

---

## 已完成功能 — 简短量化

- 页面总数：6（P001..P006）
- 功能总数：16（核心12，辅助4）
- 已实现（示例性清单）：约 8 / 16（见上页文件清单） — 推荐演示时用文件清单替换数字为最终确认值

<!-- Speaker notes:
这里给出一个保守计数（约 8/16），并提醒评审数值可由代码库自动统计以确保精确。
-->

---

## 3. 成功案例：订单查看（TDD思路，技术细节）

- 目标：实现 `P006.F013` 订单列表与详情页面
- 实施步骤：
  1. 定义后端接口契约（GET `/api/v1/tickets/orders`）
  2. 编写前端服务 `services/orders.ts`，并在 `MyOrders.tsx` 中消费
  3. 使用单元测试或手动模拟数据验证渲染与交互
- 关键实现文件：
  - `packages/backend/src/modules/trains/routes/tickets.routes.ts`
  - `packages/frontend/src/services/orders.ts`
  - `packages/frontend/src/pages/MyOrders.tsx`

<!-- Speaker notes:
示范如何用测试驱动设计（TDD）保证接口契约：先定义期望的 JSON 结构，再在前端写 mock 测试和简单断言，最后实现真实接口。
强调：测试点包括接口返回结构、分页/筛选逻辑、UI 渲染断言。
-->

---

## 成功案例：测试示例（伪测试片段）

```ts
// orders.test.ts (伪代码)
it('renders order card from API', async () => {
  mockFetchOrders([{ id: 'ORD123', status: '待支付', amount: 120 }])
  render(<MyOrders />)
  expect(await screen.findByText('ORD123')).toBeInTheDocument()
})
```

<!-- Speaker notes:
此处为示例测试，展示如何验证关键渲染逻辑；在答辩中可展示一两个真实断言以证明 TDD 流程。
-->

---

## 4. 失败案例：车票查询页面自动生成失败（详细回顾）

- 问题症状：`Tickets.tsx` 文件在多次自动修改后出现语法损坏，导致 Vite 报错并返回 500（页面白屏）。
- 典型错误信息（摘录）：
  - "Identifier 'React' has already been declared."
  - "Unexpected token (105:22)"（Babel parser 在解析 JSX 时失败）
- 直接影响：前端 dev server 无法正常渲染，阻塞后续 UI 验证与演示。

<!-- Speaker notes:
陈述出错堆栈来源（Babel/@babel/parser）并说明原因是文件里出现重复 import 和嵌套文本，通常因一次性大规模自动生成导致。
-->

---

## 失败案例：处理流程与手动修复步骤

1. 立刻回退到最小可运行页：新增并切换到 `TicketsFixed.tsx`，修改 `App.tsx` 指向该页面，确保 dev server 恢复。
2. 删除/隔离损坏文件 `Tickets.tsx`（避免再次被打包）
3. 逐步重建：按小步（搜索栏 → 站点下拉 → 日期 tabs → 结果渲染）逐步加入并验证每一步
4. 建议：在每一步运行 dev server 并执行静态检查与单元测试

<!-- Speaker notes:
详细说明我已执行的恢复动作（在仓库中的具体文件改动），并说明为什么逐步恢复比一次性生成更可靠。
-->

---

## 5. 团队协作现状与改进建议

- 现状问题：自动 Agent 流程在大型合并/生成时代码质量下降；工具链（模型/配额）限制影响自动化效率
- 改进建议：
  - 使用 feature-branch + 小步提交 + CI lint/test 门禁
  - 强制代码生成步骤输出临时文件，由人工审阅后合并
  - 增加单元/集成测试覆盖关键路径（订单流、查询接口）
  - 建立调试与回滚流程（如自动备份原始文件）

<!-- Speaker notes:
给出具体操作建议和责任分配示例；强调人机协作的重要性：Agent 负责生成草稿，人类负责审核与整合。
-->

---

## 短期路线图（2周）

- 稳定 Tickets 页面：按功能逐步恢复并在每步运行 dev 校验
- 补齐关键测试：订单/查询/筛选的单元测试
- CI 流程：PR 前运行 lint + test

<!-- Speaker notes:
为评审说明近期可交付项和验收标准（例如：票务查询在三次迭代内通过端到端验证）。
-->

---

## 3. 成功案例：TDD 驱动实现订单查看（示例）

- 目标：实现订单列表与详情（P006.F013）
- 方法：
  1. 编写后端接口契约（GET /api/v1/tickets/orders）
  2. 前端服务封装（`services/orders.ts`）
  3. 页面实现 + 单元测试（orders page 渲染静态数据）
- 成果：页面能列出订单卡片并展开详情

<!-- Speaker notes:
详细讲述以测试驱动的方式如何保证接口契约，展示关键测试断言（例如订单卡片包含订单号、状态、乘车信息）。强调从契约到可执行代码的流程。
-->

---

## 成功案例：关键代码片段（伪代码）

```ts
// orders.ts (service)
export async function listOrders() {
  const res = await fetch('/api/v1/tickets/orders')
  return await res.json()
}
```

<!-- Speaker notes:
向评审展示简单的服务层设计与单一职责，说明测试点：1) API 返回结构，2) 前端渲染是否健壮。
-->

---

## 4. 失败案例：车票查询页面的生成失败及手动修复

- 问题：大量一次性改动导致 `Tickets.tsx` 语法损坏 → Vite 编译错误（白屏）
- 根因：一次性合并大改动、未分步验证、文件中出现残留重复/嵌套 import
- 手动修复策略：
  1. 回退到最小可用页面（`TicketsFixed.tsx`）以恢复编译
  2. 逐步重建：小步提交 → 启动 dev server 验证 → 再继续添加功能

<!-- Speaker notes:
讲述具体的调试过程（例如如何定位 Babel 解析错误，如何通过替换临时页面恢复运行），并解释为何端到端自动 Agent 流程会失败。
-->

---

## 失败案例：教训与改进措施

- 小步提交与即时验证（每次改动后跑 dev）
- 使用 feature branch + CI lint/check 阶段阻止破坏性提交
- 对大型生成改动：先生成草稿文件，再人工合并
- 保留自动化测试（单元/集成）以捕获语法/运行时错误

<!-- Speaker notes:
强调流程与协作改进建议，提出将来避免类似失败的具体实践。
-->

---

## 5. 团队协作与未来计划

- 当前瓶颈：Agent 自动化在最后调试阶段需要人工干预
- 短期计划（2周）：
  - 稳定 Tickets 页面（分步恢复站点下拉、日期栏、结果渲染）
  - 补齐关键单元/集成测试
- 中期计划（下一个里程碑）：
  - 完成在线支付模拟（F014）与改签流程（F015）
  - 优化爬虫/资源恢复工具的可用性

<!-- Speaker notes:
说明每项任务的负责人（可在幻灯片中加上人员分配表），说明里程碑与验收标准。
-->

---

## 附录：可视化建议（在 PPT 中绘制）

- 需求树：用图表展示 P001..P006 的树状结构
- 核心流程图：注册→查询→下单→支付
- 问题定位时间线：自动化→失败→回退→逐步恢复

<!-- Speaker notes:
提示在答辩中展示图表，便于评审快速理解系统结构与工作流。
-->

---

# 谢谢聆听

- 问答时间：3 分钟

<!-- Speaker notes:
结束语并引导到 Q&A。准备 2 个常见问题的预设答案（如：Agent 失败的原因、下一步如何加速开发）。
-->
