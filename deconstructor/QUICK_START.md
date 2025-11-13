# 快速使用指南

## 第一次使用

### 1. 安装依赖

```bash
# 安装 Python 包
pip install -r requirements.txt

# 安装 Playwright 浏览器
playwright install chromium
```

### 2. 爬取网页

**推荐方式：爬取指定页面**

```bash
python crawl_specific_urls.py
```

默认会爬取：
- 12306 首页
- 登录页面
- 注册页面

### 3. 预览结果

```bash
python server_async.py -d deconstructed_site
```

在浏览器中打开：http://localhost:8000

## 自定义爬取

### 修改目标 URL

编辑 `crawl_specific_urls.py` 的第 96-100 行：

```python
urls = [
    "https://www.example.com/",
    "https://www.example.com/about",
    # 添加更多 URL...
]
```

### 修改输出目录

```bash
python crawl_specific_urls.py my_output_folder
```

### 整站爬取（慎用）

```bash
python site_crawler.py
```

注意：这会爬取大量页面，可能需要很长时间！

## 常见命令

```bash
# 爬取特定页面
python crawl_specific_urls.py

# 启动预览服务器
python server_async.py

# 指定服务器目录
python server_async.py -d my_output_folder

# 指定服务器端口
python server_async.py -p 8080
```

## 输出目录结构

```
deconstructed_site/
├── sitemap.html          # 站点地图（导航页面）
├── index/                # 首页
│   ├── index.html
│   ├── metadata.json     # 页面元数据
│   ├── css/              # CSS 文件
│   ├── js/               # JavaScript 文件
│   ├── images/           # 图片文件
│   └── fonts/            # 字体文件
└── login/                # 登录页面
    └── ...
```

## 故障排除

### Playwright 安装慢

使用国内镜像：

```bash
set PLAYWRIGHT_DOWNLOAD_HOST=https://npmmirror.com/mirrors/playwright/
playwright install chromium
```

### 页面资源下载不完整

增加等待时间，编辑脚本中的 `wait_for_timeout` 值。

### 服务器无法访问

检查端口是否被占用，尝试更换端口：

```bash
python server_async.py -p 8888
```

## 技术支持

- 详细文档：[README.md](README.md)
- 开发日志：[工作日志.md](工作日志.md)
- 提交问题：[GitHub Issues](https://github.com/yourusername/12306FrontEndDestruct/issues)
