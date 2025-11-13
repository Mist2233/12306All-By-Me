# 🚂 12306 前端解构工具

一个强大的网页前端解构工具，能够完整提取目标网站的 HTML、CSS、JavaScript、图片、字体等所有前端资源，用于网页复刻、学习和分析。

[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://www.python.org/downloads/)
[![Playwright](https://img.shields.io/badge/Playwright-1.40+-green.svg)](https://playwright.dev/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## ✨ 功能特性

### 核心功能

- 🌐 **完整的 HTML 结构提取** - 获取包括动态渲染内容在内的完整 DOM 结构
- 🎨 **CSS 样式全面提取** - 提取外部样式表、内联样式表和嵌入样式
- 📜 **JavaScript 代码获取** - 下载外部 JS 文件和提取内联脚本
- 🖼️ **图片资源下载** - 自动下载 `<img>` 标签和 CSS 背景图片
- 🔤 **字体文件提取** - 识别并下载 `@font-face` 定义的所有字体
- 🔗 **路径自动修正** - 自动更新 HTML 和 CSS 中的资源引用路径
- 📊 **元数据导出** - 生成 JSON 格式的解构结果摘要

### 高级功能

- 🚀 **整站爬取** - 智能发现并爬取整个网站的所有页面
- 🎯 **精确 URL 爬取** - 支持手动指定要爬取的 URL 列表
- 🔐 **登录状态支持** - 保存并复用登录状态，爬取需要认证的页面
- 🔍 **同源策略** - 只爬取目标域名下的页面，避免爬到站外
- 📈 **站点地图生成** - 自动生成可视化的站点结构图
- 🌐 **本地预览服务器** - 内置异步 HTTP 服务器预览解构结果
- ⚡ **增强 CSS 解析** - 自动提取 CSS 中 `url()` 引用的所有资源
- 🎭 **SVG 资源支持** - 完整支持 SVG Sprite 和内联 SVG
- 🎪 **字体图标提取** - 自动下载字体图标库（如 Font Awesome）

## 📋 系统要求

- Python 3.8 或更高版本
- Windows 10+ / macOS / Linux
- 至少 500MB 可用磁盘空间（用于 Playwright 浏览器）

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/yourusername/12306FrontEndDestruct.git
cd 12306FrontEndDestruct
```

### 2. 安装依赖

```bash
pip install -r requirements.txt
```

### 3. 安装 Playwright 浏览器

Playwright 需要下载浏览器驱动，首次使用需要执行：

```bash
playwright install chromium
```

### 4. 开始使用

#### 方式一：爬取指定的 URL 列表（推荐）

```bash
python crawl_specific_urls.py
```

默认会爬取以下页面：
- 12306 首页
- 登录页面
- 注册页面

你可以编辑 `crawl_specific_urls.py` 中的 `urls` 列表来自定义要爬取的页面。

#### 方式二：整站爬取

```bash
python site_crawler.py
```

这将自动发现并爬取整个网站（注意：可能爬取大量页面）。

#### 方式三：爬取需要登录的页面（新功能 🔐）

对于需要登录才能访问的页面（如个人中心、订单页面等），使用认证爬虫：

```bash
python auth_crawler.py
```

**使用流程：**

1. **首次使用 - 保存登录状态**
   - 运行程序后选择 `1. 手动登录并保存状态`
   - 浏览器会自动打开登录页面
   - 手动完成登录（输入用户名、密码、验证码）
   - 登录成功后按 Enter 键保存状态到 `auth_state.json`

2. **后续使用 - 爬取受保护页面**
   - 选择 `2. 爬取需要登录的页面`
   - 输入要爬取的 URL（一行一个）
   - 程序会自动使用保存的登录状态进行爬取

**示例 URL：**
```
https://kyfw.12306.cn/otn/leftTicket/init           # 车票查询
https://kyfw.12306.cn/otn/view/passengers.html      # 常用联系人
https://kyfw.12306.cn/otn/queryOrder/initNoComplete # 未完成订单
```

**优势：**
- ✅ 一次登录，多次使用（直到 Cookie 过期）
- ✅ 不存储密码，只保存会话 Token
- ✅ 避免自动化登录被检测
- ✅ 支持所有需要认证的页面

### 5. 查看结果

爬取完成后，所有资源都会保存在 `deconstructed_site` 目录中。

启动本地服务器预览：

```bash
python server_async.py -d deconstructed_site
```

然后在浏览器中访问：`http://localhost:8000`

## 📁 项目结构

```
12306FrontEndDestruct/
├── config.py                  # 配置文件（目录名称、文件扩展名等）
├── site_crawler.py            # 整站爬虫（支持链接自动发现）
├── crawl_specific_urls.py     # 精确 URL 爬取脚本
├── auth_crawler.py            # 认证爬虫（支持登录状态保存与复用）🆕
├── resource_downloader.py     # 资源下载器（CSS、JS、图片、字体）
├── server_async.py            # 异步 HTTP 服务器（用于预览）
├── auth_state.json            # 登录状态文件（自动生成，不提交到Git）
├── requirements.txt           # Python 依赖列表
├── README.md                  # 项目说明文档
├── 工作日志.md                 # 开发日志（详细记录了开发过程）
└── deconstructed_site/        # 输出目录（默认，会被 .gitignore 忽略）
    ├── sitemap.html          # 站点地图
    ├── index/                # 首页资源
    │   ├── index.html
    │   ├── metadata.json
    │   ├── css/
    │   ├── js/
    │   ├── images/
    │   └── fonts/
    └── ...                   # 其他页面
```

## 🔧 配置说明

### config.py

你可以在 `config.py` 中修改以下配置：

```python
class Config:
    # 资源目录名称
    CSS_DIR = "css"
    JS_DIR = "js"
    IMAGES_DIR = "images"
    FONTS_DIR = "fonts"
    
    # 允许的文件扩展名
    IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".ico"}
    FONT_EXTENSIONS = {".woff", ".woff2", ".ttf", ".otf", ".eot"}
    
    # 请求超时时间（秒）
    REQUEST_TIMEOUT = 30
```

### site_crawler.py 参数

```python
crawler = SiteCrawler(
    base_url="https://www.12306.cn/index/",  # 起始URL
    output_dir="deconstructed_site",          # 输出目录
    max_pages=50                              # 最大爬取页面数
)
```

## 📖 使用示例

### 示例 1：爬取特定页面

编辑 `crawl_specific_urls.py`：

```python
urls = [
    "https://www.example.com/",
    "https://www.example.com/about",
    "https://www.example.com/contact",
]
```

运行：

```bash
python crawl_specific_urls.py
```

### 示例 2：整站爬取

```bash
python site_crawler.py
```

### 示例 3：自定义爬取

```python
from site_crawler import SiteCrawler
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    
    crawler = SiteCrawler(
        base_url="https://www.example.com",
        output_dir="my_output",
        max_pages=20
    )
    
    results = crawler.crawl()
    browser.close()
```

### 示例 4：爬取需要登录的页面（代码方式）

```python
from auth_crawler import AuthenticatedCrawler

# 创建认证爬虫实例
crawler = AuthenticatedCrawler()

# 首次使用：手动登录并保存状态
crawler.manual_login()

# 之后可以重复使用登录状态
crawler.crawl_with_auth([
    "https://kyfw.12306.cn/otn/leftTicket/init",
    "https://kyfw.12306.cn/otn/view/passengers.html",
    "https://kyfw.12306.cn/otn/queryOrder/initNoComplete",
])
```

### 示例 5：本地预览

```bash
# 启动服务器
python server_async.py -d deconstructed_site

# 指定端口
python server_async.py -p 8080

# 不自动打开浏览器
python server_async.py -d deconstructed_site --no-browser
```

## 🎯 核心原理

### 1. 动态内容渲染

使用 Playwright 驱动真实浏览器访问网页，等待 JavaScript 执行完成和网络空闲，确保获取到完整的动态渲染内容。

### 2. 资源智能提取

- **HTML 中的资源**：解析 `<link>`, `<script>`, `<img>` 等标签
- **CSS 中的资源**：使用正则表达式提取 `url()` 引用的所有资源
- **字体资源**：识别 `@font-face` 规则并下载字体文件
- **SVG 资源**：支持内联 SVG 和 SVG Sprite

### 3. 登录状态管理

- **Cookie 保存**：自动保存浏览器 Cookies
- **Storage 同步**：保存 localStorage 和 sessionStorage
- **状态复用**：一次登录，多次使用（直到过期）
- **安全设计**：不存储密码，只保存会话 Token

### 4. 路径自动修正

下载资源后，自动更新所有引用路径为本地相对路径，确保离线可用：

```html
<!-- 原始 -->
<link href="https://example.com/css/style.css" rel="stylesheet">

<!-- 修正后 -->
<link href="css/style.css" rel="stylesheet">
```

### 5. 链接发现机制

自动提取页面中的所有 `<a>` 标签链接，判断是否同源，加入爬取队列。

## 🛠️ 技术栈

- **[Playwright](https://playwright.dev/)** - 浏览器自动化和页面渲染
- **[BeautifulSoup4](https://www.crummy.com/software/BeautifulSoup/)** - HTML/CSS 解析
- **[aiohttp](https://docs.aiohttp.org/)** - 异步 HTTP 服务器
- **[Requests](https://requests.readthedocs.io/)** - HTTP 请求库

## ⚠️ 注意事项

1. **法律合规性**：请确保你爬取的网站允许这样的操作，遵守网站的 robots.txt 和服务条款。
2. **登录安全性**：`auth_state.json` 包含登录凭证，请勿分享或提交到 Git。
3. **速率控制**：避免对目标服务器造成过大压力，建议添加适当的延迟。
3. **存储空间**：爬取整站可能会占用大量磁盘空间，请确保有足够的空间。
4. **网络稳定性**：爬取过程需要稳定的网络连接，建议在网络条件良好时进行。
5. **仅供学习**：本工具仅用于学习和研究目的，不得用于商业用途或非法用途。

## 🐛 常见问题

### 1. Playwright 安装失败

```bash
# 使用国内镜像
set PLAYWRIGHT_DOWNLOAD_HOST=https://npmmirror.com/mirrors/playwright/
playwright install chromium
```

### 2. 某些图片下载失败

某些网站使用防盗链，可能导致部分资源下载失败。这是正常现象。

### 3. 页面显示不完整

可以增加等待时间：

```python
page.wait_for_timeout(5000)  # 等待 5 秒
```

### 4. 服务器 Ctrl+C 关闭缓慢

这是 Python 标准库 http.server 的已知问题。建议使用 `server_async.py`，支持快速关闭。

### 5. 登录状态失效

登录状态通常在 7 天后过期，如遇到需要重新登录的情况：

```bash
python auth_crawler.py
# 选择 1. 手动登录并保存状态
```

### 6. 无法爬取需要登录的页面

确保：
- 已经使用 `auth_crawler.py` 保存了登录状态
- `auth_state.json` 文件存在且未过期
- 目标页面确实需要登录（可在浏览器中测试）

## 📝 开发日志

详细的开发过程和遇到的问题解决方案，请查看 [工作日志.md](工作日志.md)。

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

## 🙏 致谢

- 感谢 [Playwright](https://playwright.dev/) 提供强大的浏览器自动化工具
- 感谢 [BeautifulSoup](https://www.crummy.com/software/BeautifulSoup/) 提供优秀的 HTML 解析库
- 特别感谢 Google Gemini 在开发过程中提供的技术指导

## 📬 联系方式

如有问题或建议，请通过以下方式联系：

- 提交 [Issue](https://github.com/yourusername/12306FrontEndDestruct/issues)
- 发送邮件到：your.email@example.com

---

⭐ 如果这个项目对你有帮助，请给个 Star 支持一下！
