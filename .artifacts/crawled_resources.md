# 12306网站资源爬取清单

**爬取时间**: 2025-01-XX  
**爬取策略**: 两阶段爬取（公开页面 + 受保护页面）  
**爬取工具**: FrontendElementsCrawler (Playwright + BeautifulSoup4)  
**输出目录**: `deconstructor/deconstructed_site/`

---

## 📊 总体统计

| 资源类型       | 数量             |
| -------------- | ---------------- |
| HTML文件       | 9                |
| CSS文件        | 84               |
| JavaScript文件 | 219              |
| 图片文件       | 1,578            |
| 字体文件       | 66               |
| **总计**       | **1,956 个文件** |

---

## 🔓 阶段一：公开页面（无需登录）

### 1. 首页 (index)
- **URL**: `https://kyfw.12306.cn/otn/resources/js/framework/station_name.js?station_version=1.9.250`
- **路径**: `deconstructed_site/index/`
- **资源**: 
  - HTML: 1
  - CSS: 7
  - JavaScript: 19
  - 图片: 约200+
  - 字体: 包含iconfont全套

### 2. 登录页 (login)
- **URL**: `https://kyfw.12306.cn/otn/resources/login.html`
- **路径**: `deconstructed_site/otn/resources/`
- **资源**:
  - HTML: 1
  - CSS: 包含login.css, common.css, iconfont.css等
  - JavaScript: jquery, base64, nc.js (验证码组件), login_new.js等
  - 图片: login相关UI资源

### 3. 注册页 (register)
- **URL**: `https://kyfw.12306.cn/otn/regist/init`
- **路径**: `deconstructed_site/otn/regist/init/`
- **资源**:
  - HTML: 1
  - CSS: 注册表单样式
  - JavaScript: 表单验证脚本

### 4. 单程票查询页 (leftTicket - 81d02b52)
- **URL**: `https://kyfw.12306.cn/otn/leftTicket/init`
- **路径**: `deconstructed_site/otn/leftTicket/init_81d02b52/`
- **资源**:
  - HTML: 1
  - CSS: 车票查询界面样式
  - JavaScript: 查询逻辑、日期选择器
  - 图片: 车次类型图标、座位类型图标

### 5. 单程票查询页变体 (leftTicket - 37c6c5dd)
- **URL**: `https://kyfw.12306.cn/otn/leftTicket/init` (不同时间访问获得不同版本)
- **路径**: `deconstructed_site/otn/leftTicket/init_37c6c5dd/`
- **说明**: 与上一版本可能有细微差异

### 6. 车次查询页 (lcQuery)
- **URL**: `https://kyfw.12306.cn/otn/lcQuery/init`
- **路径**: `deconstructed_site/otn/lcQuery/init/`
- **资源**:
  - HTML: 1
  - CSS: 车次时刻表样式
  - JavaScript: 车次查询与展示逻辑

---

## 🔒 阶段二：受保护页面（需登录认证）

**认证方式**: Cookie-based session management  
**登录状态**: 已保存至 `deconstructor/auth_state.json` (12个cookies, 有效期7天)

### 7. 订单填写页 (confirmPassenger)
- **URL**: `https://kyfw.12306.cn/otn/confirmPassenger/initDc`
- **路径**: `deconstructed_site/otn/confirmPassenger/initDc/`
- **资源**:
  - HTML: 1
  - CSS: 5 (validation.css, common_css.css, toolbar.css等)
  - JavaScript: 12 (包括initDc.js订单处理逻辑)
  - 图片: 26+ (进度图标、支付方式图标、保险图标等)
- **关键功能**: 乘客选择、座位选择、保险选择、订单提交

### 8. 个人信息页 (information)
- **URL**: `https://kyfw.12306.cn/otn/view/information.html`
- **路径**: `deconstructed_site/otn/view/` (合并到view目录)
- **资源**:
  - HTML: 1
  - CSS: 6 (iconfont.css, information_v70001.css等)
  - JavaScript: 13 (包括information.html.js)
  - 图片: 49+ (用户认证图标、护照填写示例、身份证示例等)
- **关键功能**: 个人资料修改、实名认证、证件管理

### 9. 乘客管理页 (passengers)
- **URL**: `https://kyfw.12306.cn/otn/view/passengers.html`
- **路径**: `deconstructed_site/otn/view/` (合并到view目录)
- **资源**:
  - HTML: 1
  - CSS: 6 (ticket_public_v70001.css, iconfont等)
  - JavaScript: 13 (包括passengers.html.js)
  - 图片: 27+
- **关键功能**: 常用联系人管理、乘客信息增删改查

### 10. 订单管理页 (train_order)
- **URL**: `https://kyfw.12306.cn/otn/view/train_order.html`
- **路径**: `deconstructed_site/otn/view/` (合并到view目录)
- **资源**:
  - HTML: 1
  - CSS: 6 (ticket_index_v70004.css等)
  - JavaScript: 17 (包括train_order.html.js, 订单查询与管理逻辑)
  - 图片: 29+ (订单状态图标、火车票样式、发票图标等)
- **关键功能**: 历史订单查询、订单详情、退改签

---

## ⚠️ 已知问题

### 404资源（12306网站自身缺失）
以下资源在12306网站上不存在，爬虫已正确捕获404错误：

1. **图片资源**:
   - `bg_selection.gif` - 选择背景图
   - `ico02.png` - 图标文件
   - `code_train.png/gif` - 验证码相关图片
   - `icon-child.png/@2x.png` - 儿童图标（多处引用）
   - `icon-ticket-card.png/@2x.png` - 票卡图标（多处引用）
   - `cyx-train-bg.png` - 车次背景图（多处引用）
   - `img_new.png`, `img.gif` - 通用图片

2. **字体资源**:
   - `font_web.ttf` - 网页字体文件

3. **CSS资源**:
   - `toolbar_bg1.jpg` - 工具栏背景（多处引用）

4. **特殊URL**:
   - `about:blank` - 浏览器空白页（非服务器资源）

**影响**: 这些缺失资源不影响页面主体功能，爬虫已成功获取所有可用资源。CSS中引用了这些资源的地方可能显示占位符或使用降级样式。

---

## 📂 目录结构

```
deconstructed_site/
├── sitemap.html              # 站点地图（自动生成）
├── index/                    # 首页
│   ├── index.html
│   ├── metadata.json         # 页面元数据
│   ├── css/
│   ├── js/
│   ├── images/
│   ├── fonts/
│   └── other/
└── otn/                      # 12306在线票务系统
    ├── confirmPassenger/     # 订单填写
    │   └── initDc/
    ├── lcQuery/              # 车次查询
    │   └── init/
    ├── leftTicket/           # 余票查询
    │   ├── init_81d02b52/
    │   └── init_37c6c5dd/
    ├── regist/               # 注册
    │   └── init/
    ├── resources/            # 登录页
    │   ├── index.html
    │   ├── css/
    │   ├── js/
    │   └── ...
    └── view/                 # 用户中心（受保护）
        ├── index.html        # 用户信息/乘客/订单合并入口
        ├── css/
        ├── js/
        ├── images/
        └── fonts/
```

---

## 🔧 技术细节

### 爬取脚本
- **公开页面**: `deconstructor/crawl_specific_urls.py`
- **受保护页面**: `deconstructor/crawl_authenticated_batch.py`
- **认证辅助**: `deconstructor/auth_crawler.py` (手动登录并保存Cookie)

### 认证状态
- **文件**: `deconstructor/auth_state.json`
- **内容**: 12个12306 session cookies
- **有效期**: 约7天
- **用途**: 后续爬取更新或补充受保护页面资源

### metadata.json 结构
每个页面目录下的 `metadata.json` 包含：
```json
{
  "url": "原始页面URL",
  "timestamp": "爬取时间戳",
  "title": "页面标题",
  "resources": {
    "css": ["文件列表"],
    "js": ["文件列表"],
    "images": ["文件列表"]
  }
}
```

---

## 📝 使用说明

### 1. 本地预览
```bash
# 使用Python简易服务器
cd deconstructor/deconstructed_site
python -m http.server 8000

# 访问 http://localhost:8000/sitemap.html
```

### 2. 资源引用
所有资源已按相对路径保存，HTML中的引用已自动调整：
- CSS: `css/文件名.css`
- JS: `js/文件名.js`
- Images: `images/文件名.ext`
- Fonts: `fonts/文件名.ext`

### 3. 后续更新
如需重新爬取受保护页面：
```bash
cd deconstructor
python crawl_authenticated_batch.py
# 如Cookie过期，先运行: python auth_crawler.py
```

---

## 🎯 下一步行动

此资源清单将被 **Observer Agent** 读取，用于：
1. 分析页面结构与交互逻辑
2. 识别关键UI组件与状态管理模式
3. 提取业务流程与数据模型
4. 生成需求观察报告 → 传递给 **Extracter Agent**

**Agent工作流进度**: 
- ✅ **WebCrawler** (当前) - 资源爬取完成
- ⏭️ **Observer** (下一个) - 等待读取 `git show HEAD` 获取此清单
- ⏸️ Extracter → Standarder → Designer → TestGenerator → Developer
