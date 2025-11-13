# 12306系统UI组件设计

设计日期: 2025-11-13
Designer Agent: UI/UX Designer
输入文件: .artifacts/bdd_requirements.md
设计系统: 基于12306实际页面提取的设计规范

---

## 1. 设计令牌 (Design Tokens)

### 1.1 颜色系统
```javascript
const colors = {
  // 主色调
  primary: '#3b99fc',        // 蓝色 - 按钮、链接、选中状态
  primaryHover: '#2986e8',   // 蓝色悬停
  primaryActive: '#1e74d4',  // 蓝色激活
  
  // 辅助色
  secondary: '#ff8000',      // 橙色 - 强调、提示
  success: '#4ea373',        // 绿色 - 成功提示
  warning: '#f6ba29',        // 黄色 - 警告提示
  error: '#e12525',          // 红色 - 错误、验证失败
  info: '#3b99fc',           // 信息提示
  
  // 文字颜色
  textPrimary: '#333',       // 主文字
  textSecondary: '#666',     // 次要文字
  textTertiary: '#999',      // 辅助文字
  textDisabled: '#ccc',      // 禁用文字
  textWhite: '#fff',         // 白色文字
  
  // 边框颜色
  border: '#ddd',            // 默认边框
  borderLight: '#e5e5e5',    // 浅色边框
  borderDark: '#ccc',        // 深色边框
  
  // 背景颜色
  bgWhite: '#fff',           // 白色背景
  bgGray: '#f6f6f6',         // 灰色背景
  bgLight: '#fafafa',        // 浅灰背景
  bgMask: 'rgba(0,0,0,0.5)', // 遮罩背景
}
```

### 1.2 字体系统
```javascript
const typography = {
  fontFamily: '"Microsoft YaHei", "微软雅黑", Arial, sans-serif',
  
  fontSize: {
    xs: '12px',    // 极小
    sm: '13px',    // 小
    base: '14px',  // 基础
    lg: '16px',    // 大
    xl: '18px',    // 特大
    xxl: '20px',   // 超大
  },
  
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.8,
  }
}
```

### 1.3 间距系统
```javascript
const spacing = {
  0: '0',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
}
```

### 1.4 圆角系统
```javascript
const borderRadius = {
  none: '0',
  sm: '2px',
  base: '4px',
  md: '6px',
  lg: '8px',
  full: '9999px',
}
```

### 1.5 阴影系统
```javascript
const shadows = {
  sm: '0 1px 2px rgba(0,0,0,0.05)',
  base: '0 2px 4px rgba(0,0,0,0.1)',
  md: '0 4px 8px rgba(0,0,0,0.1)',
  lg: '0 8px 16px rgba(0,0,0,0.15)',
  xl: '0 12px 24px rgba(0,0,0,0.2)',
}
```

---

## 2. 基础组件

### 2.1 Button 按钮

#### 2.1.1 主要按钮
```jsx
<Button variant="primary" size="medium">
  立即登录
</Button>
```

**样式规范**:
```css
.btn-primary {
  background: #3b99fc;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 0 16px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary:hover {
  background: #2986e8;
}

.btn-primary:active {
  background: #1e74d4;
}

.btn-primary:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* 尺寸变体 */
.btn-sm { height: 30px; padding: 0 12px; font-size: 12px; }
.btn-md { height: 36px; padding: 0 16px; font-size: 14px; }
.btn-lg { height: 44px; padding: 0 20px; font-size: 16px; }
```

#### 2.1.2 次要按钮
```css
.btn-secondary {
  background: #f6f6f6;
  color: #333;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.btn-secondary:hover {
  background: #e8e8e8;
  border-color: #ccc;
}
```

#### 2.1.3 块级按钮
```css
.btn-block {
  width: 100%;
  display: block;
}
```

---

### 2.2 Input 输入框

#### 2.2.1 文本输入框
```jsx
<Input
  id="username"
  placeholder="用户名/邮箱/手机号"
  maxLength={50}
  autoComplete="off"
/>
```

**样式规范**:
```css
.input {
  width: 100%;
  height: 40px;
  padding: 0 10px;
  font-size: 14px;
  color: #333;
  border: 1px solid #ddd;
  border-radius: 4px;
  outline: none;
  transition: border-color 0.3s;
}

.input:focus {
  border-color: #3b99fc;
}

.input:disabled {
  background: #f5f5f5;
  color: #999;
  cursor: not-allowed;
}

.input.error {
  border-color: #e12525;
}

.input::placeholder {
  color: #999;
}
```

#### 2.2.2 密码输入框
```jsx
<Input
  type="password"
  id="password"
  placeholder="密码"
  autoComplete="new-password"
/>
```

#### 2.2.3 输入框容器（带图标）
```jsx
<div className="input-box">
  <input className="input" />
  <i className="icon icon-place"></i>
</div>
```

```css
.input-box {
  position: relative;
  width: 100%;
}

.input-box .icon {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
  cursor: pointer;
}
```

---

### 2.3 Modal 模态框

#### 2.3.1 登录验证模态框
```jsx
<Modal
  id="modal"
  title="选择验证方式"
  visible={showModal}
  onClose={handleClose}
>
  <ModalContent />
</Modal>
```

**样式规范**:
```css
.modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 380px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 12px 24px rgba(0,0,0,0.2);
  z-index: 1000;
}

.modal-header {
  padding: 16px 20px;
  border-bottom: 1px solid #e5e5e5;
}

.modal-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.modal-close {
  position: absolute;
  right: 16px;
  top: 16px;
  width: 24px;
  height: 24px;
  cursor: pointer;
  color: #999;
}

.modal-body {
  padding: 20px;
}

.modal-footer {
  padding: 12px 20px;
  border-top: 1px solid #e5e5e5;
  text-align: right;
}

/* 遮罩层 */
.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  z-index: 999;
}
```

---

### 2.4 Tabs 标签页

#### 2.4.1 登录方式切换
```jsx
<Tabs defaultActiveKey="account">
  <TabPane key="account" tab="账号登录">
    <AccountLogin />
  </TabPane>
  <TabPane key="qrcode" tab="扫码登录">
    <QRCodeLogin />
  </TabPane>
</Tabs>
```

**样式规范**:
```css
.tabs {
  width: 100%;
}

.tabs-header {
  display: flex;
  border-bottom: 2px solid #e5e5e5;
}

.tab-item {
  flex: 1;
  padding: 12px 0;
  text-align: center;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  position: relative;
  transition: color 0.3s;
}

.tab-item:hover {
  color: #3b99fc;
}

.tab-item.active {
  color: #3b99fc;
  font-weight: 600;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 2px;
  background: #3b99fc;
}

.tabs-content {
  padding: 20px 0;
}
```

---

### 2.5 Autocomplete 自动补全

#### 2.5.1 车站选择
```jsx
<Autocomplete
  id="fromStationText"
  placeholder="请输入或选择出发地"
  options={stationList}
  onSelect={handleStationSelect}
/>
```

**样式规范**:
```css
.autocomplete {
  position: relative;
  width: 100%;
}

.autocomplete-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  max-height: 300px;
  overflow-y: auto;
  background: #fff;
  border: 1px solid #ddd;
  border-top: none;
  border-radius: 0 0 4px 4px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  z-index: 100;
}

.autocomplete-item {
  padding: 8px 10px;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  transition: background 0.2s;
}

.autocomplete-item:hover {
  background: #f0f8ff;
}

.autocomplete-item.active {
  background: #e6f4ff;
  color: #3b99fc;
}

.autocomplete-item-main {
  font-weight: 500;
}

.autocomplete-item-sub {
  font-size: 12px;
  color: #999;
  margin-left: 8px;
}
```

---

### 2.6 DatePicker 日期选择器

#### 2.6.1 出发日期选择
```jsx
<DatePicker
  id="train_date"
  placeholder="请输入日期，例如2021-01-01"
  minDate={new Date()}
  maxDate={addDays(new Date(), 60)}
  onChange={handleDateChange}
/>
```

**样式规范**:
```css
.datepicker {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 4px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  z-index: 100;
}

.datepicker-header {
  padding: 12px;
  border-bottom: 1px solid #e5e5e5;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.datepicker-month {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.datepicker-nav {
  width: 24px;
  height: 24px;
  border-radius: 2px;
  cursor: pointer;
  transition: background 0.2s;
}

.datepicker-nav:hover {
  background: #f0f0f0;
}

.datepicker-week {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  padding: 8px 12px;
  background: #fafafa;
}

.datepicker-weekday {
  text-align: center;
  font-size: 12px;
  color: #666;
  padding: 4px 0;
}

.datepicker-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  padding: 8px 12px;
}

.datepicker-day {
  width: 32px;
  height: 32px;
  line-height: 32px;
  text-align: center;
  font-size: 14px;
  color: #333;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.datepicker-day:hover:not(.disabled) {
  background: #e6f4ff;
  color: #3b99fc;
}

.datepicker-day.disabled {
  color: #ccc;
  cursor: not-allowed;
}

.datepicker-day.selected {
  background: #3b99fc;
  color: #fff;
}

.datepicker-day.today {
  border: 1px solid #3b99fc;
}
```

---

### 2.7 Checkbox 复选框

#### 2.7.1 票种选择
```jsx
<Checkbox
  id="isStudentDan"
  label="学生"
  checked={isStudent}
  onChange={handleStudentChange}
/>
```

**样式规范**:
```css
.checkbox {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
}

.checkbox-input {
  position: absolute;
  opacity: 0;
}

.checkbox-box {
  width: 16px;
  height: 16px;
  border: 1px solid #ddd;
  border-radius: 2px;
  margin-right: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.checkbox-input:checked + .checkbox-box {
  background: #3b99fc;
  border-color: #3b99fc;
}

.checkbox-box::after {
  content: '✓';
  color: #fff;
  font-size: 12px;
  opacity: 0;
  transform: scale(0);
  transition: all 0.2s;
}

.checkbox-input:checked + .checkbox-box::after {
  opacity: 1;
  transform: scale(1);
}

.checkbox-label {
  font-size: 14px;
  color: #333;
}
```

---

### 2.8 Radio 单选框

#### 2.8.1 座位类型选择
```jsx
<RadioGroup
  name="seatType"
  value={selectedSeat}
  onChange={handleSeatChange}
>
  <Radio value="3" label="商务座 ￥1748" />
  <Radio value="2" label="一等座 ￥933" />
  <Radio value="1" label="二等座 ￥553" />
</RadioGroup>
```

**样式规范**:
```css
.radio {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
  margin-right: 20px;
}

.radio-input {
  position: absolute;
  opacity: 0;
}

.radio-circle {
  width: 16px;
  height: 16px;
  border: 1px solid #ddd;
  border-radius: 50%;
  margin-right: 6px;
  position: relative;
  transition: all 0.3s;
}

.radio-input:checked + .radio-circle {
  border-color: #3b99fc;
}

.radio-circle::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0);
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #3b99fc;
  transition: transform 0.2s;
}

.radio-input:checked + .radio-circle::after {
  transform: translate(-50%, -50%) scale(1);
}

.radio-label {
  font-size: 14px;
  color: #333;
}
```

---

### 2.9 Alert 提示框

#### 2.9.1 错误提示
```jsx
<Alert
  type="error"
  message="用户名或密码输入错误"
  closable={true}
/>
```

**样式规范**:
```css
.alert {
  padding: 12px 16px;
  border-radius: 4px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
}

.alert-error {
  background: #fff2f0;
  border: 1px solid #ffccc7;
  color: #e12525;
}

.alert-success {
  background: #f6ffed;
  border: 1px solid #b7eb8f;
  color: #4ea373;
}

.alert-warning {
  background: #fffbe6;
  border: 1px solid #ffe58f;
  color: #f6ba29;
}

.alert-info {
  background: #e6f7ff;
  border: 1px solid #91d5ff;
  color: #3b99fc;
}

.alert-icon {
  margin-right: 8px;
  font-size: 16px;
}

.alert-message {
  flex: 1;
  font-size: 14px;
}

.alert-close {
  margin-left: 12px;
  cursor: pointer;
  font-size: 14px;
  opacity: 0.7;
}

.alert-close:hover {
  opacity: 1;
}
```

---

## 3. 业务组件

### 3.1 SlideVerify 滑动验证

```jsx
<SlideVerify
  onSuccess={handleVerifySuccess}
  onFail={handleVerifyFail}
/>
```

**样式规范**:
```css
.slide-verify {
  width: 100%;
  height: 34px;
  background: #e8e8e8;
  border-radius: 17px;
  position: relative;
  overflow: hidden;
}

.slide-verify-track {
  height: 100%;
  background: #7ac23c;
  border-radius: 17px 0 0 17px;
  width: 0;
  transition: width 0.3s;
}

.slide-verify-button {
  position: absolute;
  left: 0;
  top: 0;
  width: 50px;
  height: 34px;
  background: #fff;
  border-radius: 17px;
  cursor: grab;
  box-shadow: 0 0 4px rgba(0,0,0,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.slide-verify-button:active {
  cursor: grabbing;
}

.slide-verify-text {
  position: absolute;
  left: 0;
  right: 0;
  text-align: center;
  line-height: 34px;
  font-size: 12px;
  color: #999;
  user-select: none;
}

.slide-verify.success .slide-verify-track {
  background: #7ac23c;
  width: 100%;
}

.slide-verify.success .slide-verify-button {
  left: calc(100% - 50px);
}

.slide-verify.success .slide-verify-text {
  color: #7ac23c;
}
```

---

### 3.2 QRCode 二维码

```jsx
<QRCode
  value="https://12306.cn/qr?id=QR_UUID_123"
  size={165}
  expired={false}
  onRefresh={handleRefresh}
/>
```

**样式规范**:
```css
.qrcode-container {
  width: 165px;
  height: 165px;
  position: relative;
  margin: 0 auto;
}

.qrcode-image {
  width: 100%;
  height: 100%;
  display: block;
}

.qrcode-expired {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.qrcode-expired-text {
  color: #fff;
  font-size: 14px;
  margin-bottom: 12px;
}

.qrcode-refresh {
  padding: 6px 16px;
  background: #3b99fc;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.qrcode-tip {
  margin-top: 12px;
  text-align: center;
  font-size: 14px;
  color: #666;
}

.qrcode-tip .highlight {
  color: #3b99fc;
}
```

---

### 3.3 TrainList 车次列表

```jsx
<TrainList
  trains={trainData}
  onSelectTrain={handleSelectTrain}
/>
```

**样式规范**:
```css
.train-list {
  width: 100%;
}

.train-item {
  padding: 16px;
  background: #fff;
  border: 1px solid #e5e5e5;
  margin-bottom: 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.train-item:hover {
  border-color: #3b99fc;
  box-shadow: 0 2px 8px rgba(59,153,252,0.2);
}

.train-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.train-no {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.train-type {
  display: inline-block;
  padding: 2px 8px;
  background: #e6f7ff;
  color: #3b99fc;
  border-radius: 2px;
  font-size: 12px;
  margin-left: 8px;
}

.train-route {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
}

.train-station {
  flex: 1;
}

.train-station-name {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.train-station-time {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin-top: 4px;
}

.train-arrow {
  color: #999;
  font-size: 20px;
}

.train-duration {
  font-size: 12px;
  color: #999;
  text-align: center;
}

.train-seats {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.train-seat {
  flex: 1;
  min-width: 100px;
  padding: 8px;
  background: #fafafa;
  border-radius: 4px;
  text-align: center;
}

.train-seat-name {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.train-seat-price {
  font-size: 16px;
  font-weight: 600;
  color: #ff8000;
}

.train-seat-count {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.train-seat.soldout {
  opacity: 0.5;
  cursor: not-allowed;
}

.train-seat.soldout .train-seat-price {
  color: #999;
}
```

---

## 4. 布局组件

### 4.1 Container 容器

```css
.container {
  width: 980px;
  margin: 0 auto;
  padding: 0 15px;
}

@media (max-width: 1200px) {
  .container {
    width: 100%;
    max-width: 980px;
  }
}
```

### 4.2 Header 页头

```css
.header {
  height: 60px;
  background: #fff;
  border-bottom: 1px solid #e5e5e5;
}

.header-content {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-logo {
  height: 40px;
}

.header-nav {
  display: flex;
  gap: 24px;
}

.header-nav-item {
  font-size: 14px;
  color: #333;
  cursor: pointer;
  transition: color 0.3s;
}

.header-nav-item:hover {
  color: #3b99fc;
}

.header-user {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-username {
  font-size: 14px;
  color: #333;
}
```

### 4.3 Footer 页脚

```css
.footer {
  padding: 32px 0;
  background: #f6f6f6;
  border-top: 1px solid #e5e5e5;
  margin-top: 48px;
}

.footer-content {
  text-align: center;
}

.footer-links {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-bottom: 16px;
}

.footer-link {
  font-size: 12px;
  color: #666;
  cursor: pointer;
  transition: color 0.3s;
}

.footer-link:hover {
  color: #3b99fc;
}

.footer-copyright {
  font-size: 12px;
  color: #999;
}
```

---

## 5. 响应式设计

### 5.1 断点系统
```css
/* 移动端 */
@media (max-width: 767px) {
  .container {
    width: 100%;
    padding: 0 12px;
  }
  
  .train-route {
    flex-direction: column;
  }
  
  .train-seats {
    flex-direction: column;
  }
}

/* 平板 */
@media (min-width: 768px) and (max-width: 1023px) {
  .container {
    width: 750px;
  }
}

/* 桌面 */
@media (min-width: 1024px) {
  .container {
    width: 980px;
  }
}
```

---

下一步: 提交所有设计文档并标记Next-Agent
