# 12306系统设计总结

设计日期: 2025-11-13
Designer Agent: System Architect
基于需求: .artifacts/bdd_requirements.md

---

## 设计产出清单

### 1. 数据库设计 (design_database_schema.yml)
- ✅ 用户认证模块: 4张表 (users, user_sessions, verification_codes, login_logs)
- ✅ 车站车次模块: 4张表 (stations, trains, train_schedules, seat_types)
- ✅ 票务模块: 2张表 (ticket_inventory, query_history)
- ✅ 订单模块: 2张表 (orders, order_passengers)
- ✅ 用户中心模块: 1张表 (user_contacts)
- ✅ 索引优化建议
- ✅ MySQL配置建议

**总计**: 13张核心表，完整覆盖28个BDD场景

---

### 2. API接口设计 (design_api_interfaces.yml)
- ✅ 用户认证API: 6个端点 (登录、滑动验证、短信验证、扫码登录、登出、刷新Token)
- ✅ 车票查询API: 5个端点 (车站搜索、车站列表、余票查询、往返票查询)
- ✅ 订单管理API: 5个端点 (创建订单、订单详情、订单列表、取消订单、支付订单)
- ✅ 用户中心API: 6个端点 (个人信息CRUD、常用联系人CRUD)
- ✅ API安全规范 (限流、参数验证、敏感数据处理)

**总计**: 22个RESTful API端点，完整支持所有业务场景

---

### 3. UI组件设计 (design_ui_components.md)
- ✅ 设计令牌: 颜色、字体、间距、圆角、阴影系统
- ✅ 基础组件: Button、Input、Modal、Tabs、Autocomplete、DatePicker、Checkbox、Radio、Alert (共9个)
- ✅ 业务组件: SlideVerify、QRCode、TrainList (共3个)
- ✅ 布局组件: Container、Header、Footer (共3个)
- ✅ 响应式设计: 移动端、平板、桌面断点系统

**总计**: 15个可复用组件，完整设计系统

---

## 技术架构概览

### 前端技术栈
```
- 框架: React 18+ / Vue 3+
- UI库: 基于12306设计系统的自定义组件库
- 状态管理: Redux / Pinia
- 路由: React Router / Vue Router
- HTTP客户端: Axios
- 构建工具: Vite
- CSS方案: CSS Modules / Tailwind CSS
- 第三方组件:
  - 滑动验证: 阿里云NoCaptcha
  - 二维码: qrcode.js
  - 日期选择: 自定义DatePicker
  - 拼音搜索: pinyin.js
```

### 后端技术栈
```
- 框架: Spring Boot 3.x / Node.js + Express
- 数据库: MySQL 8.0+
- 缓存: Redis 7.x
- 消息队列: RabbitMQ / Kafka (订单处理)
- 认证: JWT
- 加密: SM4 (密码)、BCrypt (哈希)
- API文档: OpenAPI 3.0 / Swagger
- 测试: Jest (Node) / JUnit (Spring)
```

### 数据库设计亮点
1. **双输入框设计**: 车站选择使用显示字段+隐藏字段模式
2. **余票库存表**: 支持分段计价和实时库存管理
3. **订单状态机**: 清晰的订单状态流转 (待支付→已支付→已出票→已退票/已取消)
4. **索引优化**: 针对高频查询场景设计复合索引
5. **软删除**: 关键表使用status字段而非物理删除

### API设计亮点
1. **RESTful规范**: 统一的资源命名和HTTP方法使用
2. **统一响应格式**: code-message-data-timestamp结构
3. **安全机制**: 
   - 接口限流 (全局1000次/分钟/IP)
   - 敏感数据脱敏 (身份证、手机号)
   - Token认证 + 刷新机制
4. **错误处理**: 完整的4xx/5xx错误码体系
5. **参数验证**: 正则校验 (手机号、身份证号、日期格式)

### UI设计亮点
1. **设计系统**: 完整的Design Tokens (颜色、字体、间距、阴影)
2. **组件化**: 15个可复用组件，支持多种变体
3. **无障碍**: ARIA标签、键盘导航支持
4. **响应式**: 移动端/平板/桌面三端适配
5. **视觉一致性**: 基于12306实际页面提取的真实设计规范

---

## 场景覆盖矩阵

| 模块 | BDD场景数 | 数据库表 | API端点 | UI组件 |
|------|-----------|----------|---------|--------|
| 用户认证 | 9 | 4张 | 6个 | 5个 (Button, Input, Modal, Tabs, SlideVerify, QRCode) |
| 车票查询 | 9 | 4张 | 5个 | 4个 (Autocomplete, DatePicker, Checkbox, TrainList) |
| 订单管理 | 3 | 2张 | 5个 | 3个 (Radio, Checkbox, Modal) |
| 用户中心 | 2 | 1张 | 6个 | 2个 (Input, Button) |
| 通用 | 5 | 2张 | 0个 | 3个 (Alert, Container, Header, Footer) |
| **总计** | **28** | **13张** | **22个** | **15个** |

---

## 数据流设计

### 登录流程
```
用户输入 → 前端验证 → 滑动验证 → API: /auth/login 
→ 数据库验证 → 生成Token → 写入session表 → 返回Token
→ 前端存储Token → 页面跳转
```

### 查票流程
```
用户输入 → 车站搜索API → 自动补全 → 日期选择 → API: /tickets/query
→ 数据库查询inventory表 → 关联train/station表 → 返回车次列表
→ 前端渲染TrainList → 写入query_history表
```

### 下单流程
```
选择车次 → 选择乘客 → 选择座位 → API: /orders/create
→ 锁定座位(inventory.locked_seats+1) → 创建订单记录
→ 创建乘客记录 → 设置30分钟支付倒计时 → 返回订单详情
→ 前端显示支付倒计时
```

---

## 性能优化策略

### 数据库层
1. **索引优化**: 高频查询字段建立复合索引
2. **分表策略**: orders表按月分表 (order_202511, order_202512...)
3. **读写分离**: 主库写入，从库查询
4. **缓存策略**: Redis缓存车站列表、热门车次

### API层
1. **接口限流**: Redis + Sliding Window算法
2. **响应压缩**: Gzip压缩响应体
3. **CDN加速**: 静态资源使用CDN
4. **连接池**: 数据库连接池大小1000

### 前端层
1. **懒加载**: 路由级别代码分割
2. **虚拟滚动**: 车次列表使用虚拟滚动
3. **防抖节流**: 车站搜索输入防抖300ms
4. **资源优化**: 图片压缩、WebP格式

---

## 安全设计

### 认证安全
- 密码: SM4加密传输 + BCrypt哈希存储
- Token: JWT + 2小时过期 + 刷新机制
- 登录保护: 5次失败锁定30分钟

### 接口安全
- 限流: IP级别 + 用户级别双重限流
- CORS: 严格的跨域策略
- HTTPS: 全站HTTPS
- SQL注入: 参数化查询

### 数据安全
- 敏感数据脱敏: 身份证、手机号显示部分
- 日志脱敏: 日志中不记录敏感信息
- 访问控制: RBAC权限模型

---

## 可扩展性设计

### 微服务拆分建议
```
- auth-service: 用户认证服务
- ticket-service: 车票查询服务
- order-service: 订单管理服务
- payment-service: 支付服务
- user-service: 用户中心服务
- notification-service: 通知服务 (短信、邮件)
```

### 消息队列场景
- 订单创建 → 异步发送确认短信
- 支付成功 → 异步出票
- 订单超时 → 延迟队列自动取消

### 缓存策略
```
Redis缓存:
- 车站列表: 永久缓存 (站点变化少)
- 余票数据: 5秒过期 (实时性要求高)
- 用户Session: 2小时过期
- 短信验证码: 5分钟过期
```

---

## 测试策略

### 单元测试
- 数据库层: DAO测试 (覆盖率 > 80%)
- API层: Controller测试 (覆盖率 > 85%)
- 前端: 组件测试 (覆盖率 > 70%)

### 集成测试
- API集成测试: 完整业务流程测试
- 数据库集成测试: 事务一致性测试

### E2E测试
- 关键路径测试: 登录→查票→下单→支付
- 浏览器兼容性: Chrome, Firefox, Safari, Edge

---

## 下一步工作

### TestGenerator Agent 任务清单
1. ✅ 基于BDD场景生成前端测试用例 (Vitest/Jest)
2. ✅ 基于API设计生成后端测试用例 (Jest/JUnit)
3. ✅ 生成测试数据工厂 (Factory Pattern)
4. ✅ 生成Mock数据和Mock Server配置
5. ✅ 生成E2E测试脚本 (Playwright/Cypress)

### 设计文档交付物
```
.artifacts/
├── bdd_requirements.md           (Standarder输出，894行)
├── design_database_schema.yml    (Designer输出，本文件)
├── design_api_interfaces.yml     (Designer输出，本文件)
├── design_ui_components.md       (Designer输出，本文件)
└── design_summary.md             (Designer输出，本文件)
```

---

**设计完成时间**: 2025-11-13
**设计Agent**: Designer (Database Architect + API Architect + UI/UX Designer)
**输入来源**: Standarder Agent的BDD需求规范
**下一环节**: TestGenerator Agent
**状态**: ✅ 设计完成，准备提交

---

## 附录：12306实际技术发现

### 发现的技术细节
1. **密码加密**: SM4算法，密钥"tiekeyuankp12306"
2. **滑动验证**: 阿里云NoCaptcha，返回nc_token
3. **车站数据**: station_name_new_v10091.js，支持拼音搜索
4. **认证流程**: 两步认证 (login → uamtk)
5. **乘客信息串**: "{seatType},{ticketType},{name},{idType},{idNo},{mobile},N"

### 保留的12306特性
- 980px固定宽度布局
- Float布局方式
- 4px/5px间距倍数
- #3b99fc主色调蓝色
- 双输入框车站选择模式

---

**Next-Agent**: TestGenerator
