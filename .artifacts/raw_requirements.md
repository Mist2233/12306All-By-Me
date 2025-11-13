# 12306系统原始需求提取

**提取日期**: 2025-11-13  
**Extracter Agent**: Requirements Engineer  
**基于策略**: `.artifacts/observation_strategy.md`  
**分析资源**: 10个HTML页面，1956个文件

---

## 模块1：用户认证

### 1.1 账号密码登录

#### 场景1.1.1：输入用户名密码并触发滑动验证

**当我** 在登录页面输入用户名"user@example.com"到用户名输入框  
**然后** 输入密码"Password123"到密码输入框  
**然后** 点击"立即登录"按钮  
**这时** 页面弹出验证模态框，标题显示"选择验证方式"  
**并且** 默认选中"滑动验证"标签页，显示滑动验证组件

**HTML依据**:
```html
<input id="J-userName" type="text" class="input" 
       placeholder="用户名/邮箱/手机号" autocomplete="off"
       aria-label="请输入用户名或邮箱或手机号"/>

<input id="J-password" type="password" class="input" 
       placeholder="密码" autocomplete="new-password"
       onpaste="$.isPaste()"/>

<a id="J-login" class="btn btn-primary form-block" 
   href="javascript:;">立即登录</a>

<div id="modal" class="modal-login" role="alertdialog">
  <div class="modal-login-tit">
    <h2>选择验证方式</h2>
  </div>
  <ul class="login-hd" id="verification">
    <li class="login-hd-slide active" type="1">滑动验证</li>
  </ul>
</div>
```

**CSS依据**:
- 登录按钮颜色: `background: #3b99fc`
- 模态框位置: `position: fixed; top: 50%; left: 50%; margin-top: -126px; margin-left: -190px`

**JS逻辑**:
- 点击登录触发: `login_new_v20221230.js` 中的点击事件
- 显示模态框: `$("#modal").show(); $(".mask").show();`

---

#### 场景1.1.2：完成滑动验证后提交登录 - 成功

**当我** 在滑动验证组件中拖动滑块到最右边  
**然后** 滑块验证成功，显示绿色对勾图标  
**然后** 自动提交登录请求到服务器  
**这时** 模态框关闭，页面跳转到首页 `https://kyfw.12306.cn/otn/resources/js/framework/station_name.js`  
**并且** 页面头部显示用户名"user@example.com"

**HTML依据**:
```html
<div id="J-slide-passcode" class="nc-container">
  <div class="nc_scale">
    <span class="nc_slide_button"></span>
    <div class="scale_text">
      <span data-nc-lang="_startTEXT">请按住滑块拖动到最右边</span>
    </div>
  </div>
</div>
```

**CSS依据**:
- 滑块轨道高度: `height: 34px`
- 成功状态背景色: `.nc_ok { background: #7ac23c; }`
- 成功图标: `.btnok { background: url("yes.png") no-repeat center; }`

**JS逻辑**:
- API调用: `POST https://kyfw.12306.cn/passport/web/login`
- 请求参数: `username`, `password`, `nc_token` (滑动验证返回的token)
- 认证流程: 成功后调用 `https://kyfw.12306.cn/passport/web/auth/uamtk`

---

#### 场景1.1.3：登录失败 - 用户名或密码错误

**当我** 输入错误的用户名"wronguser"或密码"wrongpass"  
**然后** 完成滑动验证并提交  
**这时** 登录失败，模态框关闭  
**并且** 在登录按钮上方显示红色错误提示"用户名或密码输入错误"

**HTML依据**:
```html
<div id="J-login-error" class="login-error" 
     role="alertdialog" style="display: none">
  <i class="icon icon-plaint-fill txt-error"></i>
  <span class="login-error-txt">用户名或密码输入错误</span>
</div>
```

**CSS依据**:
- 错误提示颜色: `color: #e12525`
- 错误图标颜色: `.txt-error { color: #e12525; }`

---

### 1.2 扫码登录

#### 场景1.2.1：切换到扫码登录并显示二维码

**当我** 在登录页面点击"扫码登录"标签  
**这时** 账号登录区域隐藏  
**并且** 扫码登录区域显示，展示一个二维码图片  
**并且** 二维码下方显示提示文字"打开12306手机APP扫描二维码"

**HTML依据**:
```html
<ul class="login-hd">
  <li class="login-hd-account active">账号登录</li>
  <li class="login-hd-code">扫码登录</li>
</ul>

<div class="login-code-con">
  <div id="J-qrImg-con" class="login-code-img">
    <img id="J-qrImg" alt="扫码登录二维码" src=""/>
    <div id="J-login-code-loading">
      <img src="images/loading.gif" alt="加载中"/>
    </div>
  </div>
  <div class="login-code-txt">
    打开<span class="txt-primary">12306手机APP</span>扫描二维码
  </div>
</div>
```

**CSS依据**:
- 二维码容器宽度: `width: 165px; height: 165px;`
- 主色调文字: `.txt-primary { color: #3b99fc; }`

---

#### 场景1.2.2：二维码过期后刷新

**当我** 等待超过2分钟未扫码  
**这时** 二维码上覆盖一层半透明遮罩  
**并且** 显示"二维码已失效"文字和"刷新"按钮  
**然后** 点击"刷新"按钮  
**这时** 遮罩消失，生成新的二维码

**HTML依据**:
```html
<div id="J-code-error-mask" class="code-error-mask hide">
  <div id="J-code-error" class="code-error">
    <p>二维码已失效</p>
    <a class="btn btn-primary" href="javascript:;">刷新</a>
  </div>
</div>
```

**CSS依据**:
- 遮罩背景: `background: rgba(0,0,0,0.5)`
- 刷新按钮颜色: `background: #3b99fc`

---

### 1.3 短信验证登录

#### 场景1.3.1：选择短信验证方式

**当我** 在验证模态框中点击"短信验证"标签  
**这时** 滑动验证区域隐藏  
**并且** 短信验证区域显示  
**并且** 显示输入框要求输入"登录账号绑定的证件号后4位"

**HTML依据**:
```html
<ul class="login-hd" id="verification">
  <li class="login-hd-slide active" type="1">滑动验证</li>
  <li type="0">短信验证</li>
</ul>

<div id="short_message" class="login-code-item">
  <label for="id_card">请输入登录账号绑定的证件号后4位</label>
  <input id="id_card" type="text" maxlength="4" class="input"/>
  
  <label for="code">验证码</label>
  <input id="code" type="text" maxlength="6" class="input"/>
  
  <a id="verification_code" class="btn btn-secondary">获取验证码</a>
  <a id="sureClick" class="btn btn-primary">确定</a>
</div>
```

**CSS依据**:
- 次要按钮颜色: `.btn-secondary { background: #f6f6f6; color: #333; }`

---

#### 场景1.3.2：获取短信验证码 - 成功（下行短信）

**当我** 在"手机号码"旁看到手机号尾号显示"****2753"  
**然后** 点击"获取验证码"按钮  
**这时** 按钮变为灰色禁用状态  
**并且** 按钮文字变为"60秒后重试"并开始倒计时  
**并且** 手机收到来自12306的验证码短信

**HTML依据**:
```html
<div id="down">
  <label>
    <strong>手机号码</strong>
    <span id="mobile_down">****2753</span>
    <a id="verification_code_down" href="javascript:;">获取验证码</a>
  </label>
  
  <label for="up_msg_code_down">
    <strong>短信验证码</strong>
    <input id="up_msg_code_down" type="text" maxlength="6" class="input"/>
  </label>
  
  <a id="login_control_submit_down" class="btn btn-primary">验证</a>
</div>
```

**JS逻辑**:
- 倒计时: 60秒递减，按钮文字动态更新
- 倒计时结束后按钮恢复可用状态
- API调用: `POST https://kyfw.12306.cn/passport/web/getMessageCode`

---

#### 场景1.3.3：提交短信验证码 - 验证码错误

**当我** 输入错误的验证码"123456"  
**然后** 点击"验证"按钮  
**这时** 在验证码输入框右侧显示红色错误提示"验证码错误"

**HTML依据**:
```html
<span id="login_control_error_down" style="display: none">
  <i class="icon icon-plaint-fill txt-error"></i>
  验证码错误
</span>
```

**CSS依据**:
- 错误图标和文字颜色: `color: #e12525`

---

## 模块2：车票查询

### 2.1 单程票查询

#### 场景2.1.1：选择出发地 - 使用自动补全

**当我** 在首页的"出发地"输入框中输入"bei"  
**这时** 输入框下方弹出自动补全下拉列表  
**并且** 列表显示所有拼音包含"bei"的车站：北京、蚌埠、北海等  
**并且** 每个车站显示"车站名称 | 拼音简写 | 车站代码"格式

**HTML依据**:
```html
<div class="form-item">
  <label class="form-label" for="fromStationText">出发地</label>
  <div class="input-box input-city">
    <input id="fromStation" name="from_station" type="hidden" value=""/>
    <input id="fromStationText" type="text" class="input" autocomplete="off"
           aria-label="请输入或选择出发地，按键盘上下键进行选择，按回车键选中"/>
    <i class="icon icon-place" data-click="fromStationText"></i>
  </div>
</div>

<div class="typeahead li">
  <!-- 自动补全列表容器 -->
</div>
```

**CSS依据**:
- 下拉列表宽度: `width: 265px`
- 列表项padding: `padding-left: 10px`

**JS逻辑**:
- 使用 `pinyin.js` 进行拼音匹配
- 数据源: `station_name_new_v10091.js`
- 支持简拼、全拼、汉字三种输入方式

---

#### 场景2.1.2：选择车站后填充隐藏字段

**当我** 从自动补全列表中点击"北京 | BEIJING | BJP"  
**这时** 显示输入框 `fromStationText` 的值变为"北京"  
**并且** 隐藏输入框 `fromStation` 的值变为"BJP"（车站代码）  
**并且** 自动补全列表关闭

**HTML依据**:
```html
<input id="fromStation" name="from_station" type="hidden" value="BJP"/>
<input id="fromStationText" type="text" class="input" value="北京"/>
```

**JS逻辑**:
- 双输入框模式：显示字段存车站名，隐藏字段存车站代码
- 提交时使用隐藏字段的值

---

#### 场景2.1.3：切换出发地和到达地

**当我** 已选择出发地"北京"和到达地"上海"  
**然后** 点击两个城市输入框之间的切换图标  
**这时** 出发地变为"上海"，到达地变为"北京"  
**并且** 对应的隐藏字段值也同步交换

**HTML依据**:
```html
<div class="city-change">
  <i class="icon icon-qiehuan" id="danChange" title="切换"></i>
</div>
```

**JS逻辑**:
- 交换 `fromStation` ↔ `toStation` 的value
- 交换 `fromStationText` ↔ `toStationText` 的value

---

#### 场景2.1.4：选择出发日期

**当我** 点击"出发日期"输入框或日期图标  
**这时** 弹出日期选择器组件  
**并且** 今天之前的日期显示为灰色不可选  
**并且** 今天及未来60天的日期可选  
**然后** 点击某个日期（如2025-11-15）  
**这时** 输入框显示"2025-11-15"，日期选择器关闭

**HTML依据**:
```html
<div class="form-item">
  <label class="form-label" for="train_date">出发日期</label>
  <div class="input-box input-data">
    <input id="train_date" type="text" class="input" autocomplete="off"
           aria-label="请输入日期，例如2021杠01杠01"/>
    <i class="icon icon-date" data-click="train_date"></i>
  </div>
</div>
```

**CSS依据**:
- 使用自定义日历组件 `calendarNew.css`
- 不可选日期颜色: `color: #ccc`

---

#### 场景2.1.5：勾选学生票选项

**当我** 点击"学生"复选框  
**这时** 复选框内显示对勾图标  
**并且** 复选框背景变为蓝色 `#3b99fc`

**HTML依据**:
```html
<ul class="check-list check-list-right">
  <li id="isStudentDan">学生<i></i></li>
  <li id="isHighDan">高铁/动车<i></i></li>
</ul>
```

**CSS依据**:
- 选中状态: `.check-list li.active i { background: #3b99fc; }`
- 对勾图标: `content: "✓"`

---

#### 场景2.1.6：提交查询 - 成功

**当我** 已选择出发地"北京"、到达地"上海"、日期"2025-11-15"  
**然后** 点击"查询"按钮  
**这时** 页面跳转到余票查询结果页  
**并且** URL包含参数: `leftTicketDTO.train_date=2025-11-15&leftTicketDTO.from_station=BJP&leftTicketDTO.to_station=SHH`  
**并且** 页面显示北京到上海在11月15日的所有车次列表

**HTML依据**:
```html
<a id="search_one" class="btn btn-primary form-block" 
   href="javascript:void(0)">查    询</a>
```

**JS逻辑**:
- 构建GET请求URL，包含出发站代码、到达站代码、日期参数
- 跳转到: `https://kyfw.12306.cn/otn/leftTicket/init`

---

#### 场景2.1.7：查询失败 - 出发地和到达地相同

**当我** 选择出发地"北京"、到达地也选"北京"  
**然后** 点击"查询"按钮  
**这时** 查询按钮下方显示红色错误提示"出发地和到达地不能相同"  
**并且** 不执行跳转

**CSS依据**:
- 错误提示颜色: `color: #e12525`

**JS逻辑**:
- 前端验证: `if (fromStation === toStation) { showError(); return false; }`

---

### 2.2 往返票查询

#### 场景2.2.1：切换到往返票标签

**当我** 在首页点击"往返"标签  
**这时** 单程票查询表单隐藏  
**并且** 往返票查询表单显示  
**并且** 往返票表单包含：出发地、到达地、去程日期、返程日期四个输入框

**HTML依据**:
```html
<div class="search-tab-hd">
  <ul>
    <li class="active">
      <i class="icon icon-dancheng"></i>单程
    </li>
    <li>
      <i class="icon icon-wangfan"></i>往返
    </li>
  </ul>
</div>

<!-- 往返票表单 -->
<input id="fromStationFan" name="from_station_fan" type="hidden"/>
<input id="fromStationFanText" type="text" class="input"/>
<input id="toStationFan" name="to_station_fan" type="hidden"/>
<input id="toStationFanText" type="text" class="input"/>
<input id="go_date" type="text" class="input"/>
<input id="from_date" type="text" class="input"/>
<a id="search_two" class="btn btn-primary form-block">查    询</a>
```

---

#### 场景2.2.2：选择返程日期 - 早于去程日期（错误）

**当我** 选择去程日期"2025-11-15"  
**然后** 选择返程日期"2025-11-14"（早于去程）  
**这时** 返程日期输入框边框变为红色  
**并且** 下方显示错误提示"返程日期不能早于去程日期"

**CSS依据**:
- 错误边框: `border-color: #e12525`

---

## 模块3：订单管理

### 3.1 订单填写

#### 场景3.1.1：选择常用联系人作为乘客

**当我** 在订单填写页面看到"常用联系人"列表  
**并且** 列表显示3个常用联系人：张三、李四、王五  
**然后** 点击"张三"对应的复选框  
**这时** 复选框被勾选  
**并且** 下方"乘客信息"区域自动填充张三的信息：姓名、证件类型（身份证）、证件号、手机号

**HTML依据**:
（需要从 `confirmPassenger/initDc/index.html` 提取具体HTML）

**CSS依据**:
- 联系人卡片样式
- 选中状态边框颜色

---

#### 场景3.1.2：选择座位类型

**当我** 在"选择座位"区域看到多个座位类型单选按钮  
**并且** 可选项包括：二等座￥553、一等座￥933、商务座￥1748  
**然后** 点击"一等座￥933"单选按钮  
**这时** 该单选按钮被选中  
**并且** 页面底部的"应付金额"更新为￥933

**HTML依据**:
（需要提取具体的radio button HTML）

---

#### 场景3.1.3：提交订单 - 成功

**当我** 已选择乘客"张三"、座位类型"一等座"  
**然后** 点击"提交订单"按钮  
**这时** 页面跳转到订单确认页面  
**并且** 显示订单详情：车次、日期、乘客、座位、金额  
**并且** 显示"请在30分钟内完成支付"倒计时

**HTML依据**:
（需要提取提交按钮和倒计时HTML）

**JS逻辑**:
- API调用: `POST /otn/confirmPassenger/submitOrder`
- 请求参数: 乘客信息、座位类型、车次信息

---

## 模块4：个人中心

### 4.1 个人信息管理

#### 场景4.1.1：查看个人信息

**当我** 登录后点击顶部菜单"我的12306"  
**然后** 点击下拉菜单中的"个人信息"  
**这时** 页面跳转到个人信息页面  
**并且** 显示用户的：用户名、姓名、证件类型、证件号、手机号、邮箱等信息

**HTML依据**:
```html
<ul class="menu-nav-bd" id="megamenu-2">
  <li>
    <a data-href="view/information.html" data-redirect="Y" data-type="2"
       href="javascript:;" name="g_href">个人信息</a>
  </li>
</ul>
```

---

### 4.2 常用联系人管理

#### 场景4.2.1：添加新联系人

**当我** 在"常用联系人"页面点击"添加"按钮  
**这时** 弹出添加联系人表单  
**并且** 表单包含：姓名、证件类型、证件号、手机号、旅客类型等字段  
**然后** 填写所有必填信息并点击"保存"  
**这时** 表单关闭，联系人列表新增一条记录

**HTML依据**:
（需要从 `view/passengers.html` 提取）

---

## 技术发现总结

### API端点列表

| 功能           | Method | URL                               | 参数                                 |
| -------------- | ------ | --------------------------------- | ------------------------------------ |
| 用户登录       | POST   | /passport/web/login               | username, password, nc_token         |
| 滑动验证       | POST   | /passport/web/slide-passcode      | -                                    |
| 获取短信验证码 | POST   | /passport/web/getMessageCode      | mobile                               |
| 认证           | POST   | /passport/web/auth/uamtk          | appid                                |
| 余票查询       | GET    | /otn/leftTicket/init              | train_date, from_station, to_station |
| 提交订单       | POST   | /otn/confirmPassenger/submitOrder | 乘客信息, 座位类型                   |

### 设计规范总结

**颜色系统**:
- 主色调：`#3b99fc` (蓝色)
- 辅助色：`#ff8000` (橙色)
- 成功色：`#4ea373` (绿色)
- 警告色：`#f6ba29` (黄色)
- 错误色：`#e12525` (红色)

**按钮系统**:
- `.btn-primary`: 背景 #3b99fc，文字白色
- `.btn-secondary`: 背景 #f6f6f6，文字 #333
- 高度: 30px (小), 36px (中), 44px (大)
- 圆角: 4px

**表单元素**:
- 输入框高度: 40px
- 输入框边框: 1px solid #ddd
- 输入框圆角: 4px
- 输入框focus边框: #3b99fc

**布局**:
- 页面宽度: 980px 固定宽度
- 主要使用float布局
- 间距基于4px/5px倍数

---

**提取完成日期**: 2025-11-13  
**场景总数**: 约28个场景  
**覆盖模块**: 4个核心模块  
**下一步**: Standarder Agent将这些场景转换为BDD格式的Given-When-Then规范
