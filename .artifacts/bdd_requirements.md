# 12306系统BDD需求规范

**标准化日期**: 2025-11-13  
**Standarder Agent**: BDD Specialist  
**输入文件**: `.artifacts/raw_requirements.md`  
**场景总数**: 28个场景  
**格式标准**: Given-When-Then (BDD)

---

## 模块1：用户认证 (User Authentication)

### Feature 1.1: 账号密码登录

```gherkin
Feature: 账号密码登录
  作为一个未登录用户
  我想要使用用户名和密码登录系统
  以便访问12306的各项服务

  Background: 用户在登录页面
    Given 用户已打开12306登录页面
    And 页面显示用户名输入框 "#J-userName"
    And 页面显示密码输入框 "#J-password"
    And 页面显示"立即登录"按钮 "#J-login"
```

#### Scenario 1.1.1: 输入用户名密码并触发滑动验证

```gherkin
Scenario: 输入用户名密码并触发滑动验证
  Given 用户在登录页面
  When 用户在 "#J-userName" 输入框中输入 "user@example.com"
  And 用户在 "#J-password" 输入框中输入 "Password123"
  And 用户点击 "#J-login" 登录按钮
  Then 页面应显示验证模态框 "#modal"
  And 模态框标题应为 "选择验证方式"
  And 默认应选中 "滑动验证" 标签页
  And 滑动验证组件 "#J-slide-passcode" 应可见
  
  # 技术实现细节
  Technical Details:
    - 模态框样式: position: fixed; top: 50%; left: 50%
    - 登录按钮颜色: background #3b99fc
    - 触发事件: login_new_v20221230.js
    - 显示操作: $("#modal").show(); $(".mask").show();
```

#### Scenario 1.1.2: 完成滑动验证后提交登录 - 成功

```gherkin
Scenario: 完成滑动验证后成功登录
  Given 用户已输入正确的用户名 "user@example.com"
  And 用户已输入正确的密码 "Password123"
  And 验证模态框已显示
  And 滑动验证组件 "#J-slide-passcode" 可见
  When 用户拖动滑块 ".nc_slide_button" 到最右边
  And 滑动验证成功完成
  And 系统获得验证token "nc_token"
  Then 系统应自动提交登录请求到 "POST /passport/web/login"
  And 请求应包含参数 username="user@example.com"
  And 请求应包含参数 password="Password123"
  And 请求应包含参数 nc_token
  And 登录成功后模态框应关闭
  And 页面应跳转到首页
  And 页面头部应显示用户名 "user@example.com"
  
  Technical Details:
    - 滑块轨道高度: 34px
    - 成功状态背景色: .nc_ok { background: #7ac23c; }
    - 成功图标: .btnok { background: url("yes.png") }
    - 认证流程: 登录成功后调用 POST /passport/web/auth/uamtk
```

#### Scenario 1.1.3: 登录失败 - 用户名或密码错误

```gherkin
Scenario: 登录失败 - 用户名或密码错误
  Given 用户在登录页面
  And 验证模态框已显示
  When 用户输入错误的用户名 "wronguser"
  Or 用户输入错误的密码 "wrongpass"
  And 用户完成滑动验证
  And 系统提交登录请求
  Then 登录应失败
  And 模态框应关闭
  And 页面应在登录按钮上方显示错误提示元素 "#J-login-error"
  And 错误提示应显示文本 "用户名或密码输入错误"
  And 错误提示颜色应为 "#e12525" (红色)
  And 错误图标 ".txt-error" 应显示
  
  Technical Details:
    - 错误容器: #J-login-error (初始 display: none)
    - 错误图标: .icon-plaint-fill.txt-error
    - 错误文字颜色: color: #e12525
```

---

### Feature 1.2: 扫码登录

```gherkin
Feature: 扫码登录
  作为一个未登录用户
  我想要使用12306手机APP扫码登录
  以便快速安全地登录系统

  Background: 用户在登录页面
    Given 用户已打开12306登录页面
    And 页面显示登录方式标签栏 ".login-hd"
    And 标签栏包含 "账号登录" 和 "扫码登录" 选项
```

#### Scenario 1.2.1: 切换到扫码登录并显示二维码

```gherkin
Scenario: 切换到扫码登录并显示二维码
  Given 用户在登录页面
  And "账号登录" 标签页当前处于激活状态
  When 用户点击 "扫码登录" 标签 ".login-hd-code"
  Then 账号登录区域 ".login-account-con" 应隐藏
  And 扫码登录区域 ".login-code-con" 应显示
  And 二维码图片 "#J-qrImg" 应加载并显示
  And 二维码加载指示器 "#J-login-code-loading" 应在加载期间显示
  And 二维码下方应显示提示文字
  And 提示文字应包含 "打开"
  And 提示文字应包含高亮文本 "12306手机APP" (颜色 #3b99fc)
  And 提示文字应包含 "扫描二维码"
  
  Technical Details:
    - 二维码容器尺寸: width: 165px; height: 165px
    - 主色调文字: .txt-primary { color: #3b99fc; }
    - 二维码容器ID: #J-qrImg-con
```

#### Scenario 1.2.2: 二维码过期后刷新

```gherkin
Scenario: 二维码过期后刷新
  Given 用户在扫码登录页面
  And 二维码 "#J-qrImg" 已显示
  When 用户等待超过 2 分钟未扫码
  Then 二维码上应覆盖半透明遮罩 "#J-code-error-mask"
  And 遮罩背景应为 "rgba(0,0,0,0.5)"
  And 遮罩内应显示错误提示 "#J-code-error"
  And 错误提示应显示文本 "二维码已失效"
  And 错误提示应显示 "刷新" 按钮 ".btn.btn-primary"
  
  When 用户点击 "刷新" 按钮
  Then 遮罩 "#J-code-error-mask" 应消失
  And 系统应生成新的二维码
  And 新二维码应显示在 "#J-qrImg" 中
  And 二维码有效期应重置为 2 分钟
  
  Technical Details:
    - 遮罩初始类名: .code-error-mask.hide
    - 刷新按钮颜色: background: #3b99fc
    - 二维码过期时间: 120秒
```

---

### Feature 1.3: 短信验证登录

```gherkin
Feature: 短信验证登录
  作为一个已注册用户
  我想要使用短信验证码登录
  以便在忘记密码时也能访问系统

  Background: 用户触发登录验证
    Given 用户已在登录页面输入用户名和密码
    And 验证模态框 "#modal" 已显示
    And 验证方式标签栏 "#verification" 可见
```

#### Scenario 1.3.1: 选择短信验证方式

```gherkin
Scenario: 选择短信验证方式
  Given 验证模态框已显示
  And "滑动验证" 标签 ".login-hd-slide" 当前处于激活状态
  When 用户点击 "短信验证" 标签 (type="0")
  Then 滑动验证区域应隐藏
  And 短信验证区域 "#short_message" 应显示
  And 应显示标签 "请输入登录账号绑定的证件号后4位"
  And 应显示证件号输入框 "#id_card" (maxlength=4)
  And 应显示标签 "验证码"
  And 应显示验证码输入框 "#code" (maxlength=6)
  And 应显示 "获取验证码" 按钮 "#verification_code" (样式: .btn-secondary)
  And 应显示 "确定" 按钮 "#sureClick" (样式: .btn-primary)
  
  Technical Details:
    - 次要按钮颜色: .btn-secondary { background: #f6f6f6; color: #333; }
    - 主要按钮颜色: .btn-primary { background: #3b99fc; color: white; }
```

#### Scenario 1.3.2: 获取短信验证码 - 成功（下行短信）

```gherkin
Scenario: 获取短信验证码 - 成功（下行短信）
  Given 用户在短信验证区域 "#down"
  And 页面显示手机号尾号 "#mobile_down" 为 "****2753"
  And "获取验证码" 按钮 "#verification_code_down" 处于可用状态
  When 用户点击 "#verification_code_down" 按钮
  Then 系统应发送POST请求到 "/passport/web/getMessageCode"
  And 请求应包含参数 mobile
  And 按钮应变为禁用状态
  And 按钮文字应变为 "60秒后重试"
  And 按钮应开始倒计时从 60 到 0
  And 倒计时每秒更新按钮文字
  And 用户手机应收到来自12306的验证码短信
  
  When 倒计时结束 (到达 0 秒)
  Then 按钮应恢复为可用状态
  And 按钮文字应恢复为 "获取验证码"
  
  Technical Details:
    - 倒计时逻辑: 60秒递减，每秒更新UI
    - API端点: POST https://kyfw.12306.cn/passport/web/getMessageCode
    - 短信验证码输入框: #up_msg_code_down
    - 验证按钮: #login_control_submit_down
```

#### Scenario 1.3.3: 提交短信验证码 - 验证码错误

```gherkin
Scenario: 提交短信验证码 - 验证码错误
  Given 用户在短信验证区域
  And 用户已获取验证码
  And 验证码输入框 "#up_msg_code_down" 可见
  When 用户在 "#up_msg_code_down" 中输入错误验证码 "123456"
  And 用户点击 "验证" 按钮 "#login_control_submit_down"
  Then 系统应验证验证码
  And 验证应失败
  And 应在验证码输入框右侧显示错误提示 "#login_control_error_down"
  And 错误提示应包含错误图标 ".icon-plaint-fill.txt-error"
  And 错误提示应显示文本 "验证码错误"
  And 错误图标和文字颜色应为 "#e12525" (红色)
  
  Technical Details:
    - 错误提示初始状态: display: none
    - 错误图标类: .icon.icon-plaint-fill.txt-error
    - 错误颜色: color: #e12525
```

---

## 模块2：车票查询 (Ticket Query)

### Feature 2.1: 单程票查询

```gherkin
Feature: 单程票查询
  作为一个用户
  我想要查询单程火车票
  以便预订从一个城市到另一个城市的车票

  Background: 用户在首页
    Given 用户已打开12306首页
    And 单程票查询表单已显示
    And 表单包含出发地输入框 "#fromStationText"
    And 表单包含到达地输入框 "#toStationText"
    And 表单包含出发日期输入框 "#train_date"
    And 表单包含查询按钮 "#search_one"
```

#### Scenario 2.1.1: 选择出发地 - 使用自动补全

```gherkin
Scenario: 使用拼音自动补全选择出发地
  Given 用户在首页
  And 出发地输入框 "#fromStationText" 获得焦点
  When 用户在 "#fromStationText" 中输入 "bei"
  Then 输入框下方应弹出自动补全下拉列表 ".typeahead"
  And 列表应显示所有拼音包含 "bei" 的车站
  And 列表应包括但不限于: "北京", "蚌埠", "北海"
  And 每个列表项应显示格式 "车站名称 | 拼音简写 | 车站代码"
  And 例如应显示 "北京 | BEIJING | BJP"
  And 列表宽度应为 265px
  And 列表项应有 padding-left: 10px
  
  Technical Details:
    - 拼音匹配库: pinyin.js
    - 车站数据源: station_name_new_v10091.js
    - 支持输入方式: 简拼、全拼、汉字
    - 自动补全容器: .typeahead.li
```

#### Scenario 2.1.2: 选择车站后填充隐藏字段

```gherkin
Scenario: 从下拉列表选择车站后填充双输入框
  Given 用户在出发地输入框输入 "bei"
  And 自动补全列表已显示
  And 列表包含选项 "北京 | BEIJING | BJP"
  When 用户点击列表中的 "北京 | BEIJING | BJP"
  Then 显示输入框 "#fromStationText" 的值应变为 "北京"
  And 隐藏输入框 "#fromStation" 的值应变为 "BJP"
  And 隐藏输入框 "#fromStation" 的 name 属性应为 "from_station"
  And 自动补全列表应关闭
  And 到达地输入框 "#toStationText" 应获得焦点
  
  Technical Details:
    - 双输入框模式: 
      - 显示字段 (#fromStationText) 存储车站名称 (用于UI显示)
      - 隐藏字段 (#fromStation, type=hidden) 存储车站代码 (用于后端提交)
    - 提交时使用隐藏字段的值
```

#### Scenario 2.1.3: 切换出发地和到达地

```gherkin
Scenario: 使用切换按钮互换出发地和到达地
  Given 用户已选择出发地 "北京" (代码: "BJP")
  And 显示输入框 "#fromStationText" 值为 "北京"
  And 隐藏输入框 "#fromStation" 值为 "BJP"
  And 用户已选择到达地 "上海" (代码: "SHH")
  And 显示输入框 "#toStationText" 值为 "上海"
  And 隐藏输入框 "#toStation" 值为 "SHH"
  When 用户点击切换图标 "#danChange"
  Then 出发地显示输入框 "#fromStationText" 值应变为 "上海"
  And 出发地隐藏输入框 "#fromStation" 值应变为 "SHH"
  And 到达地显示输入框 "#toStationText" 值应变为 "北京"
  And 到达地隐藏输入框 "#toStation" 值应变为 "BJP"
  
  Technical Details:
    - 切换图标: .icon.icon-qiehuan (title="切换")
    - 切换容器: .city-change
    - 交换操作:
      - fromStation ↔ toStation (隐藏字段)
      - fromStationText ↔ toStationText (显示字段)
```

#### Scenario 2.1.4: 选择出发日期

```gherkin
Scenario: 使用日期选择器选择出发日期
  Given 用户在首页
  And 出发日期输入框 "#train_date" 可见
  When 用户点击 "#train_date" 输入框
  Or 用户点击日期图标 ".icon-date"
  Then 日期选择器组件应弹出显示
  And 日期选择器应使用自定义样式 "calendarNew.css"
  And 今天之前的所有日期应显示为灰色 (color: #ccc)
  And 今天之前的日期应不可选择
  And 今天及未来60天的日期应可选择
  And 可选日期应以正常颜色显示
  
  When 用户点击某个可选日期 "2025-11-15"
  Then 输入框 "#train_date" 的值应变为 "2025-11-15"
  And 日期选择器应关闭
  And 输入框应失去焦点
  
  Technical Details:
    - 日期格式: YYYY-MM-DD (例如: 2021-01-01)
    - aria-label: "请输入日期，例如2021杠01杠01"
    - 自定义日历CSS: calendarNew.css
    - 不可选日期颜色: color: #ccc
    - 可选日期范围: 今天 ~ 今天+60天
```

#### Scenario 2.1.5: 勾选学生票选项

```gherkin
Scenario: 勾选学生票选项
  Given 用户在首页查询表单
  And 票种选项区域 ".check-list-right" 可见
  And 学生票复选框 "#isStudentDan" 处于未选中状态
  When 用户点击学生票选项 "#isStudentDan"
  Then 选项应变为选中状态
  And 选项应添加 "active" 类名
  And 复选框内应显示对勾图标 "✓"
  And 复选框背景色应变为 "#3b99fc" (蓝色)
  
  Technical Details:
    - 选中状态CSS: .check-list li.active i { background: #3b99fc; }
    - 对勾图标: content: "✓"
    - 其他选项: #isHighDan (高铁/动车)
```

#### Scenario 2.1.6: 提交查询 - 成功

```gherkin
Scenario: 提交单程票查询 - 成功
  Given 用户已选择出发地 "北京" (代码: "BJP")
  And 用户已选择到达地 "上海" (代码: "SHH")
  And 用户已选择出发日期 "2025-11-15"
  And 所有必填字段已填写
  And 查询按钮 "#search_one" 处于可用状态
  When 用户点击查询按钮 "#search_one"
  Then 系统应构建GET请求URL
  And URL应为 "/otn/leftTicket/init"
  And URL应包含参数 "leftTicketDTO.train_date=2025-11-15"
  And URL应包含参数 "leftTicketDTO.from_station=BJP"
  And URL应包含参数 "leftTicketDTO.to_station=SHH"
  And 页面应跳转到余票查询结果页
  And 结果页应显示北京到上海在2025-11-15的所有车次列表
  And 车次列表应包含: 车次号、出发时间、到达时间、历时、余票信息
  
  Technical Details:
    - 查询按钮: #search_one.btn.btn-primary.form-block
    - 按钮文字: "查    询"
    - 跳转URL: https://kyfw.12306.cn/otn/leftTicket/init
    - 请求方法: GET
```

#### Scenario 2.1.7: 查询失败 - 出发地和到达地相同

```gherkin
Scenario: 查询失败 - 出发地和到达地相同
  Given 用户在首页查询表单
  And 用户已选择出发地 "北京" (代码: "BJP")
  And 用户已选择到达地 "北京" (代码: "BJP")
  And 用户已选择出发日期 "2025-11-15"
  When 用户点击查询按钮 "#search_one"
  Then 系统应进行前端验证
  And 验证应检测到 fromStation === toStation
  And 查询按钮下方应显示错误提示
  And 错误提示文本应为 "出发地和到达地不能相同"
  And 错误提示颜色应为 "#e12525" (红色)
  And 系统应调用 showError() 函数
  And 系统不应执行页面跳转
  And 用户应停留在当前页面
  
  Technical Details:
    - 前端验证逻辑: if (fromStation === toStation) { showError(); return false; }
    - 错误提示颜色: color: #e12525
```

---

### Feature 2.2: 往返票查询

```gherkin
Feature: 往返票查询
  作为一个用户
  我想要同时查询去程和返程的火车票
  以便一次性预订往返行程

  Background: 用户在首页
    Given 用户已打开12306首页
    And 查询标签栏 ".search-tab-hd" 可见
    And 标签栏包含 "单程" 和 "往返" 标签
```

#### Scenario 2.2.1: 切换到往返票标签

```gherkin
Scenario: 切换到往返票查询模式
  Given 用户在首页
  And "单程" 标签当前处于激活状态 (class="active")
  And 单程票查询表单当前显示
  When 用户点击 "往返" 标签
  Then "单程" 标签应移除 "active" 类
  And "往返" 标签应添加 "active" 类
  And 单程票查询表单应隐藏
  And 往返票查询表单应显示
  And 往返票表单应包含出发地输入框 "#fromStationFanText"
  And 往返票表单应包含出发地隐藏字段 "#fromStationFan" (name="from_station_fan")
  And 往返票表单应包含到达地输入框 "#toStationFanText"
  And 往返票表单应包含到达地隐藏字段 "#toStationFan" (name="to_station_fan")
  And 往返票表单应包含去程日期输入框 "#go_date"
  And 往返票表单应包含返程日期输入框 "#from_date"
  And 往返票表单应包含查询按钮 "#search_two"
  
  Technical Details:
    - 单程标签图标: .icon-dancheng
    - 往返标签图标: .icon-wangfan
    - 往返查询按钮: #search_two.btn.btn-primary.form-block
```

#### Scenario 2.2.2: 选择返程日期 - 早于去程日期（错误）

```gherkin
Scenario: 选择返程日期早于去程日期 - 验证失败
  Given 用户在往返票查询表单
  And 用户已选择去程日期 "2025-11-15"
  And 去程日期输入框 "#go_date" 值为 "2025-11-15"
  When 用户选择返程日期 "2025-11-14"
  And 返程日期早于去程日期
  Then 系统应进行日期验证
  And 验证应失败
  And 返程日期输入框 "#from_date" 边框应变为红色
  And 边框颜色应为 "border-color: #e12525"
  And 输入框下方应显示错误提示
  And 错误提示文本应为 "返程日期不能早于去程日期"
  And 错误提示颜色应为 "#e12525" (红色)
  And 查询按钮 "#search_two" 应保持禁用状态
  
  Technical Details:
    - 错误边框: border-color: #e12525
    - 验证逻辑: 返程日期必须 >= 去程日期
    - 错误状态下阻止表单提交
```

---

## 模块3：订单管理 (Order Management)

### Feature 3.1: 订单填写

```gherkin
Feature: 订单填写
  作为一个已登录用户
  我想要填写订单信息
  以便预订选定的车票

  Background: 用户在订单填写页面
    Given 用户已登录系统
    And 用户已选择车次
    And 页面已跳转到订单填写页 "/otn/confirmPassenger/initDc"
```

#### Scenario 3.1.1: 选择常用联系人作为乘客

```gherkin
Scenario: 从常用联系人列表选择乘客
  Given 用户在订单填写页面
  And "常用联系人" 列表区域已显示
  And 列表包含 3 个常用联系人
  And 联系人包括 "张三", "李四", "王五"
  And 每个联系人都有对应的复选框
  When 用户点击 "张三" 对应的复选框
  Then 复选框应变为选中状态
  And 复选框应显示对勾图标
  And "乘客信息" 区域应自动填充张三的信息
  And 应填充姓名字段为 "张三"
  And 应填充证件类型为 "身份证"
  And 应填充证件号字段为张三的身份证号
  And 应填充手机号字段为张三的手机号
  
  Technical Details:
    - 页面路径: confirmPassenger/initDc/index.html
    - 联系人卡片应有选中状态边框颜色变化
    - 自动填充应同步更新表单验证状态
```

#### Scenario 3.1.2: 选择座位类型

```gherkin
Scenario: 选择座位类型并更新价格
  Given 用户在订单填写页面
  And "选择座位" 区域已显示
  And 座位类型选项包括单选按钮组
  And 可选座位包括 "二等座 ￥553"
  And 可选座位包括 "一等座 ￥933"
  And 可选座位包括 "商务座 ￥1748"
  And 当前未选择任何座位类型
  When 用户点击 "一等座 ￥933" 单选按钮
  Then 该单选按钮应变为选中状态
  And 其他座位类型单选按钮应变为未选中状态
  And 页面底部的 "应付金额" 标签应更新
  And "应付金额" 应显示 "￥933"
  
  Technical Details:
    - 使用 radio button 组件
    - 价格计算: 座位价格 × 乘客数量
    - 价格显示区域应实时更新
```

#### Scenario 3.1.3: 提交订单 - 成功

```gherkin
Scenario: 成功提交订单
  Given 用户在订单填写页面
  And 用户已选择乘客 "张三"
  And 用户已选择座位类型 "一等座"
  And 应付金额显示为 "￥933"
  And 所有必填信息已填写完整
  And "提交订单" 按钮处于可用状态
  When 用户点击 "提交订单" 按钮
  Then 系统应发送POST请求到 "/otn/confirmPassenger/submitOrder"
  And 请求应包含乘客信息 (姓名, 证件类型, 证件号, 手机号)
  And 请求应包含座位类型 "一等座"
  And 请求应包含车次信息
  Then 提交应成功
  And 页面应跳转到订单确认页面
  And 订单确认页应显示订单详情
  And 应显示车次信息
  And 应显示出发日期和时间
  And 应显示乘客信息 "张三"
  And 应显示座位类型 "一等座"
  And 应显示应付金额 "￥933"
  And 应显示支付倒计时
  And 倒计时文本应为 "请在30分钟内完成支付"
  And 倒计时应从 30:00 开始递减
  
  Technical Details:
    - API端点: POST /otn/confirmPassenger/submitOrder
    - 请求参数: 乘客信息, 座位类型, 车次信息
    - 支付倒计时: 30分钟 (1800秒)
```

---

## 模块4：个人中心 (User Center)

### Feature 4.1: 个人信息管理

```gherkin
Feature: 个人信息管理
  作为一个已登录用户
  我想要查看和管理个人信息
  以便保持账户信息的准确性

  Background: 用户已登录
    Given 用户已成功登录系统
    And 页面头部显示用户名
    And 顶部菜单栏 "我的12306" 可见
```

#### Scenario 4.1.1: 查看个人信息

```gherkin
Scenario: 从菜单导航到个人信息页面
  Given 用户已登录
  And 用户在任意页面
  When 用户点击顶部菜单 "我的12306"
  Then 下拉菜单 "#megamenu-2" 应显示
  And 下拉菜单应包含 "个人信息" 选项
  
  When 用户点击下拉菜单中的 "个人信息" 链接
  Then 页面应跳转到个人信息页面 "view/information.html"
  And 页面应显示用户的个人信息表单
  And 表单应显示字段 "用户名"
  And 表单应显示字段 "姓名"
  And 表单应显示字段 "证件类型"
  And 表单应显示字段 "证件号"
  And 表单应显示字段 "手机号"
  And 表单应显示字段 "邮箱"
  And 所有字段应填充用户的实际信息
  
  Technical Details:
    - 菜单项属性: data-href="view/information.html", data-redirect="Y", data-type="2"
    - 链接名称: name="g_href"
    - 导航容器: .menu-nav-bd#megamenu-2
```

---

### Feature 4.2: 常用联系人管理

```gherkin
Feature: 常用联系人管理
  作为一个已登录用户
  我想要管理常用联系人
  以便在订票时快速选择乘客信息

  Background: 用户在常用联系人页面
    Given 用户已登录系统
    And 用户已导航到 "常用联系人" 页面
```

#### Scenario 4.2.1: 添加新联系人

```gherkin
Scenario: 成功添加新常用联系人
  Given 用户在 "常用联系人" 页面
  And 联系人列表已显示
  And "添加" 按钮可见且可用
  When 用户点击 "添加" 按钮
  Then 添加联系人表单应弹出显示
  And 表单应包含 "姓名" 字段 (必填)
  And 表单应包含 "证件类型" 下拉选择 (必填)
  And 表单应包含 "证件号" 字段 (必填)
  And 表单应包含 "手机号" 字段 (必填)
  And 表单应包含 "旅客类型" 选择 (必填)
  And 表单应包含 "保存" 按钮
  And 表单应包含 "取消" 按钮
  
  When 用户填写姓名为 "赵六"
  And 用户选择证件类型为 "身份证"
  And 用户填写证件号为有效身份证号
  And 用户填写手机号为 "13800138000"
  And 用户选择旅客类型为 "成人"
  And 所有必填字段已正确填写
  And 用户点击 "保存" 按钮
  Then 系统应验证表单数据
  And 验证应通过
  And 系统应提交联系人信息到后端
  And 表单应关闭
  And 联系人列表应刷新
  And 列表中应新增一条记录 "赵六"
  And 新记录应显示证件类型 "身份证"
  And 新记录应显示旅客类型 "成人"
  And 应显示成功提示消息 "添加联系人成功"
  
  Technical Details:
    - 页面路径: view/passengers.html
    - 证件类型选项: 身份证, 护照, 港澳通行证, 台湾通行证等
    - 旅客类型选项: 成人, 儿童, 学生等
    - 手机号验证: 11位数字，1开头
    - 身份证号验证: 18位，符合身份证号规则
```

---

## 技术实现附录

### A. API端点规范

```yaml
API Endpoints:
  
  1. 用户登录:
    - Method: POST
    - URL: /passport/web/login
    - Parameters:
        username: string (用户名/邮箱/手机号)
        password: string (密码)
        nc_token: string (滑动验证token)
    - Response: { result: boolean, uamtk: string }
  
  2. 滑动验证:
    - Method: POST
    - URL: /passport/web/slide-passcode
    - Parameters: {}
    - Response: { nc_token: string, scene: string }
  
  3. 获取短信验证码:
    - Method: POST
    - URL: /passport/web/getMessageCode
    - Parameters:
        mobile: string (手机号)
    - Response: { result: boolean, message: string }
  
  4. 认证:
    - Method: POST
    - URL: /passport/web/auth/uamtk
    - Parameters:
        appid: string
    - Response: { result: boolean, newapptk: string }
  
  5. 余票查询:
    - Method: GET
    - URL: /otn/leftTicket/init
    - Parameters:
        leftTicketDTO.train_date: string (YYYY-MM-DD)
        leftTicketDTO.from_station: string (车站代码)
        leftTicketDTO.to_station: string (车站代码)
        purpose_codes: string (optional, 学生票标识)
    - Response: HTML页面包含车次列表
  
  6. 提交订单:
    - Method: POST
    - URL: /otn/confirmPassenger/submitOrder
    - Parameters:
        passengerTicketStr: string (乘客信息串)
        oldPassengerStr: string (常用联系人信息串)
        train_no: string (车次号)
        seat_type: string (座位类型)
    - Response: { result: boolean, orderId: string }
```

### B. 设计系统规范

```yaml
Design System:

  Colors:
    Primary: "#3b99fc"      # 主色调-蓝色 (按钮、链接、选中状态)
    Secondary: "#ff8000"    # 辅助色-橙色 (强调、提示)
    Success: "#4ea373"      # 成功色-绿色 (成功提示、完成状态)
    Warning: "#f6ba29"      # 警告色-黄色 (警告提示)
    Error: "#e12525"        # 错误色-红色 (错误提示、验证失败)
    Text-Primary: "#333"    # 主文字颜色
    Text-Secondary: "#666"  # 次要文字颜色
    Border: "#ddd"          # 边框颜色
    Background: "#f6f6f6"   # 背景色

  Button System:
    .btn-primary:
      background: "#3b99fc"
      color: "#fff"
      border: none
      border-radius: 4px
      heights: [30px, 36px, 44px]  # 小、中、大
    
    .btn-secondary:
      background: "#f6f6f6"
      color: "#333"
      border: 1px solid #ddd
      border-radius: 4px
      heights: [30px, 36px, 44px]

  Form Elements:
    Input:
      height: 40px
      border: 1px solid #ddd
      border-radius: 4px
      padding: 0 10px
      font-size: 14px
      
      focus:
        border-color: "#3b99fc"
        outline: none
      
      error:
        border-color: "#e12525"

  Layout:
    Page-Width: 980px        # 固定宽度
    Layout-Mode: float       # 主要使用float布局
    Grid-Spacing: [4px, 5px] # 间距基于4px或5px倍数
    
  Typography:
    Font-Family: "Microsoft YaHei", Arial, sans-serif
    Font-Sizes:
      Large: 18px
      Normal: 14px
      Small: 12px
```

### C. 前端组件库

```yaml
Frontend Components:

  1. Aliyun NoCaptcha (阿里云滑动验证):
    - Container: #J-slide-passcode.nc-container
    - Slider: .nc_slide_button
    - Track: .nc_scale (height: 34px)
    - Success: .nc_ok (background: #7ac23c)
    - Token: nc_token (用于后端验证)

  2. Station Autocomplete (车站自动补全):
    - Library: pinyin.js
    - Data Source: station_name_new_v10091.js
    - Input Modes: 简拼、全拼、汉字
    - Container: .typeahead
    - Width: 265px

  3. Date Picker (日期选择器):
    - CSS: calendarNew.css
    - Format: YYYY-MM-DD
    - Range: 今天 ~ 今天+60天
    - Disabled Color: #ccc

  4. jQuery (v1.x):
    - Core library: jquery.js
    - Used for: DOM操作、事件绑定、AJAX请求

  5. Other Libraries:
    - template.js: 模板引擎
    - require.js: 模块加载
    - soundmanager2.js: 音效管理
    - base64.js: Base64编解码
```

### D. 数据格式规范

```yaml
Data Formats:

  1. 车站代码映射:
    Format: "车站名|拼音|简拼|车站代码"
    Example: "北京|beijing|bj|BJP"
    Source: station_name_new_v10091.js

  2. 日期格式:
    Display: YYYY-MM-DD
    API: YYYY-MM-DD
    Example: "2025-11-15"

  3. 双输入框模式:
    Display Field: 
      - ID: {prefix}Text (如 fromStationText)
      - Type: text
      - Value: 车站名称 (如 "北京")
    
    Hidden Field:
      - ID: {prefix} (如 fromStation)
      - Type: hidden
      - Name: {name} (如 from_station)
      - Value: 车站代码 (如 "BJP")

  4. 乘客信息串格式:
    passengerTicketStr: "{seatType},{ticketType},{passengerName},{idType},{idNo},{mobile},N"
    Example: "1,1,张三,1,110101199001011234,13800138000,N"

  5. 密码加密:
    Algorithm: SM4
    Key: "tiekeyuankp12306"
    Mode: ECB
```

---

**BDD规范完成日期**: 2025-11-13  
**场景总数**: 28个BDD场景  
**覆盖模块**: 4个核心模块  
**格式标准**: Gherkin语法 (Given-When-Then)  
**下一步**: Designer Agent将基于这些BDD规范设计数据库schema、API接口和UI组件
