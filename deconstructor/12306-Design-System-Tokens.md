# 12306网站设计系统 Design Tokens

> 基于对 `login.css`, `common.css`, `index_y_v50003.css` 的深度分析提取的设计规范

---

## 📊 1. 颜色系统 (Color Tokens)

### 主色调 (Primary Colors)
```css
--primary-blue: #3b99fc;        /* 主要交互色 - 链接、按钮悬停 */
--primary-orange: #ff8000;      /* 主要操作按钮 */
--primary-dark-blue: #0077FF;   /* 默认链接色 */
--primary-hover-orange: #FB7403; /* 链接悬停色 */
```

### 辅助色 (Secondary Colors)
```css
--secondary-blue: #0f9ae0;      /* 次要按钮 */
--secondary-light-blue: #1678BE; /* 边框、布局边框 */
--secondary-cyan: #63C7E7;      /* 特殊标题背景 */
--secondary-sky: #66C8E8;       /* 新闻盒子标题 */
```

### 状态色 (Status Colors)
```css
/* 成功 */
--success-green: #4ea373;
--success-dark: #26A306;
--success-bright: #59B200;

/* 警告 */
--warning-yellow: #f6ba29;
--warning-orange: #FC8302;

/* 错误/危险 */
--error-red: #e12525;
--danger-red: #ff4646;
--danger-dark: #f00;
--danger-crimson: #D80000;
```

### 中性色 (Neutral Colors)
```css
/* 文字颜色 */
--text-primary: #333;
--text-secondary: #666;
--text-tertiary: #999;
--text-white: #fff;

/* 背景色 */
--bg-white: #fff;
--bg-light: #f8f8f8;
--bg-lighter: #EEF1F8;
--bg-pale: #FFFBE5;          /* 提示背景 */
--bg-error: #fff2f2;         /* 错误提示背景 */

/* 边框色 */
--border-default: #dedede;
--border-light: #ccc;
--border-gray: #999;
--border-pale: #CFCDC7;
--border-blue: #298CCE;
```

### 透明度变化 (Opacity Variants)
```css
--primary-orange-80: rgba(255, 128, 0, 0.8);
--secondary-blue-80: rgba(15, 154, 224, 0.8);
--success-green-80: rgba(78, 163, 115, 0.8);
--warning-yellow-80: rgba(246, 186, 41, 0.8);
--danger-red-80: rgba(255, 70, 70, 0.8);
--shadow-blue: rgba(59, 153, 252, 0.4);
```

---

## 🔤 2. 字体系统 (Typography Tokens)

### 字体家族 (Font Family)
```css
--font-primary: Tahoma, "宋体";
--font-microsoft: "微软雅黑", "黑体";
--font-number: Tahoma, Arial, Simsun;
--font-verdana: Verdana, Geneva, sans-serif;
```

### 字号标度 (Font Size Scale)
```css
--font-xs: 9px;
--font-sm: 12px;          /* body默认 */
--font-base: 14px;
--font-md: 16px;          /* h6, 重要按钮 */
--font-lg: 18px;          /* h5 */
--font-xl: 20px;          /* h4 */
--font-2xl: 22px;         /* h3 */
--font-3xl: 24px;         /* h2 */
--font-4xl: 40px;         /* h1, 特殊标题 */
```

### 行高 (Line Height)
```css
--line-height-tight: 16px;
--line-height-normal: 18px;
--line-height-base: 20px;
--line-height-relaxed: 22px;
--line-height-loose: 25px;
--line-height-extra: 30px;
--line-height-large: 32px;
```

### 字重 (Font Weight)
```css
--font-weight-normal: 400;
--font-weight-bold: 700;
```

---

## 📐 3. 间距系统 (Spacing Tokens)

### 内边距 (Padding)
```css
--spacing-0: 0;
--spacing-1: 2px;
--spacing-2: 4px;
--spacing-3: 5px;
--spacing-4: 6px;
--spacing-5: 8px;
--spacing-6: 10px;
--spacing-7: 12px;
--spacing-8: 15px;
--spacing-9: 16px;
--spacing-10: 20px;
--spacing-12: 30px;
--spacing-14: 40px;
--spacing-16: 60px;
```

### 外边距 (Margin)
```css
/* 复用spacing系统 */
--margin-xs: 5px;
--margin-sm: 10px;
--margin-md: 15px;
--margin-lg: 20px;
--margin-xl: 25px;
--margin-2xl: 40px;
```

### 组件专用间距
```css
--input-padding-vertical: 4px;
--input-padding-horizontal: 10px;
--button-padding-vertical: 4px;
--button-padding-horizontal: 10px;
```

---

## 🔲 4. 圆角系统 (Border Radius)

```css
--radius-none: 0;
--radius-sm: 2px;
--radius-default: 4px;
--radius-md: 5px;
--radius-lg: 6px;
--radius-xl: 12px;
--radius-2xl: 14px;
--radius-full: 50%;        /* 圆形 */
--radius-pill: 15px;       /* 胶囊形按钮 */
--radius-round: 20px;
```

---

## 🎨 5. 阴影系统 (Shadow Tokens)

```css
/* Box Shadow */
--shadow-none: none;
--shadow-sm: 0 0 4px rgba(59, 153, 252, 0.4);
--shadow-blue: 0 0 4px rgba(59, 153, 252, 0.4);
--shadow-default: 0 0 6px 4px #ccc;
--shadow-medium: 2px 2px 5px #666;

/* 特殊效果阴影 */
--shadow-moz: -moz-box-shadow: 0 0 6px 4px #ccc;
--shadow-webkit: -webkit-box-shadow: 0 0 6px 4px #ccc;
```

---

## 🔘 6. 按钮样式 (Button Tokens)

### 按钮尺寸 (Button Sizes)
```css
/* 小号按钮 */
--btn-sm-height: 24px;
--btn-sm-min-width: 70px;
--btn-sm-padding: 1px 10px;

/* 默认按钮 */
--btn-default-height: 30px;
--btn-default-min-width: 80px;
--btn-default-padding: 4px 10px;

/* 大号按钮 */
--btn-lg-height: 36px;
--btn-lg-padding: 7px 10px;

/* 特大按钮 */
--btn-xl-height: 44px;
--btn-xl-line-height: 34px;
```

### 按钮宽度
```css
--btn-width-30: 28px;
--btn-width-72: 72px;
--btn-width-92: 90px;
--btn-width-122: 120px;
--btn-width-200: 198px;
--btn-width-login: 225px;
```

### 按钮变体 (Button Variants)

#### 主要按钮 (Primary)
```css
.btn-primary {
  background: #ff8000;
  color: #fff;
  border-color: #ff8000;
}
.btn-primary:hover {
  background: rgba(255, 128, 0, 0.8);
  border-color: rgba(255, 128, 0, 0.8);
}
```

#### 次要按钮 (Secondary)
```css
.btn-secondary {
  background: #0f9ae0;
  color: #fff;
  border-color: #0f9ae0;
}
.btn-secondary:hover {
  background: rgba(15, 154, 224, 0.8);
}
```

#### 默认按钮 (Default)
```css
.btn-default {
  background: #e6e6e6;
  border-color: #e6e6e6;
  color: #333;
}
.btn-default:hover {
  background: #c7c7c7;
  border-color: #c7c7c7;
}
```

#### 成功按钮 (Success)
```css
.btn-success {
  background: #4ea373;
  color: #fff;
  border-color: #4ea373;
}
```

#### 警告按钮 (Warning)
```css
.btn-warning {
  background: #f6ba29;
  color: #fff;
  border-color: #f6ba29;
}
```

#### 危险按钮 (Danger)
```css
.btn-danger {
  background: #ff4646;
  color: #fff;
  border-color: #ff4646;
}
```

#### 禁用按钮 (Disabled)
```css
.btn-disabled {
  background: #eaeded;
  color: #999;
  border-color: #eaeded;
  cursor: not-allowed;
}
```

### 按钮过渡效果
```css
--btn-transition: border-color ease-in-out 0.15s, 
                  box-shadow ease-in-out 0.15s, 
                  color ease-in-out 0.15s, 
                  background ease-in-out 0.15s;
```

---

## 📦 7. 输入框系统 (Input Tokens)

### 输入框尺寸
```css
/* 小号 */
--input-sm-height: 24px;
--input-sm-padding: 1px 10px;

/* 默认 */
--input-default-height: 30px;
--input-default-padding: 4px 10px;
--input-default-line-height: 20px;

/* 大号 */
--input-lg-height: 36px;
--input-lg-padding: 7px 10px;
```

### 输入框状态
```css
/* 默认 */
--input-border: 1px solid #dedede;
--input-bg: #fff;
--input-color: #333;

/* 聚焦 */
--input-focus-border: #3b99fc;
--input-focus-shadow: 0 0 4px rgba(59, 153, 252, 0.4);

/* 错误 */
--input-error-border: #e12525;
--input-error-color: #e12525;

/* 占位符 */
--input-placeholder-color: #999;
```

---

## 📏 8. 布局系统 (Layout Tokens)

### 容器宽度
```css
--container-width: 980px;
--container-min-height: 620px;

/* 固定宽度 */
--width-sidebar: 200px;
--width-main: 770px;
--width-login-box: 380px;
--width-modal: 410px;
--width-large: 734px;
```

### 布局方式

#### Flexbox 使用
```css
/* 常见float布局 */
.fl { float: left; }
.fr { float: right; }
.clearfix:after {
  content: ".";
  display: block;
  height: 0;
  clear: both;
  visibility: hidden;
}
```

#### Position
```css
/* 定位层级 */
--z-index-dropdown: 100;
--z-index-modal: 9100;
--z-index-mask: 9000;
--z-index-tooltip: 10000;
--z-index-header: 3000;
--z-index-max: 99999;
```

---

## 🎯 9. 边框系统 (Border Tokens)

```css
--border-width-thin: 1px;
--border-width-medium: 2px;
--border-width-thick: 3px;

--border-style-solid: solid;
--border-style-dashed: dashed;
--border-style-dotted: dotted;

/* 常用边框组合 */
--border-default: 1px solid #dedede;
--border-light: 1px solid #ccc;
--border-blue: 1px solid #298CCE;
--border-error: 1px solid #e12525;
```

---

## 🌐 10. 特殊效果 (Special Effects)

### 过渡动画
```css
--transition-fast: 0.15s;
--transition-normal: 0.2s;
--transition-slow: 0.3s;

--transition-timing: ease-in-out;
--transition-linear: linear;
```

### 透明度
```css
--opacity-disabled: 0.5;
--opacity-light: 0.6;
--opacity-medium: 0.8;
--opacity-full: 1;
```

### 遮罩层
```css
.mask {
  background: #000;
  opacity: 0.5;
  z-index: 16000;
}
```

---

## ♿ 11. 适老化/无障碍设计 (Accessibility)

### 大号字体模式
```css
.is-caring {
  /* 标题放大 */
  --font-caring-header: 26px;
  --font-caring-subtitle: 22px;
  --font-caring-title: 24px;
  
  /* 正文放大 */
  --font-caring-body: 20px;
  --font-caring-label: 19px;
  
  /* 图标放大 */
  --icon-caring-size: 24px;
}
```

---

## 📱 12. 响应式断点 (Breakpoints)

```css
/* 基于固定宽度设计，主要针对桌面端 */
--breakpoint-desktop: 980px;
--breakpoint-min: 1000px;
```

---

## 🎨 13. 图标系统 (Icon System)

```css
/* 图标尺寸 */
--icon-xs: 10px;
--icon-sm: 14px;
--icon-md: 16px;
--icon-lg: 20px;
--icon-xl: 28px;
--icon-2xl: 42px;
--icon-3xl: 66px;

/* 图标颜色 */
--icon-color-default: #dadada;
--icon-color-active: #3b99fc;
--icon-color-disabled: #dcdcdc;
```

---

## 📋 14. 表格系统 (Table Tokens)

```css
/* 表头 */
--table-header-bg: #EEF1F8;
--table-header-height: 28px;
--table-header-border: 1px solid #999;

/* 单元格 */
--table-cell-padding: 3px 0;
--table-border-color: #C0D7E4;
--table-border-dashed: 1px dashed #999;

/* 斑马纹 */
--table-stripe-bg: #EEF1F8;
```

---

## 🔖 15. 设计原则总结

### 颜色使用原则
- **主色调蓝色** (`#3b99fc`) 用于交互元素、链接悬停
- **橙色** (`#ff8000`) 用于主要操作按钮
- **红色系** 用于错误、警告、删除等危险操作
- **绿色** 用于成功状态
- **中性灰** 用于文字层级和背景

### 间距规律
- 基础间距单位：**4px** (2, 4, 5, 8, 10, 12, 15, 16, 20, 30, 40, 60)
- 遵循 **4/5的倍数** 原则

### 圆角策略
- 小元素 (按钮、输入框): **4-6px**
- 大容器 (模态框、卡片): **5-8px**
- 特殊形状: **15-20px** (胶囊形)

### 字体层级
- 基础字号: **12px** (body)
- 重要操作: **14-16px**
- 标题: **18-24px**
- 超大标题: **40px**

---

## 📌 使用建议

1. **优先使用设计 tokens** 而不是硬编码值
2. **保持一致性** - 相同功能使用相同样式
3. **遵循无障碍标准** - 提供适老化和高对比度模式
4. **响应式优先** - 虽然当前主要支持桌面端，但预留扩展空间
5. **渐进增强** - 基础功能优先，高级特效可选

---

## 🔗 相关文件

- `deconstructed_site/otn/resources/css/login.css`
- `deconstructed_site/otn/resources/css/common.css`
- `deconstructed_site/index/css/index_y_v50003.css`

---

**文档版本**: v1.0  
**更新日期**: 2025-11-13  
**分析基础**: 12306网站实际CSS代码提取
