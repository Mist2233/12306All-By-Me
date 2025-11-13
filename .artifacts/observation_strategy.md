# 12306系统需求提取策略

**生成时间**: 2025-11-13  
**Observer Agent**: Business Analyst  
**基于资源**: WebCrawler爬取的10个页面，1956个文件  
**目标**: 为Extracter Agent提供系统化的需求提取指导

---

## 1. 核心模块识别

基于课程需求大纲和真实网页资源，确定4个核心模块：

### 模块1：用户认证 (Authentication)
- **登录页**: `deconstructed_site/otn/resources/index.html`
- **注册页**: `deconstructed_site/otn/regist/init/index.html`
- **关键功能**: 账号密码登录、扫码登录、滑动验证、短信验证

### 模块2：车票查询 (Ticket Query)
- **首页**: `deconstructed_site/index/index.html`
- **余票查询**: `deconstructed_site/otn/leftTicket/init_*/index.html`
- **车次查询**: `deconstructed_site/otn/lcQuery/init/index.html`
- **关键功能**: 单程/往返/中转查询、日期选择、车站自动补全

### 模块3：订单管理 (Order Management)
- **订单填写**: `deconstructed_site/otn/confirmPassenger/initDc/index.html`
- **订单查询**: `deconstructed_site/otn/view/index.html` (train_order)
- **关键功能**: 乘客选择、座位选择、订单提交、订单查询

### 模块4：个人中心 (User Center)
- **个人信息**: `deconstructed_site/otn/view/index.html` (information)
- **乘客管理**: `deconstructed_site/otn/view/index.html` (passengers)
- **关键功能**: 个人资料修改、常用联系人管理、实名认证

---

## 2. 需求提取路径

### 路径1：用户登录流程

**文件**: `deconstructed_site/otn/resources/index.html`

**提取目标**:
1. **表单结构**:
   - 用户名输入框: `id="J-userName"`, `type="text"`, placeholder="用户名/邮箱/手机号"
   - 密码输入框: `id="J-password"`, `type="password"`
   - 登录按钮: `id="J-login"`, `class="btn btn-primary"`

2. **验证码机制**:
   - 滑动验证: `id="J-slide-passcode"`, `class="nc-container"`
   - 短信验证: `id="modal"` (模态框选择验证方式)

3. **交互场景**:
   - 场景1: 输入用户名/密码 → 点击登录 → 触发滑动验证
   - 场景2: 完成滑动验证 → 提交登录 → 成功/失败响应
   - 场景3: 登录失败 → 显示错误提示 (id="J-login-error")
   - 场景4: 扫码登录 → 显示二维码 (id="J-qrImg")

4. **API端点** (从`login_new_v20221230.js`提取):
   - 登录接口: `https://kyfw.12306.cn/passport/web/login`
   - 验证码接口: `https://kyfw.12306.cn/passport/web/slide-passcode`
   - 认证接口: `https://kyfw.12306.cn/passport/web/auth/uamtk`

---

### 路径2：车票查询流程

**文件**: `deconstructed_site/index/index.html`

**提取目标**:
1. **查询表单**:
   - 出发地隐藏字段: `id="fromStation"`, `name="from_station"`
   - 出发地显示字段: `id="fromStationText"`, `class="input"`
   - 到达地隐藏字段: `id="toStation"`, `name="to_station"`
   - 到达地显示字段: `id="toStationText"`
   - 出发日期: `id="train_date"`, `type="text"`
   - 查询按钮: `id="search_one"`, `class="btn btn-primary"`

2. **高级选项**:
   - 学生票: `id="isStudentDan"` (复选框样式的li元素)
   - 高铁筛选: `id="isHighDan"`
   - 城市切换: `id="danChange"` (交换出发地和目的地)

3. **交互场景**:
   - 场景1: 选择出发地 → 触发自动补全 (城市列表弹出)
   - 场景2: 选择日期 → 触发日期选择器
   - 场景3: 点击查询 → 验证表单 → 跳转车次列表
   - 场景4: 查询失败 → 显示错误提示 (出发地=目的地)

4. **数据支持**:
   - 车站数据: `js/station_name_new_v10091.js`
   - 拼音转换: `js/pinyin.js`

---

### 路径3：订单填写流程

**文件**: `deconstructed_site/otn/confirmPassenger/initDc/index.html`

**提取目标**:
1. **乘客选择区域**:
   - 常用联系人列表
   - 乘客类型选择 (成人/儿童/学生)
   - 证件类型和证件号

2. **座位选择区域**:
   - 座位类型单选 (一等座/二等座/硬卧/软卧等)
   - 价格显示

3. **提交按钮**:
   - 提交订单按钮及倒计时

4. **交互场景**:
   - 场景1: 选择乘客 → 自动填充证件信息
   - 场景2: 选择座位类型 → 计算总价
   - 场景3: 提交订单 → 验证 → 跳转支付页面

---

## 3. 信息收集维度清单

Extracter执行时必须收集以下信息：

### ✅ HTML结构维度
- 所有`<input>`元素的: id, name, type, placeholder, pattern, maxlength, required
- 所有`<button>`元素的: id, class, data-*属性
- 所有`<form>`元素的: action, method
- 错误提示容器的: id, class, aria-*属性

### ✅ CSS样式维度
- 主色调: `#3b99fc` (蓝色), `#ff8000` (橙色)
- 按钮样式: `.btn-primary`, `.btn-secondary`
- 错误色: `#e12525` (红色)
- 成功色: `#4ea373` (绿色)
- 字体: Tahoma, 宋体, 微软雅黑
- 布局: 固定宽度980px

### ✅ JavaScript交互维度
- 表单验证规则 (从HTML的pattern属性和JS文件提取)
- AJAX请求URL和参数
- 事件处理函数 (从JS文件中的事件绑定提取)
- 状态管理 (按钮禁用/启用、倒计时等)

### ✅ 行为-响应对维度
- **成功路径**: 正常操作的系统响应
- **失败路径**: 错误操作的错误提示文案和样式
- **边界路径**: 边界条件的系统行为

---

## 4. 输出格式要求

Extracter必须使用以下句式记录需求：

```markdown
#### 场景X: [场景名称]

**当我** [用户操作]  
**然后** [触发事件]  
**这时** [系统响应]  
**并且** [附加响应]

**HTML依据**:
- 元素1: `<input id="J-userName" type="text" placeholder="用户名/邮箱/手机号">`
- 元素2: `<button id="J-login" class="btn btn-primary">立即登录</button>`

**CSS依据**:
- 按钮颜色: `#3b99fc`
- 错误提示色: `#e12525`

**JS逻辑**:
- 验证规则: 手机号pattern="^1[3-9]\d{9}$"
- API调用: POST https://kyfw.12306.cn/passport/web/login
```

---

## 5. 关键技术发现

### 5.1 滑动验证码 (阿里云NoCaptcha)
- **容器**: `id="J-slide-passcode"`, `class="nc-container"`
- **组件**: nc.js (阿里云滑动验证组件)
- **流程**: 拖动滑块 → 服务端验证 → 返回token → 提交登录

### 5.2 SM4加密
- **文件**: `js/SM4.js`
- **用途**: 密码加密
- **密钥**: `SM4_key = 'tiekeyuankp12306'` (从login_new_v20221230.js提取)

### 5.3 城市自动补全
- **实现**: typeahead组件
- **数据源**: station_name_new_v10091.js
- **支持**: 简拼、全拼、汉字输入

### 5.4 双输入框模式
- **模式**: 每个城市选择有两个input
  - `type="hidden"` 存储车站代码 (如"BJP")
  - `type="text"` 显示车站名称 (如"北京")

---

## 6. 预期输出规模

- **用户认证模块**: 8-10个场景
- **车票查询模块**: 5-7个场景
- **订单管理模块**: 6-8个场景
- **个人中心模块**: 4-5个场景

**总计**: 约25-30个场景

---

## 7. 质量标准

### 真实性
- ✅ 所有HTML元素必须从真实文件中提取
- ✅ 所有id/class必须精确匹配
- ❌ 不允许猜测或假设

### 完整性
- ✅ 覆盖成功、失败、边界场景
- ✅ 每个表单字段都要记录
- ✅ 每个按钮的交互都要描述

### 可执行性
- ✅ 开发人员可以根据需求直接编码
- ✅ 测试人员可以根据需求编写测试用例
- ✅ 设计师可以根据CSS规范还原UI

---

## 8. Extracter执行步骤建议

1. **第一步**: 读取observation_strategy.md (本文档)
2. **第二步**: 逐个打开HTML文件，按路径提取表单结构
3. **第三步**: 读取对应的JS文件，提取API调用和验证逻辑
4. **第四步**: 读取CSS文件，提取样式规范
5. **第五步**: 生成`.artifacts/raw_requirements.md`
6. **第六步**: Git提交，传递给Standarder Agent

---

**下一步行动**: Extracter Agent读取本策略，开始系统化需求提取工作。
